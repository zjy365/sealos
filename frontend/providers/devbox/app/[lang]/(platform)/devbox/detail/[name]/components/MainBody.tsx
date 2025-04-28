import dayjs from 'dayjs';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { 
  Box,
  Button,
  Center,
  Flex,
  Img,
  Text,
  Tooltip,
  useDisclosure,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from '@chakra-ui/react';

import MyIcon from '@/components/Icon';
import MyTable from '@/components/MyTable';
import PodLineChart from '@/components/PodLineChart';

import { useRouter } from '@/i18n';
import { useEnvStore } from '@/stores/env';
import { useCopyData } from '@/utils/tools';
import { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NetworkType } from '@/types/devbox';
import { useDevboxStore } from '@/stores/devbox';
import { checkReady } from '@/api/platform';

const MonitorModal = dynamic(() => import('@/components/modals/MonitorModal'));

const MainBody = () => {
  const t = useTranslations();
  const router = useRouter();
  const { copyData } = useCopyData();
  const { devboxDetail } = useDevboxStore();
  const { env } = useEnvStore();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const retryCount = useRef(0);
  const { data: networkStatus, refetch } = useQuery({
    queryKey: ['networkStatus', devboxDetail?.name],
    queryFn: () =>
      devboxDetail?.name && devboxDetail?.status.value === 'Running'
        ? checkReady(devboxDetail?.name)
        : [],
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
    refetchIntervalInBackground: false
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

  const networkColumn: {
    title: string;
    dataIndex?: keyof NetworkType;
    key: string;
    render?: (item: NetworkType) => JSX.Element;
    width?: string;
  }[] = [
    {
      title: t('port'),
      key: 'port',
      render: (item: NetworkType) => {
        return (
          <Text pl={4} color={'grayModern.600'}>
            {item.port}
          </Text>
        );
      },
      width: '0.3fr'
    },
    {
      title: t('internal_address'),
      key: 'internalAddress',
      render: (item: NetworkType) => {
        const address = `http://${devboxDetail?.name}.${env.namespace}.svc.cluster.local:${item.port}`;
        return (
          <Flex alignItems={'center'} justify={'center'}>
            <Text color={'grayModern.600'}>{address}</Text>
            <MyIcon
              name="copy"
              w={'16px'}
              ml={1}
              color={'grayModern.400'}
              _hover={{
                color: 'grayModern.600'
              }}
              cursor={'pointer'}
              onClick={() => copyData(address)}
            />
          </Flex>
        );
      }
    },
    {
      title: t('external_address'),
      key: 'externalAddress',
      render: (item: NetworkType) => {
        if (item.openPublicDomain) {
          const address = item.customDomain || item.publicDomain;
          const displayAddress = `https://${address}`;
          return (
            <Flex alignItems={'center'}>
              {displayAddress && (
                <>
                  {statusMap[displayAddress]?.ready ? (
                    <Center
                      fontSize={'12px'}
                      fontWeight={400}
                      bg={'rgba(3, 152, 85, 0.05)'}
                      color={'#039855'}
                      borderRadius={'full'}
                      p={'2px 8px 2px 8px'}
                      gap={'2px'}
                      minW={'63px'}
                    >
                      <Center w={'6px'} h={'6px'} borderRadius={'full'} bg={'#039855'}></Center>
                      {t('Accessible')}
                    </Center>
                  ) : (
                    <Popover trigger={'hover'}>
                      <PopoverTrigger>
                        <Flex
                          alignItems={'center'}
                          gap={'2px'}
                          cursor="pointer"
                          fontSize={'12px'}
                          fontWeight={400}
                          w={'fit-content'}
                          bg={'rgba(17, 24, 36, 0.05)'}
                          color={'#485264'}
                          borderRadius={'full'}
                          p={'2px 8px 2px 8px'}
                        >
                          <MyIcon name={'help'} w={'18px'} h={'18px'} />
                          <Text fontSize={'12px'} w={'full'} color={'#485264'}>
                            {t('prepare')}
                          </Text>
                        </Flex>
                      </PopoverTrigger>
                      <PopoverContent
                        minW={'410px'}
                        h={'114px'}
                        borderRadius={'10px'}
                        w={'fit-content'}
                        minH={'fit-content'}
                      >
                        <PopoverArrow />
                        <PopoverBody>
                          <Box h={'16px'} w={'100%'} fontSize={'12px'} fontWeight={400}>
                            {t.rich('public_debug_address_tooltip_1', {
                              blue: (chunks) => (
                                <Text as={'span'} color={'brightBlue.600'}>
                                  {chunks}
                                </Text>
                              )
                            })}
                          </Box>
                          <Flex mt={'12px'} gap={'4px'} maxW={'610px'}>
                            <Flex alignItems={'center'} direction={'column'} mt={'2px'}>
                              <MyIcon name="ellipse" w={'6px'} h={'6px'} />
                              <Box
                                h={'22px'}
                                w={'1px'}
                                bg={'grayModern.250'}
                              />
                              <MyIcon name="ellipse" w={'6px'} h={'6px'} />
                              <Box
                                h={'36px'}
                                w={'1px'}
                                bg={'grayModern.250'}
                              />
                              <MyIcon name="ellipse" w={'6px'} h={'6px'} />
                            </Flex>
                            <Flex gap={'6px'} alignItems={'center'} direction={'column'}>
                              <Flex
                                h={'16px'}
                                w={'100%'}
                                fontSize={'12px'}
                                fontWeight={400}
                                minH={'fit-content'}
                              >
                                <Box w={'20%'}>
                                  {t('public_debug_address_tooltip_2_1')}
                                </Box>
                                <Box color={'grayModern.600'} w={'80%'}>
                                  {t('public_debug_address_tooltip_2_2')}
                                </Box>
                              </Flex>
                              <Flex
                                h={'16px'}
                                w={'100%'}
                                fontSize={'12px'}
                                fontWeight={400}
                                minH={'fit-content'}
                              >
                                <Box w={'20%'}>
                                  {t('public_debug_address_tooltip_3_1')}
                                </Box>
                                <Box color={'grayModern.600'} w={'80%'}>
                                  {t.rich('public_debug_address_tooltip_3_2', {
                                    underline: (chunks) => (
                                      <Text as={'span'} textDecoration={'underline'}>
                                        {chunks}
                                      </Text>
                                    )
                                  })}
                                </Box>
                              </Flex>
                              <Flex
                                h={'16px'}
                                w={'100%'}
                                fontSize={'12px'}
                                fontWeight={400}
                                minH={'fit-content'}
                              >
                                <Box w={'20%'}>
                                  {t('public_debug_address_tooltip_4_1')}
                                </Box>
                                <Box color={'grayModern.600'} w={'80%'}>
                                  {t.rich('public_debug_address_tooltip_4_2', {
                                    underline: (chunks) => (
                                      <Text as={'span'} textDecoration={'underline'}>
                                        {chunks}
                                      </Text>
                                    )
                                  })}
                                </Box>
                              </Flex>
                            </Flex>
                          </Flex>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  )}
                </>
              )}
              <Tooltip
                label={t('open_link')}
                hasArrow
                bg={'#FFFFFF'}
                color={'grayModern.900'}
                fontSize={'12px'}
                fontWeight={400}
                py={2}
                borderRadius={'md'}
              >
                <Text
                  className="guide-network-address"
                  cursor="pointer"
                  color={'grayModern.600'}
                  _hover={{ textDecoration: 'underline' }}
                  onClick={() => window.open(`https://${address}`, '_blank')}
                  isTruncated
                >
                  https://{address}
                </Text>
              </Tooltip>
              {!!address && (
                <Center
                  flexShrink={0}
                  w={'24px'}
                  h={'24px'}
                  borderRadius={'6px'}
                  cursor={'pointer'}
                >
                  <MyIcon
                    name={'copy'}
                    w={'16px'}
                    color={'grayModern.400'}
                    _hover={{
                      color: 'grayModern.600'
                    }}
                    onClick={() => copyData(`https://${address}`)}
                  />
                </Center>
              )}
            </Flex>
          );
        }
        return <Text>-</Text>;
      }
    }
  ];
  return (
    <Flex gap={4} direction={'column'}>
      <Box bg={'white'} borderRadius="lg" pl={6} pt={2} pr={6} pb={6} borderWidth={1}>
        {/* monitor */}
        <Box mt={4}>
          <Flex mb={6} w={'100%'} justifyContent={'space-between'} alignItems={'center'}>
            <Box fontSize="20px" fontWeight={'bold'} color={'grayModern.900'}>
              {t('monitor')}
            </Box>
            <Box color={'#A3A3A3'} fontSize={'12px'} fontWeight={'normal'}>
              {t('update Time')}&ensp;
              {dayjs().format('HH:mm')}
            </Box>
          </Flex>
          <Flex borderRadius={'lg'} minH={'80px'} gap={4}>
            <Box flex={1} position={'relative'}>
              <Box color={'grayModern.900'} fontWeight={'bold'} mb={2} fontSize={'12px'}>
                {t('cpu')}:&ensp;
                {devboxDetail?.usedCpu?.yData[devboxDetail?.usedCpu?.yData?.length - 1]}%
              </Box>
              <Box h={'60px'} minW={['200px', '250px', '300px']}>
                <Box h={'60px'} minW={['200px', '250px', '300px']}>
                  <PodLineChart type="purple" data={devboxDetail?.usedCpu} />
                </Box>
              </Box>
            </Box>
            <Box flex={1} position={'relative'}>
              <Box color={'grayModern.900'} fontWeight={'bold'} mb={2} fontSize={'12px'}>
                {t('memory')}:&ensp;
                {devboxDetail?.usedMemory?.yData[devboxDetail?.usedMemory?.yData?.length - 1]}%
              </Box>
              <Box h={'60px'}>
                <Box h={'60px'}>
                  <PodLineChart type="purpleBlue" data={devboxDetail?.usedMemory} />
                </Box>
              </Box>
            </Box>
          </Flex>
        </Box>
        <MonitorModal isOpen={isOpen} onClose={onClose} />
      </Box>
      <Box bg={'white'} borderRadius="lg" pl={6} pt={2} pr={6} pb={6} borderWidth={1}>
        {/* network */}
        <Box mt={4}>
          <Flex alignItems={'center'} mb={2} justifyContent={'space-between'}>
            <Text fontSize="20px" fontWeight={'bold'} color={'grayModern.900'}>
              {t('network')}
            </Text>
            <Flex gap={2} alignItems={'center'}>
              <Button
                bg={'white'}
                color={'grayModern.900'}
                _hover={{ bg: 'grayModern.50' }}
                fontSize={'12px'}
                boxShadow={'none'}
                borderWidth={1}
                borderColor={'grayModern.200'}
                borderRadius={'md'}
                onClick={() => router.push(`/devbox/create?name=${devboxDetail?.name}`)}
              >
                {t('manage_network')}
              </Button>
            </Flex>
          </Flex>

          <MyTable columns={networkColumn} data={devboxDetail?.networks || []} />
          {devboxDetail?.networks && devboxDetail.networks.length === 0 && (
            <Flex
              w={'full'}
              flex={1}
              py={'24px'}
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Img src={'/images/empty/network-empty.png'} alt="empty" width={50} height={50} />
              <Text fontSize={'18px'} fontWeight={'600'} color={'grayModern.900'} mt={'12px'}>
                {t('no_network')}
              </Text>
              <Box pb={8} w={300} textAlign={'center'}>
                {t('no_network_desc')}
              </Box>
            </Flex>
          )}
        </Box>
      </Box>
    </Flex>
  );
};

export default MainBody;
