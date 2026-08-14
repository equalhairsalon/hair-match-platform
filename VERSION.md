# R0.4.1 SAFE — GEO / PORTFOLIO / CHAT / CROSS-PLATFORM

- GPS 真實距離：顧客可發布座標與媒合半徑；設計師店家保存座標與接案半徑；工作台依公里數篩選、附近設計師依距離排序。
- 設計師作品與價目：作品集、服務項目、服務說明、價格區間、預估時間正式寫入 Neon。
- 報價可直接勾選最多 5 張相關作品，顧客報價卡直接看到。
- 顧客收到報價後可「先聊聊」；Conversation / Messages 真實走 Neon，支援 5 秒輪詢同步與未讀數。
- 報價與成交會建立 notifications 紀錄，後續可直接接 Web Push / App Push。
- PWA 跨平台：manifest、service worker、iOS apple-touch-icon、Android maskable icon、safe-area、44px 觸控尺寸、16px 手機表單字級。
- 顧客照片改為「直接拍照 / 從相簿選擇」，iPhone Safari 與 Android Chrome 共用。
- 新增 push_subscriptions schema，為後續 iOS PWA / Android Web Push 與原生 App notification 預留。
- 修正 CSS autoprefixer `start` warning，改用 `flex-start`。
- API-first：/api/providers 與 /api/demands?scope=open 均可回傳 GPS 距離，後續 iOS / Android 原生 App 共用同一 API。
