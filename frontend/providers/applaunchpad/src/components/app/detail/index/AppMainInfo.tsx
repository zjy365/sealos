import MyIcon from '@/components/Icon';
import { MyTooltip } from '@sealos/ui';

import CCPodLineChart from '@/components/CCPodLineChart';
import { ProtocolList } from '@/constants/app';
import { MOCK_APP_DETAIL } from '@/mock/apps';
import { DOMAIN_PORT } from '@/store/static';
import type { AppDetailType } from '@/types/app';
import { useCopyData } from '@/utils/tools';
import { getUserNamespace, getUserSession } from '@/utils/user';
import { Box, Button, Center, Circle, Flex, Grid, Text, useDisclosure } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useRef } from 'react';
import MonitorModal from './MonitorModal';
import { HelpCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { useGuideStore } from '@/store/guide';
import { detailDriverObj, startDriver } from '@/hooks/driver';
import { useQuery } from '@tanstack/react-query';
import { checkReady } from '@/api/platform';

const AppMainInfo = ({ app = MOCK_APP_DETAIL }: { app: AppDetailType }) => {
  const { t } = useTranslation();
  const { copyData } = useCopyData();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const networks = useMemo(
    () =>
      app.networks.map((network) => {
        const protocol = ProtocolList.find((item) => item.value === network.protocol);
        const appProtocol = ProtocolList.find((item) => item.value === network.appProtocol);

        if (network.openNodePort) {
          return {
            inline: `${protocol?.inline}${app.appName}.${getUserNamespace()}.svc.cluster.local:${
              network.port
            }`,
            public: `${protocol?.label}${protocol?.value.toLowerCase()}.${network.domain}${
              network?.nodePort ? `:${network.nodePort}` : ''
            }`,
            showReadyStatus: false,
            port: network.port
          };
        }

        return {
          inline: `${appProtocol?.inline}${app.appName}.${getUserNamespace()}.svc.cluster.local:${
            network.port
          }`,
          public: network.openPublicDomain
            ? `${appProtocol?.label}${
                network.customDomain
                  ? network.customDomain
                  : `${network.publicDomain}.${network.domain}${DOMAIN_PORT}`
              }`
            : '',
          showReadyStatus: true,
          port: network.port
        };
      }),
    [app]
  );

  const retryCount = useRef(0);
  const { data: networkStatus, refetch } = useQuery({
    queryKey: ['networkStatus', app.appName],
    queryFn: () => checkReady(app.appName),
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
    onSuccess: (data) => {
      const hasUnready = data.some((item) => !item.ready);
      if (!hasUnready) {
        retryCount.current = 0;
        return;
      }
      if (retryCount.current < 14) {
        const delay = Math.min(1000 * Math.pow(2, retryCount.current), 32000);
        retryCount.current += 1;
        setTimeout(() => {
          refetch();
        }, delay);
      }
    },
    refetchIntervalInBackground: false,
    staleTime: 1000 * 60 * 5
  });

  const statusMap = useMemo(
    () =>
      networkStatus
        ? networkStatus.reduce((acc, item) => {
            if (item?.url) {
              acc[item.url] = item;
            }
            return acc;
          }, {} as Record<string, { ready: boolean; url: string }>)
        : {},
    [networkStatus]
  );

  const { detailCompleted } = useGuideStore();
  useEffect(() => {
    if (!detailCompleted) {
      const checkAndStartGuide = () => {
        const guideListElement = document.getElementById('driver-detail-network');
        if (guideListElement) {
          startDriver(detailDriverObj());
          return true;
        }
        return false;
      };

      if (!checkAndStartGuide()) return;

      const observer = new MutationObserver((mutations, obs) => {
        if (checkAndStartGuide()) {
          obs.disconnect();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return () => {
        observer.disconnect();
      };
    }
  }, [detailCompleted]);
  const planName = getUserSession()?.user?.subscription?.subscriptionPlan?.name || 'Free';

  return (
    <Box position={'relative'}>
      <Box
        mt={'16px'}
        py={'20px'}
        px={'24px'}
        borderRadius={'16px'}
        border={'1px solid #E4E4E7'}
        bg={'#FFF'}
        boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.05)'}
      >
        <Flex mb={6} w={'100%'} justifyContent={'space-between'} alignItems={'center'}>
          <Box fontSize="medium" fontWeight={'bold'} color={'grayModern.900'}>
            {t('monitor')}
          </Box>
          <Box color={'#A3A3A3'} fontSize={'12px'} fontWeight={'normal'}>
            {t('update Time')}&ensp;
            {dayjs().format('HH:mm')}
          </Box>
        </Flex>
        <Flex borderRadius={'lg'} minH={'80px'} gap={4}>
          <Box flex={1} position={'relative'}>
            <Box color={'grayModern.900'} fontWeight={'bold'} mb={'24px'} fontSize={'12px'}>
              {t('cpu')}:&ensp;
              {app?.usedCpu?.yData[app?.usedCpu?.yData?.length - 1]}%
            </Box>
            <Box h={'85px'} minW={['200px', '250px', '300px']}>
              <Box h={'85px'} minW={['200px', '250px', '300px']}>
                <CCPodLineChart type="purple" data={app?.usedCpu} />
              </Box>
            </Box>
          </Box>
          <Box flex={1} position={'relative'}>
            <Box color={'grayModern.900'} fontWeight={'bold'} mb={'24px'} fontSize={'12px'}>
              {t('memory')}:&ensp;
              {app?.usedMemory?.yData[app?.usedMemory?.yData?.length - 1]}%
            </Box>
            <Box h={'85px'}>
              <Box h={'85px'}>
                <CCPodLineChart type="purpleBlue" data={app?.usedMemory} />
              </Box>
            </Box>
          </Box>
        </Flex>
      </Box>
      <Box
        mt={'16px'}
        py={'20px'}
        px={'24px'}
        borderRadius={'16px'}
        border={'1px solid #E4E4E7'}
        bg={'#FFF'}
        boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.05)'}
        id="driver-detail-network"
      >
        <Flex alignItems={'center'} fontSize={'14px'} fontWeight={'bold'}>
          <Text fontSize={'20px'} fontWeight={500} color={'grayModern.900'}>
            {t('Network Configuration')}
          </Text>
          <Text ml={'8px'} color={'grayModern.600'}>
            ({networks.length})
          </Text>
          <Flex ml="auto" alignItems="center" gap={2}>
            <Button
              bg={'white'}
              color={'#18181B'}
              _hover={{ bg: 'grayModern.50' }}
              fontSize={'12px'}
              boxShadow={'none'}
              borderWidth={1}
              borderColor={'grayModern.200'}
              borderRadius={'8px'}
              onClick={() => router.push(`/app/edit?name=${app?.appName}`)}
            >
              {t('Manage Network')}
            </Button>
          </Flex>
        </Flex>
        <Flex mt={'16px'}>
          <table className={'table-cross'}>
            <thead>
              <tr>
                <Box as={'th'} fontSize={'12px'}>
                  {t('Port')}
                </Box>
                <Box as={'th'} fontSize={'12px'}>
                  {t('Private Address')}
                </Box>
                <Box as={'th'} fontSize={'12px'}>
                  {t('Public Address')}
                </Box>
              </tr>
            </thead>
            <tbody>
              {networks.map((network, index) => {
                return (
                  <tr key={network.inline + index}>
                    <th>
                      <Box fontSize={'12px'}>{network.port}</Box>
                    </th>
                    <th>
                      <Flex>
                        <MyTooltip label={t('Copy')} placement={'bottom-start'}>
                          <Box
                            fontSize={'12px'}
                            cursor={'pointer'}
                            _hover={{ textDecoration: 'underline' }}
                            onClick={() => copyData(network.inline)}
                          >
                            {network.inline}
                          </Box>
                        </MyTooltip>
                      </Flex>
                    </th>
                    <th>
                      <Flex alignItems={'center'} gap={'2px'} justifyContent={'flex-start'}>
                        {network.public && network.showReadyStatus && (
                          <>
                            {statusMap[network.public]?.ready ? (
                              <Center
                                fontSize={'12px'}
                                fontWeight={400}
                                bg={'rgba(3, 152, 85, 0.05)'}
                                color={'#039855'}
                                borderRadius={'full'}
                                p={'2px 4px'}
                                gap={'2px'}
                                minW={'63px'}
                              >
                                <Center
                                  w={'6px'}
                                  h={'6px'}
                                  borderRadius={'full'}
                                  bg={'#039855'}
                                  flexShrink={0}
                                ></Center>
                                {t('Accessible')}
                              </Center>
                            ) : (
                              <MyTooltip
                                isDisabled={planName === 'Pro'}
                                fontWeight="400"
                                fontSize="14px"
                                lineHeight="20px"
                                textAlign="center"
                                width={'220px'}
                                offset={[0, 0]}
                                color="#09090B"
                                label={
                                  'Switch to members-only availability zone for faster deployment.'
                                }
                                placement={'bottom'}
                              >
                                <Center
                                  fontSize={'12px'}
                                  fontWeight={400}
                                  bg={'rgba(17, 24, 36, 0.05)'}
                                  color={'#485264'}
                                  borderRadius={'full'}
                                  p={'6px 9px'}
                                  gap={'8px'}
                                  minW={'63px'}
                                >
                                  <MyIcon
                                    name={'loading'}
                                    w={'12px'}
                                    h={'12px'}
                                    animation={'spin 1s linear infinite'}
                                    sx={{
                                      '@keyframes spin': {
                                        '0%': {
                                          transform: 'rotate(0deg)'
                                        },
                                        '100%': {
                                          transform: 'rotate(360deg)'
                                        }
                                      }
                                    }}
                                  />
                                  {t('Ready')}
                                </Center>
                              </MyTooltip>
                            )}
                          </>
                        )}
                        <MyTooltip
                          label={network.public ? t('Open Link') : ''}
                          placement={'bottom-start'}
                        >
                          <Box
                            fontSize={'12px'}
                            className={'textEllipsis'}
                            {...(network.public
                              ? {
                                  cursor: 'pointer',
                                  _hover: { textDecoration: 'underline' },
                                  onClick: () => window.open(network.public, '_blank')
                                }
                              : {})}
                          >
                            <Flex alignItems={'center'} gap={2}>
                              {network.public || '-'}
                            </Flex>
                          </Box>
                        </MyTooltip>
                        {/* copy address */}
                        {!!network.public && (
                          <Center
                            flexShrink={0}
                            w={'24px'}
                            h={'24px'}
                            borderRadius={'6px'}
                            _hover={{
                              bg: 'rgba(17, 24, 36, 0.05)'
                            }}
                            cursor={'pointer'}
                          >
                            <MyIcon
                              name={'copy'}
                              w={'16px'}
                              color={'#667085'}
                              onClick={() => copyData(network.public)}
                            />
                          </Center>
                        )}
                      </Flex>
                    </th>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Flex>
      </Box>
      <MonitorModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default AppMainInfo;
