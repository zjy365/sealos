import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
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
  useDisclosure
} from '@chakra-ui/react';
import { useReactTable, ColumnDef } from '@tanstack/react-table';
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { TBonusItem } from '@/schema/plan';
import { BaseTable } from '@/components/BaseTable/baseTable';
import { CircleAlert } from 'lucide-react';
import { MyTooltip } from '@sealos/ui';
import { add } from 'date-fns';
import { getBonusDetails } from '@/api/plan';
import { getInvoiceList } from '@/api/invoice';

interface BonusDetailProps {
  userInfo: any;
}

const BonusDetail = ({ userInfo }: BonusDetailProps) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [bonusDetails, setBonusDetails] = useState<TBonusItem[]>([]);
  const columns: ColumnDef<TBonusItem>[] = React.useMemo(
    () => [
      {
        id: 'amount',
        header: `${t('available')} ($)`,
        cell: ({ row }) => (
          <Flex alignItems={'center'} cursor={'pointer'} gap={'4px'}>
            <Text>
              {((row.original.amount - (row.original.usedAmount || 0)) / 10 ** 6).toFixed(2)}
            </Text>
            {userInfo?.user?.agency ?? false ? (
              <>
                <Text color={'#71717A'}>/</Text>
                <Text color={'#71717A'}>{(row.original.amount / 10 ** 6).toFixed(2)}</Text>
              </>
            ) : null}
          </Flex>
        )
      },
      {
        id: 'createdAt',
        header: t('createdAt'),
        cell: ({ row }) => <Text>{new Date(row.original.createdAt).toLocaleDateString()}</Text>
      },
      {
        id: 'expiredAt',
        header: t('expiredAt'),
        cell: ({ row }) => {
          const expireDate = new Date(row.original.expiredAt);
          const isExpiringSoon = expireDate.getTime() < add(new Date(), { days: 14 }).getTime();
          return (
            <Flex alignItems="center" gap="4px">
              <Text>{expireDate.toLocaleDateString()}</Text>
              {isExpiringSoon && (
                <MyTooltip label={t('expiredAtTooltip')} hasArrow placement="top" fontSize={'14px'}>
                  <CircleAlert size="16px" color="#EA580C" cursor="help" />
                </MyTooltip>
              )}
            </Flex>
          );
        }
      }
    ],
    [t]
  );
  useEffect(() => {
    const fetchBonusDetails = async () => {
      try {
        if (userInfo?.user?.agency ?? false) {
          const res = await getBonusDetails();
          setBonusDetails(
            res.bonusItems.sort(
              (a, b) => new Date(b.expiredAt).getTime() - new Date(a.expiredAt).getTime()
            )
          );
        } else {
          const res = await getInvoiceList();
          // 适配 payments 数据为 TBonusItem[]
          const items = (res.payments || []).map((item: any) => ({
            id: String(item.ID),
            amount: Number(item.Gift),
            usedAmount: 0, // 没有已用金额字段，默认 0
            createdAt: String(item.CreatedAt),
            expiredAt: add(new Date(item.CreatedAt), { years: 1 }).toISOString(),
            status: 'active' as const
          }));
          setBonusDetails(items);
        }
      } catch (error) {}
    };
    fetchBonusDetails();
  }, [userInfo]);

  const filteredBonusDetails = React.useMemo(
    () => bonusDetails.filter((item) => item.amount - (item.usedAmount || 0) > 0),
    [bonusDetails]
  );

  const table = useReactTable<TBonusItem>({
    columns,
    data: filteredBonusDetails, // 使用过滤后的数据
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 9
      }
    }
  });

  return (
    <>
      <Text
        cursor={'pointer'}
        onClick={onOpen}
        mt="4px"
        fontSize="12px"
        fontWeight="400"
        color="#1C4EF5"
      >
        {t('viewDetails')}
      </Text>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size={'xl'}>
        <DrawerOverlay />
        <DrawerContent borderRadius={'16px'} margin={'8px'} border={'1px solid #E4E4E7'}>
          <DrawerHeader borderBottom={'1px solid #E4E4E7'}>{t('bonusHistory')}</DrawerHeader>
          <DrawerBody borderBottom={'1px solid #E4E4E7'} bg={'#F7F7F9'} padding={'24px'}>
            <Box background={'#EFF6FF'} borderRadius={'16px'}>
              <Box p={'12px 24px'}>
                <Text
                  display={'flex'}
                  alignItems={'center'}
                  gap={'8px'}
                  fontSize={'16px'}
                  fontWeight={500}
                >
                  {t('bonusHistoryDesc')}
                </Text>
              </Box>
              <Box border="1px solid #E4E4E7" borderRadius="16px" overflow="hidden" bg={'white'}>
                <BaseTable
                  isLoading={false}
                  table={table}
                  tdStyle={{
                    height: '52px',
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontWeight: 400,
                    color: '#18181B'
                  }}
                  empty={<Center>{t('NoData')}</Center>}
                />
              </Box>
            </Box>
          </DrawerBody>

          <DrawerFooter bg={'#F7F7F9'} justifyContent="flex-start">
            <Button variant="outline" mr={3} onClick={onClose}>
              {t('close')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default BonusDetail;
