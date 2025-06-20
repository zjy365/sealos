import { useCallback, useEffect, useState } from 'react';
import { serviceSideProps } from '@/utils/i18n';
import Layout from '@/components/Layout';
import Usage from './components/usage';
import {
  Flex,
  Select,
  Text,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Box
} from '@chakra-ui/react';
import Card from '@/components/Card';
import { CircleHelp } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { format, addDays, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/DayPicker/calendar';
import {
  getUsageList,
  getRegionList,
  getNamespaceList,
  getConsumption,
  getAppList
} from '@/api/usage';
import type { PaginationState } from '@tanstack/react-table';
import type { Region } from '@/types/region';
import { displayMoney, formatMoney } from '@/utils/format';
import { debounce } from 'lodash';

function DatePickerWithRange({
  date,
  setDate
}: {
  date: DateRange;
  setDate: (date: DateRange) => void;
}) {
  return (
    <Box display={'grid'}>
      <Popover placement="bottom-end">
        <PopoverTrigger>
          <Button id="date" variant={'outline'} gap={'8px'}>
            <CalendarIcon size={'16px'} />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent w={'fit-content'}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) => setDate(range as DateRange)}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </Box>
  );
}

function Home() {
  const [initialized, setInitialized] = useState(false);
  const { t } = useTranslation();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });
  const [total, setTotal] = useState(0);
  const [usageList, setUsageList] = useState([]);
  const [regionList, setRegionList] = useState<Region[]>([]);
  const [namespaceList, setNamespaceList] = useState([]);
  const [date, setDate] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: addDays(startOfDay(new Date()), 1)
  });
  const [confumptions, setConsumptions] = useState(0);
  const [namespace, setNamespace] = useState('');
  const [region, setRegion] = useState('');
  const [appType, setAppType] = useState({});

  useEffect(() => {
    getRegionList().then((res) => {
      setRegionList(res as any);
    });
    getAppList().then((res) => {
      setAppType(res?.appMap || {});
    });
  }, []);

  useEffect(() => {
    getNamespaceList({
      endTime: date?.to || startOfDay(new Date()),
      startTime: date?.from,
      regionUid: region
    }).then((res) => {
      setNamespaceList(res);
      if (res.length > 0) {
        setNamespace(res[0][0]);
      } else {
        setNamespace('');
      }
    });
  }, [date?.from, date?.to, region]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchUsageList = useCallback(
    debounce(async (data: any) => {
      setInitialized(false);
      try {
        const res = await getUsageList(data);
        setUsageList(res?.overviews || []);
        setTotal(res?.total || 0);
        if (Math.ceil(res.total / pagination.pageSize) < pagination.pageIndex) {
          setPagination({
            ...pagination,
            pageIndex: 0
          });
        }
      } catch (e) {
      } finally {
        setInitialized(true);
      }
    }, 500),
    []
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchComsumption = useCallback(
    debounce(async (data: any) => {
      const res = await getConsumption(data);
      setConsumptions(res?.amount || 0);
    }, 500),
    []
  );

  useEffect(() => {
    const data = {
      endTime: date?.to,
      startTime: date?.from ? date.from : date?.to ? startOfDay(new Date()) : undefined,
      regionUid: region,
      namespace
    };
    fetchComsumption(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, namespace, date?.from, date?.to]);

  useEffect(() => {
    const data = {
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      endTime: date?.to,
      startTime: date?.from ? date.from : date?.to ? startOfDay(new Date()) : undefined,
      regionUid: region,
      namespace
    };
    fetchUsageList(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, namespace, date?.from, date?.to, pagination.pageIndex, pagination.pageSize]);

  const handleCostHelp = () => {};

  return (
    <Layout loading={!initialized}>
      <Flex justifyContent={'space-between'} mb={'12px'}>
        <Flex w={'370px'}>
          <Select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            borderRightRadius={'0px'}
            size={'lg'}
            placeholder={t('SelectRegion')}
          >
            {regionList.map((item: Region) => {
              return (
                <option key={item.uid} value={item.uid}>
                  {item.name.en}
                </option>
              );
            })}
          </Select>
          <Select
            value={namespace}
            onChange={(e) => setNamespace(e.target.value)}
            borderLeftRadius={'0px'}
            size={'lg'}
            placeholder={t('SelectWorkspace')}
          >
            {namespaceList.map((item: any) => {
              return (
                <option key={item[0]} value={item[0]}>
                  {item[1]}
                </option>
              );
            })}
          </Select>
        </Flex>
        <Flex alignItems={'center'}>
          <DatePickerWithRange date={date} setDate={setDate}></DatePickerWithRange>
        </Flex>
      </Flex>
      <Flex mb={'12px'} gap={'12px'}>
        <Card width={'full'}>
          <Flex justifyContent={'space-between'}>
            <Text fontSize={'18px'} lineHeight={'28px'} fontWeight={600}>
              {t('TotalCost')}
            </Text>
            <Flex
              onClick={handleCostHelp}
              cursor={'pointer'}
              alignItems={'center'}
              color={'#1C4EF5'}
              visibility={'hidden'}
            >
              <CircleHelp size={'16px'} />
              <Text ml={'4px'} fontSize={'14px'} lineHeight={'20px'} fontWeight={500}>
                {t('CostMetrics')}
              </Text>
            </Flex>
          </Flex>
          <Text mt={'16px'} fontSize={'36px'} lineHeight={'36px'} fontWeight={600}>
            ${displayMoney(formatMoney(confumptions))}
          </Text>
        </Card>
        <Card width={'full'}>
          <Flex>
            <Text fontSize={'18px'} lineHeight={'28px'} fontWeight={600}>
              {t('TotalApps')}
            </Text>
          </Flex>
          <Text mt={'16px'} fontSize={'36px'} lineHeight={'36px'} fontWeight={600}>
            {total}
          </Text>
        </Card>
      </Flex>
      <Usage
        data={{
          page: pagination.pageIndex + 1,
          pageSize: pagination.pageSize,
          endTime: date?.to,
          startTime: date?.from,
          regionUid: region,
          namespace
        }}
        region={regionList}
        appType={appType}
        usageList={usageList}
        total={total}
        pagination={pagination}
        setPagination={setPagination}
      />
    </Layout>
  );
}

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content))
    }
  };
}

export default Home;
