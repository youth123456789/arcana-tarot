'use strict';

const { getUserByToken } = require('../services/auth');

function requireAuth(db) {
  return async function authenticate(request, response, next) {
    try {
      const header = String(request.headers.authorization || '');
      const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
      const user = await getUserByToken(db, token);
      if (!user) {
        response.status(401).json({
          error: { code: 'UNAUTHORIZED', message: '请先登录 ARCANA。' }
        });
        return;
      }
      request.user = user;
      request.token = token;
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { requireAuth };
