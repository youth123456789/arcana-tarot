# 我的塔罗牌 · 牌面风格

当前为前端验收版本，已覆盖 8 套牌面风格。每套风格都会应用到实际抽牌、牌阵和卡牌选择界面。

| ID | 名称 | 英文 | 价格 | 内部码 |
| --- | --- | --- | --- | --- |
| rider | 韦特·经典 | Rider–Waite | 免费 | 无 |
| rose | 铂金玫瑰·棱镜 | Prism Rose | ¥9.9 | ROSE-PRISM |
| malachite | 孔雀石·绿境 | Malachite | ¥9.9 | MALACHITE-GREEN |
| eclipse | 月蚀银辉 | Eclipse Silver | ¥9.9 | ECLIPSE-MOON |
| gilded | 鎏金圣殿 | Gilded Sanctum | ¥9.9 | GILDED-SUN |
| abyss | 深海星图 | Abyssal Atlas | ¥9.9 | ABYSS-STAR |
| terracotta | 赤陶秘境 | Terracotta | ¥9.9 | TERRACOTTA-CLAY |
| aurora | 极光棱镜 | Aurora Prism | ¥9.9 | AURORA-LIGHT |

## 内部码规则

每种风格只有一枚内部码，由制作人持有。

- 一枚内部码对应一套牌面
- 内部码可以无限次使用
- 不同用户输入同一枚内部码，都能各自解锁该牌面
- 每个用户只会拥有一条该牌面的权益记录
- 内部码在服务端只保存哈希

## 当前前端能力

- 牌库预览：8 套风格的封面与 The Moon 示例牌
- 牌面详情：大图、风格说明、6 张代表牌
- 全牌预览：每套风格可展开全部 78 张牌
- 当前牌面切换：选择后应用到实际抽牌、牌阵和卡牌选择
- 付费牌锁定：未解锁时展示 ¥9.9、收款码占位和内部码输入
- 内部码解锁：服务端校验后写入账号权益

## 牌面设计说明

当前人物画来自 Rider–Waite–Smith Tarot（Pamela Colman Smith / Arthur Edward Waite，1909），图片属于公共领域，已本地化为 78 张 WebP 并随 APK 分发。

8 套风格共用同一套韦特人物画，通过底色、边框、纹理、滤镜和装饰做视觉再设计，因此这是 8 套视觉风格，不是 8 套完全不同的手绘原画。

素材来源：Wikimedia Commons，Rider–Waite–Smith Tarot，Public Domain。  
色彩处理与界面框架为 ARCANA 前端再设计。

如果要让每套牌都有完全独立的人物画，需要另外准备 8×78 张原创或已授权插画，或逐套接入不同的公共领域牌组。

## 后端接口

已实现：

- GET /api/decks：返回当前用户已解锁牌面、选中牌面
- POST /api/decks/:id/unlock：校验内部码并写入用户权益
- PUT /api/decks/selected：保存当前选中的牌面
- deck_entitlements：用户牌面权益
- deck_invite_codes：每套牌保存一枚内部码哈希，不限制使用次数

每种风格的内部码由服务端配置提供，可以通过环境变量覆盖：

```dotenv
DECK_INVITE_CODES={"rose":"ROSE-PRISM","malachite":"MALACHITE-GREEN"}
DECK_PAYMENT_QR_URL=https://你的收款码图片地址
```

前端会从后端读取已解锁状态和选中牌面，不以本地内部码作为正式凭证。

支付目前仍是“扫码后人工发放内部码”的模式，没有接入支付回调。若要自动确认到账，需要后续接入支付平台订单接口。
