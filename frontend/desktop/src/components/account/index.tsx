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
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
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
import { getCreditsUsage, regionList } from '@/api/auth';
import { jwtDecode } from 'jwt-decode';
import { AccessTokenPayload } from '@/types/token';
import { formatMoney } from '@/utils/format';

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

  const { data: creditsUsage } = useQuery({
    queryKey: ['getCreditsUsage', { userId: user?.userCrUid }],
    queryFn: getCreditsUsage,
    enabled: !!user,
    staleTime: 60 * 1000
  });

  const creditBalances = useMemo(() => {
    if (!creditsUsage?.data) {
      return {
        charged: 0,
        github: 0,
        currentPlan: 0,
        bonus: 0,
        total: 0
      };
    }
    const { charged, github, currentPlan, bonus } = creditsUsage.data.creditsUsage;
    const isAgency = creditsUsage.data.isAgency;
    const githubBalance = formatMoney(github.total - github.used);
    const currentPlanBalance = formatMoney(currentPlan.total - currentPlan.used);
    const bonusBalance = formatMoney(bonus.total - bonus.used);
    const chargedBalance =
      isAgency === false
        ? formatMoney(charged.total - charged.used) - bonusBalance
        : formatMoney(charged.total - charged.used);

    const totalBalance =
      userPlan === 'Free'
        ? githubBalance
        : chargedBalance + githubBalance + currentPlanBalance + bonusBalance;

    return {
      charged: chargedBalance,
      github: githubBalance,
      currentPlan: currentPlanBalance,
      bonus: bonusBalance,
      total: totalBalance
    };
  }, [creditsUsage, userPlan]);

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
            <Popover trigger="hover" placement="bottom-end" gutter={8}>
              <PopoverTrigger>
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
                    Track.send(Track.events.clickUpgradeInDesktop);
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

                  <Text
                    color={
                      userPlan === 'Free'
                        ? '#1C4EF5'
                        : userPlan === 'Pro'
                        ? 'transparent'
                        : '#2778FD'
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
                  <Divider orientation="vertical" height="16px" borderColor={'#2778FD'} />
                  <Text color={'#2778FD'} fontSize={'14px'} fontWeight={'500'}>
                    ${creditBalances.total.toFixed(2)}
                  </Text>
                </Box>
              </PopoverTrigger>
              <PopoverContent
                bg="white"
                borderColor="rgba(0,0,0,0.1)"
                boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)"
                maxW="300px"
                borderRadius="12px"
                border="1px solid #E4E4E7"
              >
                <PopoverBody p="16px" cursor={'default'}>
                  <Box>
                    {userPlan === 'Free' ? (
                      <>
                        <Box
                          bg="linear-gradient(270deg, rgba(39, 120, 253, 0.10) 3.93%, rgba(39, 120, 253, 0.10) 18.25%, rgba(135, 161, 255, 0.10) 80.66%)"
                          borderRadius="8px"
                          p="12px"
                          mb="12px"
                        >
                          <Text fontSize="14px" fontWeight="400" color="#1C4EF5" mb="12px">
                            To get 50% top-up bonus, please upgrade your plan to hobby or pro.
                          </Text>
                          <Button
                            height={'20px'}
                            variant={'unstyled'}
                            color={'#1C4EF5'}
                            fontSize="14px"
                            fontWeight="600"
                            onClick={() => {
                              Track.send(Track.events.clickUpgradeInDesktop);
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
                            Upgrade Now
                          </Button>
                        </Box>

                        <Text fontSize="14px" fontWeight="600" color="#111824" mb="12px">
                          Your Credits
                        </Text>

                        <Box
                          borderRadius="8px"
                          p="12px"
                          border="1px solid #E4E4E7"
                          boxShadow={'0 1px 2px 0 rgba(0, 0, 0, 0.05)'}
                        >
                          <Text fontSize="24px" fontWeight="600" color="#18181B" mb="16px">
                            ${creditBalances.total.toFixed(2)}
                          </Text>

                          <Box
                            borderRadius={'8px'}
                            bg={
                              'linear-gradient(0deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.20) 100%),  #F4F4F5'
                            }
                            p={'8px 12px 12px 12px'}
                          >
                            <Flex alignItems="center" gap="8px">
                              <Box w="8px" h="8px" bg="#1C4EF5" borderRadius="full" />
                              <Text fontSize="14px" fontWeight="400" color="#18181B">
                                Gift
                              </Text>
                            </Flex>
                            <Text fontSize="16px" fontWeight="600" color="#18181B" mt="4px">
                              ${creditBalances.github.toFixed(2)}
                            </Text>
                          </Box>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Text
                          fontSize="16px"
                          fontWeight="600"
                          color="#18181B"
                          mb="12px"
                          lineHeight={'14px'}
                        >
                          Your Credits
                        </Text>

                        <Box
                          bg="#fff"
                          borderRadius="8px"
                          p="12px"
                          border="1px solid #E4E4E7"
                          boxShadow={'0 1px 2px 0 rgba(0, 0, 0, 0.05)'}
                          mb="12px"
                        >
                          <Text fontSize="24px" fontWeight="600" color="#18181B" mb="16px">
                            ${creditBalances.total.toFixed(2)}
                          </Text>

                          <Box
                            display="grid"
                            gridTemplateColumns="repeat(2, minmax(0, 1fr))"
                            gap="16px"
                          >
                            <Flex
                              flexDirection={'column'}
                              justifyContent={'space-between'}
                              p={'8px 12px 12px 12px'}
                              bg={
                                'linear-gradient(0deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.20) 100%),  #F4F4F5'
                              }
                              borderRadius="8px"
                              minHeight="72px"
                            >
                              <Flex alignItems="center" gap="8px">
                                <Box w="8px" h="8px" bg="#1C4EF5" borderRadius="full" />
                                <Text fontSize="14px" fontWeight="400" color="#18181B">
                                  Gift
                                </Text>
                              </Flex>
                              <Text fontSize="16px" fontWeight="600" color="#18181B">
                                ${creditBalances.github.toFixed(2)}
                              </Text>
                            </Flex>

                            <Flex
                              flexDirection={'column'}
                              justifyContent={'space-between'}
                              p={'8px 12px 12px 12px'}
                              bg={
                                'linear-gradient(0deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.20) 100%),  #F4F4F5'
                              }
                              borderRadius="8px"
                              minHeight="72px"
                            >
                              <Flex alignItems="center" gap="8px">
                                <Box w="8px" h="8px" bg="#D1D5DB" borderRadius="full" />
                                <Text fontSize="14px" fontWeight="400" color="#18181B">
                                  Plan
                                </Text>
                              </Flex>
                              <Text fontSize="16px" fontWeight="600" color="#18181B">
                                ${creditBalances.currentPlan.toFixed(2)}
                              </Text>
                            </Flex>

                            <Flex
                              flexDirection={'column'}
                              justifyContent={'space-between'}
                              p={'8px 12px 12px 12px'}
                              bg={
                                'linear-gradient(0deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.20) 100%),  #F4F4F5'
                              }
                              borderRadius="8px"
                              minHeight="72px"
                            >
                              <Flex alignItems="center" gap="8px">
                                <Box w="8px" h="8px" bg="#10B981" borderRadius="full" />
                                <Text fontSize="14px" fontWeight="400" color="#18181B">
                                  Recharged
                                </Text>
                              </Flex>
                              <Text fontSize="16px" fontWeight="600" color="#18181B">
                                ${creditBalances.charged.toFixed(2)}
                              </Text>
                            </Flex>

                            <Flex
                              flexDirection={'column'}
                              justifyContent={'space-between'}
                              p={'8px 12px 12px 12px'}
                              bg={
                                'linear-gradient(0deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.20) 100%),  #F4F4F5'
                              }
                              borderRadius="8px"
                              minHeight="72px"
                            >
                              <Flex alignItems="center" gap="8px">
                                <Box w="8px" h="8px" bg="#8B5CF6" borderRadius="full" />
                                <Text fontSize="14px" fontWeight="400" color="#18181B">
                                  Bonus
                                </Text>
                              </Flex>
                              <Text fontSize="16px" fontWeight="600" color="#18181B">
                                ${creditBalances.bonus.toFixed(2)}
                              </Text>
                            </Flex>
                          </Box>
                        </Box>
                        <Box
                          borderRadius={'8px'}
                          bg={
                            'linear-gradient(270deg, rgba(39, 120, 253, 0.10) 3.93%, rgba(39, 120, 253, 0.10) 18.25%, rgba(135, 161, 255, 0.10) 80.66%)'
                          }
                          p={'12px'}
                        >
                          <Text fontSize="14px" color="#1C4EF5" mb="12px">
                            Recharge from $100 gets 50% top-up bonus. The deal ends on Aug 31st.
                          </Text>
                          <Button
                            width="100%"
                            bg="linear-gradient(269deg, #2778FD 22.57%, #829DFE 99.42%)"
                            color="white"
                            fontSize="14px"
                            fontWeight="600"
                            borderRadius="8px"
                            _hover={{
                              bg: 'linear-gradient(269deg, #2778FD 22.57%, #829DFE 99.42%)'
                            }}
                            onClick={() => {
                              openAccountCenterApp('plan');
                            }}
                          >
                            Recharge Credit
                          </Button>
                        </Box>
                      </>
                    )}
                  </Box>
                </PopoverBody>
              </PopoverContent>
            </Popover>
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

              {userPlan !== 'Free' && !curRegionUid?.description?.isFree ? (
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
              ) : (
                <Divider borderColor={'#E4E4E7'} />
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
