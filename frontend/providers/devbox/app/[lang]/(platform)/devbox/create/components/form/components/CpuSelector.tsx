import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Box, Flex, FlexProps, Text } from '@chakra-ui/react';

import { MySlider } from '@/components/MySlider';

import { DevboxEditTypeV2 } from '@/types/devbox';
import { CpuSlideMarkList } from '@/constants/devbox';

export default function CpuSelector(props: FlexProps) {
  const t = useTranslations();
  const { watch, setValue } = useFormContext<DevboxEditTypeV2>();
  return (
    <Flex mb={'40px'} pr={3} alignItems={'flex-start'} {...props}>
      <Text w={100} fontWeight={'bold'}>
        {t('cpu')}
      </Text>
      <MySlider
        markList={CpuSlideMarkList}
        activeVal={watch('cpu')}
        setVal={(e) => {
          setValue('cpu', CpuSlideMarkList[e].value);
        }}
        max={CpuSlideMarkList.length - 1}
        min={0}
        step={1}
      />
    </Flex>
  );
}
