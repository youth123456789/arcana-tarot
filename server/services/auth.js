'use strict';

const { HttpError } = require('../lib/httpError');
const {
  hashValue,
  hashEmailCode,
  safeEqual,
  randomToken,
  randomCode
} = require('../lib/crypto');

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isAllowedEmail(email, config) {
  const match = /^[^\s@]+@([^\s@]+)$/.exec(email);
  if (!match) return false;
  return config.auth.allowedEmailDomains.includes(match[1]);
}

function publicUser(user) {
  return {
    id: Number(user.id),
    email: user.email,
    avatar: user.avatar || '',
    deckStyle: user.deck_style || 'rider',
    createdAt: Number(user.created_at),
    lastLoginAt: user.last_login_at ? Number(user.last_login_at) : null
  };
}

async function requestCode(db, config, mailer, emailValue) {
  const email = normalizeEmail(emailValue);
  if (!isAllowedEmail(email, config)) {
    throw new HttpError(422, 'EMAIL_NOT_SUPPORTED', '目前支持 QQ 邮箱：@qq.com、@foxmail.com、@vip.qq.com。');
  }

  const now = Date.now();
  const latest = await db.one('SELECT created_at FROM email_codes WHERE email = ? ORDER BY id DESC LIMIT 1', [email]);
  if (latest && now - Number(latest.created_at) < config.auth.codeCooldownMs) {
    const retryAfter = Math.ceil((config.auth.codeCooldownMs - (now - Number(latest.created_at))) / 1000);
    const error = new HttpError(429, 'CODE_COOLDOWN', `验证码刚发送过，请 ${retryAfter} 秒后再试。`);
    error.retryAfter = retryAfter;
    throw error;
  }

  const hourAgo = now - 60 * 60 * 1000;
  const recentCount = await db.one('SELECT COUNT(*) AS count FROM email_codes WHERE email = ? AND created_at > ?', [email, hourAgo]);
  if (Number(recentCount.count) >= config.auth.codesPerHour) {
    throw new HttpError(429, 'CODE_LIMIT', '这个邮箱请求验证码太频繁，请稍后再试。');
  }

  const code = randomCode();
  const codeHash = hashEmailCode(email, code, config.appSecret);
  const expiresAt = now + config.auth.codeTtlMs;
  const codeId = await db.insert(
    'INSERT INTO email_codes (email, code_hash, expires_at, created_at) VALUES (?, ?, ?, ?)',
    [email, codeHash, expiresAt, now]
  );

  try {
    await mailer.sendCode(email, code);
    return {
      email,
      expiresIn: Math.floor(config.auth.codeTtlMs / 1000),
      codeId
    };
  } catch (error) {
    await db.execute('DELETE FROM email_codes WHERE id = ?', [codeId]);
    console.error('[mail:error]', error.message);
    throw new HttpError(502, 'MAIL_SEND_FAILED', '验证码邮件没有发出去，请稍后重试。');
  }
}

async function verifyCode(db, config, emailValue, codeValue) {
  const email = normalizeEmail(emailValue);
  const code = String(codeValue || '').trim();
  if (!isAllowedEmail(email, config)) {
    throw new HttpError(422, 'EMAIL_NOT_SUPPORTED', '目前支持 QQ 邮箱：@qq.com、@foxmail.com、@vip.qq.com。');
  }
  if (!/^\d{6}$/.test(code)) {
    throw new HttpError(422, 'CODE_INVALID', '请输入 6 位数字验证码。');
  }

  const record = await db.one(
    'SELECT * FROM email_codes WHERE email = ? AND consumed = 0 ORDER BY id DESC LIMIT 1',
    [email]
  );
  if (!record) throw new HttpError(400, 'CODE_REQUIRED', '请先获取验证码。');
  if (Number(record.expires_at) < Date.now()) {
    throw new HttpError(400, 'CODE_EXPIRED', '验证码已失效，请重新获取。');
  }
  if (Number(record.attempts) >= config.auth.codeMaxAttempts) {
    throw new HttpError(429, 'CODE_ATTEMPTS', '验证码尝试次数过多，请重新获取。');
  }

  const actualHash = hashEmailCode(email, code, config.appSecret);
  if (!safeEqual(actualHash, record.code_hash)) {
    await db.execute('UPDATE email_codes SET attempts = attempts + 1 WHERE id = ?', [record.id]);
    throw new HttpError(401, 'CODE_WRONG', '验证码不正确，请检查后重试。');
  }

  const now = Date.now();
  return db.transaction(async (tx) => {
    await tx.execute('UPDATE email_codes SET consumed = 1 WHERE id = ?', [record.id]);
    await tx.execute(
      'INSERT INTO users (email, created_at, last_login_at) VALUES (?, ?, ?) ' +
      'ON CONFLICT(email) DO UPDATE SET last_login_at = excluded.last_login_at',
      [email, now, now]
    );
    const user = await tx.one('SELECT * FROM users WHERE email = ?', [email]);

    const token = randomToken();
    await tx.execute(
      'INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
      [hashValue(token), user.id, now + config.auth.sessionTtlMs, now]
    );
    await tx.execute('DELETE FROM sessions WHERE expires_at < ?', [now]);
    await tx.execute('DELETE FROM email_codes WHERE expires_at < ?', [now - 24 * 60 * 60 * 1000]);

    return {
      token,
      user: publicUser(user),
      expiresIn: Math.floor(config.auth.sessionTtlMs / 1000)
    };
  });
}

async function updateAvatar(db, userId, avatar) {
  await db.execute('UPDATE users SET avatar = ? WHERE id = ?', [avatar, userId]);
  const user = await db.one('SELECT * FROM users WHERE id = ?', [userId]);
  if (!user) return null;
  return publicUser(user);
}

async function getUserByToken(db, token) {
  if (!token) return null;
  const row = await db.one(
    'SELECT users.*, sessions.token_hash, sessions.expires_at FROM sessions ' +
    'JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ?',
    [hashValue(token)]
  );
  if (!row) return null;
  if (Number(row.expires_at) < Date.now()) {
    await db.execute('DELETE FROM sessions WHERE token_hash = ?', [row.token_hash]);
    return null;
  }
  return publicUser(row);
}

async function revokeSession(db, token) {
  if (!token) return;
  await db.execute('DELETE FROM sessions WHERE token_hash = ?', [hashValue(token)]);
}

module.exports = {
  normalizeEmail,
  isAllowedEmail,
  requestCode,
  verifyCode,
  getUserByToken,
  updateAvatar,
  revokeSession,
  publicUser
};
