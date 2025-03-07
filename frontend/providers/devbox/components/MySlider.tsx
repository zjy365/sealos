import React, { useMemo } from 'react';
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Box
} from '@chakra-ui/react';

export const MySlider = ({
  markList,
  setVal,
  activeVal,
  max = 100,
  min = 0,
  step = 1
}: {
  markList: {
    label: string | number;
    value: number;
  }[];
  activeVal?: number;
  setVal: (index: number) => void;
  max?: number;
  min?: number;
  step?: number;
}) => {
  const value = useMemo(() => {
    const index = markList.findIndex((item) => item.value === activeVal);
    return index > -1 ? index : 0;
  }, [activeVal, markList]);

  return (
    <Slider max={max} min={min} step={step} size={'lg'} value={value} onChange={setVal}>
      {markList.map((item, i) => (
        <SliderMark
          key={item.value}
          value={i}
          mt={3}
          fontSize={'11px'}
          transform={'translateX(-50%)'}
          whiteSpace={'nowrap'}
          {...(activeVal === item.value
            ? { color: 'myGray.600', fontWeight: 'bold' }
            : { color: 'grayModern.600' })}
        >
          <Box px={3} cursor={'pointer'}>
            {item.label}
          </Box>
        </SliderMark>
      ))}
      <SliderTrack bg={'#EAEDF3'} borderRadius={'4px'} overflow={'hidden'} h={'6px'}>
        <SliderFilledTrack bg={'#1C4EF5'} />
      </SliderTrack>
      <SliderThumb
        bg={'white'}
        border={'1px solid #1C4EF5'}
        _active={{ bg: 'white' }}
        _focus={{ bg: 'white' }}
      ></SliderThumb>
    </Slider>
  );
};
