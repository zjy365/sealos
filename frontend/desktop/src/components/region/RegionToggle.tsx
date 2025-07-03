import { regionList as getRegionList, UserInfo } from '@/api/auth';
import request from '@/services/request';
import useSessionStore from '@/stores/session';
import { ApiResp, Region, WindowSize } from '@/types';
import { AccessTokenPayload } from '@/types/token';
import { Box, Button, Center, Flex, HStack, Text, useDisclosure, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useCallback } from 'react';
import { CheckIcon, ChevronDown } from 'lucide-react';
import { useConfigStore } from '@/stores/config';
import { getUserPlan } from '@/api/platform';
import { MyTooltip, Track } from '@sealos/ui';
import useAppStore from '@/stores/app';
import { masterApp } from 'sealos-desktop-sdk/master';

export default function RegionToggle({ userPlan }: { userPlan: string }) {
  const disclosure = useDisclosure();
  const { setWorkSpaceId, session } = useSessionStore();
  const { cloudConfig } = useConfigStore();
  const { t } = useTranslation();
  const router = useRouter();
  const { data } = useQuery(['regionlist'], getRegionList, {
    cacheTime: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const regionList = useMemo(
    () =>
      (data?.data?.regionList || []).sort((a, b) => {
        if (a.description?.isFree && !b.description?.isFree) return -1;
        if (!a.description?.isFree && b.description?.isFree) return 1;
        return 0;
      }),
    [data]
  );

  const token = useSessionStore((s) => s.token);

  const curRegionUid = useMemo(() => {
    try {
      return jwtDecode<AccessTokenPayload>(token).regionUid;
    } catch {
      return undefined;
    }
  }, [token]);

  const curRegion = regionList.find((r) => r.uid === curRegionUid);

  const { data: plan } = useQuery(['getUserPlan'], () => getUserPlan(), {
    cacheTime: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const handleCick = useCallback(
    async (region: Region) => {
      setWorkSpaceId(session?.user?.ns_uid || '');
      const target = new URL(
        cloudConfig?.proxyDomain
          ? `https://${cloudConfig?.proxyDomain}/switchRegion`
          : `https://${region.domain}/switchRegion`
      );
      const res = await request.get<any, ApiResp<{ token: string }>>('/api/auth/globalToken');
      const token = res?.data?.token;

      if (!token) return;
      target.searchParams.append('token', token);
      target.searchParams.append('regionId', region.uid);
      target.searchParams.append('regionDomain', region.domain);

      await router.replace(target);
    },
    [setWorkSpaceId, session, cloudConfig, router]
  );

  const { installedApps: apps, runningInfo, setToHighestLayerById, openApp } = useAppStore();

  const openDesktopApp = ({
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
  };

  useEffect(() => {
    const cleanup = masterApp?.addEventListen('switchRegion', (regionUid: string) => {
      console.log('switchRegion', regionUid, regionList);
      const region = regionList.find((r) => r.uid === regionUid);
      if (!region) return;
      handleCick(region);
    });
    return cleanup;
  }, [regionList, handleCick]);

  return (
    <Box>
      {regionList?.length > 1 && (
        <HStack position={'relative'}>
          <HStack
            w={'full'}
            fontSize={'14px'}
            color={'#0A0A0A'}
            fontWeight={'500'}
            minH={'40px'}
            onClick={() => {
              disclosure.onOpen();
            }}
            cursor={'pointer'}
            userSelect={'none'}
            position={'relative'}
            gap={'8px'}
          >
            <Text cursor={'pointer'}>
              {curRegion?.displayName}
              {/* {curRegion?.description?.isFree === false && userPlan !== 'Free' && (
                <Box
                  display={'inline-block'}
                  px={'8px'}
                  py={'2px'}
                  borderRadius={'100px'}
                  color={'#FFF'}
                  ml={'4px'}
                  fontWeight={'500'}
                  bg={
                    userPlan === 'Pro'
                      ? 'linear-gradient(270.48deg, #1C4EF5 3.93%, #6F59F5 80.66%)'
                      : 'linear-gradient(270.48deg, #2778FD 3.93%, #829DFE 80.66%)'
                  }
                >
                  {userPlan}
                </Box>
              )} */}
            </Text>
            <Center
              bg={disclosure.isOpen ? '#FFF' : ''}
              transform={disclosure.isOpen ? 'rotate(-90deg)' : 'rotate(0deg)'}
              borderRadius={'4px'}
              transition={'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'}
            >
              <ChevronDown size={16} color={'#525252'} />
            </Center>
          </HStack>
          {disclosure.isOpen ? (
            <Box position={'absolute'} right={0}>
              <Box
                position={'fixed'}
                inset={0}
                zIndex={'998'}
                onClick={(e) => {
                  e.stopPropagation();
                  disclosure.onClose();
                }}
              ></Box>
              <Box
                position={'absolute'}
                zIndex={999}
                top="24px"
                left={'-20px'}
                cursor={'initial'}
                borderRadius={'12px'}
                py={'8px'}
                border={'1px solid #E4E4E7'}
                background={'#FFF'}
                boxShadow={'0px 4px 12px 0px rgba(0, 0, 0, 0.08)'}
                color={'#18181B'}
                width={'240px'}
              >
                <Text px={'12px'} py={'6px'} color={'#71717A'} fontSize={'12px'} fontWeight={'500'}>
                  Availability Zone
                </Text>
                <VStack alignItems={'stretch'} px={'8px'}>
                  {regionList.map((region) => {
                    const subscription = plan?.data?.subscription;
                    const notFree = subscription && subscription.subscriptionPlan.name !== 'Free';
                    const canUse = !!(
                      region.description.isFree ||
                      (notFree && subscription.status === 'NORMAL')
                    );
                    const buttonElement = (
                      <Button
                        variant={'unstyled'}
                        display={'flex'}
                        fontSize={'14px'}
                        justifyContent={'space-between'}
                        alignItems={'center'}
                        whiteSpace={'nowrap'}
                        borderRadius={'8px'}
                        py={'10px'}
                        px={'8px'}
                        onClick={() => {
                          canUse
                            ? handleCick(region)
                            : openDesktopApp({
                                appKey: 'system-account-center',
                                query: {
                                  scene: 'upgrade'
                                },
                                messageData: {
                                  scene: 'upgrade'
                                },
                                pathname: '/'
                              });
                        }}
                        bgColor={!canUse ? '#F4F4F5' : ''}
                        cursor={'pointer'}
                        _hover={{
                          bgColor: '#F4F4F5'
                        }}
                      >
                        <Flex alignItems={'center'}>
                          <Box
                            bgColor={region.description.color || '#DC2626'}
                            boxSize={'6px'}
                            mr={'7px'}
                            borderRadius={'full'}
                          ></Box>
                          <Text color={canUse ? '#18181B' : '#71717A'}>{region?.displayName}</Text>
                          {!region.description.isFree && (
                            <Flex
                              ml={'8px'}
                              px={'8px'}
                              borderRadius={'full'}
                              py={'2px'}
                              color={'#FFFFFF'}
                              fontSize={'12px'}
                              bg={'linear-gradient(270.48deg, #2778FD 3.93%, #829DFE 80.66%)'}
                            >
                              Hobby & Pro
                            </Flex>
                          )}
                        </Flex>
                        {region.uid === curRegionUid && <CheckIcon size={16} color={'#1C4EF5'} />}
                      </Button>
                    );
                    return (
                      <MyTooltip
                        key={region.uid}
                        offset={[0, 0]}
                        width={'220px'}
                        fontWeight="400"
                        fontSize="14px"
                        lineHeight="20px"
                        color="#09090B"
                        label={'Upgrade your plan to unlock members-only availability zone'}
                        isDisabled={canUse}
                        placement="right"
                      >
                        {canUse ? (
                          buttonElement
                        ) : (
                          <Track.Click eventName={Track.events.membersClick(region?.displayName)}>
                            {buttonElement}
                          </Track.Click>
                        )}
                      </MyTooltip>
                    );
                  })}
                </VStack>
              </Box>
            </Box>
          ) : null}
        </HStack>
      )}
    </Box>
  );
}
