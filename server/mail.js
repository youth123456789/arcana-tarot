'use strict';

const nodemailer = require('nodemailer');

function createMailer(config) {
  if (config.mail.mode === 'console') {
    return {
      mode: 'console',
      async sendCode(email, code) {
        console.info(`[mail:console] ${email} -> ${code}`);
        return { mode: 'console' };
      }
    };
  }

  const transport = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: {
      user: config.mail.user,
      pass: config.mail.pass
    }
  });

  return {
    mode: 'smtp',
    async sendCode(email, code) {
      await transport.sendMail({
        from: `"${config.mail.fromName}" <${config.mail.user}>`,
        to: email,
        subject: 'ARCANA 登录验证码',
        text: `你的 ARCANA 登录验证码是 ${code}，10 分钟内有效。如果不是你本人操作，请忽略这封邮件。`,
        html: `<div style="background:#07040e;color:#f3edff;padding:32px;font-family:Georgia,serif">
          <p style="letter-spacing:.2em;color:#e2c9a5;font-size:12px">ARCANA</p>
          <h1 style="font-weight:400;font-size:26px;margin:18px 0 10px">登录验证码</h1>
          <p style="color:#b6a9ca;font-size:14px">请在 App 中输入下面的验证码，10 分钟内有效。</p>
          <p style="font-size:34px;letter-spacing:.3em;color:#e2c9a5;margin:22px 0">${code}</p>
          <p style="color:#7f7293;font-size:12px">如果不是你本人操作，请忽略这封邮件。</p>
        </div>`
      });
      return { mode: 'smtp' };
    }
  };
}

module.exports = { createMailer };
