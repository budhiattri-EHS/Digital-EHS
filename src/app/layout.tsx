import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SBL EHS Central • Enterprise Cloud Platform',
  description: 'Commercial Multi-Tenant B2B EHS Management SaaS Platform across 24 Core Industrial Modules',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png'
  }
};

export const viewport: Viewport = {
  themeColor: '#f5f5f7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f5f5f7] text-[#1d1d1f] min-h-screen selection:bg-[#0071e3] selection:text-white antialiased">
        {children}
      </body>
    </html>
  );
}
