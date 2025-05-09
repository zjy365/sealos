'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';

import {
  Box,
  Button,
  Divider,
  Flex,
  Text
} from '@chakra-ui/react';

import Header from './components/Header';
import Version from './components/Release';
import MainBody from './components/MainBody';
import BasicInfo from './components/Basic';

import { useEnvStore } from '@/stores/env';
import { useLoading } from '@/hooks/useLoading';
import { useScheduleModal } from '@/hooks/useScheduleModal';
import { useDevboxStore } from '@/stores/devbox';
import { updateDevbox } from '@/api/devbox';
import { DevboxPatchPropsType } from '@/types/devbox';
import { YamlKindEnum } from '@/constants/devbox';
import Monitor from './components/Monitor';
import { getScheduleTime } from '@/utils/tools';
import { json2SchedulePause } from '@/utils/json2Yaml';
const DevboxDetailPage = ({ params }: { params: { name: string } }) => {
  const t = useTranslations();
  const { openConfirm, ConfirmModal } = useScheduleModal({title: 'devboxScheduleEdit'});

  const devboxName = params.name;
  const { Loading } = useLoading();
  const { env, setEnv } = useEnvStore();
  const { devboxDetail, setDevboxDetail, loadDetailMonitorData, intervalLoadPods } =
    useDevboxStore();

  const [initialized, setInitialized] = useState(false);
  const [tab, setTab] = useState<'overview' | 'monitor'>('overview');

  useEffect(() => {
    setEnv();
  }, [setEnv]);

  const { refetch, data } = useQuery(
    ['initDevboxDetail'],
    () => setDevboxDetail(devboxName, env.sealosDomain),
    {
      onSettled() {
        setInitialized(true);
      },
      onSuccess: () => {}
    }
  );

  useQuery(
    ['devbox-detail-pod'],
    () => {
      if (devboxDetail?.isPause) return null;
      return intervalLoadPods([devboxName], true);
    },
    {
      enabled: !devboxDetail?.isPause,
      refetchOnMount: true,
      refetchInterval: 3000
    }
  );


  const isRunning = useMemo(() => {
    return devboxDetail?.status.value === 'Running';
  }, [devboxDetail?.status.value]);
  const isSetSchedule = useMemo(() => {
    return devboxDetail?.schedulePause?.time !== undefined && devboxDetail?.schedulePause?.time !== "";
  }, [devboxDetail?.schedulePause?.time]);
  const pauseTime = useMemo(() => {
    return devboxDetail?.schedulePause?.time ? new Date(devboxDetail?.schedulePause?.time) : null;
  }, [devboxDetail?.schedulePause?.time]);

  const handleScheduleEdit = async (pauseTime: number) => {
    const patch: DevboxPatchPropsType = []
    
    if (pauseTime >= 0 && isSetSchedule) {
      patch.push({
        type: 'patch',
        kind: YamlKindEnum.DevBoxSchedule,
        value: {
          metadata: {
            name: `${devboxName}-schedule-pause`
          },
          spec: {
            scheduleTime: getScheduleTime(pauseTime),
            scheduleType: 'Stopped'
          }
        }
      });
    }
    else if (pauseTime >= 0 && !isSetSchedule) {
      patch.push({
        type: 'create',
        kind: YamlKindEnum.DevBoxSchedule,
        value: json2SchedulePause({
          devBoxName: devboxName,
          namespace: env.namespace,
          schedulePause: {
            time: getScheduleTime(pauseTime),
            type: 'Stopped'
          }
        })
      });
    }
    else {
      patch.push({
        type: 'delete',
        kind: YamlKindEnum.DevBoxSchedule,
        name: `${devboxName}-schedule-pause`
      });
    }
    try {
      await updateDevbox({
        patch,
        devboxName
      });
    } finally {
      refetch();
    }
  };

  useQuery(
    ['loadDetailMonitorData', devboxName, devboxDetail?.isPause],
    () => {
      if (devboxDetail?.isPause) return null;
      return loadDetailMonitorData(devboxName);
    },
    {
      refetchOnMount: true,
      refetchInterval: 2 * 60 * 1000
    }
  );
  return (
    <Flex py={5} direction={'column'} bg={'white'} minH={'100vh'}>
      <Loading loading={!initialized} />
      {devboxDetail && initialized && (
        <>
          <Box mb={6} px={'40px'}>
            <Header refetchDevboxDetail={refetch} />
          </Box>

          {/* tab */}
          <Flex gap={4} px={'40px'} alignItems={'center'}>
            <Button
              border={'none'}
              bg={'white'}
              h={'32px'}
              color={'grayModern.900'}
              boxShadow={'none'}
              fontWeight={'normal'}
              _hover={{
                bg: '#F2F2F2'
              }}
              {...(tab === 'overview' && {
                bg: '#F2F2F2',
                fontWeight: 'bold'
              })}
              onClick={() => {
                setTab('overview');
              }}
            >
              {t('overview')}
            </Button>
            <Divider h={'24px'} orientation={'vertical'} />
            <Button
              border={'none'}
              bg={'white'}
              h={'32px'}
              color={'grayModern.900'}
              boxShadow={'none'}
              fontWeight={'normal'}
              _hover={{
                bg: '#F2F2F2'
              }}
              {...(tab === 'monitor' && {
                bg: '#F2F2F2',
                fontWeight: 'bold'
              })}
              onClick={() => {
                setTab('monitor');
              }}
            >
              {t('monitor_tab')}
            </Button>
          </Flex>

          <Divider my={2} />
          <Flex
            position={'relative'}
            flex={'1 0 0'}
            gap={4}
            direction={'column'}
            w={'70%'}
            mx={'auto'}
            my={4}
          >
            {tab === 'overview' && (
              <>
                {isRunning && isSetSchedule && pauseTime && (
                  <Box bg={'#FFF7ED'} p={'16px'} borderRadius={'lg'}>
                    <Text color={'#18181B'}>
                      {t('devboxSchedulePauseTip', {
                        time: pauseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      })}
                    </Text>
                  </Box>
                )}
                {/* basic */}
                <Box
                  bg={'#F4F4F5'}
                  borderWidth={1}
                  borderColor={'#F4F4F5'}
                  borderRadius={'lg'}
                >
                  <Box
                    w={'full'}
                    mr={4}
                    overflow={'overlay'}
                    zIndex={1}
                    transition={'0.4s'}
                    bg={'white'}
                    borderWidth={1}
                    borderRadius={'lg'}
                    boxShadow={'0px 1px 2px 0px #0000000D'}
                  >
                    <BasicInfo />
                  </Box>
                  {
                    isRunning && (
                      <Flex p={'20px 24px'} justifyContent={'space-between'} alignItems={'center'}>
                      <Box>
                        <Text fontSize={'16px'} fontWeight={'500'} color={'black'}>
                          {t('devboxScheduleTitle')}
                        </Text>
                        <Text fontSize={'14px'} color={'#71717A'}>
                          {!isSetSchedule ? t('devboxScheduleDesc') : t('devboxScheduleDescSet')}
                        </Text>
                      </Box>
                      <Button
                        variant={'outline'}
                        color={'#18181B'}
                        p={'10px 16px'}
                        _hover={{
                          bg: '#F2F2F2'
                        }}
                        fontSize={'14px'}
                        fontWeight={'500'}
                        onClick={openConfirm(handleScheduleEdit)}
                      >
                        {!isSetSchedule ? t('devboxScheduleEdit') : t('devboxScheduleEditSet')}
                      </Button>
                    </Flex>
                  )}
                </Box>
                <Flex
                  w={'full'}
                  flexDirection={'column'}
                  overflow={'overlay'}
                  sx={{
                    '&::-webkit-scrollbar': {
                      display: 'none'
                    },
                    msOverflowStyle: 'none', // IE and Edge
                    scrollbarWidth: 'none' // Firefox
                  }}
                >
                  <Box mb={4} bg={'white'} borderRadius={'lg'} flexShrink={0} minH={'257px'}>
                    <MainBody />
                  </Box>
                  <Box bg={'white'} borderRadius={'lg'} flex={'1'}>
                    <Version />
                  </Box>
                </Flex>
              </>
            )}
            {tab === 'monitor' && <Monitor />}
          </Flex>
        </>
      )}
      {ConfirmModal}
    </Flex>
  );
};

export default DevboxDetailPage;
