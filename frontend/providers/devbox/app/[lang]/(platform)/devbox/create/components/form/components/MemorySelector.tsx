import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Flex, FlexProps, Text } from '@chakra-ui/react';

import { DevboxEditTypeV2 } from '@/types/devbox';
import { MemorySlideMarkList } from '@/constants/devbox';

import { MySlider } from '@/components/MySlider';

export default function MemorySelector(props: FlexProps) {
  const t = useTranslations();
  const { watch, setValue } = useFormContext<DevboxEditTypeV2>();
  return (
    <Flex mb={'20px'} pr={3} alignItems={'center'} {...props}>
      <Text w={100} fontWeight={'bold'}>
        {t('memory')}
      </Text>
      <MySlider
        markList={MemorySlideMarkList}
        activeVal={watch('memory')}
        setVal={(e) => {
          setValue('memory', MemorySlideMarkList[e].value);
        }}
        max={MemorySlideMarkList.length - 1}
        min={0}
        step={1}
      />
    </Flex>
  );
}
