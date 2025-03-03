import { useConfigStore } from '@/stores/config';
import { Box, Flex, Img } from '@chakra-ui/react';
import Head from 'next/head';
import { useEffect } from 'react';
import Script from 'next/script';
import useScriptStore from '@/stores/script';
import bgimage from 'public/cc/signin.png';

export default function SignLayout({ children }: { children: React.ReactNode }) {
  const { layoutConfig, authConfig } = useConfigStore();
  const { setCaptchaIsLoad } = useScriptStore();
  useEffect(() => {
    const url = sessionStorage.getItem('accessTemplatesNoLogin');
    if (!!url) {
      sessionStorage.clear();
      window.location.replace(url);
    }
  }, []);

  return (
    <Box>
      <Head>
        <title>{layoutConfig?.meta.title}</title>
        <meta name="description" content={layoutConfig?.meta.description} />
        <link rel="shortcut icon" href={layoutConfig?.logo ? layoutConfig?.logo : '/favicon.ico'} />
        <link rel="icon" href={layoutConfig?.logo ? layoutConfig?.logo : '/favicon.ico'} />
      </Head>
      {authConfig?.captcha.enabled && (
        <Script
          src="https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js"
          onLoad={() => {
            setCaptchaIsLoad();
          }}
        />
      )}
      {layoutConfig?.meta.scripts?.map((item, i) => {
        return <Script key={i} {...item} />;
      })}
      <Flex width={'full'}>
        {children}
        <Img src={bgimage.src} alt="signin-bg" fill={'cover'} w={'50%'} />
      </Flex>
    </Box>
  );
}
