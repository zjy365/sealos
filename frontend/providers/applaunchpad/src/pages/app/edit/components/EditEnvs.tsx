import React, { useState, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Textarea,
  Box
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { AppEditType } from '@/types/app';

const EditEnvs = ({
  defaultEnv = [],
  successCb,
  onClose
}: {
  defaultEnv: AppEditType['envs'];
  successCb: (e: { key: string; value: string }[]) => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const [inputVal, setInputVal] = useState(
    defaultEnv
      .filter((item) => !item.valueFrom) // Only env that is not valuefrom can be edited
      .map((item) => `${item.key}=${item.value}`)
      .join('\n')
  );

  const onSubmit = useCallback(() => {
    const lines = inputVal.split('\n').filter((item) => item);
    const result = lines
      .map((str) => {
        // replace special symbol
        str = str.trim();
        if (/^-\s*/.test(str)) {
          str = str.replace(/^-\s*/, '');
        }
        if (str.includes('=')) {
          const i = str.indexOf('=');
          return [str.slice(0, i), str.slice(i + 1)];
        } else if (str.includes(':')) {
          const i = str.indexOf(':');
          return [str.slice(0, i), str.slice(i + 1)];
        }
        return '';
      })
      .filter((item) => item)
      .map((item) => {
        // remove quotation
        const key = item[0].replace(/^['"]|['"]$/g, '').trim();
        const value = item[1].replace(/^['"]|['"]$/g, '').trim();

        return {
          key,
          value
        };
      });

    // concat valueFrom env
    successCb([...defaultEnv.filter((item) => item.valueFrom), ...result]);
    onClose();
  }, [defaultEnv, inputVal, onClose, successCb]);

  return (
    <Modal isOpen onClose={onClose} lockFocusAcrossFrames={false}>
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
            {t('Edit Environment Variables')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={'8px 24px 24px 24px'}>
            <Box fontSize={'14px'} fontWeight={500} mb={'8px'} color={'#71717A'}>
              {t('Environment Variables')}
            </Box>
            <Textarea
              style={{
                border: '1px solid #E4E4E7',
                borderRadius: '6px'
              }}
              bg={'#FFF'}
              color={'#71717A'}
              whiteSpace={'pre-wrap'}
              h={'160px'}
              maxH={'100%'}
              value={inputVal}
              resize={'both'}
              placeholder={t('Env Placeholder') || ''}
              overflowX={'auto'}
              onChange={(e) => setInputVal(e.target.value)}
            />
          </ModalBody>
          <ModalFooter justifyContent={'start'} px={'24px'}>
            <Button w={'88px'} onClick={onSubmit} borderRadius={'8px'}>
              {t('Add')}
            </Button>
            <Button
              ml={'8px'}
              w={'88px'}
              variant={'outline'}
              onClick={onClose}
              borderRadius={'8px'}
            >
              {t('Cancel')}
            </Button>
          </ModalFooter>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default EditEnvs;
