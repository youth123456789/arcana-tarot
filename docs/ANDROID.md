# Android 打包与安装

ARCANA 的 Android 壳使用 Capacitor 7。`app/` 的 Web 资源会被构建到 `www/`，再同步进 `android/app/src/main/assets/public`，最后打包成 APK。

## 产物

```text
dist/arcana-0.4.0-debug.apk
```

- 应用名：ARCANA
- 包名：`com.arcana.tarot`
- versionCode：4
- versionName：0.4.0
- minSdk：23（Android 6.0）
- targetSdk / compileSdk：35
- debug 签名，可直接侧载测试

## 环境

- Node.js 24+
- JDK 21
- Android SDK 35（Android Studio 自带）
- 可选：Android Studio 最新稳定版

如果使用 Android Studio：

```bash
npm install
npm run android:open
```

然后等待 Gradle Sync，运行到手机或 Build APK。

命令行构建：

```bash
npm run android:debug
```

脚本会：

1. 生成 `www/`；
2. 执行 `npx cap sync android`；
3. 调用 `android/gradlew.bat assembleDebug`；
4. 把 APK 复制到 `dist/arcana-0.4.0-debug.apk`。

> 命令行必须能找到 `ANDROID_HOME` / SDK，或者让 Android Studio 生成 `android/local.properties`。

## 后端地址

APK 不包含 Node 服务，也不包含任何服务商 API Key。它需要连接一个已部署的后端。

### 方式一：App 内设置（推荐给测试用户）

打开 App → 右上角头像 → 抽屉底部「服务地址」→ 填写：

```text
https://api.yourdomain.com
```

局域网调试：

```text
http://192.168.1.23:4173
```

电脑和手机连同一个 Wi-Fi；后端用 `npm start` 启动，并确保防火墙允许 4173 端口。Debug APK 的 manifest 已允许 cleartext HTTP，`capacitor.config.json` 也为调试开启了 `allowMixedContent`，因此可以访问局域网 HTTP。Release 前请把 `android.allowMixedContent` 改回 `false`，并只使用 HTTPS。

### 方式二：构建时写死默认地址

```powershell
$env:ARCANA_API_BASE_URL="https://api.yourdomain.com"
npm run android:debug
```

App 内「服务地址」仍然可以覆盖构建时的默认值。

### 第一次使用

1. 打开个人中心，用 QQ 邮箱获取验证码并登录；
2. 进入「API 配置」，选择服务商、模型，粘贴自己的 API Key；
3. 点击「添加 API」保存；
4. 点击星标，切换当前使用的 API；
5. 返回牌阵开始解读。

邮箱验证码需要后端配置 Mailjet（Render 免费，可使用 QQ 发件邮箱）或 QQ SMTP；只配置 console 模式时，验证码只出现在服务端日志里。

## 安装到手机

### 文件安装

把 `dist/arcana-0.4.0-debug.apk` 发送到手机，用文件管理器点击安装。第一次可能需要允许「安装未知来源应用」。如果安装过早期测试包并提示签名冲突，先卸载旧版。

### ADB

```bash
adb install -r dist/arcana-0.4.0-debug.apk
```

## Release 签名

仓库不包含 release keystore。正式发布时：

```bash
keytool -genkeypair -v \
  -keystore arcana-release.jks \
  -alias arcana \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

把 keystore 放在 `android/` 之外或加入 `.gitignore`，不要提交密码和 jks。

在 `android/app/build.gradle` 中增加 `signingConfigs.release` 并引用 keystore，然后：

```bash
npm run android:release
```

默认未配置签名时，Gradle 只会生成 `app-release-unsigned.apk`，不能直接安装；需要配置签名或使用 `apksigner` 签名。

## GitHub Actions

`.github/workflows/android.yml` 提供手动/推送构建：

- Ubuntu + Node 22 + JDK 21；
- 安装 Android SDK；
- `npm ci`、`npm run build:web`、`npx cap sync android`；
- `./gradlew assembleDebug`；
- 上传 `arcana-debug-apk` artifact。

如果要让 CI 构建的 APK 默认连接某个后端，在仓库 Variables 中设置：

```text
ARCANA_API_BASE_URL=https://api.yourdomain.com
```

## 常见问题

### 页面能开，但解读失败

- 先确认手机浏览器能打开后端地址；
- 检查 App 内个人中心底部的「服务地址」是否填写正确；
- 检查后端 `CORS_ORIGINS` 是否包含 `https://localhost`；
- Debug 包可以用 HTTP；Release 包必须把 `android.allowMixedContent` 改为 `false` 并使用 HTTPS。

### 局域网 HTTP 连不上

- 后端 `HOST=0.0.0.0`；
- Windows 防火墙放行 Node 或 4173；
- 手机和电脑必须在同一局域网；
- 用 `http://电脑IP:4173/api/health` 在手机浏览器验证。

### Gradle 下载慢

使用 Android Studio 的 Gradle 同步，或给 Gradle 配置镜像。仓库里的 `android/gradlew` 是标准 Gradle Wrapper，不绑定某个本机路径。

### 修改了前端但 APK 没变化

```bash
npm run android:sync
npm run android:debug
```

不要直接修改 `www/` 或 `android/app/src/main/assets/public/`，它们是生成目录。
