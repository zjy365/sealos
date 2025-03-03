import MyIcon from '@/components/Icon';
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
import { useTranslation } from 'next-i18next';
import AdvancedSelect, { ListItem } from '../AdvancedSelect';
import DynamicTime from './Time';

import { REFRESH_INTERVAL_OPTIONS } from '@/constants/monitor';
import useDateTimeStore from '@/store/date';
import { ChevronDownIcon } from '@chakra-ui/icons';
import dynamic from 'next/dynamic';
import { MyTooltip } from '@sealos/ui';
import { formatTime } from '@/utils/tools';
const DatePicker = dynamic(() => import('@/components/DatePicker'), { ssr: false });

export default function Header({
  podList,
  setPodList,
  refetchData
}: {
  podList: ListItem[];
  setPodList: (val: ListItem[]) => void;
  refetchData: () => void;
}) {
  const { t } = useTranslation();
  const { refreshInterval, setRefreshInterval, endDateTime } = useDateTimeStore();

  return (
    <Flex alignItems={'center'}>
      <Flex alignItems={'center'}>
        <DatePicker />
      </Flex>

      <ButtonGroup isAttached variant={'outline'} size={'sm'} ml={'12px'}>
        <Button
          height="32px"
          bg={'#FFF'}
          _hover={{
            bg: '#FFF',
            color: 'brightBlue.500'
          }}
          onClick={() => {
            refetchData();
          }}
        >
          <Box position={'relative'}>{t('refresh')}</Box>
        </Button>
        <Menu>
          <MenuButton
            as={Button}
            height="32px"
            bg={'#FFF'}
            border={'1px solid #E4E4E7'}
            _hover={{
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
      </ButtonGroup>

      <Flex
        minW={'110px'}
        flexShrink={0}
        ml={'12px'}
        fontSize={'12px'}
        color={'grayModern.600'}
        fontWeight={'400'}
        alignItems={'center'}
      >
        {t('Update Time')}&ensp;
        {formatTime(endDateTime, 'hh:mm')}
      </Flex>
    </Flex>
  );
}
