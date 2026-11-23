/* =========================================================
   ARCANA · API client
   Keeps network concerns out of the UI layer.
   ========================================================= */
(function (global) {
  'use strict';

  function ApiError(message, code, status) {
    this.name = 'ApiError';
    this.message = message;
    this.code = code || 'API_ERROR';
    this.status = status || 0;
  }
  ApiError.prototype = Object.create(Error.prototype);
  ApiError.prototype.constructor = ApiError;

  function apiBaseUrl() {
    try {
      var saved = window.localStorage.getItem('arcana.apiBaseUrl');
      if (saved) return saved.replace(/\/+$/, '');
    } catch (error) {
      // localStorage can be unavailable in private or embedded contexts.
    }
    var configured = window.ARCANA_CONFIG && window.ARCANA_CONFIG.apiBaseUrl;
    return configured ? String(configured).replace(/\/+$/, '') : '';
  }

  function getToken() {
    try { return window.localStorage.getItem('arcana.token') || ''; }
    catch (error) { return ''; }
  }

  function setToken(token) {
    try {
      if (token) window.localStorage.setItem('arcana.token', token);
      else window.localStorage.removeItem('arcana.token');
    } catch (error) { /* ignore */ }
  }

  function clearToken() {
    setToken('');
  }

  function messageForStatus(status, body) {
    if (body && body.error && body.error.message) return body.error.message;
    if (status === 401) return '登录已失效，请重新登录。';
    if (status === 404) return '没有找到接口，请检查连接设置中的服务地址。';
    if (status === 409) return '请先在个人中心配置可用的 API。';
    if (status === 429) return '请求太频繁，请稍后再试。';
    if (status === 503) return '服务暂时不可用，请稍后再试。';
    if (status === 504) return '请求超时，请稍后重试。';
    if (status >= 500) return '服务暂时出了点问题，请稍后重试。';
    return '请求没有被接受，请检查输入。';
  }

  async function request(path, options) {
    options = options || {};
    var base = apiBaseUrl();
    if (!base && location.hostname === 'localhost' && !location.port) {
      throw new ApiError('还没有连接解读服务，请先填写后端地址。', 'CONFIG_REQUIRED', 0);
    }

    var headers = { 'Accept': 'application/json' };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    var token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;

    var response;
    try {
      response = await fetch(base + path, {
        method: options.method || 'GET',
        headers: headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: options.signal
      });
    } catch (error) {
      if (error && error.name === 'AbortError') throw error;
      throw new ApiError('无法连接到服务。请检查网络和服务地址。', 'NETWORK_ERROR', 0);
    }

    var body = null;
    try { body = await response.json(); } catch (error) { body = null; }

    if (!response.ok) {
      var code = body && body.error ? body.error.code : 'API_ERROR';
      if (response.status === 401 && options.auth !== false) clearToken();
      throw new ApiError(messageForStatus(response.status, body), code, response.status);
    }
    return body;
  }

  function requireToken() {
    if (!getToken()) throw new ApiError('请先登录 ARCANA。', 'LOGIN_REQUIRED', 401);
  }

  async function requestCode(email) {
    return request('/api/auth/request-code', {
      method: 'POST',
      body: { email: email },
      auth: false
    });
  }

  async function verifyCode(email, code) {
    var data = await request('/api/auth/verify-code', {
      method: 'POST',
      body: { email: email, code: code },
      auth: false
    });
    if (data && data.token) setToken(data.token);
    return data;
  }

  async function me() {
    requireToken();
    return request('/api/auth/me');
  }

  async function logout() {
    try { await request('/api/auth/logout', { method: 'POST' }); }
    catch (error) { /* clearing locally is enough */ }
    clearToken();
  }

  async function providers() {
    return request('/api/keys/providers', { auth: false });
  }

  async function listKeys() {
    requireToken();
    return request('/api/keys');
  }

  async function addKey(payload) {
    requireToken();
    return request('/api/keys', { method: 'POST', body: payload });
  }

  async function updateKey(id, payload) {
    requireToken();
    return request('/api/keys/' + encodeURIComponent(id), { method: 'PUT', body: payload });
  }

  async function testKey(id) {
    requireToken();
    return request('/api/keys/' + encodeURIComponent(id) + '/test', { method: 'POST' });
  }

  async function starKey(id) {
    requireToken();
    return request('/api/keys/' + encodeURIComponent(id) + '/star', { method: 'PUT' });
  }

  async function deleteKey(id) {
    requireToken();
    return request('/api/keys/' + encodeURIComponent(id), { method: 'DELETE' });
  }

  async function createReading(payload, options) {
    requireToken();
    options = options || {};
    return request('/api/readings', {
      method: 'POST',
      body: payload,
      signal: options.signal
    });
  }

  global.ArcanaAPI = {
    ApiError: ApiError,
    requestCode: requestCode,
    verifyCode: verifyCode,
    me: me,
    logout: logout,
    providers: providers,
    listKeys: listKeys,
    addKey: addKey,
    updateKey: updateKey,
    testKey: testKey,
    starKey: starKey,
    deleteKey: deleteKey,
    createReading: createReading,
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    apiBaseUrl: apiBaseUrl
  };
})(window);
