# 我的塔罗牌 · 牌面风格

当前为前端验收版本，已覆盖 8 套牌面风格。每套风格都会应用到实际抽牌、牌阵和卡牌选择界面。

| ID | 名称 | 英文 | 价格 | 前端邀请码 |
| --- | --- | --- | --- | --- |
| rider | 韦特·经典 | Rider–Waite | 免费 | 无 |
| rose | 铂金玫瑰·棱镜 | Prism Rose | ¥9.9 | ROSE-PRISM |
| malachite | 孔雀石·绿境 | Malachite | ¥9.9 | MALACHITE-GREEN |
| eclipse | 月蚀银辉 | Eclipse Silver | ¥9.9 | ECLIPSE-MOON |
| gilded | 鎏金圣殿 | Gilded Sanctum | ¥9.9 | GILDED-SUN |
| abyss | 深海星图 | Abyssal Atlas | ¥9.9 | ABYSS-STAR |
| terracotta | 赤陶秘境 | Terracotta | ¥9.9 | TERRACOTTA-CLAY |
| aurora | 极光棱镜 | Aurora Prism | ¥9.9 | AURORA-LIGHT |

## 当前前端能力

- 牌库预览：8 套风格的封面与 The Moon 示例牌
- 牌面详情：大图、风格说明、6 张代表牌
- 全牌预览：每套风格可展开全部 78 张牌
- 当前牌面切换：选择后应用到实际抽牌、牌阵和卡牌选择
- 付费牌锁定：未解锁时展示 ¥9.9、收款码占位和邀请码输入
- 邀请码演示解锁：当前写入 localStorage，仅用于前端验收

## 牌面设计说明

当前人物画来自 Rider–Waite–Smith Tarot（Pamela Colman Smith / Arthur Edward Waite，1909），图片属于公共领域，已本地化为 78 张 WebP 并随 APK 分发。

8 套风格共用同一套韦特人物画，通过底色、边框、纹理、滤镜和装饰做视觉再设计，因此这是 8 套视觉风格，不是 8 套完全不同的手绘原画。

素材来源：Wikimedia Commons，Rider–Waite–Smith Tarot，Public Domain。  
色彩处理与界面框架为 ARCANA 前端再设计。

如果要让每套牌都有完全独立的人物画，需要另外准备 8×78 张原创或已授权插画，或逐套接入不同的公共领域牌组。

## 后端接入计划

前端验收后，再实现：

- 收款码配置
- 订单与支付状态
- 每种风格独立的邀请码
- 邀请码一次性或限次使用
- 用户已购牌面同步到账号
- 未购买时服务端拒绝下发付费牌面资源

当前前端邀请码只用于验收，不能作为正式付费凭证。
