import { FormSchema, Authority } from '@/consts';
import {
  Stack,
  FormControl,
  FormLabel,
  Input,
  Flex,
  Select,
  FormHelperText,
  Text,
  RadioGroup,
  Radio,
  useRadio,
  Box,
  useRadioGroup
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import ExpanMoreIcon from '../Icons/ExpandMoreIcon';
import InfoCircleIcon from '../Icons/InfoCircleIcon';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { MySelect } from '@sealos/ui';

const BasicConfigHookForm = () => {
  const { register, getFieldState, control, getValues, setValue } = useFormContext<FormSchema>();
  const { t } = useTranslation(['common', 'bucket']);
  const authorityTips = useMemo(
    () => ({
      [Authority.private]: t('bucket:privateBucket'),
      [Authority.readonly]: t('bucket:sharedBucketRead'),
      [Authority.readwrite]: t('bucket:sharedBucketReadWrite')
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const authorityList = [
    {
      // 首字母大写
      label: Authority.private.replace(/^\w/, (c) => c.toUpperCase()),
      value: Authority.private
    },
    {
      value: Authority.readonly,
      label: Authority.readonly.replace(/^\w/, (c) => c.toUpperCase())
    },
    {
      value: Authority.readwrite,
      label: Authority.readwrite.replace(/^\w/, (c) => c.toUpperCase())
    }
  ];
  const selectedAuthority = useWatch<FormSchema, 'bucketAuthority'>({
    name: 'bucketAuthority',
    defaultValue: Authority.private,
    control
  });
  const router = useRouter();
  // const { getRootProps, getRadioProps } = useRadioGroup({
  //   name: 'framework',
  //   defaultValue: Authority.private,
  //   onChange: (v) => {
  //     setValue('bucketAuthority', v as any);
  //   },
  // })
  return (
    <Stack gap={'16px'}>
      <FormControl
        isInvalid={!!getFieldState('bucketName').error}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'flex-start'}
        border={'1px solid #E4E4E7'}
        borderRadius={'16px'}
        p={'24px'}
      >
        <FormLabel mb={'20px'} fontWeight={500} fontSize={'20px'} lineHeight={'28px'} mr="30px">
          {t('bucket:bucketName')}
        </FormLabel>
        <Input
          variant={'outline'}
          h="40px"
          w="360px"
          borderRadius={'8px'}
          placeholder="Bucket Name"
          autoFocus={true}
          color={'#71717A'}
          fontSize={'14px'}
          isDisabled={!!router.query.bucketName}
          {...register('bucketName', {
            required: 'This is required',
            minLength: { value: 1, message: 'Minimum length should be 1' }
          })}
        />
      </FormControl>
      <FormControl
        isInvalid={!!getFieldState('bucketAuthority').error}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'flex-start'}
        border={'1px solid #E4E4E7'}
        borderRadius={'16px'}
        p={'24px'}
      >
        <FormLabel mb={'20px'} fontWeight={500} fontSize={'20px'} lineHeight={'28px'} mr="30px">
          {t('bucket:bucketPermission')}
        </FormLabel>
        <RadioGroup
          w={'100%'}
          onChange={(v) => {
            setValue('bucketAuthority', v as any);
          }}
          value={getValues('bucketAuthority')}
        >
          <Flex w={'100%'} direction="row" h={'56px'} gap={'12px'}>
            {authorityList.map((item) => {
              return (
                <Flex
                  transition={'all 0.1s'}
                  bg={item.value === getValues('bucketAuthority') ? '#1C4EF50D' : 'white'}
                  border={
                    item.value === getValues('bucketAuthority')
                      ? '1.5px solid #1C4EF5'
                      : '1px solid #E4E4E7'
                  }
                  alignItems={'center'}
                  justifyContent={'flex-start'}
                  borderRadius={'8px'}
                  px={'16px'}
                  flex={1}
                  h={'100%'}
                  as="label"
                  key={item.value}
                  cursor={'pointer'}
                >
                  <Text fontWeight={500} fontSize={'16px'} color={'#111824'}>
                    {item.label}
                  </Text>
                  <Radio visibility={'hidden'} value={item.value} name={item.value}></Radio>
                </Flex>
              );
            })}
          </Flex>
        </RadioGroup>
        {/* <MySelect
          list={authorityList}
          width="300px"
          value={getValues('bucketAuthority')}
          onchange={(v) => {
            setValue('bucketAuthority', v as any);
          }}
        ></MySelect> */}
        <FormHelperText
          mt={'20px'}
          display={
            selectedAuthority === Authority.readonly || selectedAuthority === Authority.readwrite
              ? ''
              : 'none'
          }
          w="100%"
          p="16px"
          borderRadius={'8px'}
          bgColor={'#FFF7ED'}
          alignItems={'center'}
        >
          <Text fontSize={'14px'} lineHeight={'20px'} color="#EA580C">
            {authorityTips[selectedAuthority]}
          </Text>
        </FormHelperText>
      </FormControl>
    </Stack>
  );
};
export default BasicConfigHookForm;
