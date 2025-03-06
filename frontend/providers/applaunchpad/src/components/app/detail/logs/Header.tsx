import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useMediaQuery
} from '@chakra-ui/react';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { Check, Search } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { UseFormReturn } from 'react-hook-form';

import useDateTimeStore from '@/store/date';
import { LogsFormData } from '@/pages/app/detail/logs';
import AdvancedSelect from '@/components/AdvancedSelect';
import { REFRESH_INTERVAL_OPTIONS } from '@/constants/monitor';
import { Filter } from './Filter';

const DatePicker = dynamic(() => import('@/components/DatePicker'), { ssr: false });

export const Header = ({
  formHook,
  refetchData
}: {
  formHook: UseFormReturn<LogsFormData>;
  refetchData: () => void;
}) => {
  const { t } = useTranslation();
  const { refreshInterval, setRefreshInterval } = useDateTimeStore();

  return (
    <Flex gap={'32px'} flexWrap={'wrap'} py={'12px'} px={'20px'} w={'100vw'}>
      <AdvancedSelect
        placeholder={t('by_pod')}
        height="40px"
        w={'100px'}
        checkBoxMode
        width={'fit-content'}
        value={'hello-sql-postgresql-0'}
        onCheckboxChange={(val) => {
          formHook.setValue('pods', val);
        }}
        list={formHook.watch('pods')}
      />
      <AdvancedSelect
        w={'100px'}
        width={'fit-content'}
        placeholder={t('by_container')}
        height="40px"
        checkBoxMode
        value={'hello-sql-postgresql-0'}
        list={formHook.watch('containers')}
        onCheckboxChange={(val) => {
          formHook.setValue('containers', val);
        }}
      />
      <InputGroup w={'200px'}>
        <InputLeftElement pointerEvents="none" h={'40px'} w={'40px'}>
          <Search color="#666666" size={16} />
        </InputLeftElement>
        <Input
          height="40px"
          w={'300px'}
          width={'fit-content'}
          bg={'#F5F5F5'}
          border={'none'}
          placeholder={t('search_placeholder')}
          _hover={{
            bg: 'white',
            border: '1px solid #E8EBF0'
          }}
          _focus={{
            border: '1px solid #E8EBF0'
          }}
          value={formHook.watch('limit')}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (isNaN(val)) {
              formHook.setValue('limit', 1);
            } else if (val > 500) {
              formHook.setValue('limit', 500);
            } else if (val < 1) {
              formHook.setValue('limit', 1);
            } else {
              formHook.setValue('limit', val);
            }
          }}
        />
      </InputGroup>
      <Filter formHook={formHook} refetchData={refetchData} />
      <DatePicker />
      <ButtonGroup isAttached variant={'outline'} size={'sm'}>
        <Button
          height="40px"
          boxShadow={'none'}
          bg={'white'}
          _hover={{
            bg: 'grayModern.50'
          }}
          onClick={() => {
            refetchData();
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
            height="40px"
            bg={'white'}
            boxShadow={'none'}
            _hover={{
              bg: 'grayModern.50'
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

      <Text color="#737373" w={'fit-content'} alignSelf={'center'}>
        {t('update_time') + ' ' + format(new Date(), 'HH:mm:ss')}
      </Text>
    </Flex>
  );
};
