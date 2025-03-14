import React from 'react';
import { Box, BoxProps, Grid, Flex, Button, Text, IconButton, Center } from '@chakra-ui/react';

interface Props extends BoxProps {
  columns: {
    title: string;
    dataIndex?: string;
    key: string;
    render?: (item: any) => JSX.Element;
  }[];
  data: any[];
  itemClass?: string;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
  };
  onRowClick?: (item: any) => void;
}

export const MyTable = ({ columns, data, itemClass = '', pagination, onRowClick }: Props) => {
  return (
    <Box
      borderRadius={'12px'}
      border={'1px solid #EDEDED'}
      bg={'#FFF'}
      boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.05)'}
    >
      <Grid
        templateColumns={`repeat(${columns.length},1fr)`}
        overflowX={'auto'}
        fontSize={'base'}
        color={'grayModern.600'}
        fontWeight={'bold'}
        borderBottom={'1px solid #EDEDED'}
        borderTopRadius={'12px'}
      >
        {columns.map((item, i) => (
          <Box
            px={3}
            py={3}
            key={item.key}
            whiteSpace={'nowrap'}
            _first={{
              pl: 7
            }}
          >
            {item.title}
          </Box>
        ))}
      </Grid>
      {data.map((item: any, index1) => (
        <Grid
          templateColumns={`repeat(${columns.length},1fr)`}
          overflowX={'auto'}
          key={index1}
          _hover={{
            bg: '#F9F9F9'
          }}
          borderBottomRadius={index1 === data.length - 1 ? '12px' : '0px'}
          borderBottom={'1px solid'}
          borderBottomColor={index1 !== data.length - 1 ? '#EDEDED' : 'transparent'}
        >
          {columns.map((col, index2) => (
            <Flex
              cursor={'pointer'}
              className={index2 === 0 ? itemClass : ''}
              data-id={item.id}
              key={col.key}
              alignItems={'center'}
              px={3}
              py={4}
              fontSize={'base'}
              fontWeight={'bold'}
              color={'grayModern.900'}
              onClick={() => (onRowClick ? onRowClick?.(item) : {})}
            >
              {col.render ? col.render(item) : col.dataIndex ? `${item[col.dataIndex]}` : ''}
            </Flex>
          ))}
        </Grid>
      ))}
      {pagination && (
        <Flex
          justifyContent="space-between"
          alignItems="center"
          p={4}
          borderTop="1px solid #EDEDED"
        >
          <Center gap={'4px'}>
            <Text fontSize="14px" color="#525252">
              Total
            </Text>
            <Text fontSize="14px" fontWeight={600}>
              {pagination.total}
            </Text>
          </Center>
          <Flex alignItems="center" gap={2}>
            <IconButton
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              aria-label="Previous"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18px"
                  height="18px"
                  viewBox="0 0 18 18"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.0303 3.96967C11.3232 4.26256 11.3232 4.73744 11.0303 5.03033L7.06066 9L11.0303 12.9697C11.3232 13.2626 11.3232 13.7374 11.0303 14.0303C10.7374 14.3232 10.2626 14.3232 9.96967 14.0303L5.46967 9.53033C5.17678 9.23744 5.17678 8.76256 5.46967 8.46967L9.96967 3.96967C10.2626 3.67678 10.7374 3.67678 11.0303 3.96967Z"
                    fill="#A3A3A3"
                  />
                </svg>
              }
              variant="unstyled"
              isDisabled={pagination.current <= 1}
              onClick={() => pagination.onChange(pagination.current - 1)}
            />
            <Center boxSize={'32px'} borderRadius={'full'} bg={'#F4F4F5'}>
              <Text fontSize={'14px'} fontWeight={500} textAlign="center">
                {pagination.current}
              </Text>
            </Center>
            <IconButton
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              aria-label="Next"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18px"
                  height="18px"
                  viewBox="0 0 18 18"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.96967 14.0303C6.67678 13.7374 6.67678 13.2626 6.96967 12.9697L10.9393 9L6.96967 5.03033C6.67678 4.73744 6.67678 4.26256 6.96967 3.96967C7.26256 3.67678 7.73744 3.67678 8.03033 3.96967L12.5303 8.46967C12.8232 8.76256 12.8232 9.23744 12.5303 9.53033L8.03033 14.0303C7.73744 14.3232 7.26256 14.3232 6.96967 14.0303Z"
                    fill="#2B2B34"
                  />
                </svg>
              }
              variant="unstyled"
              isDisabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => pagination.onChange(pagination.current + 1)}
            />
          </Flex>
        </Flex>
      )}
    </Box>
  );
};
