import { useConfigStore } from '@/stores/config';
import { Box, Flex, Img } from '@chakra-ui/react';
import Head from 'next/head';
import { useEffect } from 'react';
import Script from 'next/script';
import useScriptStore from '@/stores/script';
import bgimage from 'public/cc/signin.png';
import { useQuery } from '@tanstack/react-query';
import { regionList } from '@/api/auth';
import useSessionStore from '@/stores/session';
import { useRouter } from 'next/router';

export default function SignLayout({ children }: { children: React.ReactNode }) {
  const { layoutConfig, authConfig, cloudConfig } = useConfigStore();
  const { setCaptchaIsLoad } = useScriptStore();
  const { data } = useQuery(['regionlist'], regionList, {
    cacheTime: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
  const { session, token } = useSessionStore();
  const router = useRouter();

  useEffect(() => {
    const url = sessionStorage.getItem('accessTemplatesNoLogin');
    if (!!url) {
      sessionStorage.clear();
      window.location.replace(url);
    }
  }, []);

  useEffect(() => {
    if (session && token) {
      router.replace('/');
    }
  }, []);

  return (
    <Box>
      <Head>
        <title>{layoutConfig?.meta.title}</title>
        <meta name="description" content={layoutConfig?.meta.description} />
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
