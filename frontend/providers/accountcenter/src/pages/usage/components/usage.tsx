import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import MyIcon from '@/components/Icon';
import { useTranslation } from 'next-i18next';
import Card from '@/components/Card';
import {
  Flex,
  Text,
  Button,
  Center,
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  DrawerFooter,
  DrawerHeader,
  Highlight
} from '@chakra-ui/react';
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel
} from '@tanstack/react-table';
import { BaseTable } from '@/components/BaseTable/baseTable';
import Empty from '@/components/Empty';
import type { PaginationState } from '@tanstack/react-table';
import type { AppOverviewBilling, APPBillingItem } from '@/types/billing';
import { displayMoney, formatMoney } from '@/utils/format';
import { getUsageDetail } from '@/api/usage';
import type { Region } from '@/types/region';
import { serviceSideProps } from '@/utils/i18n';

const valuationMap = [
  ['cpu', { unit: 'Core', scale: 1000, bg: '#33BABB', idx: 0 }],
  ['memory', { unit: 'GB', scale: 1024, bg: '#36ADEF', idx: 1 }],
  ['storage', { unit: 'GB', scale: 1024, bg: '#9A8EE0', idx: 2 }],
  // ['pu', { unit: 'GPU Unit', scale: 1000, bg: '#6FCA88', idx: 3 }],
  ['network', { unit: 'M', scale: 1, bg: '#F182AA', idx: 3 }],
  ['services.nodeports', { unit: 'port_unit', scale: 1000, bg: '#F182AA', idx: 4 }]
] as const;

const icons = {
  1: <MyIcon name={'db'} w={'24px'} h={'24px'} />,
  2: <MyIcon name={'app'} w={'24px'} h={'24px'} />,
  3: <MyIcon name={'terminal'} w={'24px'} h={'24px'} />,
  4: <MyIcon name={'job'} w={'24px'} h={'24px'} />,
  5: null,
  6: <MyIcon name={'objectStorage'} w={'24px'} h={'24px'} />,
  7: null,
  8: <MyIcon name={'appStore'} w={'24px'} h={'24px'} />,
  9: null,
  10: <MyIcon name={'devBox'} w={'24px'} h={'24px'} />,
  11: null
};

const Usage = ({
  total,
  pagination,
  setPagination,
  usageList,
  appType,
  data,
  region
}: {
  total: number;
  pagination: PaginationState;
  setPagination: (set: any) => void;
  usageList: AppOverviewBilling[];
  appType: any;
  data: any;
  region: Region[];
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const onClose = () => setIsOpen(false);
  const [selectApp, setSelectApp] = React.useState<AppOverviewBilling | null>(null);
  const [selectDetail, setSelectDetail] = React.useState<APPBillingItem[]>([]);
  useEffect(() => {
    if (selectApp) {
      getUsageDetail({
        appName: selectApp.appName,
        appType: appType[selectApp.appType],
        endTime: data.endTime,
        namespace: selectApp.namespace,
        regionUid: region.find((item: Region) => item.domain === selectApp.regionDomain)?.uid,
        startTime: data.startTime
      }).then((res) => {
        setSelectDetail(res.costs || []);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const columns: ColumnDef<AppOverviewBilling>[] = React.useMemo(
    () => [
      {
        id: 'appName',
        header: t('AppName'),
        cell: ({ row }) => (
          <Flex
            alignItems={'center'}
            cursor={'pointer'}
            onClick={() => {
              setIsOpen(true);
              setSelectApp(row.original);
            }}
            gap={'4px'}
          >
            {icons[row.original.appType as keyof typeof icons]}
            <Text>{row.original.appName}</Text>
          </Flex>
        )
      },
      {
        id: 'appType',
        header: t('Type'),
        cell: ({ row }) => <Text>{appType[row.original.appType]}</Text>
      },
      {
        id: 'totalCost',
        header: t('TotalCost'),
        cell: ({ row }) => <Text>{displayMoney(formatMoney(row.original.amount), 4)}</Text>
      },
      {
        id: 'status',
        header: t('Status'),
        cell: ({ row }) => (
          <Flex alignItems={'center'}>
            <Box
              mr={'4px'}
              // bg={row.original.status === 'Active' ? '#3CCA7F' : '#EF4444'}
              bg={'#3CCA7F'}
              h={'6px'}
              w={'6px'}
              borderRadius={'full'}
            ></Box>
            {/* <Text>{row.original.status}</Text> */}
            <Text>Active</Text>
          </Flex>
        )
      }
    ],
    [t, appType]
  );
  const table = useReactTable<AppOverviewBilling>({
    columns,
    data: usageList,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    state: {
      pagination
    },
    onPaginationChange: (set) => {
      setPagination(set);
    },
    rowCount: total
  });

  return (
    <Card>
      <Flex justify={'space-between'} align={'center'} mb={'16px'}>
        <Text fontSize={'18px'} fontWeight={600} lineHeight={'28px'}>
          {t('AppUsage')}
        </Text>
        <Button visibility={'hidden'} variant={'outline'} colorScheme={'gray'}></Button>
      </Flex>
      <BaseTable
        isLoading={false}
        table={table}
        tdStyle={{ height: '52px', fontSize: '14px', lineHeight: '20px', fontWeight: 400 }}
        empty={
          <Center>
            <Empty
              title={t('NoUsage')}
              description={t('NoUsagePrompt')}
              Icon={
                <MyIcon name={'emptyUsage'} color={'white'} w={'60px'} h={'60px'} mb={'12px'} />
              }
            />
          </Center>
        }
      />
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size={'xl'}>
        <DrawerOverlay />
        <DrawerContent borderRadius={'16px'} margin={'8px'} border={'1px solid #E4E4E7'}>
          <DrawerHeader borderBottom={'1px solid #E4E4E7'}>{selectApp?.appName}</DrawerHeader>

          <DrawerBody borderBottom={'1px solid #E4E4E7'} bg={'#F7F7F9'} padding={'24px'}>
            {selectDetail.map((item, index) => (
              <Box key={index}>
                <Text
                  display={'flex'}
                  alignItems={'center'}
                  gap={'8px'}
                  mb={'16px'}
                  fontSize={'16px'}
                  fontWeight={500}
                >
                  {icons[item.app_type as keyof typeof icons]}
                  {appType[item.app_type]}
                </Text>
                <Box
                  display="grid"
                  gridTemplateColumns="1fr 1fr 1fr"
                  border="1px solid #E4E4E7"
                  borderRadius="16px"
                  overflow="hidden"
                >
                  {valuationMap.map((config, index) => {
                    if (!item.used?.[String(index) as '0' | '1' | '2' | '3' | '4' | '5']) {
                      return null;
                    }
                    return [
                      <Box
                        key={`type-${config[1].idx}`}
                        p="12px 24px"
                        bg="white"
                        borderBottom="1px solid #E4E4E7"
                      >
                        <Text>{config[0]}</Text>
                      </Box>,
                      <Box
                        key={`scale-${config[1].idx}`}
                        p="12px 24px"
                        bg="white"
                        borderBottom="1px solid #E4E4E7"
                        textAlign="right"
                      >
                        <Highlight
                          styles={{ fontWeight: '600' }}
                          query={`${(
                            item.used[String(index) as '0' | '1' | '2' | '3' | '4' | '5'] /
                            config[1].scale
                          ).toFixed(2)}`}
                        >
                          {`${(
                            item.used[String(index) as '0' | '1' | '2' | '3' | '4' | '5'] /
                            config[1].scale
                          ).toFixed(2)} ${config[1].unit}`}
                        </Highlight>
                      </Box>,
                      <Box
                        key={`amount-${config[1].idx}`}
                        p="12px 24px"
                        bg="white"
                        borderBottom="1px solid #E4E4E7"
                        textAlign="right"
                      >
                        <Highlight styles={{ fontWeight: '600' }} query={'$'}>
                          {`$ ${formatMoney(
                            item.used_amount[String(index) as '0' | '1' | '2' | '3' | '4' | '5'] ??
                              0
                          ).toFixed(6)}`}
                        </Highlight>
                      </Box>
                    ];
                  })}
                </Box>
              </Box>
            ))}
          </DrawerBody>

          <DrawerFooter bg={'#F7F7F9'} justifyContent="flex-start">
            <Button variant="outline" mr={3} onClick={onClose}>
              {t('Cancel')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Card>
  );
};

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content))
    }
  };
}

export default Usage;
