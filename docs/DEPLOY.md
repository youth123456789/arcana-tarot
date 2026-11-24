# 免费部署完整步骤

目标：**不买域名、不买服务器**，尽量只使用免费层（是否要求绑定付款方式以平台当时政策为准）。

架构：

```text
Android APK
   ↓ HTTPS
Render Free Web Service
   ├── Neon Free Postgres：账号、Session、加密 API Key
   └── EmailJS Free HTTPS API：QQ 邮箱验证码
```

所需账号：

- GitHub（仓库已有）
- Render
- Neon
- EmailJS

三个平台都有免费层。免费层有休眠/暂停/额度限制，但数据能持久保存。

---

## 为什么不直接用 Render 免费 + QQ SMTP

Render 免费 Web Service 有两个硬限制：

1. 不能挂持久磁盘，SQLite 重启会丢数据；
2. 封锁 SMTP 出站端口 25 / 465 / 587，QQ SMTP 发不出验证码。

参考：[Render 公告](https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports)

所以免费方案必须：

- 用 Neon Postgres 代替 SQLite；
- 用 EmailJS HTTPS API 代替 QQ SMTP。

代码已经支持这两种模式。

---

## 第 0 步：把最新代码推到 GitHub

Render 构建的是 GitHub 上的代码，不是本机文件。先确认仓库已经包含最新的：

- `server/db.js`（Postgres 支持）
- `server/mail.js`（EmailJS 支持）
- `render.yaml`（`plan: free`，无磁盘）

在项目根目录执行：

```bash
git status
git add .
git commit -m "ARCANA free backend"
git push origin main
```

如果仓库还是旧版，Render 会按旧版启动，免费方案会失败。

## 第 1 步：创建 Neon 数据库

1. 打开 <https://neon.tech/>，用 GitHub 登录；
2. New Project；
3. 区域选 Singapore；
4. 创建完成后进入 Dashboard；
5. 打开 Connect 或 Connection string；
6. 确认 Connection pooling 已开启；
7. 复制连接串，点 Show password 获取真实密码。

连接串形如：

```text
postgresql://neondb_owner:真实密码@ep-xxxx-pooler.c-5.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

注意：

- 把星号换成真实密码；
- 删除 `&channel_binding=require`，Node 的 pg 驱动不需要；
- 首次启动后端会自动建表。

Neon 免费项目会自动挂起，第一次请求需要唤醒。

## 第 2 步：创建 EmailJS 邮件账号

Mailjet 账号被风控关闭，Brevo、SMTP2GO、SendGrid 也都不适合只有 QQ 邮箱的情况。  
EmailJS 免费计划不需要域名或手机验证，可以通过 SMTP 连接你的 QQ 邮箱发送验证码。

1. 打开 <https://www.emailjs.com/>，免费注册；
2. 进入 Email Services → Add New Service；
3. 选择 SMTP（不是 Gmail）；
4. 填写 QQ 邮箱 SMTP：
   - Host: `smtp.qq.com`
   - Port: `465`
   - SSL: 开启
   - Username: 你的QQ邮箱@qq.com
   - Password: QQ 邮箱 SMTP 授权码
   - From: 你的QQ邮箱@qq.com
5. 保存后记下 Service ID；
6. 进入 Email Templates → Create New Template；
7. To Email 填 `{{to_email}}`，Subject 填 `ARCANA 登录验证码`，正文里放 `{{code}}`；
8. 保存后记下 Template ID；
9. 进入 Account → General，复制 Public Key；
10. 进入 Account → Security，启用 Private Key 并复制。

免费额度约 200 封/月。

关键配置：

```dotenv
MAIL_MODE=emailjs
EMAILJS_SERVICE_ID=Service ID
EMAILJS_TEMPLATE_ID=Template ID
EMAILJS_PUBLIC_KEY=Public Key
EMAILJS_PRIVATE_KEY=Private Key
```

模板里的变量名必须是：

```text
{{to_email}}
{{code}}
```

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
DATABASE_URL=第 1 步的 Neon 连接串
EMAILJS_SERVICE_ID=第 2 步的 Service ID
EMAILJS_TEMPLATE_ID=第 2 步的 Template ID
EMAILJS_PUBLIC_KEY=第 2 步的 Public Key
EMAILJS_PRIVATE_KEY=第 2 步的 Private Key
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
  "mail": { "mode": "emailjs" },
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

- EmailJS 的 SMTP 服务是否连接成功；
- QQ 邮箱 SMTP 授权码是否正确；
- 模板里是否有 `{{to_email}}` 和 `{{code}}`；
- `EMAILJS_SERVICE_ID` 和 `EMAILJS_TEMPLATE_ID` 是否正确；
- `EMAILJS_PUBLIC_KEY` 和 `EMAILJS_PRIVATE_KEY` 是否正确；
- EmailJS 免费额度是否用完；
- Render 日志里是否出现 `EmailJS HTTP 400/401/403`。

### Render 日志报数据库连接失败

- 确认连接串里是真实密码；
- 删除连接串末尾的 `&channel_binding=require`；
- 确认 Neon 项目没有暂停；
- 密码里的特殊字符是否做了 URL 编码；
- 连接串是否包含 `postgresql://`。

### Render 免费实例很慢

免费实例会休眠，第一次请求需要唤醒。可以接受就继续用；不能接受再升级 Render Starter（约 $7/月），代码不需要改。

### Neon 免费项目挂起

打开 Neon Dashboard 唤醒项目，然后重新访问 Render 地址。

### Render 免费实例能挂磁盘吗

不能。当前方案已经用 Neon 代替磁盘，不需要磁盘。

---

## 免费方案的限制

- Render 免费：休眠、冷启动、512 MB 内存；
- Neon 免费：约 0.5 GB 数据库，闲置后会自动挂起；
- EmailJS 免费：约 200 封/月；
- 限流在单实例内存里，适合小范围朋友；
- 不适合大量公开用户或商业运营。

---

## 如果以后想花钱升级

最简单：

- Render 升到 Starter；
- Render 加 1 GB 持久磁盘；
- 数据库可以继续用 Neon，也可以切回 SQLite；
- QQ SMTP 可用，但当前 EmailJS 也可以继续用。

代码不需要改，只改环境变量和 Render 套餐。

---

## 不部署可以吗

如果保留 QQ 邮箱登录、服务端保存 Key、多用户隔离，就必须有后端。

可以放弃的功能：

- 取消邮箱登录；
- Key 只存在手机本地；
- 手机直接请求服务商。

这会变成另一个单机产品，兼容性和安全性都更差，不推荐。
