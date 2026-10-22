import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://finscore.app'),
  title: 'FInSCOURE -Fix Your Finances With Me !',
  description: 'Evaluate your emergency fund, insurance protection, savings health, and debt burden with a 100-point holistic financial engine and SWOT diagnostics.',
  applicationName: 'FinScore',
  keywords: ['financial score', 'finscore', 'financial health check', 'debt avalanche', 'debt snowball', 'asset allocation', 'net worth tracker'],
  authors: [{ name: 'FinScore Team' }],
  creator: 'FinScore',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'FInSCOURE -Fix Your Finances With Me !',
    description: 'Comprehensive 100-point holistic financial score, SWOT diagnostic, and debt elimination engine.',
    url: 'https://finscore.app',
    siteName: 'FinScore',
    images: [
      {
        url: '/hero-fix-your-finances.png',
        width: 1200,
        height: 630,
        alt: 'FinScore - Fix Your Finances With Me',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FInSCOURE -Fix Your Finances With Me !',
    description: 'Evaluate emergency funds, net worth, debt payoff, and financial security with instant scoring.',
    images: ['/hero-fix-your-finances.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-zinc-900 font-sans selection:bg-[#eaf5ef] selection:text-[#1b4d3e]">
        {children}
      </body>
    </html>
  );
}
