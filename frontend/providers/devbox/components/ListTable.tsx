import { useRouter } from '@/i18n';
import {
  Table,
  TableContainer,
  TableContainerProps,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import { Table as ReactTable, flexRender } from '@tanstack/react-table';
export function BaseTable<T extends unknown>({
  table,
  ...styles
}: { table: ReactTable<T> } & TableContainerProps) {
  const router = useRouter();
  return (
    <TableContainer w="100%" my="0px" p="0" overflowY={'auto'} {...styles}>
      <Table variant="simple" mb={'0'} fontSize={'12px'} width={'full'} textTransform={'none'}>
        <Thead>
          {table.getHeaderGroups().map((headers) => {
            return (
              <Tr key={headers.id}>
                {headers.headers.map((header, i) => {
                  const pinState = header.column.getIsPinned();
                  return (
                    <Th
                      textTransform={'unset'}
                      py="11px"
                      fontWeight={'400'}
                      fontSize={'12px'}
                      px={'24px'}
                      top={'0'}
                      {...(!pinState
                        ? {
                            zIndex: 3
                          }
                        : {
                            [pinState]: 0,
                            _after: {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              bottom: '-1px',
                              width: '30px',
                              ...(pinState === 'right'
                                ? {
                                    right: '100%',
                                    boxShadow: 'rgba(5, 5, 5, 0.06) -10px 0px 8px -8px inset',
                                    '@media (min-width: 1440px)': {
                                      boxShadow: 'none'
                                    }
                                  }
                                : {
                                    left: '100%'
                                  })
                            },
                            color: 'neutral.500',
                            bgColor: 'white',
                            zIndex: 9
                          })}
                      position={'sticky'}
                      key={header.id}
                      // _before={{
                      //   content: `""`,
                      //   display: 'block',
                      //   borderTopLeftRadius: '10px',
                      //   borderTopRightRadius: '10px',
                      //   background: '#F1F4F6'
                      // }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </Th>
                  );
                })}
              </Tr>
            );
          })}
        </Thead>
        <Tbody whiteSpace={'nowrap'} mb={'0'} position={'relative'}>
          {table.getRowModel().rows.map((item, index) => {
            return (
              <Tr
                id={index === 0 ? 'guide-list' : ''}
                key={item.id}
                fontSize={'12px'}
                _hover={{
                  bgColor: '#F9F9F9'
                }}
                cursor={'pointer'}
                onClick={(e) => {
                  e.stopPropagation();
                  // name, id, iconid
                  const [name] = item.getValue('name') as [string, string, string];
                  router.push(`/devbox/detail/${name}`);
                }}
                role="group"
                borderBottom={'0.5px solid var(--base-border, #E4E4E7)'}
                _last={{
                  borderBottom: 'none'
                }}
              >
                {item.getAllCells().map((cell, i, arr) => {
                  const pinState = cell.column.getIsPinned();
                  return (
                    <Td
                      py="10px"
                      key={cell.id}
                      // px={'24px'}
                      _first={{
                        pl: '24px'
                      }}
                      {...(!pinState
                        ? {}
                        : {
                            [pinState]: 0,
                            position: 'sticky',
                            zIndex: 9 + (arr.length - i),
                            bgColor: 'white',
                            _groupHover: {
                              bgColor: '#F9F9F9'
                            },
                            _after: {
                              content: '""',
                              position: 'absolute',
                              // position: 'relative',
                              top: 0,
                              bottom: '-1px',
                              width: '30px',
                              ...(pinState === 'right'
                                ? {
                                    right: '100%',
                                    boxShadow: 'rgba(5, 5, 5, 0.06) -10px 0px 8px -8px inset',
                                    '@media (min-width: 1440px)': {
                                      boxShadow: 'none'
                                    }
                                  }
                                : {
                                    left: '100%'
                                    // boxShadow: 'rgba(5, 5, 5, 0.06) 10px 0px 8px -8px inset'
                                  })
                            }
                          })}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Td>
                  );
                })}
              </Tr>
            );
          })}
          {}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
