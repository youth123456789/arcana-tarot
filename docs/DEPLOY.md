# 后端部署完整步骤

当前功能要求一个**可公网访问的后端**，因为：

- QQ 邮箱验证码必须由服务端 SMTP 发出；
- 用户的 API Key 不能保存在 APK 里；
- 多个朋友共用一个后端时，账号和 Key 需要按用户隔离。

好消息是：**只需要部署一次**。部署完成后，朋友只安装 APK，用 QQ 邮箱注册即可，不需要各自部署。

---

## 费用与域名

- **不需要买域名**：Render 会提供一个 `https://你的服务名.onrender.com` 地址，自带 HTTPS。
- **不需要买服务器**：Render 负责运行 Docker 容器。
- 但 SQLite 需要持久磁盘，Render 的免费 Web Service 不能挂载磁盘，重启/重新部署会丢数据。因此要长期给朋友使用，建议用付费的 Starter 实例。
- 参考价格（以 Render 控制台实际显示为准）：Starter Web Service 约 7 美元/月，持久磁盘 0.25 美元/GB/月；1 GB 磁盘合计约 7.25 美元/月。价格可能调整，详见 [Render Pricing](https://render.com/pricing)。
- QQ SMTP 本身免费；朋友使用自己的 API Key，模型费用由各自承担。

**完全没有预算时**：可以先用 Render 免费 Web Service 走通流程，但账号和 API Key 会在重启后丢失，只能测试；或者改用免费云服务器 + 外部 Postgres（需要改造数据库层），或本地电脑临时运行（不能脱离电脑）。不建议把免费临时方案直接给朋友长期用。

## 方案 A：Render（推荐，最少运维）

需要：

- GitHub 账号
- Render 账号
- 一个 QQ 邮箱的 SMTP 授权码
- Render 的付费实例（SQLite 需要持久磁盘，免费实例不适合）

### 1. 把项目推到 GitHub

在项目根目录执行：

```bash
git init
git add .
git commit -m "ARCANA 0.4"
git branch -M main
git remote add origin https://github.com/你的用户名/arcana-tarot.git
git push -u origin main
```

> `.env`、`node_modules`、`data/`、APK 工作目录已经被 `.gitignore` 排除。不要提交任何 API Key 或 SMTP 授权码。

### 2. 在 Render 创建 Blueprint

1. 登录 [Render](https://render.com/)；
2. Dashboard → **New +** → **Blueprint**；
3. 选择刚才的 GitHub 仓库；
4. Render 会自动读取仓库根目录的 [`render.yaml`](../render.yaml)；
5. 点击 **Apply**。

`render.yaml` 会创建：

- 一个 Docker Web Service；
- 一个 1 GB 持久磁盘，挂载到 `/data`；
- `APP_SECRET` 自动生成；
- `DB_PATH=/data/arcana.db`；
- `MAIL_MODE=smtp`；
- 健康检查 `/api/health`。

### 3. 填写 SMTP 密钥

在 Render 服务的 **Environment** 中填写：

```text
SMTP_USER=你的QQ邮箱@qq.com
SMTP_PASS=QQ邮箱SMTP授权码
```

QQ 邮箱授权码获取：

1. 登录 QQ 邮箱网页版；
2. 设置 → 账户；
3. 开启「POP3/IMAP/SMTP 服务」；
4. 生成授权码；
5. 把授权码填到 `SMTP_PASS`，不要填 QQ 登录密码。

`SMTP_HOST=smtp.qq.com`、`SMTP_PORT=465`、`SMTP_SECURE=true` 已经在模板里。

### 4. 等待部署并拿到 URL

部署完成后，Render 会给出类似：

```text
https://arcana-xxxx.onrender.com
```

验证：

```bash
curl https://arcana-xxxx.onrender.com/api/health
```

返回 `ok: true`、`mail.mode: smtp`、`storage: sqlite` 即正常。

### 5. 手机连接

1. 安装 `dist/arcana-0.4.0-debug.apk`；
2. 打开首页右上角头像；
3. 点「服务地址」，填入上面的 HTTPS URL；
4. 用 QQ 邮箱获取验证码并登录；
5. 进入 API 配置，添加并星标自己的 API Key。

如果想让朋友完全不用填地址，可以在构建 APK 时写入：

```powershell
$env:ARCANA_API_BASE_URL="https://arcana-xxxx.onrender.com"
npm run android:debug
```

---

## 方案 B：自己的 VPS / 云服务器

需要：

- 一台 Ubuntu 22.04/24.04 云服务器；
- 一个域名（用于 HTTPS）；
- 开放 80/443 端口；
- QQ 邮箱 SMTP 授权码。

### 1. 安装 Docker

```bash
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable --now docker
```

### 2. 拉取项目

```bash
git clone https://github.com/你的用户名/arcana-tarot.git
cd arcana-tarot
```

### 3. 配置环境变量

```bash
cp .env.example .env
nano .env
```

至少改成：

```dotenv
NODE_ENV=production
APP_SECRET=64位随机字符串
DB_PATH=/data/arcana.db
MAIL_MODE=smtp
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=你的QQ邮箱@qq.com
SMTP_PASS=QQ邮箱SMTP授权码
CORS_ORIGINS=https://localhost,capacitor://localhost
```

生成 `APP_SECRET`：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. 构建并运行

```bash
docker build -t arcana .
docker volume create arcana-data
docker run -d \
  --name arcana \
  --restart unless-stopped \
  -p 127.0.0.1:4173:4173 \
  -v arcana-data:/data \
  --env-file .env \
  arcana
```

### 5. 配置 HTTPS

用 Caddy 最简单：

```bash
sudo apt install -y caddy
sudo nano /etc/caddy/Caddyfile
```

写入：

```text
api.你的域名.com {
    reverse_proxy 127.0.0.1:4173
}
```

```bash
sudo systemctl reload caddy
```

把域名的 A 记录指向服务器公网 IP，等待证书自动签发。然后：

```bash
curl https://api.你的域名.com/api/health
```

---

## 方案 C：本机临时测试

只适合测试，不适合朋友使用：

```bash
npm install
copy .env.example .env
npm start
```

Debug APK 可以填：

```text
http://电脑局域网IP:4173
```

需要手机和电脑在同一 Wi-Fi，Windows 防火墙放行 4173。这个方案依赖电脑开着，不能做到「只用手机」。

---

## 不部署，可以吗？

如果保留以下功能，**不可以**：

- QQ 邮箱验证码登录；
- 多用户账号；
- 服务端加密保存 API Key；
- 统一调用服务商 API。

这些都必须有可信服务端。可以做的替代方案是大幅削减功能：

- 取消邮箱登录，只做本机单用户；
- 把 API Key 存在手机本地；
- 由手机直接请求服务商（部分服务商可能因 CORS 或安全策略失败）。

这会变成另一个产品，而且安全性、兼容性都更差，不推荐现在这样做。

---

## 朋友共用时的边界

- 账号按 `user_id` 隔离，API Key 加密保存，朋友看不到彼此的 Key。
- 每个朋友使用自己的 API Key，模型费用各自承担。
- 邮件从你的 QQ 邮箱发出；朋友多时注意发送限制。
- 你作为服务端管理员持有 `APP_SECRET` 和数据库，建议只给信任的人使用。
- 目前没有邀请码；任何拿到后端 URL 的人都能注册。若要严格控制，需要后续加白名单。
