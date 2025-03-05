import React from 'react';
import { Box, BoxProps, Grid, Flex, Button, Text, IconButton, Center } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

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
}

export const MyTable = ({ columns, data, itemClass = '', pagination }: Props) => {
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
              className={index2 === 0 ? itemClass : ''}
              data-id={item.id}
              key={col.key}
              alignItems={'center'}
              px={3}
              py={4}
              fontSize={'base'}
              fontWeight={'bold'}
              color={'grayModern.900'}
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
              aria-label="Previous"
              icon={<ChevronLeftIcon w={'18px'} height={'18px'} />}
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
              aria-label="Next"
              icon={<ChevronRightIcon w={'18px'} height={'18px'} />}
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
