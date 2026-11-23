'use strict';

/*
 * A curated provider catalog. Models change often, so every provider also
 * allows a custom model id. Endpoints are the official API bases as of 2026.
 */
const PROVIDERS = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    api: 'openai',
    baseUrl: 'https://api.deepseek.com',
    models: ['deepseek-chat', 'deepseek-reasoner', 'deepseek-flash', 'deepseek-v4-pro'],
    docsUrl: 'https://api-docs.deepseek.com/',
    keyUrl: 'https://platform.deepseek.com/api_keys',
    keyHint: '打开 DeepSeek 开放平台 → API Keys → 创建，复制以 sk- 开头的 Key。'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    api: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    tokenParam: 'max_completion_tokens',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'o3-mini'],
    docsUrl: 'https://platform.openai.com/docs/models',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyHint: '登录 OpenAI Platform → API keys → Create new secret key，复制 sk- 开头的 Key。'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    api: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    models: ['claude-sonnet-4-20250514', 'claude-3-7-sonnet-latest', 'claude-3-5-haiku-latest'],
    docsUrl: 'https://docs.anthropic.com/en/docs/about-claude/models',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    keyHint: '登录 Anthropic Console → Settings → API Keys → Create Key，复制 sk-ant- 开头的 Key。'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    api: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com',
    models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
    docsUrl: 'https://ai.google.dev/gemini-api/docs/models',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    keyHint: '打开 Google AI Studio → Get API key → 创建并复制 API Key。'
  },
  {
    id: 'qwen',
    name: '阿里云百炼 Qwen',
    api: 'openai',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen3-max'],
    docsUrl: 'https://help.aliyun.com/zh/model-studio/',
    keyUrl: 'https://bailian.console.aliyun.com/',
    keyHint: '登录阿里云百炼控制台 → API-KEY 管理 → 创建 API-KEY。'
  },
  {
    id: 'kimi',
    name: 'Moonshot Kimi',
    api: 'openai',
    baseUrl: 'https://api.moonshot.cn/v1',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'kimi-k2-0711-preview'],
    docsUrl: 'https://platform.moonshot.cn/docs',
    keyUrl: 'https://platform.moonshot.cn/console/api-keys',
    keyHint: '登录 Moonshot 开放平台 → API Key 管理 → 新建 API Key。'
  },
  {
    id: 'zhipu',
    name: '智谱 GLM',
    api: 'openai',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-4-plus', 'glm-4-air', 'glm-4-flash', 'glm-4.5'],
    docsUrl: 'https://open.bigmodel.cn/dev/api',
    keyUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
    keyHint: '登录智谱开放平台 → API Keys → 创建 API Key。'
  },
  {
    id: 'doubao',
    name: '火山方舟豆包',
    api: 'openai',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    models: ['doubao-1-5-pro-32k-250115', 'doubao-1-5-lite-32k-250115'],
    allowCustomModel: true,
    modelHint: '方舟可能需要填写你的推理接入点 ID（ep-开头），以下模型名仅作示例。',
    docsUrl: 'https://www.volcengine.com/docs/82379',
    keyUrl: 'https://console.volcengine.com/ark',
    keyHint: '登录火山方舟控制台 → API Key 管理 → 创建 API Key；模型处填写推理接入点 ID 或模型 ID。'
  },
  {
    id: 'hunyuan',
    name: '腾讯混元',
    api: 'openai',
    baseUrl: 'https://api.hunyuan.cloud.tencent.com/v1',
    models: ['hunyuan-turbos-latest', 'hunyuan-large'],
    docsUrl: 'https://cloud.tencent.com/document/product/1729',
    keyUrl: 'https://console.cloud.tencent.com/hunyuan/api-key',
    keyHint: '登录腾讯云混元控制台 → API Key 管理 → 新建 API Key。'
  },
  {
    id: 'ernie',
    name: '百度文心 ERNIE',
    api: 'openai',
    baseUrl: 'https://qianfan.baidubce.com/v2',
    models: ['ernie-4.5-turbo-128k', 'ernie-4.0-8k'],
    docsUrl: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/',
    keyUrl: 'https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application',
    keyHint: '登录百度智能云千帆控制台 → 应用接入 → 创建应用并获取 API Key。'
  },
  {
    id: 'xai',
    name: 'xAI Grok',
    api: 'openai',
    baseUrl: 'https://api.x.ai/v1',
    models: ['grok-3', 'grok-3-mini'],
    docsUrl: 'https://docs.x.ai/',
    keyUrl: 'https://console.x.ai/',
    keyHint: '登录 xAI Console → API Keys → Create API Key。'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    api: 'openai',
    baseUrl: 'https://api.mistral.ai/v1',
    models: ['mistral-large-latest', 'mistral-small-latest'],
    docsUrl: 'https://docs.mistral.ai/getting-started/models/',
    keyUrl: 'https://console.mistral.ai/api-keys/',
    keyHint: '登录 Mistral Console → API Keys → 创建并复制 Key。'
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    api: 'openai',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: ['openai/gpt-4o', 'anthropic/claude-3.7-sonnet', 'google/gemini-2.5-pro'],
    allowCustomModel: true,
    modelHint: 'OpenRouter 的模型名采用 provider/model 格式，也可以填写任意它支持的模型 ID。',
    docsUrl: 'https://openrouter.ai/docs',
    keyUrl: 'https://openrouter.ai/keys',
    keyHint: '登录 OpenRouter → Keys → Create Key，复制 sk-or- 开头的 Key。'
  }
];

const byId = new Map(PROVIDERS.map((provider) => [provider.id, provider]));

function getProvider(id) {
  return byId.get(String(id || '')) || null;
}

function publicProviders() {
  return PROVIDERS.map((provider) => ({
    id: provider.id,
    name: provider.name,
    models: provider.models,
    docsUrl: provider.docsUrl,
    keyUrl: provider.keyUrl,
    keyHint: provider.keyHint,
    allowCustomModel: Boolean(provider.allowCustomModel),
    modelHint: provider.modelHint || ''
  }));
}

function endpointFor(provider, config) {
  return (config.providerOverrides && config.providerOverrides[provider.id]) || provider.baseUrl;
}

function joinUrl(base, path) {
  return `${String(base).replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`;
}

function providerError(status, message, code) {
  const error = new Error(message);
  error.providerStatus = status;
  error.code = code || 'PROVIDER_ERROR';
  return error;
}

function safeProviderMessage(status, text) {
  if (status === 401 || status === 403) return 'API Key 无效或没有权限。';
  if (status === 404) return '模型或接口地址不存在，请检查模型 ID。';
  if (status === 429) return '该服务商限流或额度不足，请稍后再试。';
  const message = String(text || '').replace(/\s+/g, ' ').slice(0, 180);
  return message || `服务商返回了 HTTP ${status}。`;
}

async function readJson(response) {
  const text = await response.text();
  try {
    return { json: JSON.parse(text), text };
  } catch (error) {
    return { json: null, text };
  }
}

async function testOpenAICompatible(provider, model, apiKey, config) {
  const endpoint = joinUrl(endpointFor(provider, config), 'chat/completions');
  const body = {
    model,
    messages: [{ role: 'user', content: 'Reply with just: OK' }],
    stream: false
  };
  if (!(provider.id === 'openai' && /^o\d/.test(model))) body.temperature = 0;
  if (provider.tokenParam) body[provider.tokenParam] = 8;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(config.ai.testTimeoutMs)
  });
  const { json, text } = await readJson(response);
  if (!response.ok) throw providerError(response.status, safeProviderMessage(response.status, text));
  const content = json && json.choices && json.choices[0] && json.choices[0].message
    ? json.choices[0].message.content
    : '';
  if (!content) throw providerError(response.status, '服务商返回了空内容，请检查模型。');
  return { model: (json && json.model) || model };
}

async function testAnthropic(provider, model, apiKey, config) {
  const endpoint = joinUrl(endpointFor(provider, config), 'v1/messages');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      max_tokens: 8,
      messages: [{ role: 'user', content: 'Reply with just: OK' }]
    }),
    signal: AbortSignal.timeout(config.ai.testTimeoutMs)
  });
  const { json, text } = await readJson(response);
  if (!response.ok) throw providerError(response.status, safeProviderMessage(response.status, text));
  const content = json && Array.isArray(json.content) ? json.content.map((item) => item.text).join('') : '';
  if (!content) throw providerError(response.status, 'Claude 返回了空内容。');
  return { model: (json && json.model) || model };
}

async function testGemini(provider, model, apiKey, config) {
  const endpoint = joinUrl(
    endpointFor(provider, config),
    `v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
  );
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Reply with just: OK' }] }],
      generationConfig: { maxOutputTokens: 8, temperature: 0 }
    }),
    signal: AbortSignal.timeout(config.ai.testTimeoutMs)
  });
  const { json, text } = await readJson(response);
  if (!response.ok) throw providerError(response.status, safeProviderMessage(response.status, text));
  const content = json && json.candidates && json.candidates[0] && json.candidates[0].content
    ? json.candidates[0].content.parts.map((part) => part.text || '').join('')
    : '';
  if (!content) throw providerError(response.status, 'Gemini 返回了空内容。');
  return { model };
}

async function testProvider(providerId, model, apiKey, config) {
  const provider = getProvider(providerId);
  if (!provider) throw providerError(400, '未知的服务商。', 'UNKNOWN_PROVIDER');
  if (!model) throw providerError(422, '请选择一个模型。', 'MODEL_REQUIRED');
  if (!apiKey || String(apiKey).trim().length < 8) {
    throw providerError(422, '请填写有效的 API Key。', 'KEY_REQUIRED');
  }
  const startedAt = Date.now();
  let result;
  try {
    if (provider.api === 'anthropic') {
      result = await testAnthropic(provider, model, apiKey, config);
    } else if (provider.api === 'gemini') {
      result = await testGemini(provider, model, apiKey, config);
    } else {
      result = await testOpenAICompatible(provider, model, apiKey, config);
    }
  } catch (error) {
    if (error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      throw providerError(504, '测试超时，请检查网络后重试。', 'TEST_TIMEOUT');
    }
    if (error && error.code) throw error;
    throw providerError(502, '无法连接该服务商，请检查网络。', 'UNREACHABLE');
  }
  return {
    provider: provider.id,
    providerName: provider.name,
    model: result.model || model,
    latencyMs: Date.now() - startedAt
  };
}

module.exports = {
  PROVIDERS,
  getProvider,
  publicProviders,
  testProvider,
  endpointFor,
  joinUrl,
  providerError,
  safeProviderMessage
};
