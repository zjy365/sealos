import React, { use, useEffect } from 'react';
import { useRouter } from 'next/router';
import MyIcon from '@/components/Icon';
import { useTranslation } from 'next-i18next';
import Card from '@/components/Card';
import {
  Flex,
  Text,
  IconButton,
  Button,
  Center,
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  DrawerFooter,
  DrawerHeader,
  Table,
  Tr,
  Td,
  Tbody,
  Highlight
} from '@chakra-ui/react';
import { Ellipsis } from 'lucide-react';
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
import type { RecordType } from 'zod';

export const valuationMap = [
  ['cpu', { unit: 'Core', scale: 1000, bg: '#33BABB', idx: 0 }],
  ['memory', { unit: 'GB', scale: 1024, bg: '#36ADEF', idx: 1 }],
  ['storage', { unit: 'GB', scale: 1024, bg: '#9A8EE0', idx: 2 }],
  ['gpu', { unit: 'GPU Unit', scale: 1000, bg: '#6FCA88', idx: 3 }],
  ['network', { unit: 'M', scale: 1, bg: '#F182AA', idx: 4 }],
  ['services.nodeports', { unit: 'port_unit', scale: 1000, bg: '#F182AA', idx: 5 }]
] as const;

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
        console.log(res);
        setSelectDetail(res.costs);
      });
    }
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
          >
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
        cell: ({ row }) => <Text>{displayMoney(formatMoney(row.original.amount))}</Text>
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
    [t]
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
            {selectDetail.map((item) => (
              <Box key={item.order_id}>
                <Text mb={'16px'} fontSize={'16px'} fontWeight={500}>
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
                    return (
                      <>
                        <Box
                          key={config[1].idx}
                          p="12px 24px"
                          bg="white"
                          borderBottom="1px solid #E4E4E7"
                        >
                          <Text>{config[0]}</Text>
                        </Box>
                        <Box
                          key={config[1].idx}
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
                        </Box>
                        <Box
                          key={config[1].idx}
                          p="12px 24px"
                          bg="white"
                          borderBottom="1px solid #E4E4E7"
                          textAlign="right"
                        >
                          <Highlight styles={{ fontWeight: '600' }} query={'$'}>
                            {`$ ${displayMoney(
                              formatMoney(
                                item.used_amount[String(index) as '0' | '1' | '2' | '3' | '4' | '5']
                              )
                            )}`}
                          </Highlight>
                        </Box>
                      </>
                    );
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

export default Usage;
