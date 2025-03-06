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
  Textarea,
  Input
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import MyFormControl from '@/components/FormControl';
import { useTranslation } from 'next-i18next';

export type ConfigMapType = {
  id?: string;
  mountPath: string;
  value: string;
};

const ConfigmapModal = ({
  defaultValue = {
    mountPath: '',
    value: ''
  },
  listNames,
  successCb,
  closeCb
}: {
  defaultValue?: ConfigMapType;
  listNames: string[];
  successCb: (e: ConfigMapType) => void;
  closeCb: () => void;
}) => {
  const { t } = useTranslation();
  const type = useMemo(() => (!defaultValue.id ? 'create' : 'edit'), [defaultValue]);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: defaultValue
  });
  const textMap = {
    create: {
      title: 'Add'
    },
    edit: {
      title: 'Update'
    }
  };

  return (
    <>
      <Modal isOpen onClose={closeCb} lockFocusAcrossFrames={false}>
        <ModalOverlay />
        <ModalContent
          maxH={'90vh'}
          maxW={'90vw'}
          minW={'530px'}
          w={'auto'}
          p={'2px'}
          boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.05)'}
          borderRadius={'16px'}
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
              {t(textMap[type].title)}&nbsp;
              {t('ConfigMap Tip')}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody p={'8px 24px 24px 24px'}>
              <MyFormControl showError errorText={errors.mountPath?.message}>
                <Box mb={'8px'} fontSize={'14px'} fontWeight={500} color={'#71717A'}>
                  {t('filename')}
                </Box>
                <Input
                  bg={'#fff'}
                  width={'100%'}
                  placeholder={`${t('File Name')}: /etc/kubernetes/admin.conf`}
                  {...register('mountPath', {
                    required: t('Filename can not empty') || 'Filename can not empty',
                    pattern: {
                      value: /^[0-9a-zA-Z_/][0-9a-zA-Z_/.-]*[0-9a-zA-Z_/]$/,
                      message: t('Mount Path Auth')
                    },
                    validate: (e) => {
                      if (listNames.includes(e.toLocaleLowerCase())) {
                        return t('ConfigMap Path Conflict') || 'ConfigMap Path Conflict';
                      }
                      return true;
                    }
                  })}
                />
              </MyFormControl>
              <FormControl isInvalid={!!errors.value}>
                <Box mb={'8px'} fontSize={'14px'} fontWeight={500} color={'#71717A'}>
                  {t('file value')}
                </Box>
                <Textarea
                  bg={'#FFF'}
                  whiteSpace={'pre-wrap'}
                  rows={6}
                  resize={'both'}
                  {...register('value', {
                    required: t('File Value can not empty') || 'File Value can not empty'
                  })}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter justifyContent={'start'} px={'24px'}>
              <Button w={'88px'} borderRadius={'8px'} onClick={handleSubmit(successCb)}>
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

export default ConfigmapModal;
