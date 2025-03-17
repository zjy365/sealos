import React from 'react';
import MyIcon from '@/components/Icon';
import { useTranslation } from 'next-i18next';
import Card from '@/components/Card';
import { Flex, Text, Tag, TagLabel, IconButton, Button, Center } from '@chakra-ui/react';
import { Download } from 'lucide-react';
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel
} from '@tanstack/react-table';
import { BaseTable } from '@/components/BaseTable/baseTable';
import Empty from './empty';
import type { InvoicePayload } from '@/types/invoice';

const Invoice = ({ invoiceList = [] }: { invoiceList: InvoicePayload[] }) => {
  const { t } = useTranslation();
  const columns: ColumnDef<InvoicePayload>[] = React.useMemo(
    () => [
      {
        id: 'date',
        header: t('Date'),
        cell: ({ row }) => <Text>{new Date(row.original.createdAt).toLocaleDateString()}</Text>
      },
      {
        id: 'amount',
        header: t('Amount'),
        accessorKey: 'totalAmount'
      },
      {
        id: 'status',
        header: t('Status'),
        cell: ({ row }) => (
          <Tag
            variant={'outline'}
            size={'md'}
            colorScheme={
              row.original.status === 'PENDING'
                ? 'gray'
                : row.original.status === 'COMPLETED'
                ? 'green'
                : 'red'
            }
            borderRadius={'full'}
            bg={row.original.status === 'REJECTED' ? '#FEF2F2' : undefined}
          >
            <TagLabel>{row.original.status}</TagLabel>
          </Tag>
        )
      },
      {
        // id: 'desc',
        header: t('Description'),
        accessorKey: 'desc'
      },
      {
        id: 'action',
        header: '',
        cell: () => (
          <Flex justifyContent="flex-end">
            <IconButton aria-label="Download" icon={<Download size={'16px'} />} variant={'ghost'} />
          </Flex>
        )
      }
    ],
    [t]
  );
  const table = useReactTable<InvoicePayload>({
    columns,
    data: invoiceList,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
        pageIndex: 0
      }
    }
  });

  return (
    <Card>
      <Flex justify={'space-between'} align={'center'} mb={'16px'}>
        <Text fontSize={'18px'} fontWeight={600} lineHeight={'28px'}>
          {t('InvoiceHistory')}
        </Text>
        <Button isDisabled={invoiceList.length === 0} variant={'outline'} colorScheme={'gray'}>
          {t('DownloadAll')}
        </Button>
      </Flex>
      <BaseTable
        isLoading={false}
        table={table}
        empty={
          <Center>
            <Empty
              title={t('NoInvoice')}
              description={t('NoInvoicePrompt')}
              Icon={
                <MyIcon name={'emptyInvoice'} color={'white'} w={'60px'} h={'60px'} mb={'12px'} />
              }
            />
          </Center>
        }
      />
    </Card>
  );
};

export default Invoice;
