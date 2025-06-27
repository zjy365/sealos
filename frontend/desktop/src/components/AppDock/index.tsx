import { MoreAppsContext } from '@/pages/index';
import useAppStore, { AppInfo } from '@/stores/app';
import { useConfigStore } from '@/stores/config';
import { useDesktopConfigStore } from '@/stores/desktopConfig';
import { APPTYPE, TApp } from '@/types';
import { I18nCommonKey } from '@/types/i18next';
import { Box, Center, Divider, Flex, Image, Spinner } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { MouseEvent, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Menu, useContextMenu } from 'react-contexify';
import { ChevronDownIcon } from '../icons';
import CustomTooltip from './CustomTooltip';
import styles from './index.module.css';

const APP_DOCK_MENU_ID = 'APP_DOCK_MENU_ID';

export default function AppDock() {
  const { t, i18n } = useTranslation();
  const {
    installedApps: apps,
    runningInfo,
    currentAppPid,
    openApp,
    switchAppById,
    findAppInfoById,
    updateOpenedAppInfo
  } = useAppStore();
  const logo = useConfigStore().layoutConfig?.logo;
  const moreAppsContent = useContext(MoreAppsContext);
  const { isNavbarVisible, toggleNavbarVisibility, getTransitionValue } = useDesktopConfigStore();
  const [isMouseOverDock, setIsMouseOverDock] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const { show } = useContextMenu({
    id: APP_DOCK_MENU_ID
  });
  const { toggleShape } = useDesktopConfigStore();
  const normalApps = apps.filter((item: TApp) => item?.displayType === 'normal');

  const templateApp = normalApps.find((app) => app.key === 'system-template');
  const launchpadApp = normalApps.find((app) => app.key === 'system-applaunchpad');
  const devboxApp = normalApps.find((app) => app.key === 'system-devbox');

  const AppMenuLists = useMemo(() => {
    const initialApps: TApp[] = [
      {
        name: 'home',
        icon: '/home.svg',
        zIndex: 99999,
        isShow: false,
        pid: -9,
        size: 'maxmin',
        cacheSize: 'maxmin',
        style: {},
        mouseDowning: false,
        key: `system-sealos-home`,
        type: APPTYPE.IFRAME,
        data: {
          url: '',
          desc: ''
        },
        displayType: 'hidden'
      },
      ...(devboxApp ? [devboxApp].map((app, index) => ({ ...app, pid: -2 })) : []),
      ...(launchpadApp ? [launchpadApp].map((app, index) => ({ ...app, pid: -2 })) : []),
      ...(templateApp ? [templateApp].map((app, index) => ({ ...app, pid: -2 })) : [])
      // ...normalApps.slice(0, 3).map((app, index) => ({ ...app, pid: -2 }))
    ];

    const mergedApps = initialApps.map((app) => {
      const runningApp = runningInfo.find((running) => running.key === app.key);
      return runningApp ? { ...app, ...runningApp } : app;
    });

    return [
      ...mergedApps,
      ...runningInfo.filter((running) => !initialApps.some((app) => app.key === running.key))
    ].filter((app) => app.key !== 'system-account-center' && app.key !== 'system-workorder');
  }, [devboxApp, launchpadApp, runningInfo, templateApp]);

  // Handle icon click event
  const handleNavItem = (e: MouseEvent<HTMLDivElement>, item: AppInfo) => {
    if (item.key === 'system-sealos-home') {
      const isNotMinimized = runningInfo.some((item) => item.size !== 'minimize');
      runningInfo.forEach((item) => {
        updateOpenedAppInfo({
          ...item,
          size: isNotMinimized ? 'minimize' : item.cacheSize
        });
      });
      return;
    }

    if (item.key === 'system-sealos-apps') {
      moreAppsContent?.setShowMoreApps(true);
      return;
    }

    if (item.pid === currentAppPid && item.size !== 'minimize') {
      updateOpenedAppInfo({
        ...item,
        size: 'minimize',
        cacheSize: item.size
      });
    } else {
      const app = findAppInfoById(item.pid);
      if (!app) {
        openApp(item);
      } else {
        switchAppById(item.pid);
      }
    }
  };

  const displayMenu = (e: MouseEvent<HTMLDivElement>) => {
    show({
      event: e,
      position: {
        // @ts-ignore
        x: '244px',
        // @ts-ignore
        y: '-34px'
      }
    });
  };

  useEffect(() => {
    if (!isMouseOverDock) {
      const hasMaximizedApp = runningInfo.some((app) => app.size === 'maximize');
      toggleNavbarVisibility(!hasMaximizedApp);
    }
  }, [isMouseOverDock, runningInfo, toggleNavbarVisibility]);

  const handleMouseEnter = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsMouseOverDock(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsMouseOverDock(false);
    }, 500);
  };

  return (
    <Flex
      alignItems={'center'}
      position="absolute"
      left="12px"
      top="50%"
      bottom={'unset'}
      zIndex={'1000'}
      transition={getTransitionValue()}
      transform={isNavbarVisible ? 'translate(0, -50%)' : 'translate(-93px, -50%)'}
      will-change="transform, opacity"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Flex
        // onContextMenu={(e) => displayMenu(e)} // 删除右键菜单
        borderRadius="100px"
        border={'0.5px solid var(--dock-str, #E5E5E5)'}
        background={
          'var(--dock-fill, linear-gradient(180deg, rgba(255, 255, 255, 0.30) 0%, rgba(255, 255, 255, 0.48) 100%))'
        }
        backdropFilter="blur(20px)"
        boxShadow={'0px 4px 12px 0px rgba(0, 0, 0, 0.12)'}
        minH={'fit-content'}
        h={'auto'}
        flexDirection={'column'}
        gap={'12px'}
        userSelect={'none'}
        p={'12px'}
      >
        {AppMenuLists.map((item: AppInfo, index: number) => {
          if (item.key === 'system-sealos-home') {
            return (
              <Flex
                key={item?.key}
                flexDirection={'column'}
                alignItems={'center'}
                cursor={'pointer'}
              >
                <Center
                  mb={'6px'}
                  key={item?.key}
                  w="54px"
                  h="54px"
                  borderRadius={'50%'}
                  bg={'rgba(255, 255, 255, 0.85)'}
                  backdropFilter={'blur(25px)'}
                  boxShadow={
                    '0px 0.875px 3.5px 0px rgba(0, 0, 0, 0.08), 0px 14px 35px 0px rgba(0, 0, 0, 0.06)'
                  }
                  onClick={(e) => handleNavItem(e, item)}
                >
                  <Image
                    src={item?.icon}
                    fallbackSrc={logo || '/logo.svg'}
                    alt={item?.name}
                    w="30px"
                    h="30px"
                    draggable={false}
                  />
                </Center>
                {index === 0 && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="45"
                    height="2"
                    viewBox="0 0 45 2"
                    fill="none"
                  >
                    <path
                      d="M1 0.5C0.723858 0.5 0.5 0.723858 0.5 1C0.5 1.27614 0.723858 1.5 1 1.5V0.5ZM1 1.5H45V0.5H1V1.5Z"
                      fill="black"
                      fillOpacity="0.2"
                    />
                  </svg>
                )}
              </Flex>
            );
          }

          return (
            <Flex
              flexDirection={'column'}
              alignItems={'center'}
              cursor={'pointer'}
              key={item?.name}
              onClick={(e) => handleNavItem(e, item)}
            >
              <Center
                w="54px"
                h="54px"
                borderRadius={'50%'}
                // bg={'rgba(255, 255, 255, 0.85)'}
                // backdropFilter={'blur(25px)'}
                // boxShadow={
                //   '0px 0.875px 3.5px 0px rgba(0, 0, 0, 0.08), 0px 14px 35px 0px rgba(0, 0, 0, 0.06)'
                // }
              >
                <Image
                  src={item?.icon}
                  fallbackSrc={logo || '/logo.svg'}
                  alt={item?.name}
                  w="56px"
                  h="56px"
                  draggable={false}
                />
              </Center>
              <Box
                display={item?.isShow ? 'block' : 'none'}
                opacity={item?.isShow ? 1 : 0}
                mt={'6px'}
                width={'20px'}
                height={'4px'}
                borderRadius={'full'}
                bg={'#686868'}
              ></Box>
              {index === 0 && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="45"
                  height="2"
                  viewBox="0 0 45 2"
                  fill="none"
                >
                  <path
                    d="M1 0.5C0.723858 0.5 0.5 0.723858 0.5 1C0.5 1.27614 0.723858 1.5 1 1.5V0.5ZM1 1.5H45V0.5H1V1.5Z"
                    fill="black"
                    fillOpacity="0.2"
                  />
                </svg>
              )}
            </Flex>
          );
        })}
      </Flex>

      <Menu className={styles.contexify} id={APP_DOCK_MENU_ID}>
        <>
          <Box
            cursor={'pointer'}
            p={'4px'}
            _hover={{
              bg: 'rgba(17, 24, 36, 0.10)'
            }}
            onClick={toggleShape}
            borderRadius={'4px'}
          >
            {t('common:switching_disc')}
          </Box>
          <div className={styles.arrow}></div>
        </>
      </Menu>

      {runningInfo.length > 0 && runningInfo.some((app) => app.size === 'maximize') && (
        <Center
          width={'20px'}
          height={'72px'}
          color={'white'}
          transition={getTransitionValue()}
          cursor={'pointer'}
          bg="rgba(220, 220, 224, 0.3)"
          backdropFilter="blur(80px) saturate(150%)"
          boxShadow={
            '0px 0px 20px -4px rgba(12, 26, 67, 0.25), 0px 0px 1px 0px rgba(24, 43, 100, 0.25)'
          }
          borderRadius={'full'}
          transform={isNavbarVisible ? 'translateX(0px)' : 'translateX(4px)'}
          will-change="transform, opacity"
          onClick={() => {
            toggleNavbarVisibility();
          }}
        >
          <ChevronDownIcon
            transform={isNavbarVisible ? 'rotate(90deg)' : 'rotate(-90deg)'}
            transition="transform 200ms ease-in-out"
          />
        </Center>
      )}
    </Flex>
  );
}
