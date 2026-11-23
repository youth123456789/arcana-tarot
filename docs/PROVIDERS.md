# API 服务商与模型

ARCANA 的 API 配置不是把所有请求都写死给 DeepSeek。用户在个人中心选择一个服务商、模型和自己的 Key；后端会在**添加、测试、星标**时真实调用一次该服务商，只有调用成功才保存或切换。

> 模型列表会随服务商更新而变化。每个服务商都支持填写「自定义模型 ID」，以官方文档为准。

| 服务商 | 常见模型 | 官方文档 | 获取 Key |
| --- | --- | --- | --- |
| DeepSeek | `deepseek-chat`、`deepseek-reasoner`、`deepseek-flash`、`deepseek-v4-pro` | [api-docs.deepseek.com](https://api-docs.deepseek.com/) | [platform.deepseek.com](https://platform.deepseek.com/api_keys) |
| OpenAI | `gpt-4o`、`gpt-4o-mini`、`gpt-4.1`、`gpt-4.1-mini`、`o3-mini` | [platform.openai.com/docs/models](https://platform.openai.com/docs/models) | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Anthropic Claude | `claude-sonnet-4-20250514`、`claude-3-7-sonnet-latest`、`claude-3-5-haiku-latest` | [docs.anthropic.com](https://docs.anthropic.com/en/docs/about-claude/models) | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| Google Gemini | `gemini-2.5-pro`、`gemini-2.5-flash`、`gemini-2.0-flash` | [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models) | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| 阿里云百炼 Qwen | `qwen-max`、`qwen-plus`、`qwen-turbo`、`qwen3-max` | [help.aliyun.com/zh/model-studio](https://help.aliyun.com/zh/model-studio/) | [bailian.console.aliyun.com](https://bailian.console.aliyun.com/) |
| Moonshot Kimi | `moonshot-v1-8k`、`moonshot-v1-32k`、`kimi-k2-0711-preview` | [platform.moonshot.cn/docs](https://platform.moonshot.cn/docs) | [platform.moonshot.cn](https://platform.moonshot.cn/console/api-keys) |
| 智谱 GLM | `glm-4-plus`、`glm-4-air`、`glm-4-flash`、`glm-4.5` | [open.bigmodel.cn/dev/api](https://open.bigmodel.cn/dev/api) | [open.bigmodel.cn](https://open.bigmodel.cn/usercenter/apikeys) |
| 火山方舟豆包 | 模型 ID 或推理接入点 `ep-...` | [volcengine.com/docs/82379](https://www.volcengine.com/docs/82379) | [console.volcengine.com/ark](https://console.volcengine.com/ark) |
| 腾讯混元 | `hunyuan-turbos-latest`、`hunyuan-large` | [cloud.tencent.com/document/product/1729](https://cloud.tencent.com/document/product/1729) | [console.cloud.tencent.com](https://console.cloud.tencent.com/hunyuan/api-key) |
| 百度文心 ERNIE | `ernie-4.5-turbo-128k`、`ernie-4.0-8k` | [cloud.baidu.com/doc/WENXINWORKSHOP](https://cloud.baidu.com/doc/WENXINWORKSHOP/) | [console.bce.baidu.com](https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application) |
| xAI Grok | `grok-3`、`grok-3-mini` | [docs.x.ai](https://docs.x.ai/) | [console.x.ai](https://console.x.ai/) |
| Mistral AI | `mistral-large-latest`、`mistral-small-latest` | [docs.mistral.ai](https://docs.mistral.ai/getting-started/models/) | [console.mistral.ai](https://console.mistral.ai/api-keys/) |
| OpenRouter | `openai/gpt-4o`、`anthropic/claude-3.7-sonnet`、`google/gemini-2.5-pro` | [openrouter.ai/docs](https://openrouter.ai/docs) | [openrouter.ai/keys](https://openrouter.ai/keys) |

## 接入方式

- 大多数服务商使用 OpenAI 兼容的 `/chat/completions`。
- Claude 使用 `/v1/messages`，请求头 `x-api-key` 和 `anthropic-version`。
- Gemini 使用 `/v1beta/models/{model}:generateContent`。
- 方舟 / OpenRouter 的模型名可能不是固定列表，界面支持自定义模型 ID。

## 测试与星标

1. 在个人中心选择服务商和模型；
2. 粘贴 API Key；
3. 点击「测试并保存」；后端会发出一次真实的最小请求；
4. 返回成功后才写入 SQLite，并把 Key 用 AES-256-GCM 加密保存；
5. 点击星标时，后端会再次测试，成功后切换唯一星标；
6. 发解读时读取星标 Key，真正请求对应服务商。

如果服务商返回 401/403，通常表示 Key 无效；404 通常是模型或接入点 ID 不对；429 通常是限流或额度问题。界面会显示对应提示，不会把失败伪装成成功。
