'use strict';

const path = require('path');
const dotenv = require('dotenv');

const rootDir = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(rootDir, '.env') });

function numberFromEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function nonNegativeFromEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

function decimalFromEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 && value <= 2 ? value : fallback;
}

function loadConfig() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const appSecret = String(process.env.APP_SECRET || '').trim();
  if (!appSecret || appSecret.length < 32) {
    throw new Error('APP_SECRET is required and must be at least 32 characters. See .env.example.');
  }

  const mailMode = String(process.env.MAIL_MODE || 'console').toLowerCase();
  if (!['console', 'smtp', 'brevo', 'smtp2go'].includes(mailMode)) {
    throw new Error('MAIL_MODE must be console, smtp, brevo or smtp2go');
  }

  const smtpUser = String(process.env.SMTP_USER || '').trim();
  const smtpPass = String(process.env.SMTP_PASS || '').trim();
  const brevoApiKey = String(process.env.BREVO_API_KEY || '').trim();
  const smtp2goApiKey = String(process.env.SMTP2GO_API_KEY || '').trim();
  const mailFrom = String(process.env.MAIL_FROM || smtpUser).trim();
  if (mailMode === 'smtp' && (!smtpUser || !smtpPass)) {
    throw new Error('SMTP_USER and SMTP_PASS are required when MAIL_MODE=smtp');
  }
  if (mailMode === 'brevo' && (!brevoApiKey || !mailFrom)) {
    throw new Error('BREVO_API_KEY and MAIL_FROM are required when MAIL_MODE=brevo');
  }
  if (mailMode === 'smtp2go' && (!smtp2goApiKey || !mailFrom)) {
    throw new Error('SMTP2GO_API_KEY and MAIL_FROM are required when MAIL_MODE=smtp2go');
  }

  let providerOverrides = {};
  try {
    providerOverrides = process.env.PROVIDER_OVERRIDES ? JSON.parse(process.env.PROVIDER_OVERRIDES) : {};
  } catch (error) {
    throw new Error('PROVIDER_OVERRIDES must be valid JSON');
  }

  return {
    nodeEnv,
    rootDir,
    port: numberFromEnv('PORT', 4173),
    host: process.env.HOST || '0.0.0.0',
    dbPath: process.env.DB_PATH || path.join(rootDir, 'data', 'arcana.db'),
    databaseUrl: String(process.env.DATABASE_URL || '').trim(),
    appSecret,
    auth: {
      codeTtlMs: numberFromEnv('AUTH_CODE_TTL_MS', 10 * 60 * 1000),
      codeCooldownMs: numberFromEnv('AUTH_CODE_COOLDOWN_MS', 60 * 1000),
      codeMaxAttempts: numberFromEnv('AUTH_CODE_MAX_ATTEMPTS', 5),
      codesPerHour: numberFromEnv('AUTH_CODES_PER_HOUR', 8),
      sessionTtlMs: numberFromEnv('AUTH_SESSION_DAYS', 30) * 24 * 60 * 60 * 1000,
      allowedEmailDomains: String(process.env.ALLOWED_EMAIL_DOMAINS || 'qq.com,foxmail.com,vip.qq.com')
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    },
    mail: {
      mode: mailMode,
      host: process.env.SMTP_HOST || 'smtp.qq.com',
      port: numberFromEnv('SMTP_PORT', 465),
      secure: String(process.env.SMTP_SECURE || 'true').toLowerCase() !== 'false',
      user: smtpUser,
      pass: smtpPass,
      brevoApiKey,
      smtp2goApiKey,
      from: mailFrom,
      fromName: process.env.SMTP_FROM_NAME || process.env.MAIL_FROM_NAME || 'ARCANA'
    },
    ai: {
      timeoutMs: numberFromEnv('AI_TIMEOUT_MS', 45000),
      testTimeoutMs: numberFromEnv('AI_TEST_TIMEOUT_MS', 15000),
      maxTokens: numberFromEnv('AI_MAX_TOKENS', 2200),
      temperature: decimalFromEnv('AI_TEMPERATURE', 0.7),
      retries: nonNegativeFromEnv('AI_RETRIES', 0)
    },
    rateLimit: {
      windowMs: numberFromEnv('RATE_LIMIT_WINDOW_MS', 10 * 60 * 1000),
      max: numberFromEnv('RATE_LIMIT_MAX', 30)
    },
    corsOrigins: String(process.env.CORS_ORIGINS || 'http://localhost:4173,http://127.0.0.1:4173,https://localhost,http://localhost,capacitor://localhost')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    providerOverrides
  };
}

module.exports = { loadConfig, rootDir };
