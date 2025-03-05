import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text
} from '@chakra-ui/react';
import { Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDownIcon } from '@chakra-ui/icons';

import DatePicker from '@/components/DatePicker';
import PodLineChart from '@/components/PodLineChart';

import useDateTimeStore from '@/stores/date';
import { useDevboxStore } from '@/stores/devbox';
import { REFRESH_INTERVAL_OPTIONS } from '@/constants/monitor';

const Monitor = () => {
  const t = useTranslations();
  const { devboxDetail, loadDetailMonitorData } = useDevboxStore();
  const { refreshInterval, setRefreshInterval, startDateTime, endDateTime } = useDateTimeStore();

  useQuery({
    queryKey: ['monitorData', devboxDetail?.name, refreshInterval, startDateTime, endDateTime],
    queryFn: () =>
      loadDetailMonitorData(
        devboxDetail?.name || '',
        refreshInterval,
        startDateTime.getTime(),
        endDateTime.getTime()
      )
  });

  return (
    <Flex gap={4} direction={'column'} minH={'100%'}>
      <Flex justifyContent={'start'} alignItems={'center'} gap={4}>
        <DatePicker />
        <ButtonGroup isAttached variant={'outline'} size={'sm'}>
          <Button
            height="36px"
            boxShadow={'none'}
            bg={'white'}
            _hover={{
              bg: 'grayModern.50'
            }}
            onClick={() => {
              loadDetailMonitorData(
                devboxDetail?.name || '',
                refreshInterval,
                startDateTime.getTime(),
                endDateTime.getTime()
              );
            }}
            position={'relative'}
          >
            <Text position={'relative'} fontSize={'normal'} fontWeight={'normal'}>
              {t('refresh')}
            </Text>
          </Button>

          <Menu autoSelect={false}>
            <MenuButton
              as={Button}
              height="36px"
              bg={'white'}
              boxShadow={'none'}
              _hover={{
                bg: 'grayModern.50'
              }}
            >
              <Flex alignItems={'center'}>
                {refreshInterval === '' ? null : <Text mr={'4px'}>{`${refreshInterval}`}</Text>}
                <ChevronDownIcon w={'16px'} h={'16px'} color={'grayModern.500'} />
              </Flex>
            </MenuButton>
            <MenuList
              p={'2'}
              borderRadius={'base'}
              border={'1px solid #E8EBF0'}
              boxShadow={
                '0px 4px 10px 0px rgba(19, 51, 107, 0.10), 0px 0px 1px 0px rgba(19, 51, 107, 0.10)'
              }
              zIndex={99}
              overflow={'overlay'}
              maxH={'300px'}
            >
              <Box color={'#71717A'} mb={'3'} pl={1} fontSize={'12px'} fontWeight={'500'}>
                {t('set_automatic_refresh')}
              </Box>
              {REFRESH_INTERVAL_OPTIONS.map((item) => (
                <MenuItem
                  key={item.value}
                  value={item.value}
                  onClick={() => {
                    setRefreshInterval(item.value);
                  }}
                  borderRadius={'4px'}
                  _hover={{
                    bg: 'rgba(17, 24, 36, 0.05)'
                  }}
                  p={'6px'}
                >
                  <Flex alignItems={'center'} justifyContent={'space-between'} w={'full'}>
                    {item.label}
                    {refreshInterval === item.value && (
                      <Check color={'#1C4EF5'} width={'16px'} height={'16px'} />
                    )}
                  </Flex>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </ButtonGroup>
        <Box color={'#737373'} fontSize={'12px'} fontWeight={'normal'}>
          {t('update Time')}&ensp;
          {dayjs().format('HH:mm')}
        </Box>
      </Flex>
      {/* cpu */}
      <Box bg={'white'} borderRadius="lg" borderWidth={1} minH={'350px'}>
        <Flex justifyContent={'space-between'} borderBottom={'1px solid #E0E0E0'} p={4}>
          <Box fontWeight={'bold'}>CPU</Box>
          <Box fontWeight={'bold'}>
            {devboxDetail?.usedCpu?.yData[devboxDetail?.usedCpu?.yData?.length - 1]}%
          </Box>
        </Flex>
        <Flex p={4} py={6} my={3} position={'relative'} h={'250px'}>
          <PodLineChart
            type={'purpleBlue'}
            data={devboxDetail?.usedCpu}
            isShowLabel
            noBg
            splitNumber={5}
          />
        </Flex>
      </Box>
      {/* memory */}
      <Box bg={'white'} borderRadius="lg" borderWidth={1} minH={'350px'}>
        <Flex justifyContent={'space-between'} borderBottom={'1px solid #E0E0E0'} p={4}>
          <Box fontWeight={'bold'}> {t('memory')}</Box>
          <Box fontWeight={'bold'}>
            {devboxDetail?.usedMemory?.yData[devboxDetail?.usedMemory?.yData?.length - 1]}%
          </Box>
        </Flex>
        <Flex p={4} py={6} my={3} position={'relative'} h={'250px'}>
          <PodLineChart
            type={'purple'}
            data={devboxDetail?.usedMemory}
            isShowLabel
            noBg
            splitNumber={5}
          />
        </Flex>
      </Box>
    </Flex>
  );
};

export default Monitor;
