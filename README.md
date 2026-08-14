# 髮媒 HAIR MATCH — R0.2 GLASS UI FULL

手機優先的「顧客即時需求 ↔ 附近髮型設計師／髮廊」媒合平台。

## R0.2 視覺升級
- 全站改為 Premium Glassmorphism：透明毛玻璃、柔霧背景、內高光、層次陰影。
- 字體優先使用 SF Pro / PingFang TC，並配置 Noto Sans TC / Microsoft JhengHei fallback。
- 手機版底部導覽、表單、報價卡、設計師卡與工作台全面重整。
- 視覺目標：Web 版即具備接近 App Store 正式產品的完成度，之後可直接延伸 PWA / iOS App。

## 核心流程
- 顧客首頁與「附近現在有空」探索
- 顧客發布需求：項目、時間、預算、位置、瀏覽器定位、髮長、補充說明、照片介面
- 顧客需求單：收集多份設計師方案、比價、作品、時段、選擇設計師
- 設計師公開檔案：作品、專長、價格、評價、可服務狀態
- 設計師工作台：附近需求牆、營業／接案狀態、媒合數據
- 設計師提出方案：價格、可服務時間、說明、附相關作品
- 平台 Admin：店家／設計師審核、Pilot 數據、風控入口
- PWA manifest、Web Geolocation、Vercel Blob upload API、Neon/PostgreSQL schema
- `/api/health` 健康檢查

## Demo 模式
未設定 DATABASE_URL 時，前台以 Demo 資料與 localStorage 跑流程，可以立即看 UI、發布需求與測試媒合畫面。

## 本機啟動
```bash
npm install
npm run dev
```
打開 `http://localhost:3000`

## 正式上線需要的環境
1. GitHub repository
2. Vercel project
3. Neon PostgreSQL 並執行 `database/schema.sql`
4. Vercel Blob 儲存作品與顧客髮況照片
5. 正式登入：手機 OTP / LINE Login / Apple Sign in
6. 設計師 Pro 訂閱金流
7. Google Maps / Mapbox
8. Web Push / LINE 通知
