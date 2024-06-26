import { ArrowDown } from '@/components/Icon/ArrowDown';
import { ArrowUp } from '@/components/Icon/ArrowUp';
import { CpuIcon } from '@/components/Icon/CpuIcon';
import { MemoryIcon } from '@/components/Icon/MemoryIcon';
import MySelect from '@/components/Select';
import { CpuSlideMarkList, MemorySlideMarkList, MonthMapList } from '@/constant/product';
import { ClusterFormType } from '@/types';
import {
  Box,
  Divider,
  Flex,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Text
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

const defaultValues = {
  cpu: 8,
  memory: 16,
  time: '3' // month
};

const freeValues = {
  cpu: 8,
  memory: 8,
  time: '3' // month
};

export default function Cost() {
  const [forceUpdate, setForceUpdate] = useState(false);
  const [price, setPrice] = useState(0);
  const cpuPriceMonth = 6;
  const memoryPriceMonth = 3;

  // form
  const formHook = useForm<ClusterFormType>({
    defaultValues: defaultValues
  });

  const { setValue, getValues, watch, control } = formHook;

  const calculatePrice = (form: ClusterFormType): number => {
    const { cpu, memory, time } = form;

    const cpuTotalPrice = cpuPriceMonth * cpu;
    const memoryTotalPrice = memoryPriceMonth * memory;

    const totalPrice = (cpuTotalPrice + memoryTotalPrice) * parseInt(time);

    return totalPrice;
  };

  formHook.watch((data) => {
    setForceUpdate(!forceUpdate);
    if (!data) return;
    const price = calculatePrice(data as ClusterFormType);
    setPrice(price);
  });

  useEffect(() => {
    const price = calculatePrice(defaultValues);
    setPrice(price);
  }, []);

  const formArr = [
    {
      unit: '核',
      value: 'cpu' as 'cpu' | 'memory',
      label: 'CPU',
      min: 1,
      max: 256,
      sliderList: CpuSlideMarkList
    },
    {
      unit: 'G',
      value: 'memory' as 'cpu' | 'memory',
      label: '内存',
      min: 1,
      max: 1024,
      sliderList: MemorySlideMarkList
    }
  ];

  const cPrice = useMemo(() => {
    const { cpu, memory, time } = getValues();
    if (cpu === freeValues.cpu && memory === freeValues.memory && time === freeValues.time) {
      return 0;
    } else {
      return price;
    }
  }, [getValues, price]);

  return (
    <Box minW={'500px'}>
      <Text mt={'40px'} textAlign={'center'} fontSize={'24px'} fontWeight={500}>
        计价方案
      </Text>
      <Box mt={'24px'} borderRadius={'8px'} bg={'white'} px={'32px'}>
        <Flex
          color={'#667085'}
          fontSize={'12px'}
          alignItems={'center'}
          fontWeight={500}
          py={'16px'}
        >
          <Text color={'#485264'}>单价</Text>
          <Flex gap={'4px'} ml={'auto'}>
            <CpuIcon />
            <Text>CPU: {cpuPriceMonth * 12} 元/核心/年</Text>
          </Flex>
          <Flex gap={'4px'} ml={'24px'}>
            <MemoryIcon />
            <Text>内存: {memoryPriceMonth * 12} 元/G/年</Text>
          </Flex>
        </Flex>
        <Divider borderColor={'#E8EBF0'} />

        {formArr.map((item) => {
          const list = item.sliderList;
          return (
            <Box key={item.value}>
              <Box fontWeight={500} fontSize={'12px'} mt={'24px'}>
                {item.label}
              </Box>
              <Flex alignItems={'center'} gap={'20px'}>
                <Controller
                  control={control}
                  name={item.value}
                  render={({ field }) => (
                    <Slider
                      {...field}
                      focusThumbOnChange={false}
                      aria-label="slider-ex-1"
                      min={item.min}
                      max={item.max}
                    >
                      {list.map((n, i) => (
                        <SliderMark
                          key={n.value}
                          value={n.value}
                          mt={3}
                          fontSize={'11px'}
                          transform={'translateX(-50%)'}
                          whiteSpace={'nowrap'}
                          {...(getValues(item.value) === n.value
                            ? { color: '#111824' }
                            : { color: '#8A95A7' })}
                        >
                          {n.value} {i + 1 === CpuSlideMarkList.length && item.unit}
                        </SliderMark>
                      ))}
                      <SliderTrack
                        bg={'#EAEDF3'}
                        borderRadius={'4px'}
                        overflow={'hidden'}
                        h={'4px'}
                      >
                        <SliderFilledTrack bg={'#111824'} />
                      </SliderTrack>
                      <SliderThumb bg={'#111824'} _focusVisible={{ boxShadow: '' }} />
                    </Slider>
                  )}
                />

                <Controller
                  control={control}
                  name={item.value}
                  render={({ field }) => (
                    <NumberInput position={'relative'} max={item.max} min={item.min} {...field}>
                      <NumberInputField
                        width={'89px'}
                        height={'32px'}
                        pl={'12px'}
                        color={'#111824'}
                        fontSize={'12px'}
                        min={item.min}
                        max={item.max}
                        borderRadius={'md'}
                        borderColor={'#E8EBF0'}
                        bg={'#F7F8FA'}
                        _focusVisible={{
                          borderColor: 'brightBlue.500',
                          boxShadow: '0px 0px 0px 2.4px rgba(33, 155, 244, 0.15)',
                          bg: '#FFF',
                          color: '#111824'
                        }}
                        _hover={{
                          borderColor: 'brightBlue.300'
                        }}
                      />

                      <NumberInputStepper>
                        <NumberIncrementStepper>
                          <ArrowUp />
                        </NumberIncrementStepper>
                        <NumberDecrementStepper>
                          <ArrowDown />
                        </NumberDecrementStepper>
                      </NumberInputStepper>
                      <Box
                        zIndex={1}
                        position={'absolute'}
                        right={'28px'}
                        top={'50%'}
                        fontSize={'12px'}
                        fontWeight={500}
                        transform={'translateY(-50%)'}
                        color={'#667085'}
                      >
                        {item.unit}
                      </Box>
                    </NumberInput>
                  )}
                />
              </Flex>
            </Box>
          );
        })}

        <Box fontWeight={500} fontSize={'12px'} mt={'36px'}>
          时间
        </Box>
        <MySelect
          textAlign={'left'}
          mt={'12px'}
          width={'200px'}
          value={getValues('time')}
          list={MonthMapList}
          onchange={(val: any) => setValue('time', val)}
        />
        <Text
          cursor={'pointer'}
          textAlign={'right'}
          color={'#0884DD'}
          fontSize={'12px'}
          fontWeight={500}
          mt={'24px'}
          onClick={() => {
            formHook.reset(freeValues);
          }}
        >
          免费规模
        </Text>
        <Divider mt={'8px'} borderColor={'#E8EBF0'} />
        <Flex alignItems={'center'} justifyContent={'center'} py={'16px'}>
          <Text fontSize={'11px'} fontWeight={500}>
            价格:
          </Text>
          <Text ml={'12px'} color={'#0884DD'} fontSize={'20px'} fontWeight={500}>
            ¥ {cPrice}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
