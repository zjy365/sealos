import { serviceSideProps } from '@/utils/i18n';
import { Box, Flex, Text, Button } from '@chakra-ui/react';
import React, { useState, useEffect, useCallback } from 'react';
import MyIcon from '@/components/Icon';
// import { useLoading } from '@/hooks/useLoading';
import { useQuery } from '@tanstack/react-query';
import { getPodEvents } from '@/api/app';
import { PodDetailType, PodEvent } from '@/types/app';
import { useAppStore } from '@/store/app';
import { useRouter } from 'next/router';
import { ChevronRight, CircleCheck, CircleX, CircleAlert, ArrowRight } from 'lucide-react';
import { AppStatusEnum } from '@/constants/app';
import { useTranslation } from 'next-i18next';

const AppDetail = ({ appName }: { appName: string }) => {
  const [events, setEvents] = useState<PodEvent[]>([]);
  // const { Loading } = useLoading();
  const [currentPod, setCurrentPod] = useState<number>(0);
  const { appDetail, appDetailPods, intervalLoadPods, setAppDetail } = useAppStore();
  const router = useRouter();
  const [expandedEvents, setExpandedEvents] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('waiting');
  const { t } = useTranslation();
  // 获取 pods 数据
  useQuery(['pods', appName], () => intervalLoadPods(appName, true), {
    refetchInterval: 5000
  });

  useQuery(['appDetail', appName], () => setAppDetail(appName), {
    refetchInterval: 5000,
    enabled: !!appName
  });

  // 根据 podName 获取事件
  const { isLoading } = useQuery(
    ['podEvents', appDetailPods[currentPod]?.podName],
    () => getPodEvents(appDetailPods[currentPod]?.podName || ''),
    {
      enabled: !!appDetailPods[currentPod]?.podName,
      refetchInterval: 3000,
      onSuccess(res) {
        setEvents(res);
      }
    }
  );

  useEffect(() => {
    if (appDetail?.status.value === AppStatusEnum.running) {
      setStatus('running');
    } else if (appDetail?.status.value === AppStatusEnum.waiting) {
      setStatus('waiting');
    } else if (appDetail?.status.value === AppStatusEnum.error) {
      setStatus('error');
    } else if (appDetail?.status.value === AppStatusEnum.pause) {
      setStatus('pause');
    } else if (appDetail?.status.value === AppStatusEnum.creating) {
      setStatus('creating');
    }
  }, [appDetail]);

  const handleViewDashboard = useCallback(() => {
    router.push(`/app/detail?name=${appName}`);
  }, [appName, router]);

  const handleRedeploy = useCallback(() => {
    router.push(`/app/edit?name=${appName}`);
  }, [appName, router]);

  useEffect(() => {
    if (status === 'running') {
      setTimeout(() => {
        handleViewDashboard();
      }, 1000);
    }
  }, [status, handleViewDashboard, appDetailPods]);

  return (
    <>
      <Flex
        flexDirection={'column'}
        minH={'100%'}
        overflowY={'auto'}
        overflowX={'hidden'}
        w={'100%'}
        mx={'auto'}
        bg={'#fafafa'}
        pt={'110px'}
      >
        <Flex w={'880px'} mx={'auto'} flexDirection={'column'}>
          <Flex alignItems={'center'} justifyContent={'space-between'}>
            <Box>
              <Text fontSize={'24px'} fontWeight={600} color={'#0A0A0A'}>
                {t('deploying')} {appName}
              </Text>
              <Text fontSize={'14px'} color={'#525252'}>
                {status === 'failed' ? t('deployFailed') : t('deploymentInProgress')}
              </Text>
            </Box>
            <Flex gap={2}>
              {status === 'failed' && (
                <Button onClick={handleRedeploy} height={'40px'}>
                  <Text fontSize={'14px'} mr={2}>
                    {t('redeploy')}
                  </Text>
                  <ArrowRight size={20} />
                </Button>
              )}
              <Button onClick={handleViewDashboard} height={'40px'} variant={'outline'}>
                <Text fontSize={'14px'}>{t('viewDashboard')}</Text>
              </Button>
            </Flex>
          </Flex>
          <Box
            mt={'24px'}
            border={'1px solid #E4E4E7'}
            borderRadius={'16px'}
            bg={'#fff'}
            boxShadow={'0px 4px 6px -2px #0000000D, 0px 10px 15px -3px #0000001A'}
          >
            <Box px={'20px'} borderBottom={'1px solid #E4E4E7'}>
              <Text fontSize={'16px'} fontWeight={600} h={'64px'} lineHeight={'64px'}>
                {t('deploymentProcess')}
              </Text>
              {appDetailPods.length > 1 && (
                <Flex my={'14px'} overflowX={'auto'} gap={'12px'} alignItems={'center'}>
                  {appDetailPods.map((pod, index, arr) => (
                    <>
                      <Flex
                        key={index}
                        px={4}
                        py={2}
                        borderRadius={'8px'}
                        bg={currentPod === index ? '#F4F4F5' : 'transparent'}
                        cursor={'pointer'}
                        _hover={{ bg: '#F4F4F5' }}
                        onClick={() => setCurrentPod(index)}
                        alignItems={'center'}
                        gap={2}
                      >
                        {pod.status.value === 'running' && (
                          <CircleCheck size={20} fill={'#1C4EF5'} color={'white'} />
                        )}
                        {pod.status.value !== 'running' && (
                          <CircleAlert size={20} fill={'#FACC15'} color={'white'} />
                        )}
                        <Text
                          fontSize={'14px'}
                          color={currentPod === index ? '#0A0A0A' : '#71717A'}
                          fontWeight={currentPod === index ? 500 : 400}
                        >
                          {pod.podName}
                        </Text>
                      </Flex>
                      {index !== arr.length - 1 && <Box w={'1px'} h={'24px'} bg={'#E4E4E7'} />}
                    </>
                  ))}
                </Flex>
              )}
            </Box>

            <Box flex={'1 0 0'} pt={4} overflowY={'auto'}>
              {events.map((event, i) => {
                return (
                  <Box
                    key={event.id}
                    px={'20px'}
                    py={'16px'}
                    position={'relative'}
                    borderBottom={'1px dashed #E4E4E7'}
                  >
                    <Flex lineHeight={1} mb={2} w={'100%'} flexDirection={'column'}>
                      <Flex
                        justifyContent={'space-between'}
                        w={'100%'}
                        cursor={'pointer'}
                        onClick={() => {
                          const target = event.id;
                          setExpandedEvents((prev) => {
                            if (prev.includes(target)) {
                              return prev.filter((id) => id !== target);
                            }
                            return [...prev, target];
                          });
                        }}
                      >
                        <Flex gap={2} alignItems={'center'}>
                          <ChevronRight
                            size={20}
                            color={'#0A0A0A'}
                            style={{
                              transform: `rotate(${
                                expandedEvents.includes(event.id) ? '90deg' : '0deg'
                              })`,
                              transition: 'transform 0.2s'
                            }}
                          />
                          <Text fontWeight={500}>{event.reason}</Text>
                        </Flex>
                        <Flex gap={2} alignItems={'center'}>
                          <Text fontSize={'14px'} color={'#71717A'}>
                            {event.firstTime}
                          </Text>
                          {/* {event.type === 'none' && <CircleX size={20} fill={'#DC2626'} color={'white'} />} */}
                          {event.type === 'Normal' && (
                            <CircleCheck size={20} fill={'#1C4EF5'} color={'white'} />
                          )}
                          {event.type === 'Warning' && (
                            <CircleAlert size={20} fill={'#FACC15'} color={'white'} />
                          )}
                        </Flex>
                      </Flex>
                      <Box
                        ml={'28px'}
                        mt={expandedEvents.includes(event.id) ? '16px' : '0'}
                        color={'#71717A'}
                        maxH={
                          expandedEvents.includes(event.id)
                            ? Math.floor(event.message.length / 100) * 20 + 20
                            : '0'
                        }
                        // height={expandedEvents.includes(event.id) ? '' : '0'}
                        lineHeight={'20px'}
                        overflow={'hidden'}
                        transition={'all 0.2s ease-in-out'}
                      >
                        {event.message}
                      </Box>
                    </Flex>
                  </Box>
                );
              })}
              {events.length === 0 && !isLoading && (
                <Flex
                  alignItems={'center'}
                  justifyContent={'center'}
                  flexDirection={'column'}
                  h={'100%'}
                >
                  <MyIcon name="noEvents" w={'48px'} h={'48px'} color={'transparent'} />
                  <Box mt={4} color={'myGray.600'}>
                    {'No events yet'}
                  </Box>
                </Flex>
              )}
            </Box>
            {/* <Loading loading={isLoading} fixed={false} /> */}
          </Box>
        </Flex>
      </Flex>
    </>
  );
};

export async function getServerSideProps(content: any) {
  const appName = content?.query?.name || '';

  return {
    props: {
      appName,
      ...(await serviceSideProps(content))
    }
  };
}

export default React.memo(AppDetail);
