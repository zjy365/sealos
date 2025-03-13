'use client';

import React, { useState } from 'react';
import { HStack, Input, useNumberInput, IconButton, InputProps, Center } from '@chakra-ui/react';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { MyTooltip } from '../MyTooltip';

export const RangeInput = ({
  w = 200,
  step = 1,
  precision = 0,
  min = -Infinity,
  max = Infinity,
  value,
  setVal,
  hoverText,
  inputStyle,
  isDisabled = false
}: {
  w?: number;
  step?: number;
  precision?: number;
  min?: number;
  max?: number;
  value: number | '';
  setVal: (val: number) => void;
  hoverText?: string;
  inputStyle?: InputProps;
  isDisabled?: boolean;
}) => {
  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } = useNumberInput({
    focusInputOnChange: false,
    step,
    min,
    max,
    precision,
    value,
    onChange(_, val) {
      setVal(val);
    }
  });
  const inc = getIncrementButtonProps();
  const dec = getDecrementButtonProps();
  const input = getInputProps();
  const [isFocus, setIsFocus] = useState(false);

  const IconStyle = {
    variant: 'unstyled'
  };

  return (
    <MyTooltip label={hoverText} closeOnClick={false}>
      <HStack
        w={`${w}px`}
        position={'relative'}
        border={'1px solid #E4E4E7'}
        borderRadius={'6px'}
        onBlurCapture={() => {
          setIsFocus(false);
        }}
        onFocusCapture={() => {
          setIsFocus(true);
        }}
      >
        <Center
          flexShrink={0}
          height={'40px'}
          width={'40px'}
          color={+input.value <= min ? 'blackAlpha.400' : 'blackAlpha.700'}
          {...dec}
          {...IconStyle}
        >
          <MinusIcon />
        </Center>
        <Input
          variant={'unstyled'}
          textAlign={'center'}
          fontSize={'lg'}
          fontWeight={'bold'}
          height={'40px'}
          borderLeft={'1px solid #E4E4E7'}
          borderRight={'1px solid #E4E4E7'}
          borderRadius={'none'}
          {...inputStyle}
          {...input}
        />
        <Center
          flexShrink={0}
          height={'40px'}
          width={'40px'}
          color={+input.value >= max ? 'blackAlpha.400' : 'blackAlpha.700'}
          {...inc}
          {...IconStyle}
        >
          <AddIcon />
        </Center>
      </HStack>
    </MyTooltip>
  );
};
