import { useTranslations } from 'next-intl';
import { Flex, Textarea } from '@chakra-ui/react';
import { Controller, useFormContext } from 'react-hook-form';

import MyFormLabel from '@/components/MyFormControl';

export default function TemplateRepositoryDescriptionField() {
  const { control } = useFormContext<{ description: string }>();
  const t = useTranslations();
  return (
    <Flex align={'start'} direction={'column'} gap={4} w={'full'}>
      <MyFormLabel width="108px" m="0" fontSize="14px">
        {t('template_description')}
      </MyFormLabel>
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            placeholder={t('template_description_placeholder')}
            bg="white"
            borderColor="grayModern.200"
            color={'grayModern.500'}
            fontSize={'12px'}
            resize="vertical"
            minH="106px"
          />
        )}
      />
    </Flex>
  );
}
