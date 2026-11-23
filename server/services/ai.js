'use strict';

const { HttpError } = require('../lib/httpError');
const { buildMessages } = require('./prompt');
const { getProvider, endpointFor, joinUrl } = require('./providers');

function parseJsonContent(content) {
  const text = String(content || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  if (!text) throw new HttpError(502, 'PROVIDER_EMPTY', '当前 API 没有返回解读内容。');
  try {
    return JSON.parse(text);
  } catch (error) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start > -1 && end > start) {
      try { return JSON.parse(text.slice(start, end + 1)); } catch (innerError) { /* ignore */ }
    }
    throw new HttpError(502, 'PROVIDER_INVALID_RESPONSE', '当前 API 返回的格式无法解析。');
  }
}

function upstreamError(provider, status, text) {
  if (status === 401 || status === 403) {
    return new HttpError(502, 'PROVIDER_AUTH_FAILED', `${provider.name} 的 API Key 无效或没有权限。`);
  }
  if (status === 404) {
    return new HttpError(502, 'PROVIDER_MODEL_NOT_FOUND', `${provider.name} 没有找到这个模型或接口。`);
  }
  if (status === 429) {
    return new HttpError(503, 'PROVIDER_RATE_LIMITED', `${provider.name} 当前限流或额度不足，请稍后再试。`);
  }
  const detail = String(text || '').replace(/\s+/g, ' ').slice(0, 200);
  return new HttpError(502, 'PROVIDER_ERROR', `${provider.name} 返回了错误${detail ? `：${detail}` : '。'}`);
}

async function parseResponse(response, provider) {
  const text = await response.text();
  let data = null;
  try { data = JSON.parse(text); } catch (error) { data = null; }
  if (!response.ok) throw upstreamError(provider, response.status, text);
  return data;
}

async function callOpenAICompatible(provider, model, apiKey, messages, config) {
  const url = joinUrl(endpointFor(provider, config), 'chat/completions');
  const body = {
    model,
    messages,
    stream: false
  };
  if (!(provider.id === 'openai' && /^o\d/.test(model))) body.temperature = config.ai.temperature;
  body[provider.tokenParam || 'max_tokens'] = config.ai.maxTokens;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(config.ai.timeoutMs)
  });
  const data = await parseResponse(response, provider);
  const content = data && data.choices && data.choices[0] && data.choices[0].message
    ? data.choices[0].message.content
    : '';
  return {
    raw: parseJsonContent(content),
    model: (data && data.model) || model,
    usage: data && data.usage ? {
      promptTokens: data.usage.prompt_tokens || 0,
      completionTokens: data.usage.completion_tokens || 0,
      totalTokens: data.usage.total_tokens || 0
    } : null
  };
}

async function callAnthropic(provider, model, apiKey, messages, config) {
  const url = joinUrl(endpointFor(provider, config), 'v1/messages');
  const system = messages.filter((item) => item.role === 'system').map((item) => item.content).join('\n\n');
  const userMessages = messages.filter((item) => item.role !== 'system');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      max_tokens: config.ai.maxTokens,
      temperature: config.ai.temperature,
      system,
      messages: userMessages
    }),
    signal: AbortSignal.timeout(config.ai.timeoutMs)
  });
  const data = await parseResponse(response, provider);
  const content = data && Array.isArray(data.content)
    ? data.content.map((item) => item.text || '').join('')
    : '';
  return {
    raw: parseJsonContent(content),
    model: (data && data.model) || model,
    usage: data && data.usage ? {
      promptTokens: data.usage.input_tokens || 0,
      completionTokens: data.usage.output_tokens || 0,
      totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0)
    } : null
  };
}

async function callGemini(provider, model, apiKey, messages, config) {
  const url = joinUrl(
    endpointFor(provider, config),
    `v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
  );
  const system = messages.filter((item) => item.role === 'system').map((item) => item.content).join('\n\n');
  const contents = messages.filter((item) => item.role !== 'system').map((item) => ({
    role: item.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: item.content }]
  }));
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      generationConfig: {
        temperature: config.ai.temperature,
        maxOutputTokens: config.ai.maxTokens
      }
    }),
    signal: AbortSignal.timeout(config.ai.timeoutMs)
  });
  const data = await parseResponse(response, provider);
  const candidate = data && data.candidates && data.candidates[0];
  const content = candidate && candidate.content
    ? candidate.content.parts.map((part) => part.text || '').join('')
    : '';
  return {
    raw: parseJsonContent(content),
    model,
    usage: data && data.usageMetadata ? {
      promptTokens: data.usageMetadata.promptTokenCount || 0,
      completionTokens: data.usageMetadata.candidatesTokenCount || 0,
      totalTokens: data.usageMetadata.totalTokenCount || 0
    } : null
  };
}

async function generateWithProvider({ providerId, model, apiKey, input, config }) {
  const provider = getProvider(providerId);
  if (!provider) throw new HttpError(422, 'UNKNOWN_PROVIDER', '未知的服务商。');
  const messages = buildMessages(input);

  try {
    if (provider.api === 'anthropic') {
      return { ...(await callAnthropic(provider, model, apiKey, messages, config)), provider, providerName: provider.name };
    }
    if (provider.api === 'gemini') {
      return { ...(await callGemini(provider, model, apiKey, messages, config)), provider, providerName: provider.name };
    }
    return { ...(await callOpenAICompatible(provider, model, apiKey, messages, config)), provider, providerName: provider.name };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      throw new HttpError(504, 'PROVIDER_TIMEOUT', 'AI 思考超时，请稍后重试。');
    }
    console.warn('[provider:error]', provider.id, error.message);
    throw new HttpError(502, 'PROVIDER_UNAVAILABLE', `无法连接 ${provider.name}，请检查网络或稍后重试。`);
  }
}

module.exports = { generateWithProvider };
