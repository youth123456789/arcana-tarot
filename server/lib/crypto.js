'use strict';

const crypto = require('crypto');

const keyCache = new Map();

function deriveKey(secret) {
  if (keyCache.has(secret)) return keyCache.get(secret);
  const key = crypto.scryptSync(String(secret), 'arcana-api-keys-v1', 32);
  keyCache.set(secret, key);
  return key;
}

function encryptSecret(plaintext, secret) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', deriveKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ['v1', iv.toString('base64'), tag.toString('base64'), encrypted.toString('base64')].join(':');
}

function decryptSecret(payload, secret) {
  const parts = String(payload || '').split(':');
  if (parts.length !== 4 || parts[0] !== 'v1') throw new Error('Invalid encrypted secret');
  const iv = Buffer.from(parts[1], 'base64');
  const tag = Buffer.from(parts[2], 'base64');
  const encrypted = Buffer.from(parts[3], 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', deriveKey(secret), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

function hashValue(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function hashEmailCode(email, code, secret) {
  return crypto.createHmac('sha256', String(secret)).update(`${email}:${code}`).digest('hex');
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function randomToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function randomCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

function maskKey(key) {
  const value = String(key || '');
  return value.length <= 4 ? '••••' : `••••${value.slice(-4)}`;
}

module.exports = {
  encryptSecret,
  decryptSecret,
  hashValue,
  hashEmailCode,
  safeEqual,
  randomToken,
  randomCode,
  maskKey
};
