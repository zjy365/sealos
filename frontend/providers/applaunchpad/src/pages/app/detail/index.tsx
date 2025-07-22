import { useLoading } from '@/hooks/useLoading';
import { useToast } from '@/hooks/useToast';
import { MOCK_APP_DETAIL } from '@/mock/apps';
import { useAppStore } from '@/store/app';
import { useGlobalStore } from '@/store/global';
import { serviceSideProps } from '@/utils/i18n';
import { Box, Flex, useTheme } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import React, { useMemo } from 'react';
import AppBaseInfo from '@/components/app/detail/index/AppBaseInfo';
import Pods from '@/components/app/detail/index/Pods';
import DetailLayout from '@/components/layouts/DetailLayout';
import AdvancedInfo from '@/components/app/detail/index/AdvancedInfo';

const AppMainInfo = dynamic(() => import('@/components/app/detail/index/AppMainInfo'), {
  ssr: false
});

const AppDetail = ({ appName }: { appName: string }) => {
  const theme = useTheme();
  const { toast } = useToast();
  const { Loading } = useLoading();
  const { screenWidth } = useGlobalStore();
  const isLargeScreen = useMemo(() => screenWidth > 1280, [screenWidth]);
  const {
    appDetail = MOCK_APP_DETAIL,
    setAppDetail,
    appDetailPods,
    intervalLoadPods,
    loadDetailMonitorData
  } = useAppStore();

  const { refetch, isSuccess } = useQuery(['setAppDetail'], () => setAppDetail(appName), {
    onError(err) {
      toast({
        title: String(err),
        status: 'error'
      });
    }
  });

  useQuery(
    ['loadDetailMonitorData', appName, appDetail?.isPause],
    () => {
      if (appDetail?.isPause) return null;
      return loadDetailMonitorData(appName);
    },
    {
      refetchOnMount: true,
      refetchInterval: 2 * 60 * 1000
    }
  );

  return (
    <DetailLayout appName={appName} key={'detail'}>
      <Flex
        flexDirection={'column'}
        minH={'100%'}
        flex={'1 0 0'}
        overflowY={'auto'}
        overflowX={'hidden'}
        w={'1000px'}
        mx={'auto'}
        my={'32px'}
      >
        <AppBaseInfo app={appDetail} />

        <Box flex="1" maxH={'fit-content'} bg={'white'} borderRadius={'8px'}>
          {appDetail ? <AppMainInfo app={appDetail} /> : <Loading loading={true} fixed={false} />}
        </Box>

        {/* <Box bg={'white'} borderRadius={'8px'} mb={'6px'}>
          <AdvancedInfo app={appDetail} />
        </Box> */}

        <Pods pods={appDetailPods} appName={appName} />
      </Flex>
    </DetailLayout>
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
