import AppWindow from '@/components/theme/app_window';
import IframeWindow from '@/components/desktop_content/iframe_window';
import styles from '@/components/desktop_content/index.module.scss';
import MoreButton from '@/components/more_button';
import UserMenu from '@/components/user_menu';
import useAppStore from '@/stores/app';
import { TApp } from '@/types';
import { Box, Flex, Grid, GridItem, Icon, Image, Text } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { MouseEvent, useCallback, useEffect, useState } from 'react';
import { createMasterAPP, masterApp } from 'sealos-desktop-sdk/master';

export default function DesktopContent(props: any) {
  const { t, i18n } = useTranslation();
  const { installedApps: apps, runningInfo, openApp, setToHighestLayerById } = useAppStore();
  const renderApps = apps.filter((item: TApp) => item?.displayType === 'normal');
  const [maxItems, setMaxItems] = useState(10);

  const handleDoubleClick = (e: MouseEvent<HTMLDivElement>, item: TApp) => {
    e.preventDefault();
    if (item?.name) {
      openApp(item);
    }
  };

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
      pathname = '/'
    }: {
      appKey: string;
      query?: Record<string, string>;
      messageData?: Record<string, any>;
      pathname: string;
    }) => {
      const app = apps.find((item) => item.key === appKey);
      const runningApp = runningInfo.find((item) => item.key === appKey);
      if (!app) return;
      openApp(app, { query, pathname });
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

  useEffect(() => {
    return createMasterAPP();
  }, []);

  useEffect(() => {
    return masterApp?.addEventListen('openDesktopApp', openDesktopApp);
  }, [openDesktopApp]);

  return (
    <Box
      id="desktop"
      className={styles.desktop}
      backgroundImage={'url(/theme/images/knorr-bremse-bg.png)'}
      backgroundRepeat={'no-repeat'}
      backgroundSize={'cover'}
    >
      <Flex w="100%" h="100%" alignItems={'center'} flexDirection={'column'}>
        <Flex
          px="32px"
          h="88px"
          alignItems={'center'}
          justifyContent={'space-between'}
          w="100%"
          bg="#00457E"
        >
          <Icon
            xmlns="http://www.w3.org/2000/svg"
            width="241"
            height="38"
            viewBox="0 0 241 38"
            fill="none"
          >
            <g clipPath="url(#clip0_18_7061)">
              <path
                d="M77.3132 28.5786L74.4793 21.9835L73.4415 23.5538V28.5786H68.572V9.57856H73.4415V16.8802H73.4814L77.0737 9.57856H82.2625L77.5926 17.9009L82.8612 28.5786H77.3132ZM91.1234 28.5786L87.8903 16.8802H87.8105V28.6571H83.3002V9.53931H88.7285L91.8418 21.2769H91.9216V9.57856H96.4718V28.5786H91.1234Z"
                fill="white"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M98.1882 19.0785C98.1882 26.1839 99.9045 28.9711 104.854 28.9711C109.803 28.9711 111.519 26.2232 111.519 19.0785C111.519 11.9339 109.803 9.22522 104.854 9.22522C99.9045 9.22522 98.1882 11.9732 98.1882 19.0785ZM103.217 19.0785C103.217 13.9752 103.377 12.562 104.814 12.562C106.251 12.562 106.49 13.9752 106.49 19.0785C106.49 24.1818 106.331 25.5951 104.854 25.5951C103.377 25.5951 103.217 24.2211 103.217 19.0785ZM113.236 28.5785H118.145V21.0021H119.422C120.62 21.0021 121.019 21.5517 121.019 23.7108V24.967C121.019 25.7521 121.019 27.5971 121.498 28.5785H126.687V28.343C126.442 28.2101 126.246 28.0038 126.128 27.7541C125.928 27.3616 125.928 26.1054 125.928 25.124V23.4752C125.928 20.9628 125.21 19.4318 122.855 19.2355V19.157C125.09 18.843 126.048 17.1942 126.048 14.6426C126.048 11.6984 124.651 9.57853 120.939 9.57853H113.356L113.236 28.5785ZM118.145 13.1508H119.103C120.58 13.1508 121.179 13.8182 121.179 15.3492C121.179 16.7232 120.5 17.626 119.143 17.626H118.145V13.1508ZM128.283 28.5785H133.153V21.0021H134.43C135.627 21.0021 136.027 21.5517 136.027 23.7108V24.967C136.027 25.7521 136.027 27.5971 136.506 28.5785H141.694V28.343C141.449 28.2101 141.253 28.0038 141.136 27.7541C140.896 27.3616 140.896 26.1054 140.896 25.124V23.4752C140.896 20.9628 140.178 19.4318 137.863 19.2355V19.157C140.058 18.843 141.056 17.1942 141.056 14.6426C141.056 11.6984 139.619 9.57853 135.907 9.57853H128.323L128.283 28.5785ZM133.153 13.1508H134.071C135.548 13.1508 136.146 13.8182 136.146 15.3492C136.146 16.7232 135.508 17.626 134.151 17.626H133.153V13.1508Z"
                fill="white"
              />
              <path d="M142.812 18.843H150.954V22.9257H142.812V18.843Z" fill="white" />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M152.99 28.5785H160.334C164.405 28.5785 165.962 26.2624 165.962 22.9649C165.962 21.002 164.964 18.8822 162.529 18.6467V18.5682C164.565 18.1756 165.443 16.3698 165.443 14.3285C165.443 11.4628 163.847 9.61775 160.334 9.61775H152.99V28.5785ZM157.859 13.1508H159.057C160.015 13.1508 160.574 14.0537 160.574 15.1136C160.574 16.1735 160.015 17.0372 159.057 17.0372H157.859V13.1508ZM157.859 20.4132H159.217C160.095 20.4132 160.933 21.1983 160.933 22.6901C160.933 24.2603 160.135 25.0454 159.217 25.0454H157.859V20.4132ZM167.838 28.5785H172.707V21.002H173.985C175.182 21.002 175.581 21.5516 175.581 23.7107V24.9669C175.581 25.752 175.581 27.5971 176.06 28.5785H181.249V28.343C181.004 28.2101 180.808 28.0038 180.69 27.7541C180.451 27.3615 180.451 26.1054 180.451 25.1239V23.4752C180.451 20.9628 179.732 19.4318 177.377 19.2355V19.157C179.613 18.843 180.57 17.1942 180.57 14.6425C180.57 11.6983 179.174 9.57849 175.462 9.57849H167.878L167.838 28.5785ZM172.707 13.1508H173.625C175.102 13.1508 175.701 13.8182 175.701 15.3492C175.701 16.7231 175.022 17.626 173.665 17.626H172.668L172.707 13.1508Z"
                fill="white"
              />
              <path
                d="M182.806 28.5785H194.101V24.5351H187.715V20.8058H193.502V16.8802H187.675V13.6219H193.862V9.57851H182.845V28.5785H182.806ZM195.698 28.5785H200.248V14.4463H200.288L202.882 28.5785H206.395L208.989 14.4463H209.029V28.5785H213.579V9.57851H206.634L204.638 20.845L202.643 9.57851H195.698V28.5785ZM227.509 15.0744C227.509 10.9917 225.713 9.18595 221.482 9.18595C217.371 9.18595 215.375 11.3058 215.375 15.1529C215.375 21.8657 222.959 20.0207 222.959 23.7893C222.959 24.8099 222.4 25.6343 221.442 25.6343C220.484 25.6343 219.846 25.0455 219.846 23.4359V22.9649H215.096V23.6322C215.096 27.5578 217.371 28.9711 221.402 28.9711C225.673 28.9711 227.988 27.1653 227.988 23.0826C227.988 16.1736 220.045 17.9793 220.045 14.25C220.045 13.3864 220.524 12.562 221.562 12.562C222.52 12.562 222.959 13.5041 222.959 14.6033V15.0744H227.509ZM229.704 28.5785H241V24.5351H234.574V20.8058H240.361V16.8802H234.574V13.6219H240.761V9.57851H229.704V28.5785ZM0 0H54.682V38H0V0Z"
                fill="#00457E"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M194.101 28.5785H182.845V9.57847H193.862V13.6219H187.675V16.8801H193.502V20.8057H187.715V24.5351H194.101V28.5785ZM200.248 28.5785H195.698V9.57847H202.643L204.638 20.845L206.634 9.57847H213.579V28.5785H209.029V14.4462H208.989L206.395 28.5785H202.882L200.288 14.4462H200.248V28.5785ZM221.482 9.18591C225.713 9.18591 227.509 10.9917 227.509 15.0743H222.959V14.6033C222.959 13.5041 222.52 12.5619 221.562 12.5619C220.524 12.5619 220.045 13.3863 220.045 14.25C220.045 15.8294 221.47 16.4161 223.113 17.0924C225.349 18.0129 227.988 19.0997 227.988 23.0826C227.988 27.1653 225.673 28.971 221.402 28.971C217.371 28.971 215.096 27.5578 215.096 23.6322V22.9648H219.846V23.4359C219.846 25.0454 220.484 25.6343 221.442 25.6343C222.4 25.6343 222.959 24.8099 222.959 23.7892C222.959 22.175 221.568 21.5907 219.977 20.9227C217.854 20.0311 215.375 18.9903 215.375 15.1529C215.375 11.3057 217.371 9.18591 221.482 9.18591ZM241 28.5785H229.704V9.57847H240.76V13.6219H234.574V16.8801H240.361V20.8057H234.574V24.5351H241V28.5785Z"
                fill="white"
              />
              <path
                d="M14.9277 18.9999C14.9277 12.0123 20.4758 6.32019 27.301 6.32019C34.1263 6.32019 39.7542 12.0123 39.7542 18.9999C39.7542 25.9875 34.1662 31.6404 27.341 31.6404C20.5157 31.6404 14.9277 25.9875 14.9277 18.9999ZM27.301 28.6177C32.4898 28.6177 36.7207 24.2995 36.7207 18.9999C36.7207 13.7004 32.5298 9.38217 27.301 9.38217C22.0723 9.38217 17.8414 13.7004 17.8414 18.9999C17.8414 24.2995 22.0723 28.6177 27.301 28.6177Z"
                fill="white"
              />
              <path
                d="M42.1492 11.8947C43.1739 14.1279 43.7039 16.5499 43.7039 19C43.7039 21.4501 43.1739 23.8722 42.1492 26.1054H38.7565C40.0325 23.9477 40.7047 21.4961 40.7047 19C40.7047 16.5039 40.0325 14.0523 38.7565 11.8947H42.1492ZM15.806 11.8947C14.5374 14.0477 13.8694 16.492 13.8694 18.9804C13.8694 21.4688 14.5374 23.9131 15.806 26.0661H12.4532C11.4343 23.8383 10.9075 21.4232 10.9075 18.9804C10.9075 16.5376 11.4343 14.1225 12.4532 11.8947H15.806ZM21.7133 11.8947H25.7046V26.0661H21.7133V11.8947ZM33.0887 26.0661L29.696 19L33.0887 11.9339H29.0973L25.7446 19L29.0973 26.0661H33.0887Z"
                fill="white"
              />
              <path
                d="M9.89855 19C9.89429 16.574 10.3828 14.1716 11.3354 11.9338H8.38182L5.02905 19L8.38182 26.0661H11.3754C10.4227 23.8283 9.93421 21.4259 9.93846 19M44.7434 19C44.7476 16.574 44.2591 14.1716 43.3065 11.9338H46.3L49.6528 19L46.3 26.0661H43.3065C44.2591 23.8283 44.7476 21.4259 44.7434 19Z"
                fill="white"
              />
            </g>
            <defs>
              <clipPath id="clip0_18_7061">
                <rect width="241" height="38" fill="white" />
              </clipPath>
            </defs>
          </Icon>
          <UserMenu
            userMenuStyleProps={{ position: 'unset', gap: '16px' }}
            ButtonStyle={{
              bg: '#F5F4F1',
              color: '#00457E'
            }}
          />
        </Flex>

        {/* desktop apps */}
        <Grid
          mt="20vh"
          minW={'508px'}
          maxH={'300px'}
          templateRows={'repeat(2, 100px)'}
          templateColumns={'repeat(5, 72px)'}
          gap={'36px'}
        >
          {renderApps &&
            renderApps.slice(0, maxItems).map((item: TApp, index) => (
              <GridItem
                w="72px"
                h="100px"
                key={index}
                userSelect="none"
                cursor={'pointer'}
                onClick={(e) => handleDoubleClick(e, item)}
              >
                <Box
                  className={item.key}
                  w="72px"
                  h="72px"
                  p={'12px'}
                  border={'1px solid #00457E'}
                  backgroundColor={'#00457E'}
                >
                  <Image
                    width="100%"
                    height="100%"
                    fill={'#fff'}
                    src={item?.icon}
                    fallbackSrc="/images/sealos.svg"
                    alt="user avator"
                    filter={
                      'invert(100%) sepia(100%) saturate(1%) hue-rotate(182deg) brightness(108%) contrast(101%)'
                    }
                  />
                </Box>
                <Text
                  textAlign={'center'}
                  mt="8px"
                  color={'#396c90'}
                  fontSize={'13px'}
                  lineHeight={'16px'}
                >
                  {item?.i18n?.[i18n?.language]?.name
                    ? item?.i18n?.[i18n?.language]?.name
                    : t(item?.name)}
                </Text>
              </GridItem>
            ))}
        </Grid>
        {/* <Image
          width="100%"
          height="100%"
          fill={'#fff'}
          src={'/images/sealos.svg'}
          fallbackSrc="/images/sealos.svg"
          alt="user avator"
          filter={'drop-shadow(1000px 0 0 red); transform: translate(-10000px);'}
        /> */}
        <MoreButton />
      </Flex>
      {/* opened apps */}
      {runningInfo.map((process) => {
        return (
          <AppWindow key={process.pid} style={{ height: '100vh' }} pid={process.pid}>
            <IframeWindow pid={process.pid} />
          </AppWindow>
        );
      })}
    </Box>
  );
}
