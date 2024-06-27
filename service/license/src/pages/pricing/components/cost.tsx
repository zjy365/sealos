import { ArrowDown } from '@/components/Icon/ArrowDown';
import { ArrowUp } from '@/components/Icon/ArrowUp';
import { CpuIcon } from '@/components/Icon/CpuIcon';
import { MemoryIcon } from '@/components/Icon/MemoryIcon';
import MySelect from '@/components/Select';
import {
  CpuSlideMarkList,
  MemorySlideMarkList,
  MonthMapList,
  cpuPriceMonth,
  defaulClustertForm,
  freeClusterForm,
  memoryPriceMonth
} from '@/constant/product';
import { ClusterFormType } from '@/types';
import {
  Box,
  Divider,
  Flex,
  Input,
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
import { useEffect, useState } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';

export const calculatePrice = (form: ClusterFormType, freeValues: ClusterFormType): number => {
  const { cpu, memory, time } = form;

  const cpuTotalPrice = cpuPriceMonth * cpu;
  const memoryTotalPrice = memoryPriceMonth * memory;

  const totalPrice = (cpuTotalPrice + memoryTotalPrice) * parseInt(time);

  if (cpu === freeValues.cpu && memory === freeValues.memory && time === freeValues.time) {
    return 0;
  } else {
    return totalPrice;
  }
};

export default function Cost({
  formHook,
  priceMode = true
}: {
  priceMode?: boolean;
  formHook: UseFormReturn<ClusterFormType, any, undefined>;
}) {
  const [forceUpdate, setForceUpdate] = useState(false);
  const [price, setPrice] = useState(0);

  const { setValue, getValues, register, control } = formHook;

  formHook.watch((data) => {
    setForceUpdate(!forceUpdate);
    if (!data) return;
    const price = calculatePrice(data as ClusterFormType, freeClusterForm);
    setPrice(price);
  });

  useEffect(() => {
    const price = calculatePrice(defaulClustertForm, freeClusterForm);
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

  return (
    <Box minW={'500px'}>
      {priceMode && (
        <Text mt={'40px'} textAlign={'center'} fontSize={'24px'} fontWeight={500}>
          计价方案
        </Text>
      )}
      <Box mt={priceMode ? '24px' : ''} borderRadius={'8px'} bg={'white'} px={'32px'}>
        {priceMode && (
          <>
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
          </>
        )}

        {!priceMode && (
          <Flex alignItems={'center'} pt={'32px'}>
            <Box fontSize={'14px'} fontWeight={500} minW={'88px'}>
              集群名
            </Box>
            <Input
              flex={1}
              borderRadius={'6px'}
              placeholder={'集群名'}
              {...register('name', {
                required: '集群名称不能为空'
              })}
            />
          </Flex>
        )}

        {formArr.map((item) => {
          const list = item.sliderList;
          return (
            <Flex
              key={item.value}
              flexDirection={priceMode ? 'column' : 'row'}
              mt={priceMode ? '20px' : '32px'}
            >
              <Box minW={'88px'} fontWeight={500} fontSize={priceMode ? '12px' : '14px'}>
                {item.label}
              </Box>
              <Flex alignItems={'center'} gap={'20px'} flex={1} mt={priceMode ? '12px' : ''}>
                <Controller
                  control={control}
                  name={item.value}
                  render={({ field }) => (
                    <Slider
                      alignSelf={'self-start'}
                      {...field}
                      mt={'4px'}
                      focusThumbOnChange={false}
                      aria-label="slider-ex-1"
                      min={item.min}
                      max={item.max}
                    >
                      {list.map((n, i) => (
                        <SliderMark
                          key={n.value}
                          value={n.value}
                          mt={'6px'}
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
                    <NumberInput
                      ml={'10px'}
                      position={'relative'}
                      max={item.max}
                      min={item.min}
                      {...field}
                    >
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
            </Flex>
          );
        })}

        <Flex flexDirection={priceMode ? 'column' : 'row'} mt={'32px'}>
          <Box fontWeight={500} fontSize={priceMode ? '12px' : '14px'} minW={'88px'}>
            时间
          </Box>
          <MySelect
            textAlign={'left'}
            mt={priceMode ? '12px' : ''}
            width={'200px'}
            value={getValues('time')}
            list={MonthMapList}
            onchange={(val: any) => setValue('time', val)}
          />
        </Flex>

        <Flex
          justifyContent={'end'}
          textAlign={'right'}
          color={'#0884DD'}
          fontSize={'12px'}
          fontWeight={500}
          mt={priceMode ? '24px' : '4px'}
        >
          <Text
            px={'8px'}
            cursor={'pointer'}
            onClick={() => {
              formHook.reset(freeClusterForm);
            }}
          >
            免费规模
          </Text>
        </Flex>
        <Divider mt={priceMode ? '8px' : '4px'} borderColor={'#E8EBF0'} />

        <Flex alignItems={'center'} justifyContent={'center'} py={'16px'}>
          <Text color={'#667085'} fontSize={'11px'} fontWeight={500}>
            {priceMode ? '价格:' : '需支付:'}
          </Text>
          <Text
            ml={'12px'}
            color={'#0884DD'}
            fontSize={priceMode ? '20px' : '28px'}
            fontWeight={500}
          >
            ¥ {price}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
