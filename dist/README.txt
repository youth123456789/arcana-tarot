ARCANA · Android 0.4.0 (debug)

Package: com.arcana.tarot
Version: 0.4.0 (versionCode 4)
Min Android: 6.0 (SDK 23)
Target SDK: 35
APK: arcana-0.4.0-debug.apk

Install:
1. Copy the APK to your phone and open it, or run:
   adb install -r arcana-0.4.0-debug.apk
2. The app needs a deployed ARCANA backend (QQ email code + API key storage
   live on the server; the APK intentionally contains no API keys).
3. Tap the avatar in the top-right of the home screen.
4. If needed, open "服务地址" at the bottom of the personal center and enter
   the HTTPS backend URL, for example https://arcana-api.example.com.
5. Login with your QQ email code.
6. Open API 配置, choose a provider/model, paste your own API key, tap
   "添加 API", then tap the star to make it active.

Backend setup:
See ../README.md and ../docs/ANDROID.md.
The server must have QQ Mail SMTP configured for real email codes.
For local testing, the debug APK can use http://<computer-LAN-IP>:4173,
but a phone-only install should use a deployed HTTPS backend.

Release:
This APK is debug-signed for sideloading. Use a private release keystore for
store distribution and set android.allowMixedContent=false.

If an earlier debug build is already installed and Android reports a signature
conflict, uninstall the old ARCANA first, then install this APK.

SHA256: 3663BE5C5F614AEE3056E3B64A89219A20FBD5A81749B52A5BAF20B83D4BA304

