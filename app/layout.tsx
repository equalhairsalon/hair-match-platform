import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { PwaRegister } from '@/components/PwaRegister';

export const metadata: Metadata = {
  title: '髮媒｜美業即時需求媒合平台',
  description: '美髮、美甲、美睫、美容美體的即時需求媒合平台。',
  manifest: '/manifest.webmanifest',
  applicationName: '髮媒',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '髮媒',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  other: { 'mobile-web-app-capable': 'yes' },
};

export const viewport: Viewport = {
  themeColor: '#527d58',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant-TW">
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
