# GitHub + Vercel 初次上線

> Repository 暫用 `hair-match-platform`。正式品牌名稱確定後可再改 GitHub/Vercel 專案名稱，不影響程式核心。

## A. GitHub：第一次建立 repository

### 方法 1：Terminal（推薦，最乾淨）
1. GitHub 建立新的空白 repository：`hair-match-platform`。
2. 建立時不要另外勾 README / .gitignore / License，因為專案裡已經有。
3. 解壓縮完整專案，Terminal `cd` 到專案資料夾。
4. 執行：

```bash
git init
git add .
git commit -m "R0.2 glass UI initial release"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/hair-match-platform.git
git push -u origin main
```

之後更新只需要：

```bash
git add .
git commit -m "update"
git push
```

### 方法 2：GitHub Desktop
1. File → Add Local Repository。
2. 選解壓縮後的專案資料夾。
3. 若尚未初始化，選 Create a Repository。
4. Commit to main。
5. Publish repository。

## B. Vercel：第一次部署
1. 登入 Vercel。
2. Add New… → Project。
3. 連接 GitHub，找到剛才的 `hair-match-platform`。
4. Import。
5. Framework 應自動辨識為 Next.js。
6. 這個 repository 的根目錄就是 Next.js 專案，所以 Root Directory 保持預設 `.`。
7. 第一次只看 UI Demo 時，可以不填資料庫環境變數，先 Deploy。

每次 `git push` 到連接的 repository 後，Vercel 會自動重新部署。

## C. 正式資料功能再加入 Environment Variables
Vercel → Project → Settings → Environment Variables。

依 `.env.example` 加入：

```text
DATABASE_URL=...
AUTH_SECRET=...
BLOB_READ_WRITE_TOKEN=...
NEXT_PUBLIC_MAP_PROVIDER=none
NEXT_PUBLIC_APP_URL=https://你的正式網域
```

注意：
- `.env` / `.env.local` 不可 push 到 GitHub。
- `DATABASE_URL`、`AUTH_SECRET`、`BLOB_READ_WRITE_TOKEN` 都屬於 secret。
- UI Demo 階段可先不填 `DATABASE_URL`，目前程式會走 Demo/localStorage 流程。

## D. 下一階段正式接線順序
1. GitHub + Vercel 先讓 Web UI 上線。
2. Neon 建 PostgreSQL，執行 `database/schema.sql`。
3. 把 Neon `DATABASE_URL` 放進 Vercel Environment Variables。
4. 建立 Vercel Blob，取得 `BLOB_READ_WRITE_TOKEN`。
5. 實作正式帳號登入與角色：顧客 / 設計師 / 店家 / 平台管理員。
6. 把 Demo/localStorage 媒合流程換成正式 API + DB。
7. 接定位地圖與通知。
