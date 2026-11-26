import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import { PwaSmartRouter } from '@/components/pwa/PwaSmartRouter';

export const viewport: Viewport = {
  themeColor: '#1A1A1A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true
};

export const metadata: Metadata = {
  title: 'RED APPLE GYM AND FITNESS CENTER | Chhatrapati Sambhajinagar',
  description: 'Chhatrapati Sambhajinagar’s premier fitness sanctuary in Cidco N-2, Ram Nagar. Owned by Prashant Magre | Master Trainer: Mohaseen Subedar. 4.7 ⭐ on Google Maps.',
  keywords: [
    'RED APPLE GYM AND FITNESS CENTER',
    'Red Apple Gym',
    'रेड ॲपल जिम',
    'Gym in Cidco N-2',
    'Chhatrapati Sambhajinagar Gym',
    'Aurangabad Gym',
    'Mohaseen Subedar Trainer',
    'Prashant Magre',
    'Personal Training Sambhajinagar',
    'Luxury Athletic Club'
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RED APPLE GYM AND FITNESS CENTER'
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600;1,700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RED APPLE GYM" />
        <meta name="application-name" content="RED APPLE GYM" />
        <meta name="msapplication-TileColor" content="#0B0C0E" />
      </head>
      <body className="bg-[#F8F6F4] text-[#1A1A1A] font-sans antialiased min-h-screen selection:bg-[#C41E3A] selection:text-white">
        <AppProvider>
          <ServiceWorkerRegister />
          <PwaSmartRouter />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
