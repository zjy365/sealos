import { useTranslations } from 'next-intl';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Box, Flex, FormControl, FormControlProps, Input } from '@chakra-ui/react';

import { nanoid } from '@/utils/tools';
import { DevboxEditTypeV2 } from '@/types/devbox';
import { devboxNameSchema } from '@/utils/vaildate';

import Label from './Label';

export default function DevboxName({ isEdit, ...props }: { isEdit: boolean } & FormControlProps) {
  const t = useTranslations();
  const {
    register,
    setValue,
    formState: { errors },
    control
  } = useFormContext<DevboxEditTypeV2>();
  const { fields: networks, update: updateNetworks } = useFieldArray({
    control,
    name: 'networks'
  });
  return (
    <FormControl isInvalid={!!errors.name} minW={'500px'} {...props}>
      <Flex alignItems={'start'} direction={'column'}>
        <Box h={'30px'}>
          <Label w={100}>{t('devbox_name')}</Label>
        </Box>
        <Input
          disabled={isEdit}
          autoFocus={true}
          w={'300px'}
          placeholder={t('enter_devbox_name')}
          {...register('name', {
            required: t('devbox_name_required'),
            maxLength: {
              value: 63,
              message: t('devbox_name_max_length')
            },
            validate: {
              pattern: (value) =>
                devboxNameSchema.safeParse(value).success || t('devbox_name_invalid')
            }
          })}
          onBlur={(e) => {
            const lowercaseValue = e.target.value.toLowerCase();
            setValue('name', lowercaseValue);
            networks.forEach((network, i) => {
              updateNetworks(i, {
                ...network,
                networkName: `${lowercaseValue}-${nanoid()}`
              });
            });
          }}
        />
      </Flex>
    </FormControl>
  );
}
