'use client';

import { useEffect } from 'react';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Admin route error', error);
  }, [error]);

  return (
    <div className="admin-panel" style={{ margin: 24 }}>
      <h2>管理後台暫時無法載入</h2>
      <p className="muted">系統已攔截伺服器錯誤，不會再顯示整頁白屏。請先查看診斷結果。</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-brand" onClick={() => reset()}>重新載入</button>
        <a className="btn" href="/api/admin/diagnostics">查看診斷</a>
        <a className="btn" href="/">回顧客平台</a>
      </div>
      {error.digest && <p className="muted" style={{ marginTop: 12 }}>Digest: {error.digest}</p>}
    </div>
  );
}
