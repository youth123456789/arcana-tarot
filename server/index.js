'use strict';

const { loadConfig } = require('./config');
const { createApp } = require('./app');

const config = loadConfig();

async function main() {
  const app = await createApp(config);
  const server = app.listen(config.port, config.host, () => {
    const address = config.host === '0.0.0.0' ? 'localhost' : config.host;
    console.info(`ARCANA listening on http://${address}:${config.port}`);
    console.info(`Auth: QQ email code · Mail: ${config.mail.mode} · DB: ${app.locals.db.kind === 'postgres' ? 'postgres' : config.dbPath}`);
    if (config.mail.mode === 'console') {
      console.warn('MAIL_MODE=console: verification codes are printed to this server console. Use brevo for Render free, or smtp for a VPS.');
    }
  });

  server.on('error', (error) => {
    console.error('[server]', error.message);
    process.exit(1);
  });

  function shutdown(signal) {
    console.info(`\n${signal} received, shutting down...`);
    server.close(async () => {
      try { await app.locals.db.close(); } catch (error) { /* ignored */ }
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 5000).unref();
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  console.error('[startup]', error);
  process.exit(1);
});
