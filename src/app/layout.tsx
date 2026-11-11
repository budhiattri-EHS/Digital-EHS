import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Budhi Parkash's Digital EHS Solutions • Enterprise Cloud Platform",
  description: "Enterprise Multi-Tenant B2B EHS Management SaaS Platform across 24 Core Industrial Modules created and maintained by Mr Budhi Parkash",
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' }
    ]
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
