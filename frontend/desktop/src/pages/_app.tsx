import { useConfigStore } from '@/stores/config';
import { theme } from '@/styles/chakraTheme';
import '@/styles/globals.scss';
import { getCookie } from '@/utils/cookieUtils';
import { ChakraProvider } from '@chakra-ui/react';
import '@sealos/driver/src/driver.css';
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { appWithTranslation, useTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import Router from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useEffect } from 'react';
import useSessionStore from '@/stores/session';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false
    }
  }
});

//Binding events.
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const App = ({ Component, pageProps }: AppProps) => {
  const { i18n } = useTranslation();
  const { initAppConfig, layoutConfig } = useConfigStore();
  const { initTokenFromStorage } = useSessionStore();

  useEffect(() => {
    initAppConfig();
    initTokenFromStorage();
  }, []);

  useEffect(() => {
    const lang = getCookie('NEXT_LOCALE');
    i18n?.changeLanguage?.(lang);
  }, [i18n]);

  useEffect(() => {
    if (typeof window !== 'undefined' && layoutConfig?.posthog?.key) {
      posthog.init(layoutConfig.posthog.key, {
        api_host: layoutConfig.posthog.host || 'https://us.i.posthog.com',
        person_profiles: 'identified_only',
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug();
        }
      });
    }
  }, [layoutConfig]);

  return (
    <PostHogProvider client={posthog}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <ChakraProvider theme={theme}>
            <Component {...pageProps} />
          </ChakraProvider>
        </Hydrate>
      </QueryClientProvider>
    </PostHogProvider>
  );
};

export default appWithTranslation(App);
