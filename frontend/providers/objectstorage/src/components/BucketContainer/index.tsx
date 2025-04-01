import {
  Center,
  Spinner,
  Stack,
  StackProps,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text
} from '@chakra-ui/react';
import { useOssStore } from '@/store/ossStore';
import BucketHeader from './BucketHeader';
import FileManager from './FileManager';
// import DataMonitor from './Monitor';
const DataMonitor = dynamic(() => import('./Monitor'), {
  ssr: false
});
import { useTranslation } from 'next-i18next';
import { Authority } from '@/consts';
import { HostStatus } from '@/components/BucketContainer/HostStatus';
import dynamic from 'next/dynamic';

export default function BucketContainer(props: StackProps) {
  const bucket = useOssStore((s) => s.currentBucket);
  const { t } = useTranslation('file');
  const { t: bucketT } = useTranslation('bucket');
  const tabTitle = [{ title: t('directory') }, { title: t('monitoring') }] as const;
  if (process.env.NODE_ENV !== 'development' && !bucket) return <></>;
  return (
    <Stack px="42px" py="28px" w="full" h="full" {...props}>
      {bucket?.isComplete ? (
        <>
          <BucketHeader />
          <Tabs isLazy flex="1" display={'flex'} flexDir={'column'}>
            <TabList>
              {tabTitle.map((item) => (
                <Tab
                  key={item.title}
                  alignItems={'center'}
                  gap="8px"
                  py="16px"
                  fontWeight={500}
                  transition={'all 0.2s'}
                  border={'0px solid #000000'}
                  sx={{
                    svg: {
                      color: 'grayModern.500'
                    },
                    p: {
                      color: 'grayModern.600'
                    }
                  }}
                  _selected={{
                    borderBottomWidth: '2px',
                    'svg, p': {
                      color: '#18181B'
                    }
                  }}
                >
                  <Text fontSize={'14px'}>{item.title}</Text>
                </Tab>
              ))}
              {bucket.policy !== Authority.private && <HostStatus />}
            </TabList>
            <TabPanels h="0" flex="auto" overflow={'auto'}>
              <TabPanel h="full" p="0">
                <FileManager h="full" />
              </TabPanel>
              <TabPanel
                h="full"
                p="0"
                display={'flex'}
                placeItems={'center'}
                flexDirection={'column'}
              >
                <DataMonitor />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      ) : (
        <Center h="full" w="full">
          <Spinner size={'lg'} mr="10px" />
          <Text>{bucketT('initializing')}</Text>
        </Center>
      )}
    </Stack>
  );
}
