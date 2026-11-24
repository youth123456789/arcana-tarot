'use strict';

const nodemailer = require('nodemailer');

function codeEmail(code) {
  return {
    subject: 'ARCANA 登录验证码',
    text: `你的 ARCANA 登录验证码是 ${code}，10 分钟内有效。如果不是你本人操作，请忽略这封邮件。`,
    html: `<div style="background:#07040e;color:#f3edff;padding:32px;font-family:Georgia,serif">
      <p style="letter-spacing:.2em;color:#e2c9a5;font-size:12px">ARCANA</p>
      <h1 style="font-weight:400;font-size:26px;margin:18px 0 10px">登录验证码</h1>
      <p style="color:#b6a9ca;font-size:14px">请在 App 中输入下面的验证码，10 分钟内有效。</p>
      <p style="font-size:34px;letter-spacing:.3em;color:#e2c9a5;margin:22px 0">${code}</p>
      <p style="color:#7f7293;font-size:12px">如果不是你本人操作，请忽略这封邮件。</p>
    </div>`
  };
}

function createBrevoMailer(config) {
  const apiKey = config.mail.brevoApiKey;
  const from = config.mail.from;
  return {
    mode: 'brevo',
    async sendCode(email, code) {
      const content = codeEmail(code);
      let response;
      try {
        response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'content-type': 'application/json',
            accept: 'application/json'
          },
          body: JSON.stringify({
            sender: { name: config.mail.fromName, email: from },
            to: [{ email }],
            subject: content.subject,
            textContent: content.text,
            htmlContent: content.html
          }),
          signal: AbortSignal.timeout(12000)
        });
      } catch (error) {
        throw new Error(`Brevo request failed: ${error.message}`);
      }
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`Brevo HTTP ${response.status}: ${body.slice(0, 200)}`);
      }
      return { mode: 'brevo' };
    }
  };
}

function createSmtp2GoMailer(config) {
  const apiKey = config.mail.smtp2goApiKey;
  const from = config.mail.from;
  return {
    mode: 'smtp2go',
    async sendCode(email, code) {
      const content = codeEmail(code);
      let response;
      try {
        response = await fetch('https://api.smtp2go.com/v3/email/send', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            api_key: apiKey,
            sender: `${config.mail.fromName} <${from}>`,
            to: [email],
            subject: content.subject,
            text_body: content.text,
            html_body: content.html
          }),
          signal: AbortSignal.timeout(12000)
        });
      } catch (error) {
        throw new Error(`SMTP2GO request failed: ${error.message}`);
      }
      const body = await response.text().catch(() => '');
      let payload = null;
      try { payload = body ? JSON.parse(body) : null; } catch (error) { payload = null; }
      const data = payload && payload.data ? payload.data : {};
      if (!response.ok || Number(data.succeeded || 0) < 1 || (Array.isArray(data.failures) && data.failures.length)) {
        const detail = Array.isArray(data.failures) && data.failures.length
          ? JSON.stringify(data.failures[0]).slice(0, 200)
          : body.slice(0, 200);
        throw new Error(`SMTP2GO HTTP ${response.status}: ${detail}`);
      }
      return { mode: 'smtp2go' };
    }
  };
}

function createSendGridMailer(config) {
  const apiKey = config.mail.sendgridApiKey;
  const from = config.mail.from;
  return {
    mode: 'sendgrid',
    async sendCode(email, code) {
      const content = codeEmail(code);
      let response;
      try {
        response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${apiKey}`,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email }] }],
            from: { email: from, name: config.mail.fromName },
            subject: content.subject,
            content: [
              { type: 'text/plain', value: content.text },
              { type: 'text/html', value: content.html }
            ]
          }),
          signal: AbortSignal.timeout(12000)
        });
      } catch (error) {
        throw new Error(`SendGrid request failed: ${error.message}`);
      }
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`SendGrid HTTP ${response.status}: ${body.slice(0, 200)}`);
      }
      return { mode: 'sendgrid' };
    }
  };
}

function createMailjetMailer(config) {
  const apiKey = config.mail.mailjetApiKey;
  const apiSecret = config.mail.mailjetApiSecret;
  const from = config.mail.from;
  const authorization = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  return {
    mode: 'mailjet',
    async sendCode(email, code) {
      const content = codeEmail(code);
      let response;
      try {
        response = await fetch('https://api.mailjet.com/v3.1/send', {
          method: 'POST',
          headers: {
            authorization,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            Messages: [{
              From: { Email: from, Name: config.mail.fromName },
              To: [{ Email: email }],
              Subject: content.subject,
              TextPart: content.text,
              HTMLPart: content.html
            }]
          }),
          signal: AbortSignal.timeout(12000)
        });
      } catch (error) {
        throw new Error(`Mailjet request failed: ${error.message}`);
      }
      const body = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Mailjet HTTP ${response.status}: ${body.slice(0, 200)}`);
      }
      let payload = null;
      try { payload = body ? JSON.parse(body) : null; } catch (error) { payload = null; }
      const message = payload && Array.isArray(payload.Messages) ? payload.Messages[0] : null;
      if (!message || String(message.Status || '').toLowerCase() !== 'success') {
        throw new Error(`Mailjet rejected message: ${body.slice(0, 200)}`);
      }
      return { mode: 'mailjet' };
    }
  };
}

function createEmailJsMailer(config) {
  const serviceId = config.mail.emailjsServiceId;
  const templateId = config.mail.emailjsTemplateId;
  const publicKey = config.mail.emailjsPublicKey;
  const privateKey = config.mail.emailjsPrivateKey;
  return {
    mode: 'emailjs',
    async sendCode(email, code) {
      const content = codeEmail(code);
      let response;
      try {
        response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            ...(privateKey ? { accessToken: privateKey } : {}),
            template_params: {
              to_email: email,
              code,
              subject: content.subject,
              message: content.text,
              app_name: 'ARCANA'
            }
          }),
          signal: AbortSignal.timeout(12000)
        });
      } catch (error) {
        throw new Error(`EmailJS request failed: ${error.message}`);
      }
      const body = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`EmailJS HTTP ${response.status}: ${body.slice(0, 200)}`);
      }
      return { mode: 'emailjs' };
    }
  };
}

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

  if (config.mail.mode === 'brevo') {
    return createBrevoMailer(config);
  }

  if (config.mail.mode === 'smtp2go') {
    return createSmtp2GoMailer(config);
  }

  if (config.mail.mode === 'sendgrid') {
    return createSendGridMailer(config);
  }

  if (config.mail.mode === 'mailjet') {
    return createMailjetMailer(config);
  }

  if (config.mail.mode === 'emailjs') {
    return createEmailJsMailer(config);
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
      const content = codeEmail(code);
      await transport.sendMail({
        from: `"${config.mail.fromName}" <${config.mail.user}>`,
        to: email,
        subject: content.subject,
        text: content.text,
        html: content.html
      });
      return { mode: 'smtp' };
    }
  };
}

module.exports = { createMailer, codeEmail };
