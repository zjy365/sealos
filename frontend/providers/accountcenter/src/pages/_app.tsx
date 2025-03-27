import { theme } from '@/constants/theme';
import { useLoading } from '@/hooks/useLoading';
import { useGlobalStore } from '@/store/global';
import { getLangStore, setLangStore } from '@/utils/cookieUtils';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import throttle from 'lodash/throttle';
import { appWithTranslation, useTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import NProgress from 'nprogress';
import { useEffect, useState } from 'react';
import { EVENT_NAME } from 'sealos-desktop-sdk';
import { createSealosApp, sealosApp } from 'sealos-desktop-sdk/app';

import '@sealos/driver/src/driver.css';
import '@/styles/reset.scss';
import 'nprogress/nprogress.css';
import '@/styles/globals.css';

//Binding events.
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      cacheTime: 0
    }
  }
});

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const { setScreenWidth, loading, setLastRoute } = useGlobalStore();
  const { Loading } = useLoading();
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const response = createSealosApp();
    (async () => {
      try {
        const newSession = JSON.stringify(await sealosApp.getSession());
        const oldSession = localStorage.getItem('session');
        if (newSession && newSession !== oldSession) {
          localStorage.setItem('session', newSession);
          window.location.reload();
        }
        console.log('app init success');
      } catch (err) {
        console.log('App is not running in desktop');
      }
    })();
    return response;
  }, []);

  // add resize event
  useEffect(() => {
    const resize = throttle((e: Event) => {
      const documentWidth = document.documentElement.clientWidth || document.body.clientWidth;
      setScreenWidth(documentWidth);
    }, 200);
    window.addEventListener('resize', resize);
    const documentWidth = document.documentElement.clientWidth || document.body.clientWidth;
    setScreenWidth(documentWidth);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [setScreenWidth]);

  // init
  useEffect(() => {
    const changeI18n = async (data: any) => {
      const lastLang = getLangStore();
      const newLang = data.currentLanguage;
      if (lastLang !== newLang && typeof i18n?.changeLanguage === 'function') {
        i18n?.changeLanguage(newLang);
        setLangStore(newLang);
        setRefresh((state) => !state);
      }
    };

    (async () => {
      try {
        const lang = await sealosApp.getLanguage();
        changeI18n({
          currentLanguage: lang.lng
        });
      } catch (error) {
        changeI18n({
          currentLanguage: 'en'
        });
      }
    })();

    return sealosApp?.addAppEventListen(EVENT_NAME.CHANGE_I18N, changeI18n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // record route
  useEffect(() => {
    return () => {
      setLastRoute(router.asPath);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  useEffect(() => {
    const lang = getLangStore() || 'en';
    i18n?.changeLanguage?.(lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, router.asPath]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const setupInternalAppCallListener = async () => {
      try {
        const event = async (e: MessageEvent) => {
          try {
            if (e.data?.type === 'InternalAppCall' && e.data?.name) {
              router.push({
                pathname: '/redirect',
                query: {
                  name: e.data.name
                }
              });
            }

            if (e.data?.scene) {
              return router.push({
                pathname: '/',
                query: {
                  scene: e.data.scene
                }
              });
            }

            if (e.data?.page) {
              router.push({
                pathname: `/${e.data.page}`
              });
            }
          } catch (error) {
            console.log(error, 'error');
          }
        };
        window.addEventListener('message', event);
        return () => window.removeEventListener('message', event);
      } catch (error) {}
    };

    setupInternalAppCallListener();
  }, [router.isReady, router]);

  return (
    <>
      <Head>
        <title>Account Center</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          {/* <button
            onClick={() => {
              const lastLang = getLangStore();
              let lang = lastLang === 'en' ? 'zh' : 'en';
              if (lastLang !== lang) {
                i18n.changeLanguage(lang);
                setLangStore(lang);
                setRefresh((state) => !state);
              }
            }}
          >
            changeLanguage
          </button> */}
          <Component {...pageProps} />
          <Loading loading={loading} />
        </ChakraProvider>
      </QueryClientProvider>
    </>
  );
}

export default appWithTranslation(App);
