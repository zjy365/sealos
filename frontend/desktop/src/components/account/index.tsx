import Notification from '@/components/notification';
import { useCopyData } from '@/hooks/useCopyData';
import { useConfigStore } from '@/stores/config';
import useSessionStore from '@/stores/session';
import download from '@/utils/downloadFIle';
import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { CopyIcon, DocsIcon, DownloadIcon, LogoutIcon, NotificationIcon, Track } from '@sealos/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LangSelectSimple from '../LangSelect/simple';
import { blurBackgroundStyles } from '../desktop_content';
import RegionToggle from '../region/RegionToggle';
import WorkspaceToggle from '../team/WorkspaceToggle';
import GithubComponent from './github';
import { ArrowIcon, ChevronDownIcon } from '../icons';
import useAppStore from '@/stores/app';
import AccountCenter, { AccountCenterRef } from './AccountCenter';
import CustomTooltip from '../AppDock/CustomTooltip';
import {
  User,
  BarChart2,
  CreditCard,
  Settings,
  Download,
  LogOut,
  Copy,
  Bell,
  Sparkles,
  ReceiptText,
  Gift,
  Ticket,
  FileCheck
} from 'lucide-react';
import UpgradePlanModal from './UpgradePlanModal';
import GuideModal from './GuideModal';
import { useInitWorkspaceStore } from '@/stores/initWorkspace';
import { getUserPlan } from '@/api/platform';
import Cost from '../cc/Cost';
import { regionList } from '@/api/auth';
import { jwtDecode } from 'jwt-decode';
import { AccessTokenPayload } from '@/types/token';

const baseItemStyle = {
  minW: '40px',
  h: '40px',
  fontSize: '14px',
  fontWeight: '500',
  color: '#262626'
};

export default function Account() {
  const { layoutConfig } = useConfigStore();
  const [showId, setShowId] = useState(true);
  const router = useRouter();
  const { copyData } = useCopyData();
  const { t } = useTranslation();
  const { delSession, session, setToken, updateSubscription } = useSessionStore();
  const user = session?.user;
  const queryclient = useQueryClient();
  const kubeconfig = session?.kubeconfig || '';
  const showDisclosure = useDisclosure();
  const [notificationAmount, setNotificationAmount] = useState(0);
  const { installedApps, openApp, runningInfo, setToHighestLayerById, openDesktopApp } =
    useAppStore();
  const accountCenterRef = useRef<AccountCenterRef>(null);
  const onAmount = useCallback((amount: number) => setNotificationAmount(amount), []);
  const upgradePlanDisclosure = useDisclosure();
  const guideDisclosure = useDisclosure();
  const { setInitGuide, initGuide } = useInitWorkspaceStore();

  const { data } = useQuery(['regionlist'], regionList, {
    cacheTime: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const token = useSessionStore((s) => s.token);

  const curRegionUid = useMemo(() => {
    try {
      const regionUid = jwtDecode<AccessTokenPayload>(token).regionUid;
      const curRegion = data?.data?.regionList?.find((r) => r.uid === regionUid);
      return curRegion ? curRegion : undefined;
    } catch {
      return undefined;
    }
  }, [token, data]);

  const logout = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    delSession();
    queryclient.clear();
    router.replace('/signin');
  };

  const openWorkOrderApp = () => {
    const workorder = installedApps.find((t) => t.key === 'system-workorder');
    if (!workorder) return;
    openApp(workorder);
  };

  const openAccountCenterApp = (page?: string) => {
    openDesktopApp({
      appKey: 'system-account-center',
      query: {
        page: page || 'plan'
      },
      messageData: {
        page: page || 'plan'
      },
      pathname: '/redirect'
    });
  };

  useEffect(() => {
    if (initGuide) {
      guideDisclosure.onOpen();
    }
  }, [guideDisclosure, initGuide]);

  const { data: plan } = useQuery(['getUserPlan'], () => getUserPlan(), {
    refetchOnWindowFocus: false,
    refetchInterval: 60 * 1000
  });
  const userPlan = useMemo(() => {
    // DEBUG
    // return 'Pro';
    return plan?.data?.subscription?.subscriptionPlan?.name || 'Free';
  }, [plan]);
  useEffect(() => {
    if (plan?.data?.subscription) updateSubscription(plan?.data?.subscription);
  }, [plan?.data?.subscription?.subscriptionPlan?.name]);

  return (
    <Box position={'relative'} flex={1}>
      <Flex justifyContent={'space-between'} alignItems={'center'} height={'100%'} zIndex={3}>
        <Flex alignItems={'center'} gap={'12px'}>
          <Center boxSize={'40px'} bg={'#FFF'} borderRadius={'full'}>
            <Image src={'/logo.svg'} alt="Logo" width="32px" height="32px" />
          </Center>

          <RegionToggle userPlan={userPlan} />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="8"
            height="24"
            viewBox="0 0 8 24"
            fill="none"
          >
            <path
              d="M1 22.625L6.69402 1.37463"
              stroke="black"
              strokeOpacity="0.15"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <WorkspaceToggle />
        </Flex>

        <Flex gap={'12px'} position={'relative'} zIndex={3} height={'100%'} alignItems={'center'}>
          <LangSelectSimple visibility={'hidden'} />

          <AccountCenter ref={accountCenterRef} variant={'white-bg-icon'} p="4px" />
          {/* {layoutConfig?.common.workorderEnabled && (
            <Flex
              borderBottom={'1px solid rgba(255, 255, 255, 0.05)'}
              color={'white'}
              fontSize={'base'}
              fontWeight={'bold'}
              justifyContent={'space-between'}
              alignItems={'center'}
              py={'12px'}
              px={'16px'}
            >
              <Text>{t('common:work_order')}</Text>
              <IconButton
                variant={'white-bg-icon'}
                p="4px"
                onClick={openWorkOrderApp}
                icon={<ArrowIcon fill={'rgba(255, 255, 255, 0.7)'} />}
                aria-label={'setting'}
              />
            </Flex>
          )} */}
          {
            <Track.Click eventName={Track.events.clickUpgradeInDesktop}>
              <Box
                cursor={'pointer'}
                height="36px"
                padding="8px 12px"
                display="flex"
                justifyContent="center"
                alignItems="center"
                gap="8px"
                borderRadius="8px"
                fontSize={'14px'}
                background="linear-gradient(95deg, rgba(73, 116, 255, 0.15) 3.77%, rgba(38, 53, 255, 0.15) 67.5%)"
                _hover={{
                  background:
                    'linear-gradient(95deg, rgba(73, 116, 255, 0.15) 3.77%, rgba(38, 53, 255, 0.15) 67.5%)'
                }}
                onClick={() => {
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
                }}
              >
                <Center
                  borderRadius={'4px'}
                  bg={'linear-gradient(90deg, #FE5CBD 0%, #494BE9 100%)'}
                  color={'#fff'}
                  fontSize={'12px'}
                  fontWeight={'700'}
                  height={'20px'}
                  px={'4px'}
                >
                  50% OFF
                </Center>
                {/* <Sparkles
                  size={16}
                  color={
                    userPlan === 'Free' ? '#1C4EF5' : userPlan === 'Pro' ? '#5856F5' : '#2778FD'
                  }
                  fill={userPlan === 'Free' ? 'none' : userPlan === 'Pro' ? '#5856F5' : '#2778FD'}
                /> */}
                <Text
                  color={
                    userPlan === 'Free' ? '#1C4EF5' : userPlan === 'Pro' ? 'transparent' : '#2778FD'
                  }
                  bg={
                    userPlan === 'Pro'
                      ? 'linear-gradient(270.48deg, #1C4EF5 3.93%, #6F59F5 80.66%)'
                      : ''
                  }
                  bgClip={userPlan === 'Pro' ? 'text' : ''}
                  fontWeight="medium"
                >
                  {userPlan === 'Free' ? t('cc:upgrade_plan') : userPlan}
                </Text>
              </Box>
            </Track.Click>
          }
          <Center
            className="guide-button"
            cursor={'pointer'}
            {...baseItemStyle}
            px={'8px'}
            borderRadius={'8px'}
            _hover={{
              background: 'rgba(0, 0, 0, 0.05);'
            }}
            border={'1px solid transparent'}
            onClick={() => {
              guideDisclosure.onOpen();
              setInitGuide(false);
            }}
          >
            {t('cc:guide')}
          </Center>
          {layoutConfig?.common.docsUrl && (
            <Center
              cursor={'pointer'}
              {...baseItemStyle}
              borderRadius={'8px'}
              px={'8px'}
              _hover={{
                background: 'rgba(0, 0, 0, 0.05);'
              }}
              onClick={() => window.open(layoutConfig?.common?.docsUrl)}
            >
              {t('common:doc')}
            </Center>
          )}
          {layoutConfig?.common.helpUrl && (
            <Center
              cursor={'pointer'}
              {...baseItemStyle}
              borderRadius={'8px'}
              px={'8px'}
              _hover={{
                background: 'rgba(0, 0, 0, 0.05);'
              }}
              onClick={() => window.open(layoutConfig?.common?.helpUrl)}
            >
              {t('common:help')}
            </Center>
          )}
          <Box>
            <Center
              cursor={'pointer'}
              {...baseItemStyle}
              borderRadius={'full'}
              _hover={{
                background: '#FFF'
              }}
              background={showDisclosure.isOpen ? '#FFF' : 'transparent'}
              onClick={() => showDisclosure.onOpen()}
            >
              <Bell size={20} color={'#262626'} />
            </Center>
            <Notification key={'notification'} disclosure={showDisclosure} onAmount={onAmount} />
          </Box>
          <Cost />
          <Menu>
            <MenuButton height={'40px'} width={'40px'}>
              <Center width={'40px'} height={'40px'} bg={'#9FC0FF'} borderRadius="full" mr={'8px'}>
                <Image
                  width={user?.avatar && user.avatar.trim() !== '' ? 'full' : '20px'}
                  height={user?.avatar && user.avatar.trim() !== '' ? 'full' : '20px'}
                  objectFit={'cover'}
                  borderRadius="full"
                  src={user?.avatar}
                  fallbackSrc={'/images/default-user.svg'}
                  alt="user avator"
                  draggable={'false'}
                />
              </Center>
            </MenuButton>
            <MenuList p="0" borderRadius="12px" overflow="hidden" boxShadow="lg" minW="246px">
              <Box p="16px">
                <Button
                  height="24px"
                  size="sm"
                  px="16px"
                  bg="#1C4EF5"
                  color="white"
                  borderRadius="32px"
                  fontSize="12px"
                  fontWeight="500"
                  mb="16px"
                  _hover={{ bg: '#1677FF' }}
                >
                  {userPlan?.toLocaleUpperCase()}
                </Button>
                <Text color={'#18181B'} fontSize="14px" fontWeight="500" mb="8px">
                  {user?.name}
                </Text>
                <Text color="#737373" fontSize="14px" lineHeight="22px" mb="4px">
                  ID:{user?.userId}
                </Text>
                <Text color="#737373" fontSize="14px" lineHeight="22px">
                  NS:{user?.nsid}
                </Text>
              </Box>
              {userPlan === 'Free' && <Divider borderColor={'#E4E4E7'} />}

              {userPlan !== 'Free' && !curRegionUid?.description?.isFree && (
                <Box borderTop={'1px solid #E4E4E7'} borderBottom={'1px solid #E4E4E7'}>
                  <Box py="6px" px="16px">
                    <Flex alignItems="center" gap="8px" justifyContent="space-between" width="100%">
                      <Text fontSize="14px" fontWeight="500">
                        Kubeconfig
                      </Text>
                      <Flex alignItems="center" gap="8px">
                        <Center
                          cursor={'pointer'}
                          w="32px"
                          h="32px"
                          border={'1px solid #E4E4E7'}
                          borderRadius={'8px'}
                          onClick={() => kubeconfig && download('kubeconfig.yaml', kubeconfig)}
                        >
                          <Download size={16} color="#737373" />
                        </Center>
                        <Center
                          cursor={'pointer'}
                          w="32px"
                          h="32px"
                          border={'1px solid #E4E4E7'}
                          borderRadius={'8px'}
                          onClick={(e) => {
                            e.stopPropagation();
                            kubeconfig && copyData(kubeconfig);
                          }}
                        >
                          <Copy size="16px" color="#737373" />
                        </Center>
                      </Flex>
                    </Flex>
                  </Box>
                </Box>
              )}

              <Box p={'8px'}>
                {layoutConfig?.common.accountSettingEnabled && (
                  <MenuItem
                    mt="0px"
                    py="6px"
                    px="8px"
                    borderRadius="8px"
                    _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
                    onClick={() => {
                      openAccountCenterApp('setting');
                    }}
                  >
                    <Flex alignItems="center" gap="8px">
                      <Center w="20px" h="20px">
                        <User size={16} color="#737373" />
                      </Center>
                      <Text fontSize="14px" fontWeight="500">
                        {t('common:account_settings')}
                      </Text>
                    </Flex>
                  </MenuItem>
                )}

                <MenuItem
                  py="6px"
                  px="8px"
                  borderRadius="8px"
                  _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
                  onClick={() => {
                    openAccountCenterApp('plan');
                  }}
                >
                  <Flex alignItems="center" gap="8px">
                    <Center w="20px" h="20px">
                      <CreditCard size={16} color="#737373" />
                    </Center>
                    <Text fontSize="14px" fontWeight="500">
                      {t('cc:plan_and_billing')}
                    </Text>
                  </Flex>
                </MenuItem>
                <MenuItem
                  py="6px"
                  px="8px"
                  borderRadius="8px"
                  _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
                  onClick={() => {
                    openAccountCenterApp('billing');
                  }}
                >
                  <Flex alignItems="center" gap="8px">
                    <Center w="20px" h="20px">
                      <ReceiptText size={16} color="#737373" />
                    </Center>
                    <Text fontSize="14px" fontWeight="500">
                      Billing
                    </Text>
                  </Flex>
                </MenuItem>
                <MenuItem
                  mt="0px"
                  py="6px"
                  px="8px"
                  borderRadius="8px"
                  _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
                  onClick={() => {
                    openAccountCenterApp('usage');
                  }}
                >
                  <Flex alignItems="center" gap="8px">
                    <Center w="20px" h="20px">
                      <BarChart2 size={16} color="#737373" />
                    </Center>
                    <Text fontSize="14px" fontWeight="500">
                      {t('cc:usage_analysis')}
                    </Text>
                  </Flex>
                </MenuItem>
                <MenuItem
                  mt="0px"
                  py="6px"
                  px="8px"
                  borderRadius="8px"
                  _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
                  onClick={() => {
                    openAccountCenterApp('referral');
                  }}
                >
                  <Flex alignItems="center" gap="8px">
                    <Center w="20px" h="20px">
                      <Gift size={16} color="#737373" />
                    </Center>
                    <Text fontSize="14px" fontWeight="500">
                      {t('cc:referral')}
                    </Text>
                  </Flex>
                </MenuItem>
                {userPlan === 'Pro' && (
                  <MenuItem
                    mt="0px"
                    py="6px"
                    px="8px"
                    borderRadius="8px"
                    _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
                    onClick={openWorkOrderApp}
                  >
                    <Flex alignItems="center" gap="8px">
                      <Center w="20px" h="20px">
                        <FileCheck size={16} color="#737373" />
                      </Center>
                      <Text fontSize="14px" fontWeight="500">
                        Support Ticket
                      </Text>
                    </Flex>
                  </MenuItem>
                )}
              </Box>
              <Divider bg={'#E4E4E7'} />
              <Box p="8px">
                <MenuItem
                  py="6px"
                  px="8px"
                  borderRadius="8px"
                  _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
                  onClick={logout}
                >
                  <Flex alignItems="center" gap="8px" justifyContent="space-between" width="100%">
                    <Flex alignItems="center" gap="8px">
                      <Center w="20px" h="20px">
                        <LogOut size={16} color="#737373" />
                      </Center>
                      <Text fontSize="14px" fontWeight="500">
                        {t('common:log_out')}
                      </Text>
                    </Flex>
                  </Flex>
                </MenuItem>
              </Box>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      <UpgradePlanModal
        isOpen={upgradePlanDisclosure.isOpen}
        onClose={upgradePlanDisclosure.onClose}
      />

      <GuideModal isOpen={guideDisclosure.isOpen} onClose={guideDisclosure.onClose} />
    </Box>
  );
}
