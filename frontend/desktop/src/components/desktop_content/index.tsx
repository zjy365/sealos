import { UserInfo } from '@/api/auth';
import { getGlobalNotification } from '@/api/platform';
import AppWindow from '@/components/app_window';
import useAppStore from '@/stores/app';
import { useConfigStore } from '@/stores/config';
import { useDesktopConfigStore } from '@/stores/desktopConfig';
import useSessionStore, { OauthAction } from '@/stores/session';
import { WindowSize } from '@/types';
import { OauthProvider } from '@/types/user';
import { Box, Flex, Text, Button, IconButton, Icon, Center } from '@chakra-ui/react';
import { useMessage } from '@sealos/ui';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createMasterAPP, masterApp } from 'sealos-desktop-sdk/master';
import NeedToMerge from '../account/AccountCenter/mergeUser/NeedToMergeModal';
import { useRealNameAuthNotification } from '../account/RealNameModal';
import { ChakraIndicator } from './ChakraIndicator';
import Apps from './apps';
import IframeWindow from './iframe_window';
import styles from './index.module.scss';
import SearchBox from './searchBox';
import { Sparkles, X } from 'lucide-react';
import { LimitedOfferModal } from './limitedOfferModal';

const AppDock = dynamic(() => import('../AppDock'), { ssr: false });
const FloatButton = dynamic(() => import('@/components/floating_button'), { ssr: false });
const Account = dynamic(() => import('../account'), { ssr: false });
const TriggerAccountModule = dynamic(() => import('../account/trigger'), { ssr: false });

export const blurBackgroundStyles = {
  bg: 'rgba(22, 30, 40, 0.35)',
  backdropFilter: 'blur(80px) saturate(150%)',
  border: 'none',
  borderRadius: '12px'
};

// 添加限时优惠弹窗组件

export default function Desktop(props: any) {
  const { i18n } = useTranslation();
  const { isAppBar } = useDesktopConfigStore();
  const { installedApps: apps, runningInfo, openApp, setToHighestLayerById } = useAppStore();
  const { message } = useMessage();
  const { realNameAuthNotification } = useRealNameAuthNotification();
  const { session } = useSessionStore();
  const { commonConfig } = useConfigStore();
  const realNameAuthNotificationIdRef = useRef<string | number | undefined>();
  const { authConfig: conf, cloudConfig } = useConfigStore();
  const { setProvider, generateState } = useSessionStore();

  const infoData = useQuery({
    queryFn: UserInfo,
    queryKey: [session?.token, 'UserInfo'],
    select(d) {
      return d.data?.info;
    }
  });

  /**
   * Open Desktop Application
   *
   * @param {object} options - Options for opening the application
   * @param {string} options.appKey - Unique identifier key for the application
   * @param {object} [options.query={}] - Query parameter object
   * @param {object} [options.messageData={}] - Message data to be sent to the application
   * @param {string} options.pathname - Path when the application opens
   *
   * Logic:
   * - Find information about the application and its running state
   * - If the application does not exist, exit
   * - If the application is not open (not running), call the openApp method to open it
   * - If the application is already open (running), bring it to the highest layer
   * - Send a postMessage to the application window to handle the message data
   */
  const openDesktopApp = useCallback(
    ({
      appKey,
      query = {},
      messageData = {},
      pathname = '/',
      appSize = 'maximize'
    }: {
      appKey: string;
      query?: Record<string, string>;
      messageData?: Record<string, any>;
      pathname: string;
      appSize?: WindowSize;
    }) => {
      const app = apps.find((item) => item.key === appKey);
      const runningApp = runningInfo.find((item) => item.key === appKey);
      if (!app) return;
      openApp(app, { query, pathname, appSize });
      if (runningApp) {
        setToHighestLayerById(runningApp.pid);
      }
      // post message
      const iframe = document.getElementById(`app-window-${appKey}`) as HTMLIFrameElement;
      if (!iframe) return;
      iframe.contentWindow?.postMessage(messageData, app.data.url);
    },
    [apps, openApp, runningInfo, setToHighestLayerById]
  );

  const router = useRouter();

  const actionCbGen = useCallback(
    <T extends OauthAction>({ url, provider }: { url: string; provider: OauthProvider }) =>
      (action: T) => {
        if (!conf) return;
        const state = generateState(action, {
          provider,
          domain: cloudConfig!.domain
        });
        setProvider(provider);
        const target = new URL(url);
        target.searchParams.append('state', state);
        router.replace(target);
      },
    [conf?.callbackURL, cloudConfig?.domain]
  );

  const bindGithub = useCallback(() => {
    if (!conf?.idp.github.enabled) return;
    const githubConf = conf.idp.github;
    actionCbGen({
      provider: 'GITHUB',
      url: `https://github.com/login/oauth/authorize?client_id=${githubConf?.clientID}&redirect_uri=${conf?.callbackURL}&scope=user:email%20read:user`
    })('BIND');
  }, [conf?.callbackURL, conf?.idp.github, actionCbGen]);

  const bindGmail = useCallback(() => {
    if (!conf?.idp.google.enabled) return;
    const googleConf = conf.idp.google;
    const scope = encodeURIComponent(`https://www.googleapis.com/auth/userinfo.profile openid`);
    return actionCbGen({
      provider: 'GOOGLE',
      url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleConf.clientID}&redirect_uri=${conf.callbackURL}&response_type=code&scope=${scope}&include_granted_scopes=true`
    })('BIND');
  }, [conf?.callbackURL, conf?.idp.google, actionCbGen]);

  const deleteUser = useCallback(() => {
    localStorage.setItem('session', '');
    router.replace(`https://${cloudConfig?.domain || 'console.run.claw.cloud'}/login`);
  }, [cloudConfig?.domain]);

  const { taskComponentState, setTaskComponentState } = useDesktopConfigStore();
  // const { UserGuide, tasks, desktopGuide, handleCloseTaskModal } = useDriver();
  const openUpgradePlan = () => {
    openDesktopApp({
      appKey: 'system-account-center',
      query: {
        scene: 'upgrade'
      },
      messageData: {
        scene: 'upgrade'
      },
      pathname: '/'
    });
  };
  useEffect(() => {
    const cleanup = createMasterAPP();
    return cleanup;
  }, []);

  useEffect(() => {
    const cleanup = masterApp?.addEventListen('openDesktopApp', openDesktopApp);
    return cleanup;
  }, [openDesktopApp]);
  useEffect(() => {
    const cleanup = masterApp?.addEventListen('deleteUser', deleteUser);
    return cleanup;
  }, [openDesktopApp]);
  useEffect(() => {
    const cleanup = masterApp?.addEventListen('bindGmail', bindGmail);
    return cleanup;
  }, [bindGmail]);
  useEffect(() => {
    const cleanup = masterApp?.addEventListen('bindGithub', bindGithub);
    return cleanup;
  }, [bindGithub]);
  useEffect(() => {
    const cleanup = masterApp?.addEventListen('open', (data) => {
      if (typeof data?.url !== 'string') {
        return;
      }
      if (data.target === '_blank') {
        window.open(data.url);
      } else {
        location.href = data.url;
      }
    });
    return cleanup;
  }, []);
  useEffect(() => {
    const cleanup = masterApp?.addEventListen('openUpgradePlan', openUpgradePlan);
    return cleanup;
  }, []);

  useEffect(() => {
    if (infoData.isSuccess && commonConfig?.realNameAuthEnabled) {
      if (!infoData?.data?.realName && !infoData?.data?.enterpriseRealName) {
        realNameAuthNotificationIdRef.current = realNameAuthNotification({
          duration: null,
          isClosable: true
        });
      }
    }

    return () => {
      if (realNameAuthNotificationIdRef.current) {
        realNameAuthNotification.close(realNameAuthNotificationIdRef.current);
      }
    };
  }, [infoData.data, commonConfig?.realNameAuthEnabled]);

  useEffect(() => {
    const globalNotification = async () => {
      const { data: notification } = await getGlobalNotification();
      if (!notification) return;
      const newID = notification?.uid;
      const title = notification?.i18n[i18n?.language]?.title;

      if (notification.licenseFrontend) {
        message({
          title: title,
          status: 'info',
          isClosable: true
        });
      } else {
        if (!newID || newID === localStorage.getItem('GlobalNotification')) return;
        localStorage.setItem('GlobalNotification', newID);
        message({
          title: title,
          status: 'info',
          isClosable: true
        });
      }
    };
    globalNotification();
  }, []);
  useEffect(() => {
    if (!Array.isArray(apps) || !apps.length) return;
    const { query } = router;
    const getFirstQuery = (data: string | string[] | undefined) =>
      Array.isArray(data) ? data[0] : data;
    const appKey = getFirstQuery(query.app);
    const path = getFirstQuery(query.path);
    if (!appKey) {
      return;
    }
    openDesktopApp({
      appKey,
      pathname: path || '/',
      query: {}
    });
    router.replace('/');
  }, [apps]);

  return (
    <Box id="desktop" className={styles.desktop} bg={'#E0E9FF'} position={'relative'}>
      <ChakraIndicator />
      <Flex height={'68px'} px="32px">
        <Account />
      </Flex>
      <Flex
        width={'100%'}
        height={'calc(100% - 68px)'}
        pt={'60px'}
        pb={'84px'}
        px={'180px'}
        mx={'auto'}
        position={'relative'}
      >
        <Flex flexDirection={'column'} gap={'8px'} flex={1} position={'relative'}>
          <SearchBox />
          <Apps />
        </Flex>
      </Flex>

      {/* 限时优惠弹窗 */}
      <LimitedOfferModal onUpgrade={openUpgradePlan} />

      {isAppBar ? <AppDock /> : <FloatButton />}
      {/* opened apps */}
      {runningInfo.map((process) => {
        return (
          <AppWindow key={process.pid} style={{ height: '100vh' }} pid={process.pid}>
            <IframeWindow pid={process.pid} />
          </AppWindow>
        );
      })}
      {/* modal */}
      <NeedToMerge />
    </Box>
  );
}
