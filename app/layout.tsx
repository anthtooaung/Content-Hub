import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import { SessionProvider } from '@/components/SessionProvider';
import ThemeProvider from '@/components/ThemeProvider';
import NavigationEvents from '@/components/NavigationEvents';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Content Hub - AI Social Media Content Generator',
  description: 'Generate engaging social media content for multiple platforms within seconds',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <SessionProvider>
            <Suspense fallback={null}>
              <NavigationEvents />
            </Suspense>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
