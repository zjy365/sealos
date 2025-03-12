'use client';

import React, { useRef, forwardRef, useMemo } from 'react';
import {
  Menu,
  Box,
  MenuList,
  MenuItem,
  Button,
  useDisclosure,
  useOutsideClick,
  MenuButton,
  Flex
} from '@chakra-ui/react';
import type { BoxProps, ButtonProps } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

interface Props extends ButtonProps {
  width?: string;
  height?: string;
  value?: string;
  placeholder?: string;
  list: {
    label: string | React.ReactNode;
    value: string;
    icon?: React.ReactNode;
  }[];
  onchange?: (val: string) => void;
  isInvalid?: boolean;
  boxStyle?: BoxProps;
}

const MySelect = (
  {
    placeholder,
    value,
    width = 'auto',
    height = '30px',
    list,
    onchange,
    isInvalid,
    boxStyle,
    ...props
  }: Props,
  selectRef: any
) => {
  const ref = useRef<HTMLButtonElement>(null);
  const SelectRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useOutsideClick({
    ref: SelectRef,
    handler: () => {
      onClose();
    }
  });

  // useEffect(() => {
  //   if (value && list.length > 0 && !list.some((item) => item.value === value)) {
  //     if (onchange) {
  //       onchange(list[0]?.value || '');
  //     }
  //   }
  // }, [list, value, onchange]);

  const activeMenu = useMemo(() => {
    const foundItem = list.find((item) => item.value === value);
    if (!foundItem && value) {
      return {
        label: value,
        value: value
      };
    }
    return foundItem;
  }, [list, value]);

  return (
    <Menu autoSelect={false} isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
      <Box
        ref={SelectRef}
        position={'relative'}
        onClick={() => {
          isOpen ? onClose() : onOpen();
        }}
        {...boxStyle}
      >
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          width={width}
          height={height}
          ref={ref}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
          border={'1px solid #E8EBF0'}
          borderRadius={'md'}
          fontSize={'12px'}
          fontWeight={'400'}
          variant={'outline'}
          _hover={{
            borderColor: 'brightBlue.300',
            bg: 'grayModern.50'
          }}
          _active={{
            transform: ''
          }}
          {...(isOpen
            ? {
                boxShadow: '0px 0px 0px 2.4px rgba(33, 155, 244, 0.15)',
                borderColor: 'brightBlue.500',
                bg: '#FFF'
              }
            : {
                bg: '#F7F8FA',
                borderColor: isInvalid ? 'red' : ''
              })}
          {...props}
        >
          <Flex justifyContent={'flex-start'} alignItems={'center'}>
            {activeMenu?.icon && <Box mr={2}>{activeMenu.icon}</Box>}
            {activeMenu ? activeMenu.label : placeholder}
          </Flex>
        </MenuButton>

        <MenuList
          minW={(() => {
            const w = ref.current?.clientWidth;
            if (w) {
              return `${w}px !important`;
            }
            return Array.isArray(width)
              ? width.map((item) => `${item} !important`)
              : `${width} !important`;
          })()}
          p={'6px'}
          borderRadius={'base'}
          border={'1px solid #E8EBF0'}
          boxShadow={
            '0px 4px 10px 0px rgba(19, 51, 107, 0.10), 0px 0px 1px 0px rgba(19, 51, 107, 0.10)'
          }
          zIndex={99}
          overflow={'overlay'}
          maxH={'300px'}
        >
          {list.map((item) => (
            <MenuItem
              key={item.value}
              borderRadius={'4px'}
              _hover={{
                bg: 'rgba(17, 24, 36, 0.05)',
                color: 'brightBlue.600'
              }}
              p={'6px'}
              onClick={() => {
                if (onchange && value !== item.value) {
                  onchange(item.value);
                }
              }}
            >
              <Flex justifyContent="space-between" width="100%" alignItems="center">
                <Flex alignItems="center">
                  {item.icon && <Box mr={2}>{item.icon}</Box>}
                  <Box>{item.label}</Box>
                </Flex>
                {value === item.value && (
                  <Box ml={2}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.00016 10.7799L3.22016 7.9999L2.27349 8.9399L6.00016 12.6666L14.0002 4.66656L13.0602 3.72656L6.00016 10.7799Z"
                        fill="#1C4EF5"
                      />
                    </svg>
                  </Box>
                )}
              </Flex>
            </MenuItem>
          ))}
        </MenuList>
      </Box>
    </Menu>
  );
};

export default React.memo(forwardRef(MySelect));
