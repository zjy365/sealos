import React from 'react';
import {
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Box,
  Text
} from '@chakra-ui/react';

export const MyRangeSlider = ({
  value,
  max = 100,
  min = 0,
  step = 1,
  setVal
}: {
  value: [number, number];
  setVal: (index: [number, number]) => void;
  max?: number;
  min?: number;
  step?: number;
}) => {
  const startEndValStyle = {
    position: 'absolute' as const,
    top: '10px'
  };

  return (
    <RangeSlider
      // eslint-disable-next-line jsx-a11y/aria-proptypes
      aria-label={['min', 'max']}
      value={value}
      min={min}
      max={max}
      size={'lg'}
      step={step}
      minStepsBetweenThumbs={1}
      onChange={setVal}
    >
      <RangeSliderTrack overflow={'visible'} h={'4px'}>
        <Box {...startEndValStyle} left={0} transform={'translateX(-50%)'}>
          {min}
        </Box>
        <Box {...startEndValStyle} right={0} transform={'translateX(50%)'}>
          {max}
        </Box>
        <RangeSliderFilledTrack bg={'#1C4EF5'} />
      </RangeSliderTrack>
      <RangeSliderThumb index={0} bg={'#1C4EF5'}>
        <Box w={'10px'} h={'10px'} bg={'#FFF'} borderRadius={'50%'}>
          <Text whiteSpace={'nowrap'} transform={'translateY(14px)'}>
            {value[0] === min ? '' : value[0]}
          </Text>
        </Box>
      </RangeSliderThumb>
      <RangeSliderThumb index={1} bg={'#1C4EF5'}>
        <Box w={'10px'} h={'10px'} bg={'#FFF'} borderRadius={'50%'}>
          <Text whiteSpace={'nowrap'} transform={'translateY(14px)'}>
            {value[1] === max ? '' : value[1]}
          </Text>
        </Box>
      </RangeSliderThumb>
    </RangeSlider>
  );
};
