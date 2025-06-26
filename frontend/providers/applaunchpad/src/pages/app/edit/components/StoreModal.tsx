import React, { useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  Box,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Flex
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import MyFormControl from '@/components/FormControl';
import { useTranslation } from 'next-i18next';
import { pathToNameFormat } from '@/utils/tools';
import { MyTooltip } from '@sealos/ui';
import { PVC_STORAGE_MAX } from '@/store/static';
import { getUserSession } from '@/utils/user';
import { sealosApp } from 'sealos-desktop-sdk/app';
import { PLAN_LIMIT } from '@/constants/account';
import { LockKeyholeIcon } from 'lucide-react';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';

export type StoreType = {
  id?: string;
  name: string;
  path: string;
  value: number;
};

const StoreModal = ({
  defaultValue = {
    name: '',
    path: '',
    value: 1
  },
  listNames,
  isEditStore,
  successCb,
  closeCb
}: {
  defaultValue?: StoreType;
  listNames: string[];
  isEditStore: boolean;
  successCb: (e: StoreType) => void;
  closeCb: () => void;
}) => {
  const { t } = useTranslation();
  const { userQuota, loadUserQuota } = useUserStore();
  const type = useMemo(() => (!!defaultValue.id ? 'create' : 'edit'), [defaultValue]);
  const minVal = useMemo(
    () => (isEditStore ? defaultValue.value : 1),
    [defaultValue.value, isEditStore]
  );
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: defaultValue
  });
  const textMap = {
    create: {
      title: `${t('Update')} ${t('Storage')}`
    },
    edit: {
      title: `${t('Add')} ${t('Storage')}`
    }
  };
  const planName = getUserSession()?.user?.subscription?.subscriptionPlan?.name || 'Free';

  const limit = PLAN_LIMIT[planName as 'Free'];
  const storageQuota = userQuota.find((q) => q.type === 'storage');
  const exceedLimit =
    storageQuota &&
    storageQuota.limit >= 0 &&
    storageQuota.limit < watch('value') + storageQuota.used;
  return (
    <>
      <Modal isOpen onClose={closeCb} lockFocusAcrossFrames={false}>
        <ModalOverlay />
        <ModalContent
          p={'2px'}
          boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.05)'}
          borderRadius={'16px'}
          maxW={'456px'}
        >
          <Box border={'1px solid #E4E4E7'} borderRadius={'16px'}>
            <ModalHeader
              p={'24px'}
              borderTopRadius={'16px'}
              style={{
                background: '#FFF',
                border: 'none'
              }}
            >
              {textMap[type].title}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody p={'8px 24px 24px 24px'}>
              <FormControl mb={5} isInvalid={!!errors.value}>
                <Box mb={'8px'} fontSize={'14px'} fontWeight={500} color={'grayModern.900'}>
                  {t('capacity')}
                </Box>
                <MyTooltip
                  isDisabled={planName !== 'Free'}
                  label={
                    'Free plan includes up to 10GB. Upgrade your plan to enjoy unlimited capacity.'
                    // `${t('Storage Range')}: ${minVal}~${PVC_STORAGE_MAX} Gi`
                  }
                >
                  <NumberInput max={PVC_STORAGE_MAX} min={minVal} step={1} position={'relative'}>
                    <Box
                      position={'absolute'}
                      right={10}
                      top={'50%'}
                      transform={'translateY(-50%)'}
                      color={'blackAlpha.600'}
                    >
                      Gi
                    </Box>
                    <NumberInputField
                      bg={'#fff'}
                      _hover={{
                        borderColor: '#85CCFF',
                        bg: '#fff'
                      }}
                      _focusVisible={{
                        borderColor: '#219BF4',
                        boxShadow: '0px 0px 0px 2.4px rgba(33, 155, 244, 0.15)',
                        bg: '#FFF',
                        color: '#111824'
                      }}
                      {...register('value', {
                        required: t('Storage Value can not empty') || 'Storage Value can not empty',
                        min: {
                          value: minVal,
                          message: `${t('Min Storage Value')} ${minVal} Gi`
                        },
                        max: {
                          value: PVC_STORAGE_MAX,
                          message: `${t('Max Storage Value')} ${PVC_STORAGE_MAX} Gi`
                        },
                        valueAsNumber: true
                      })}
                      max={PVC_STORAGE_MAX}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </MyTooltip>
              </FormControl>
              {exceedLimit && (
                <Flex
                  justifyContent="space-between"
                  alignItems="center"
                  padding="12px"
                  gap="12px"
                  width="full"
                  bgGradient="linear(270.48deg, rgba(39, 120, 253, 0.1) 3.93%, rgba(39, 120, 253, 0.1) 18.25%, rgba(135, 161, 255, 0.1) 80.66%)"
                  borderRadius="8px"
                >
                  <Flex gap={'8px'}>
                    <LockKeyholeIcon size={'16px'} color="#3E6FF4"></LockKeyholeIcon>
                    <Text
                      bgClip={'text'}
                      bgGradient={'linear-gradient(180deg, #3E6FF4 0%, #0E4BF1 100%)'}
                    >
                      {planName} plan includes up to {storageQuota.limit} GB
                    </Text>
                  </Flex>
                  <Button
                    variant={'unstyled'}
                    onClick={() => {
                      sealosApp.runEvents('openDesktopApp', {
                        appKey: 'system-account-center',
                        pathname: '/',
                        query: {
                          scene: 'upgrade'
                        }
                      });
                    }}
                    bgGradient="linear(to-b, #3E6FF4 0%, #0E4BF1 100%)"
                    bgClip="text"
                  >
                    Upgrade Now
                  </Button>
                </Flex>
              )}
              <MyFormControl showError errorText={errors.path?.message} pb={2}>
                <Box mb={'8px'} fontSize={'14px'} fontWeight={500} color={'grayModern.900'}>
                  {t('mount path')}
                </Box>
                <Input
                  bg={'#fff'}
                  width={'100%'}
                  placeholder={t('form.storage_path_placeholder')}
                  title={
                    isEditStore
                      ? t('Can not change storage path') || 'Can not change storage path'
                      : ''
                  }
                  disabled={isEditStore}
                  {...register('path', {
                    required: t('Storage path can not empty') || 'Storage path can not empty',
                    pattern: {
                      value: /^[0-9a-zA-Z_/][0-9a-zA-Z_/.-]*[0-9a-zA-Z_/]$/,
                      message: t('Mount Path Auth')
                    },
                    validate: (e) => {
                      if (listNames.includes(e.toLocaleLowerCase())) {
                        return t('ConfigMap Path Conflict') || 'ConfigMap Path Conflict';
                      }
                      return true;
                    },
                    onChange(e) {
                      setValue('name', pathToNameFormat(e.target.value));
                    }
                  })}
                />
              </MyFormControl>
            </ModalBody>
            <ModalFooter justifyContent={'start'} px={'24px'}>
              <Button w={'88px'} onClick={handleSubmit(successCb)} borderRadius={'8px'}>
                {t('Confirm')}
              </Button>
              <Button
                ml={'8px'}
                w={'88px'}
                variant={'outline'}
                onClick={closeCb}
                borderRadius={'8px'}
              >
                {t('Cancel')}
              </Button>
            </ModalFooter>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
};

export default StoreModal;
