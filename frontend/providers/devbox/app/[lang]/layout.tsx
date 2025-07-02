import { enableMapSet } from 'immer';
import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

import IntlProvider from '@/components/providers/MyIntlProvider';
import QueryProvider from '@/components/providers/MyQueryProvider';

import './globals.css';
import '@sealos/driver/src/driver.css';
import 'react-day-picker/dist/style.css';

import { Track } from '@sealos/ui';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ClawCloud Devbox',
  description: 'Generated a development and production environment for you',
  icons: [
    {
      url: '/logo.svg',
      href: '/logo.svg'
    }
  ]
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
};
enableMapSet();
export default function RootLayout({
  children,
  params: { lang }
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string };
}>) {
  return (
    <html lang={lang}>
      <head>
        <Track.Scripts />
      </head>
      <body className={inter.className}>
        <IntlProvider>
          <QueryProvider>{children}</QueryProvider>
        </IntlProvider>
      </body>
    </html>
  );
}
