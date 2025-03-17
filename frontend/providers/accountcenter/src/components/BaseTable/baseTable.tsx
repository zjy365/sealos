import {
  HTMLChakraProps,
  Spinner,
  Table,
  TableContainer,
  TableContainerProps,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import { Column, Table as ReactTable, flexRender } from '@tanstack/react-table';
import { CSSProperties } from 'react';
import { Button, Flex, IconButton } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide-react';
import { useTranslation } from 'next-i18next';

const getCommonPinningStyles = <T,>(column: Column<T, unknown>): CSSProperties => {
  const isPinned = column.getIsPinned();

  return {
    position: isPinned ? 'sticky' : 'relative',
    left: isPinned === 'left' ? 0 : undefined,
    right: isPinned === 'right' ? 0 : undefined,
    zIndex: isPinned ? 10 : 0
  };
};

export function BaseTable<T extends unknown>({
  table,
  isLoading,
  tdStyle,
  tfoot,
  empty,
  ...props
}: {
  table: ReactTable<T>;
  isLoading: boolean;
  tfoot?: React.ReactNode;
  tdStyle?: HTMLChakraProps<'td'>;
  empty?: React.ReactNode;
} & TableContainerProps) {
  const { t } = useTranslation();
  return (
    <TableContainer {...props}>
      <Table variant="unstyled" width={'full'}>
        <Thead>
          {table.getHeaderGroups().map((headers) => {
            return (
              <Tr key={headers.id}>
                {headers.headers.map((header, i) => {
                  return (
                    <Th
                      fontSize={'12px'}
                      py="13px"
                      px={'24px'}
                      key={header.id}
                      bg={'#FAFAFA'}
                      color={'grayModern.600'}
                      border={'none'}
                      _first={{
                        borderLeftRadius: '6px'
                      }}
                      _last={{
                        borderRightRadius: '6px'
                      }}
                      {...(getCommonPinningStyles(header.column) as HTMLChakraProps<'th'>)}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </Th>
                  );
                })}
              </Tr>
            );
          })}
        </Thead>
        <Tbody>
          {isLoading ? (
            <Tr>
              <Td h={'300px'} colSpan={table.getAllColumns().length} textAlign="center" py={4}>
                <Spinner size="xl" />
              </Td>
            </Tr>
          ) : table.getPaginationRowModel().rows.length === 0 ? (
            <Tr>
              <Td colSpan={table.getAllColumns().length} textAlign="center">
                {empty}
              </Td>
            </Tr>
          ) : (
            table.getPaginationRowModel().rows.map((item, index) => {
              return (
                <Tr key={item.id} fontSize={'12px'}>
                  {item.getAllCells().map((cell, i) => {
                    const isPinned = cell.column.getIsPinned();
                    return (
                      <Td
                        key={cell.id}
                        p={'10px 24px'}
                        bg={isPinned ? 'white' : ''}
                        borderBottom={'1px solid'}
                        borderBottomColor={
                          index !== table.getPaginationRowModel().rows.length - 1
                            ? '#F0F1F6'
                            : 'transparent'
                        }
                        {...(getCommonPinningStyles(cell.column) as HTMLChakraProps<'td'>)}
                        {...tdStyle}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Td>
                    );
                  })}
                </Tr>
              );
            })
          )}
        </Tbody>
        {table.getPaginationRowModel().rows.length === 0 ? null : (
          <Tfoot>
            <Tr>
              <Th>
                {t('Total')} {table.getRowCount()}
              </Th>
              <Th colSpan={table.getAllColumns().length - 1} isNumeric>
                <Flex justify="flex-end" gap={'8px'}>
                  <IconButton
                    aria-label="Previous"
                    icon={<ChevronLeft size={'18px'} />}
                    variant={'ghost'}
                    onClick={() => table.previousPage()}
                    isDisabled={!table.getCanPreviousPage()}
                    rounded={'full'}
                    _hover={{ bg: '#f4f4f5' }}
                  />
                  {table.getPageOptions().map((page, index) => {
                    const total = table.getPageCount();
                    const curPage = table.getState().pagination.pageIndex;
                    console.log(curPage, index, total);
                    return index === 0 ||
                      index === total - 1 ||
                      Math.abs(curPage - index) <=
                        Math.max(Math.max(total - 1 - curPage, curPage) - total / 2, 1) ? (
                      <Button
                        key={index}
                        onClick={() => table.setPageIndex(page)}
                        isActive={table.getState().pagination.pageIndex === page}
                        variant={'ghost'}
                        rounded={'full'}
                        _hover={{ bg: '#f4f4f5' }}
                        _active={{ bg: '#f4f4f5' }}
                      >
                        {page + 1}
                      </Button>
                    ) : index === 1 || index === total - 2 ? (
                      <IconButton
                        aria-label="Ellipsis"
                        icon={<Ellipsis size={'18px'} />}
                        key={index}
                        variant={'ghost'}
                        isDisabled={true}
                      />
                    ) : null;
                  })}
                  <IconButton
                    aria-label="Next"
                    icon={<ChevronRight size={'18px'} />}
                    variant={'ghost'}
                    onClick={() => table.nextPage()}
                    isDisabled={!table.getCanNextPage()}
                    rounded={'full'}
                    _hover={{ bg: '#f4f4f5' }}
                  />
                </Flex>
              </Th>
            </Tr>
          </Tfoot>
        )}
      </Table>
    </TableContainer>
  );
}
