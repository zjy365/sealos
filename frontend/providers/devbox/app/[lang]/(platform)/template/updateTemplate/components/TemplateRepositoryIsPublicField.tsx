import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';
import { Alert, Flex, FormControl, Link, Switch, Text, VStack } from '@chakra-ui/react';

import { useEnvStore } from '@/stores/env';
import { TagCheckbox } from '../../TagCheckbox';
import MyFormLabel from '@/components/MyFormControl';

export default function TemplateRepositoryIsPublicField({
  isDisabled = false
}: {
  isDisabled?: boolean;
}) {
  const { control } = useFormContext();
  const t = useTranslations();
  const { env } = useEnvStore();
  return (
    <Flex align={'start'} direction={'column'} gap={4} w={'full'}>
      <Flex align={'center'} gap={4}>
        <MyFormLabel width="60px" m="0" fontSize="14px">
          {t('public')}
        </MyFormLabel>
        <Controller
          name="isPublic"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Switch
              isChecked={value}
              onChange={onChange}
              size="lg"
              colorScheme="blackAlpha"
              isDisabled={isDisabled}
            />
          )}
        />
      </Flex>
      <VStack align="start" spacing={'12px'} flex={1}>
        {
          <Alert
            status="info"
            borderRadius="md"
            py={'6px'}
            color={'grayModern.500'}
            bgColor={'grayModern.50'}
            px={'0'}
          >
            <Text fontSize="12px" fontWeight={400}>
              {t('set_template_to_public_tips')}
            </Text>
          </Alert>
        }
        {!isDisabled && (
          <FormControl>
            <Controller
              name="agreeTerms"
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <TagCheckbox
                  name="agreeTerms"
                  isChecked={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  size="sm"
                >
                  <Text fontSize="12px" color="grayModern.600" fontWeight={500}>
                    {t('have_read_and_agree_to_the ')}
                    <Link
                      textDecoration={'underline'}
                      href={env.privacyUrl}
                      target={'_blank'}
                      ml={'2px'}
                    >
                      {t('privacy_and_security_agreement')}
                    </Link>
                  </Text>
                </TagCheckbox>
              )}
            />
          </FormControl>
        )}
      </VStack>
    </Flex>
  );
}
