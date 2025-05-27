import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Box,
  Flex,
  Grid,
  Button,
  useTheme,
  useDisclosure,
  MenuButton,
  Text
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import type { PodDetailType, PodEvent } from '@/types/app';
import PodLineChart from '@/components/PodLineChart';
import { MOCK_PODS } from '@/mock/apps';
import { getPodEvents } from '@/api/app';
import { useQuery } from '@tanstack/react-query';
import { useLoading } from '@/hooks/useLoading';
import MyIcon from '@/components/Icon';
import { streamFetch } from '@/services/streamFetch';
import { useToast } from '@/hooks/useToast';
import { SealosMenu } from '@sealos/ui';

import { MyTooltip } from '@sealos/ui';

import styles from '@/components/app/detail/index/index.module.scss';
import { useTranslation } from 'next-i18next';
import { SHOW_EVENT_ANALYZE } from '@/store/static';

const Logs = ({
  pod = MOCK_PODS[0],
  pods = [],
  podAlias,
  setPodDetail,
  closeFn
}: {
  pod: PodDetailType;
  pods: { alias: string; podName: string }[];
  podAlias: string;
  setPodDetail: (name: string) => void;
  closeFn: () => void;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const controller = useRef(new AbortController());
  const { Loading } = useLoading();
  const { toast } = useToast();
  const [events, setEvents] = useState<PodEvent[]>([]);
  const [eventAnalysesText, setEventAnalysesText] = useState('');
  const { isOpen: isAnalyzing, onOpen: onStartAnalyses, onClose: onEndAnalyses } = useDisclosure();
  const {
    isOpen: isOpenAnalyses,
    onOpen: onOpenAnalyses,
    onClose: onCloseAnalyses
  } = useDisclosure();

  const RenderItem = useCallback(
    ({ label, children }: { label: string; children: React.ReactNode }) => {
      return (
        <Flex w={'100%'} my={'12px'} alignItems="center">
          <Box flex={'0 0 100px'} w={0} color={'grayModern.900'}>
            {label}
          </Box>
          <Box
            flex={'1 0 0'}
            w={0}
            color={'grayModern.600'}
            userSelect={typeof children === 'string' ? 'all' : 'auto'}
          >
            {children}
          </Box>
        </Flex>
      );
    },
    []
  );
  const RenderTag = useCallback(({ children }: { children: string }) => {
    return (
      <MyTooltip label={children}>
        <Box
          py={1}
          px={4}
          backgroundColor={'#EFF6FF'}
          whiteSpace={'nowrap'}
          overflow={'hidden'}
          textOverflow={'ellipsis'}
          color={'#1C4EF5'}
          cursor={'default'}
          borderRadius={'full'}
        >
          {children}
        </Box>
      </MyTooltip>
    );
  }, []);

  const { isLoading } = useQuery(['initPodEvents'], () => getPodEvents(pod.podName), {
    refetchInterval: 3000,
    onSuccess(res) {
      setEvents(res);
    }
  });

  useEffect(() => {
    controller.current = new AbortController();
    return () => {
      controller.current?.abort();
    };
  }, []);

  const onCloseAnalysesModel = useCallback(() => {
    setEventAnalysesText('');
    onCloseAnalyses();
    controller.current?.abort();
    controller.current = new AbortController();
  }, [onCloseAnalyses]);

  const onclickAnalyses = useCallback(async () => {
    try {
      onOpenAnalyses();
      onStartAnalyses();
      await streamFetch({
        url: '/api/getPodEventsAnalyses',
        data: events.map((item) => ({
          reason: item.reason,
          message: item.message,
          count: item.count,
          type: item.type,
          firstTimestamp: item.firstTime,
          lastTimestamp: item.lastTime
        })),
        abortSignal: controller.current,
        onMessage: (text: string) => {
          setEventAnalysesText((state) => (state += text));
        }
      });
    } catch (err: any) {
      toast({
        title: typeof err === 'string' ? err : err?.message || '智能分析出错了~',
        status: 'warning',
        duration: 5000,
        isClosable: true
      });
      onCloseAnalysesModel();
    }
    onEndAnalyses();
  }, [events, onCloseAnalysesModel, onEndAnalyses, onOpenAnalyses, onStartAnalyses, toast]);

  return (
    <>
      <Drawer isOpen={true} onClose={closeFn} size={'xl'} placement="right">
        <DrawerOverlay />
        <DrawerContent
          maxW={'50%'}
          height={'calc(100% - 16px)'}
          display={'flex'}
          flexDirection={'column'}
          borderRadius={'16px'}
          style={{
            top: '8px',
            right: '8px'
          }}
        >
          <Flex alignItems={'center'} height={'56px'} px={'24px'}>
            <Box mr={3} fontSize={'18px'} fontWeight={600}>
              Pod {t('Details')}
            </Box>
            {/* <Box px={3}>
              <SealosMenu
                width={240}
                Button={
                  <MenuButton
                    minW={'240px'}
                    h={'32px'}
                    textAlign={'start'}
                    bg={'grayModern.100'}
                    border={theme.borders.base}
                    borderRadius={'md'}
                  >
                    <Flex px={4} alignItems={'center'}>
                      <Box flex={1}>{podAlias}</Box>
                      <ChevronDownIcon ml={2} />
                    </Flex>
                  </MenuButton>
                }
                menuList={pods.map((item) => ({
                  isActive: item.podName === pod.podName,
                  child: <Box>{item.alias}</Box>,
                  onClick: () => setPodDetail(item.podName)
                }))}
              />
            </Box> */}
          </Flex>

          <DrawerBody
            overflowX={'auto'}
            borderTop={'1px solid #E4E4E7'}
            p={'24px'}
            display={'flex'}
            bg={'#F8F8F9'}
            flexDirection={'column'}
            borderBottomRadius={'16px'}
          >
            <Flex
              flexDirection={'column'}
              py={'20px'}
              px={'24px'}
              border={'1px solid #E4E4E7'}
              borderRadius={'16px'}
              bg={'#fff'}
              boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.05)'}
            >
              <Text fontSize={'16px'} fontWeight={600}>
                Live Monitoring
              </Text>
              <Flex mt={'24px'}>
                <Box flex={1}>
                  <Box mb={3}>CPU ({pod.usedCpu.yData[pod.usedCpu.yData.length - 1]}%)</Box>
                  <Box h={'80px'} w={'100%'}>
                    <PodLineChart type={'blue'} data={pod.usedCpu} />
                  </Box>
                </Box>
                <Box flex={1}>
                  <Box mb={3}>
                    {t('Memory')} ({pod.usedMemory.yData[pod.usedMemory.yData.length - 1]}%)
                  </Box>
                  <Box h={'80px'} w={'100%'}>
                    <PodLineChart type={'purple'} data={pod.usedMemory} />
                  </Box>
                </Box>
              </Flex>
            </Flex>
            <Box
              mt={'24px'}
              py={'20px'}
              px={'24px'}
              border={'1px solid #E4E4E7'}
              borderRadius={'16px'}
              bg={'#fff'}
              boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.05)'}
            >
              <Text fontSize={'16px'} fontWeight={600}>
                Events
              </Text>

              <Box flex={'1 0 0'} pt={4} overflowY={'auto'}>
                {events.map((event, i) => {
                  return (
                    <Box
                      key={event.id}
                      pl={6}
                      pb={6}
                      ml={4}
                      borderLeft={`2px solid ${
                        i === events.length - 1 ? 'transparent' : '#DCE7F1'
                      }`}
                      position={'relative'}
                      _before={{
                        content: '""',
                        position: 'absolute',
                        left: '-6.5px',
                        w: '8px',
                        h: '8px',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        border: '2px solid',
                        borderColor: event.type === 'Warning' ? '#D92D20' : '#039855'
                      }}
                    >
                      <Flex lineHeight={1} mb={2} alignItems={'center'}>
                        <Box fontWeight={'bold'}>
                          {event.reason},&ensp;Last Occur: {event.lastTime}
                        </Box>
                        <Box ml={2} color={'blackAlpha.700'}>
                          First Seen: {event.firstTime}
                        </Box>
                        <Box ml={2} color={'blackAlpha.700'}>
                          count: {event.count}
                        </Box>
                      </Flex>
                      <Box color={'blackAlpha.700'}>{event.message}</Box>
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
                      {t('No events yet')}
                    </Box>
                  </Flex>
                )}
              </Box>
              <Loading loading={isLoading} fixed={false} />
            </Box>

            <Flex
              mt={'24px'}
              flexDirection={'column'}
              h={'100%'}
              py={'20px'}
              px={'24px'}
              border={'1px solid #E4E4E7'}
              borderRadius={'16px'}
              bg={'#fff'}
              boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.05)'}
            >
              <Box fontSize={'16px'} fontWeight={600}>
                {t('Details')}
              </Box>

              <Box backgroundColor={'#fff'}>
                <RenderItem label={t('Status')}>
                  <Box as="span" color={pod.status.color}>
                    {pod.status.label}
                  </Box>
                </RenderItem>
                <RenderItem label="Restarts">{pod.restarts}</RenderItem>
                <RenderItem label="Age">{pod.age}</RenderItem>
                <RenderItem label="Pod Name">{pod.podName}</RenderItem>
                <RenderItem label="Controlled By">{`${pod.metadata?.ownerReferences?.[0].kind}/${pod.metadata?.ownerReferences?.[0].name}`}</RenderItem>
                <RenderItem label="Labels">
                  <Grid gridTemplateColumns={'auto auto'} gridGap={2}>
                    {Object.entries(pod.metadata?.labels || {}).map(
                      ([key, value]: [string, string]) => (
                        <RenderTag key={key}>{`${key}=${value}`}</RenderTag>
                      )
                    )}
                  </Grid>
                </RenderItem>
                <RenderItem label="Annotations">
                  {Object.entries(pod.metadata?.annotations || {}).map(
                    ([key, value]: [string, string]) => (
                      <Box key={key} mb={2}>
                        <RenderTag>{`${key}=${value}`}</RenderTag>
                      </Box>
                    )
                  )}
                </RenderItem>
              </Box>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* analyses drawer */}
      <Drawer isOpen={isOpenAnalyses} onClose={onCloseAnalysesModel} placement="right" size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Pod {t('Intelligent Analysis')}</DrawerHeader>
          <DrawerCloseButton />
          <DrawerBody
            className={isAnalyzing ? styles.analysesAnimation : ''}
            overflowY={'auto'}
            whiteSpace={'pre-wrap'}
            position={'relative'}
          >
            {eventAnalysesText}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Logs;
