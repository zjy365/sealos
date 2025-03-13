import { useTranslations } from 'next-intl';
import { Flex, Input } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

import MyFormLabel from '@/components/MyFormControl';

export default function TemplateRepositoryNameField({
  isDisabled = false
}: {
  isDisabled?: boolean;
}) {
  const ctx = useFormContext<{ name: string }>();
  const t = useTranslations();
  return (
    <Flex align={'start'} direction={'column'} gap={4} w={'full'}>
      <MyFormLabel width="108px" m="0" fontSize="14px">
        {t('name')}
      </MyFormLabel>
      <Input
        {...ctx.register('name')}
        placeholder={t('input_template_name_placeholder')}
        bg="white"
        w={'full'}
        borderColor="grayModern.200"
        h={'40px'}
        isDisabled={isDisabled}
      />
    </Flex>
  );
}
