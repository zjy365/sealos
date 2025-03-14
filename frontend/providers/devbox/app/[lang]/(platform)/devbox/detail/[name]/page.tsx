'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, Divider, Flex } from '@chakra-ui/react';

import Header from './components/Header';
import Version from './components/Release';
import MainBody from './components/MainBody';
import BasicInfo from './components/Basic';

import { useEnvStore } from '@/stores/env';
import { useLoading } from '@/hooks/useLoading';
import { useDevboxStore } from '@/stores/devbox';
import Monitor from './components/Monitor';
const DevboxDetailPage = ({ params }: { params: { name: string } }) => {
  const t = useTranslations();

  const devboxName = params.name;
  const { Loading } = useLoading();
  const { env } = useEnvStore();
  const { devboxDetail, setDevboxDetail, loadDetailMonitorData, intervalLoadPods } =
    useDevboxStore();

  const [initialized, setInitialized] = useState(false);
  const [tab, setTab] = useState<'overview' | 'monitor'>('overview');

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
      return intervalLoadPods(devboxName, true);
    },
    {
      enabled: !devboxDetail?.isPause,
      refetchOnMount: true,
      refetchInterval: 3000
    }
  );

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
                {/* basic */}
                <Box
                  w={'full'}
                  mr={4}
                  overflow={'overlay'}
                  zIndex={1}
                  transition={'0.4s'}
                  bg={'white'}
                  borderWidth={1}
                  borderRadius={'lg'}
                >
                  <BasicInfo />
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
    </Flex>
  );
};

export default DevboxDetailPage;
