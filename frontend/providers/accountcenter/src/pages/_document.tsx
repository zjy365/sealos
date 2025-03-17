import { Html, Head, Main, NextScript } from 'next/document';
import { Box } from '@chakra-ui/react';
import Sidebar from '@/components/Sidebar';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="application-name" content="Sealos Desktop App Demo" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sealos" />
        <meta name="description" content="sealos cloud" />
        <meta name="format-detection" content="telephone=no" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
