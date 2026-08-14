import './globals.css';
import type { Metadata, Viewport } from 'next';
import { BRAND } from '@/lib/brand';
import { PwaRegister } from '@/components/PwaRegister';

export const metadata: Metadata = {
  title: `${BRAND.name}｜美業即時需求媒合平台`,
  description: BRAND.description,
  manifest: '/manifest.webmanifest',
  applicationName: BRAND.name,
  appleWebApp: {capable:true,statusBarStyle:'black-translucent',title:BRAND.name},
  formatDetection: {telephone:false,email:false,address:false},
  icons: {
    icon: [{url:'/icons/icon-192.png',sizes:'192x192',type:'image/png'},{url:'/icons/icon-512.png',sizes:'512x512',type:'image/png'}],
    apple: [{url:'/apple-touch-icon.png',sizes:'180x180',type:'image/png'}],
  },
  other: {'mobile-web-app-capable':'yes'},
};

export const viewport: Viewport = {
  themeColor: '#527d58',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="zh-Hant-TW"><body><PwaRegister/>{children}</body></html>;
}
