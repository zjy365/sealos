import React from 'react';
import { Box, BoxProps, Grid, Flex, Button, Text, IconButton } from '@chakra-ui/react';
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
          <Text fontSize="sm" color="grayModern.600">
            共 {pagination.total} 条
          </Text>
          <Flex alignItems="center" gap={2}>
            <IconButton
              aria-label="上一页"
              icon={<ChevronLeftIcon />}
              size="sm"
              variant="outline"
              isDisabled={pagination.current <= 1}
              onClick={() => pagination.onChange(pagination.current - 1)}
            />
            {generatePaginationButtons(pagination)}
            <IconButton
              aria-label="下一页"
              icon={<ChevronRightIcon />}
              size="sm"
              variant="outline"
              isDisabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => pagination.onChange(pagination.current + 1)}
            />
          </Flex>
        </Flex>
      )}
    </Box>
  );
};

// 生成分页按钮
const generatePaginationButtons = (pagination: {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) => {
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const buttons = [];

  // 显示最多5个页码按钮
  let startPage = Math.max(1, pagination.current - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  // 调整起始页，确保显示5个按钮（如果总页数足够）
  if (endPage - startPage < 4 && totalPages > 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    buttons.push(
      <Button
        key={i}
        size="sm"
        variant={i === pagination.current ? 'solid' : 'outline'}
        colorScheme={i === pagination.current ? 'blue' : 'gray'}
        onClick={() => pagination.onChange(i)}
      >
        {i}
      </Button>
    );
  }

  return buttons;
};
