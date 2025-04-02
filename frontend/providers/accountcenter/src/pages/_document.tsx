import { Html, Head, Main, NextScript } from 'next/document';
import { Box } from '@chakra-ui/react';
import Sidebar from '@/components/Sidebar';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="application-name" content="ClawCloud Desktop App" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ClawCloud" />
        <meta name="description" content="ClawCloud" />
        <meta name="format-detection" content="telephone=no" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
