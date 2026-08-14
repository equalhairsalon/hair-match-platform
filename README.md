# Hair Match Platform — R0.4 GEO / PORTFOLIO / CHAT / CROSS-PLATFORM

Cloud-first 的美髮即時需求媒合平台。Web/PWA 先行，iPhone Safari 與 Android Chrome 同步驗收；未來原生 iOS / Android 共用同一套 API、Neon 資料庫與媒合邏輯。

## R0.4 已完成

- 顧客 / 設計師 Email 密碼帳號與 HttpOnly JWT session。
- Neon 真實資料：需求、報價、預約、作品、價目、聊天、通知紀錄。
- 顧客 GPS、媒合半徑與髮況照片。
- 設計師店家 GPS、接案半徑、附近需求真實距離排序。
- 附近設計師 API 可接受 lat/lng/radius，方便未來原生 App 直接使用。
- 設計師作品集與公開價目表管理。
- 報價可附最多 5 張相關作品。
- 顧客收到報價後可「先聊聊」，訊息寫入 Neon 並在不同裝置同步。
- PWA manifest / service worker / iOS icon / Android maskable icon / safe-area / 觸控尺寸。
- iPhone / Android 分開提供「直接拍照」與「從相簿選擇」。
- notifications 與 push_subscriptions schema 已預留，下一階段可直接接 Web Push / APNs / FCM。

## 正式架構

- GitHub：程式碼 source of truth
- Vercel：Production Web / API
- Neon PostgreSQL：會員、設計師、店家、需求、報價、預約、聊天等主要資料
- Vercel Blob：顧客髮況照、設計師作品與店家照片
- PWA：現階段手機主畫面使用
- Native apps：成熟後上 iOS App Store，並保留 Android / Google Play 共用後端

## R0.4 升級

1. Neon SQL Editor 執行 `database/R0.4_MIGRATION.sql`。
2. Vercel Storage 新增 Vercel Blob 並 Connect 到 `hair-match-platform`，確認環境變數出現 `BLOB_READ_WRITE_TOKEN`。
3. 本機 `npm install && npm run dev`。
4. 手機完整 GPS / 相機測試以 `https://hair-match-platform.vercel.app` 為準。
5. `git add . && git commit -m "R0.4 geo portfolio chat cross-platform" && git push`。

詳細步驟見 `R0.4_GO_LIVE.md`。
