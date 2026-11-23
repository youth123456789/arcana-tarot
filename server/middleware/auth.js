'use strict';

const { getUserByToken } = require('../services/auth');

function requireAuth(db) {
  return function authenticate(request, response, next) {
    const header = String(request.headers.authorization || '');
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    const user = getUserByToken(db, token);
    if (!user) {
      response.status(401).json({
        error: { code: 'UNAUTHORIZED', message: '请先登录 ARCANA。' }
      });
      return;
    }
    request.user = user;
    request.token = token;
    next();
  };
}

module.exports = { requireAuth };
