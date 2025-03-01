import React, { useMemo } from 'react';
import { Box, Grid } from '@chakra-ui/react';
import type { GridProps } from '@chakra-ui/react';

// @ts-ignore
interface Props extends GridProps {
  list: { id: string; label: string }[];
  activeId: string;
  size?: 'sm' | 'md' | 'lg';
  onChange: (id: string) => void;
}

export const Tabs = ({ list, size = 'md', activeId, onChange, ...props }: Props) => {
  const sizeMap = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          fontSize: 'base',
          outP: '3px',
          inlineP: '4px'
        };
      case 'md':
        return {
          fontSize: 'md',
          outP: '4px',
          inlineP: '6px'
        };
      case 'lg':
        return {
          fontSize: 'lg',
          outP: '5px',
          inlineP: 3
        };
    }
  }, [size]);
  return (
    <Grid
      gridTemplateColumns={`repeat(${list.length},1fr)`}
      p={sizeMap.outP}
      borderRadius={'lg'}
      backgroundColor={'#F2F2F2'}
      fontSize={sizeMap.fontSize}
      fontWeight={500}
      {...props}
    >
      {list.map((item) => (
        <Box
          key={item.id}
          px={'2'}
          py={sizeMap.inlineP}
          borderRadius={'md'}
          textAlign={'center'}
          _hover={{
            color: 'brightBlue.600'
          }}
          {...(activeId === item.id
            ? {
                boxShadow: '0px 1px 2px 0px #0000000D',
                backgroundColor: 'white',
                cursor: 'default',
                color: 'grayModern.900'
              }
            : {
                cursor: 'pointer',
                color: 'grayModern.500'
              })}
          onClick={() => {
            if (activeId === item.id) return;
            onChange(item.id);
          }}
        >
          {item.label}
        </Box>
      ))}
    </Grid>
  );
};
