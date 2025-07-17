import { getAmount } from '@/api/auth';
import useAppStore from '@/stores/app';
import { useConfigStore } from '@/stores/config';
import useSessionStore from '@/stores/session';
import { useUsageStore } from '@/stores/usage';
import {
  Box,
  Flex,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { Track } from '@sealos/ui';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { CpuIcon, FlowIcon, MemoryIcon, StorageIcon } from '../icons';
import { WindowSize } from '@/types';
import { PLAN_LIMIT } from '@/constants/account';

export default function Cost() {
  const { t } = useTranslation();
  const rechargeEnabled = useConfigStore().commonConfig?.rechargeEnabled;
  const openApp = useAppStore((s) => s.openApp);
  const installApp = useAppStore((s) => s.installedApps);
  const { session, updateSubscription } = useSessionStore();
  const user = session?.user;
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  const { installedApps: apps, runningInfo, setToHighestLayerById } = useAppStore();
  const currencySymbol = useConfigStore(
    (state) => state.layoutConfig?.currencySymbol || 'shellCoin'
  );
  const {
    resourceData: storeResourceData,
    fetchResourceData,
    getTrafficUsageInGB
  } = useUsageStore();

  const { data } = useQuery({
    queryKey: ['getAmount', { userId: user?.userCrUid }],
    queryFn: getAmount,
    enabled: !!user,
    staleTime: 60 * 1000
  });

  // const { data: billing } = useQuery(['getUserBilling'], () => getUserBilling(), {
  //   cacheTime: 5 * 60 * 1000,
  //   staleTime: 5 * 60 * 1000,
  //   refetchOnWindowFocus: false
  // });

  // 使用 store 的方法获取资源数据
  useQuery(['getResource'], () => fetchResourceData(), {
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  });
  const resourceData = { data: storeResourceData };

  // const balance = useMemo(() => {
  //   let realBalance = new Decimal(data?.data?.balance || 0);
  //   if (data?.data?.deductionBalance) {
  //     realBalance = realBalance.minus(new Decimal(data.data.deductionBalance));
  //   }
  //   return realBalance.toNumber();
  // }, [data]);

  // const calculations = useMemo(() => {
  //   const prevDayAmount = new Decimal(billing?.data?.prevDayTime || 0);
  //   const estimatedNextMonthAmount = prevDayAmount.times(30).toNumber();
  //   const _balance = new Decimal(balance || 0);

  //   let estimatedDaysUsable;
  //   if (_balance.isNegative()) {
  //     estimatedDaysUsable = 0;
  //   } else if (prevDayAmount.isZero()) {
  //     estimatedDaysUsable = Number.POSITIVE_INFINITY;
  //   } else {
  //     estimatedDaysUsable = _balance.div(prevDayAmount).ceil().toNumber();
  //   }

  //   return {
  //     prevMonthAmount: new Decimal(billing?.data?.prevMonthTime || 0).toNumber(),
  //     estimatedNextMonthAmount,
  //     estimatedDaysUsable
  //   };
  // }, [billing?.data?.prevDayTime, billing?.data?.prevMonthTime, balance]);

  // Resource data from monitor component
  const resourceInfo = useMemo(
    () => [
      {
        label: 'CPU',
        value: resourceData?.data?.totalCpu,
        icon: <CpuIcon />,
        unit: 'core'
      },
      {
        label: t('common:memory'),
        value: resourceData?.data?.totalMemory,
        icon: <MemoryIcon />,
        unit: 'GB'
      },
      {
        label: t('common:storage'),
        value: resourceData?.data?.totalStorage,
        icon: <StorageIcon />,
        unit: 'GB'
      },
      {
        label: t('common:flow'),
        value: resourceData?.data?.traffic?.value || '~',
        icon: <FlowIcon />,
        unit: resourceData?.data?.traffic?.unit
      }
    ],
    [resourceData?.data, t]
  );
  const { totalPod, healthPod, unhealthPod } = useMemo(() => {
    const data = resourceData?.data;
    const totalPod = Number(data?.totalPodCount || 0);
    const healthPod = Number(data?.runningPodCount || 0);
    const unhealthPod = totalPod - healthPod;
    return {
      totalPod,
      healthPod,
      unhealthPod
    };
  }, [resourceData?.data]);

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
  const planName = session?.user?.subscription?.subscriptionPlan.name || 'Free';

  // Cost 页面的逻辑：必须要溢出才显示，不区分套餐类型
  const shouldShowAlert = useMemo(() => {
    if (!storeResourceData) return false;

    const limits = PLAN_LIMIT[planName as keyof typeof PLAN_LIMIT];
    if (!limits) return false;

    const healthyPods = Number(storeResourceData.runningPodCount || 0);
    const trafficUsageGB = getTrafficUsageInGB();
    const totalCpu = Number(storeResourceData.totalCpu || 0);
    const totalMemory = Number(storeResourceData.totalMemory || 0);
    const totalStorage = Number(storeResourceData.totalStorage || 0);

    // 检查是否有任何资源超出限制
    const isPodExceeded = limits.pod > 0 && healthyPods >= limits.pod;
    const isTrafficExceeded = limits.network > 0 && trafficUsageGB > limits.network;
    const isCpuExceeded = limits.cpu > 0 && totalCpu > limits.cpu;
    const isMemoryExceeded = limits.memory > 0 && totalMemory > limits.memory;
    const isStorageExceeded = limits.storage > 0 && totalStorage > limits.storage;

    return (
      isPodExceeded || isTrafficExceeded || isCpuExceeded || isMemoryExceeded || isStorageExceeded
    );
  }, [storeResourceData, planName, getTrafficUsageInGB]);

  const upgradeAlertMessage = useMemo(() => {
    if (!shouldShowAlert || !storeResourceData) return null;

    const limits = PLAN_LIMIT[planName as keyof typeof PLAN_LIMIT];
    if (!limits) return null;

    const healthyPods = Number(storeResourceData.runningPodCount || 0);
    const trafficUsageGB = getTrafficUsageInGB();
    const totalCpu = Number(storeResourceData.totalCpu || 0);
    const totalMemory = Number(storeResourceData.totalMemory || 0);
    const totalStorage = Number(storeResourceData.totalStorage || 0);

    const messages = [];

    if (limits.pod > 0 && healthyPods >= limits.pod) {
      messages.push('Pod limit reached');
    }

    if (limits.network > 0 && trafficUsageGB > limits.network) {
      messages.push(`Traffic limit exceeded (${trafficUsageGB.toFixed(2)}G/${limits.network}G)`);
    }

    // if (limits.cpu > 0 && totalCpu > limits.cpu) {
    //   messages.push(`CPU limit exceeded (${totalCpu}/${limits.cpu} cores)`);
    // }

    // if (limits.memory > 0 && totalMemory > limits.memory) {
    //   messages.push(`Memory limit exceeded (${totalMemory}G/${limits.memory}G)`);
    // }

    // if (limits.storage > 0 && totalStorage > limits.storage) {
    //   messages.push(`Storage limit exceeded (${totalStorage}G/${limits.storage}G)`);
    // }

    return messages.length > 0
      ? messages.join('. ') + '. Upgrade your plan to unlock higher quotas.'
      : null;
  }, [shouldShowAlert, storeResourceData, planName, getTrafficUsageInGB]);

  return (
    <>
      <Popover onOpen={onOpen} onClose={onClose} placement="bottom-start">
        <PopoverTrigger>
          <Flex
            as="button"
            alignItems={'center'}
            padding={'4px 8px'}
            gap={'8px'}
            width={'129px'}
            height={'28px'}
            background={'rgba(30, 58, 138, 0.05)'}
            borderRadius={'100px'}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            <Box width={'8px'} height={'8px'} background={'#10B981'} borderRadius={'100%'} />
            <Text
              fontFamily={'Geist'}
              fontWeight={400}
              fontSize={'14px'}
              lineHeight={'20px'}
              color={'#18181B'}
            >
              {unhealthPod ? `${unhealthPod} pod unhealthy` : `${healthPod} pod running`}
            </Text>
          </Flex>
        </PopoverTrigger>
        <PopoverContent
          width={'280px'}
          display={'flex'}
          flexDirection={'column'}
          alignItems={'flex-start'}
          padding={'16px 16px 8px'}
          gap={'20px'}
          background={'#FFFFFF'}
          boxShadow={'0px 4px 12px rgba(0, 0, 0, 0.08)'}
          borderRadius={'12px'}
        >
          {/* Upgrade Alert Section */}
          {shouldShowAlert && (
            <Flex
              direction="column"
              align="flex-start"
              p="12px"
              gap="12px"
              w="248px"
              bg="#FFF7ED"
              borderRadius="8px"
            >
              <Text
                w="224px"
                fontFamily="Geist"
                fontWeight={400}
                fontSize="14px"
                lineHeight="20px"
                color="#EA580C"
              >
                {upgradeAlertMessage}
              </Text>
              <Track.Click eventName={Track.events.podUpgrade}>
                <Text
                  as="button"
                  w="91px"
                  h="20px"
                  fontFamily="Geist"
                  fontWeight={600}
                  fontSize="14px"
                  lineHeight="20px"
                  display="flex"
                  alignItems="center"
                  color="#EA580C"
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
                  Upgrade Now
                </Text>
              </Track.Click>
            </Flex>
          )}

          {/* Balance Section */}
          <Flex flexDirection={'column'} gap={'12px'} width={'248px'} height={'98px'}>
            <Flex alignItems={'center'} gap={'8px'} height={'14px'}>
              <Text
                fontFamily={'Geist'}
                fontWeight={600}
                fontSize={'14px'}
                lineHeight={'100%'}
                color={'#111824'}
              >
                Pod in current availability zone
              </Text>
            </Flex>

            <Flex alignItems={'center'} gap={'8px'} width={'248px'} height={'72px'}>
              {/* Healthy Pod Card */}
              <Box
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'space-between'}
                alignItems={'flex-start'}
                padding={'8px 12px 12px'}
                gap={'16px'}
                width={'120px'}
                height={'72px'}
                background={'#FFFFFF'}
                border={'1px solid #E4E4E7'}
                boxShadow={'0px 1px 2px rgba(0, 0, 0, 0.05)'}
                borderRadius={'8px'}
              >
                <Flex alignItems={'center'} gap={'6px'} width={'96px'} height={'20px'}>
                  <Box width={'8px'} height={'8px'} background={'#10B981'} borderRadius={'100%'} />
                  <Text
                    fontFamily={'Geist'}
                    fontWeight={400}
                    fontSize={'14px'}
                    lineHeight={'20px'}
                    color={'#18181B'}
                  >
                    Healthy
                  </Text>
                </Flex>
                <Text
                  fontFamily={'Geist'}
                  fontWeight={500}
                  fontSize={'18px'}
                  lineHeight={'100%'}
                  color={'#000000'}
                  textAlign={'center'}
                >
                  {healthPod}
                </Text>
              </Box>

              {/* Unhealthy Pod Card */}
              <Box
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'space-between'}
                alignItems={'flex-start'}
                padding={'8px 12px 12px'}
                gap={'16px'}
                width={'120px'}
                height={'72px'}
                background={'#FFFFFF'}
                border={'1px solid #E4E4E7'}
                boxShadow={'0px 1px 2px rgba(0, 0, 0, 0.05)'}
                borderRadius={'8px'}
              >
                <Flex alignItems={'center'} gap={'6px'} width={'96px'} height={'20px'}>
                  <Box width={'8px'} height={'8px'} background={'#DC2626'} borderRadius={'100%'} />
                  <Text
                    fontFamily={'Geist'}
                    fontWeight={400}
                    fontSize={'14px'}
                    lineHeight={'20px'}
                    color={'#18181B'}
                  >
                    Unhealthy
                  </Text>
                </Flex>
                <Text
                  fontFamily={'Geist'}
                  fontWeight={500}
                  fontSize={'18px'}
                  lineHeight={'100%'}
                  color={'#000000'}
                  textAlign={'center'}
                >
                  {unhealthPod}
                </Text>
              </Box>
            </Flex>
          </Flex>

          {/* Usage Section */}
          <Flex flexDirection={'column'} width={'248px'}>
            <Flex alignItems={'center'} gap={'8px'} width={'43px'}>
              <Text
                fontFamily={'Geist'}
                fontWeight={600}
                fontSize={'14px'}
                lineHeight={'100%'}
                color={'#111824'}
              >
                Usage
              </Text>
            </Flex>

            {/* Usage Items */}
            <Flex
              flexDirection={'column'}
              width={'248px'}
              css={{
                '& > div:not(:last-child)': {
                  borderBottom: '1px solid #E4E4E7'
                }
              }}
            >
              {resourceInfo.map((item) => (
                <Flex
                  key={item.label}
                  justifyContent={'space-between'}
                  alignItems={'center'}
                  padding={'24px 0px'}
                  gap={'8px'}
                  width={'248px'}
                  height={'47px'}
                >
                  <Flex alignItems={'center'} gap={'8px'}>
                    <Text
                      fontFamily={'Geist'}
                      fontWeight={400}
                      fontSize={'14px'}
                      lineHeight={'100%'}
                      color={'#111824'}
                    >
                      {item.label}
                    </Text>
                  </Flex>
                  <Text
                    fontFamily={'Geist'}
                    fontWeight={500}
                    fontSize={'14px'}
                    lineHeight={'100%'}
                    color={'#525252'}
                  >
                    {item.value} {item.unit}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </PopoverContent>
      </Popover>
    </>
  );
}
