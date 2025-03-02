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

import MyIcon from '@/components/Icon';
import DatePicker from '@/components/DatePicker';
import PodLineChart from '@/components/PodLineChart';

import { useDevboxStore } from '@/stores/devbox';

const Monitor = () => {
  const t = useTranslations();
  const { devboxDetail } = useDevboxStore();

  return (
    <Flex gap={4} direction={'column'} minH={'100%'}>
      <Flex justifyContent={'start'} alignItems={'center'}>
        {/* <DatePicker /> */}
        {/* <ButtonGroup isAttached variant={'outline'} size={'sm'}>
          <Button
            height="32px"
            bg={'grayModern.50'}
            _hover={{
              bg: 'grayModern.50'
            }}
            onClick={() => {
              refetchData();
            }}
            position={'relative'}
          >
            <Box position={'relative'}>
              <MyIcon
                name="refresh"
                w={'16px'}
                h={'16px'}
                color={'grayModern.500'}
                _hover={{
                  color: 'brightBlue.500'
                }}
              />
            </Box>
          </Button>

          <Menu>
            <MenuButton
              as={Button}
              height="32px"
              bg={'grayModern.50'}
              _hover={{
                bg: 'grayModern.50',
                '& div': {
                  color: 'brightBlue.500'
                },
                '& svg': {
                  color: 'brightBlue.500'
                }
              }}
            >
              <Flex alignItems={'center'}>
                {refreshInterval === 0 ? null : (
                  <Text mr={'4px'}>{`${refreshInterval / 1000}s`}</Text>
                )}
                <ChevronDownIcon w={'16px'} h={'16px'} color={'grayModern.500'} />
              </Flex>
            </MenuButton>
            <MenuList
              p={'6px'}
              borderRadius={'base'}
              border={'1px solid #E8EBF0'}
              boxShadow={
                '0px 4px 10px 0px rgba(19, 51, 107, 0.10), 0px 0px 1px 0px rgba(19, 51, 107, 0.10)'
              }
              zIndex={99}
              overflow={'overlay'}
              maxH={'300px'}
            >
              {REFRESH_INTERVAL_OPTIONS.map((item) => (
                <MenuItem
                  key={item.value}
                  value={item.value}
                  onClick={() => {
                    setRefreshInterval(item.value);
                  }}
                  {...(refreshInterval === item.value
                    ? {
                        color: 'brightBlue.600'
                      }
                    : {})}
                  borderRadius={'4px'}
                  _hover={{
                    bg: 'rgba(17, 24, 36, 0.05)',
                    color: 'brightBlue.600'
                  }}
                  p={'6px'}
                >
                  {item.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </ButtonGroup> */}
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
