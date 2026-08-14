import './globals.css';
import type { Metadata, Viewport } from 'next';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: `${BRAND.name}｜美髮即時需求媒合平台`,
  description: BRAND.description,
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#527d58',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
