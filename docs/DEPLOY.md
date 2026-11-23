# 免费部署完整步骤

目标：**不买域名、不买服务器**，尽量只使用免费层（是否要求绑定付款方式以平台当时政策为准）。

架构：

```text
Android APK
   ↓ HTTPS
Render Free Web Service
   ├── Supabase Free Postgres：账号、Session、加密 API Key
   └── SMTP2GO Free HTTPS API：QQ 邮箱验证码
```

所需账号：

- GitHub（仓库已有）
- Render
- Supabase
- SMTP2GO

三个平台都有免费层。免费层有休眠/暂停/额度限制，但数据能持久保存。

---

## 为什么不直接用 Render 免费 + QQ SMTP

Render 免费 Web Service 有两个硬限制：

1. 不能挂持久磁盘，SQLite 重启会丢数据；
2. 封锁 SMTP 出站端口 25 / 465 / 587，QQ SMTP 发不出验证码。

参考：[Render 公告](https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports)

所以免费方案必须：

- 用 Supabase Postgres 代替 SQLite；
- 用 SMTP2GO HTTPS API 代替 QQ SMTP。

代码已经支持这两种模式。

---

## 第 0 步：把最新代码推到 GitHub

Render 构建的是 GitHub 上的代码，不是本机文件。先确认仓库已经包含最新的：

- `server/db.js`（Postgres 支持）
- `server/mail.js`（SMTP2GO 支持）
- `render.yaml`（`plan: free`，无磁盘）

在项目根目录执行：

```bash
git status
git add .
git commit -m "ARCANA free backend"
git push origin main
```

如果仓库还是旧版，Render 会按旧版启动，免费方案会失败。

## 第 1 步：创建 Supabase 数据库

1. 打开 <https://supabase.com/>，用 GitHub 登录；
2. **New project**；
3. 名称随意，例如 `arcana`；
4. 区域选 **Southeast Asia (Singapore)** 或日本；
5. 设置数据库密码并保存好；
6. 等待项目初始化完成。

### 获取连接串

进入项目：

```text
Connect → Session Pooler
```

复制 **Session Pooler** 的连接串，不要用 Direct Connection。Render 的网络环境更适合 Pooler，而且 Direct Connection 可能只有 IPv6。

连接串类似：

```text
postgresql://postgres.xxxx:你的密码@aws-0-region.pooler.supabase.com:5432/postgres
```

如果密码包含 `@`、`#`、`/` 等字符，要在连接串里做 URL 编码，或改用只含字母数字的密码。

> 第一次启动后端时会自动建表，不需要手动执行 SQL。

免费项目连续 7 天无活动会暂停。暂停后打开 Supabase Dashboard 点 **Restore**，再访问 App 即可。

---

## 第 2 步：创建 SMTP2GO 邮件账号

QQ 邮箱不能作为 Brevo 的发件人，因为 Brevo 要求对自有域名做认证，免费邮箱域名无法通过。  
SMTP2GO 的免费计划允许添加单个发件邮箱，适合只有 QQ 邮箱的情况。

1. 打开 <https://www.smtp2go.com/>，免费注册；
2. 进入 Senders；
3. 添加你的 QQ 邮箱作为 single sender；
4. 去 QQ 邮箱收验证码并完成验证；
5. 进入 API Keys；
6. 创建一个 API Key 并保存。

免费额度约 1000 封/月、200 封/天。

关键配置：

```dotenv
MAIL_MODE=smtp2go
SMTP2GO_API_KEY=你的 SMTP2GO API Key
MAIL_FROM=你的QQ邮箱@qq.com
```

`MAIL_FROM` 必须是 SMTP2GO 里已验证的发件邮箱，否则 API 会拒绝。

---

## 第 3 步：Render 创建免费服务

1. 打开 <https://dashboard.render.com/>；
2. 用 GitHub 登录；
3. 点 **New + → Blueprint**；
4. 选择仓库：

```text
youth123456789/arcana-tarot
```

5. Branch 选 `main`；
6. Render 自动读取仓库根目录的 `render.yaml`；
7. 确认服务配置：

```text
Name: arcana
Runtime: Docker
Plan: Free
Health Check: /api/health
Disk: 无
```

8. 填写环境变量：

```text
DATABASE_URL=第 1 步的 Supabase Session Pooler 连接串
SMTP2GO_API_KEY=第 2 步的 SMTP2GO API Key
MAIL_FROM=你的QQ邮箱@qq.com
```

`APP_SECRET` 会自动生成，不要手动改。改了以后已经保存的 API Key 会解不开。

9. 点 **Apply** 或 **Deploy**。

> 如果 Blueprint 没有自动识别：
>
> **New + → Web Service** → 选择仓库 → Runtime 选 **Docker** → Plan 选 **Free** → Health Check 填 `/api/health` → 添加上面的环境变量。

Render 免费计划通常不需要付款方式；如果页面要求绑卡，以 Render 当时的政策为准。不要选 Starter，否则会产生费用。

---

## 第 4 步：验证部署

部署完成后，Render 会给一个地址：

```text
https://arcana-xxxx.onrender.com
```

浏览器打开：

```text
https://arcana-xxxx.onrender.com/api/health
```

预期返回：

```json
{
  "ok": true,
  "service": "arcana",
  "mail": { "mode": "smtp2go" },
  "storage": "postgres"
}
```

如果 `storage` 是 `sqlite`，说明 `DATABASE_URL` 没生效；  
如果 `mail.mode` 是 `smtp`，说明 `MAIL_MODE` 没生效。

免费实例闲置约 15 分钟后会休眠。第一次访问可能需要等 30–60 秒，这是正常现象。

---

## 第 5 步：连接手机

1. 安装 APK；
2. 头像 → 服务地址；
3. 填 Render 的 HTTPS 地址；
4. 用 QQ 邮箱获取验证码；
5. 添加 API Key，点击星标；
6. 开始解读。

如果想让朋友完全不用填地址，构建 APK 时写入：

```powershell
$env:ARCANA_API_BASE_URL="https://arcana-xxxx.onrender.com"
npm run android:debug
```

---

## 常见问题

### 验证码一直收不到

检查：

- SMTP2GO 的 sender 是否已验证；
- `MAIL_FROM` 是否和已验证 sender 完全一致；
- `SMTP2GO_API_KEY` 是否正确；
- SMTP2GO 免费额度是否用完；
- Render 日志里是否出现 `SMTP2GO HTTP 401/400`。

### Render 日志报数据库连接失败

- 确认用的是 **Session Pooler**，不是 Direct Connection；
- 确认 Supabase 项目没有暂停；
- 密码里的特殊字符是否做了 URL 编码；
- 连接串是否包含 `postgresql://`。

### Render 免费实例很慢

免费实例会休眠，第一次请求需要唤醒。可以接受就继续用；不能接受再升级 Render Starter（约 $7/月），代码不需要改。

### Supabase 免费项目暂停

登录 Supabase Dashboard，恢复项目，然后重新访问 Render 地址。

### Render 免费实例能挂磁盘吗

不能。当前方案已经用 Supabase 代替磁盘，不需要磁盘。

---

## 免费方案的限制

- Render 免费：休眠、冷启动、512 MB 内存；
- Supabase 免费：500 MB 数据库，7 天不活动暂停；
- SMTP2GO 免费：约 1000 封/月；
- 限流在单实例内存里，适合小范围朋友；
- 不适合大量公开用户或商业运营。

---

## 如果以后想花钱升级

最简单：

- Render 升到 Starter；
- Render 加 1 GB 持久磁盘；
- 数据库可以继续用 Supabase，也可以切回 SQLite；
- QQ SMTP 可用，但当前 SMTP2GO 也可以继续用。

代码不需要改，只改环境变量和 Render 套餐。

---

## 不部署可以吗

如果保留 QQ 邮箱登录、服务端保存 Key、多用户隔离，就必须有后端。

可以放弃的功能：

- 取消邮箱登录；
- Key 只存在手机本地；
- 手机直接请求服务商。

这会变成另一个单机产品，兼容性和安全性都更差，不推荐。
