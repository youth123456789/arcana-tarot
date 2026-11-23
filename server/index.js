'use strict';

const { loadConfig } = require('./config');
const { createApp } = require('./app');

const config = loadConfig();
const app = createApp(config);
const server = app.listen(config.port, config.host, () => {
  const address = config.host === '0.0.0.0' ? 'localhost' : config.host;
  console.info(`ARCANA listening on http://${address}:${config.port}`);
  console.info(`Auth: QQ email code · Mail: ${config.mail.mode} · DB: ${config.dbPath}`);
  if (config.mail.mode === 'console') {
    console.warn('MAIL_MODE=console: verification codes are printed to this server console. Use smtp for a standalone phone app.');
  }
});

server.on('error', (error) => {
  console.error('[server]', error.message);
  process.exit(1);
});

function shutdown(signal) {
  console.info(`\n${signal} received, shutting down...`);
  server.close(() => {
    try { app.locals.db.close(); } catch (error) { /* ignored */ }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
