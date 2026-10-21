import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinScore — 100-Point Financial Health Score & Assessment',
  description: 'Evaluate your emergency fund, insurance protection, savings health, and debt burden with a 100-point holistic financial engine and SWOT diagnostics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
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
