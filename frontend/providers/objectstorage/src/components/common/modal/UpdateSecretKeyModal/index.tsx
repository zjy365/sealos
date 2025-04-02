import { deleteBucket, updateSecret } from '@/api/bucket';
import RefreshIcon from '@/components/Icons/RefreshIcon';
import { QueryKey } from '@/consts';
import { useToast } from '@/hooks/useToast';
import { useOssStore } from '@/store/ossStore';
import {
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalOverlay,
  useDisclosure,
  Button,
  ButtonProps
} from '@chakra-ui/react';
import { WarnTriangeIcon } from '@sealos/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { title } from 'process';
import { useState } from 'react';
export default function UpdateSecretKeyModal({ ...styles }: ButtonProps & {}) {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { t } = useTranslation(['common', 'bucket', 'file']);
  const queryClient = useQueryClient();
  const { isUpdating, setIsUpdating, clearClient } = useOssStore();
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: updateSecret,
    onSuccess() {
      queryClient.invalidateQueries([QueryKey.bucketUser]);
      clearClient();
      setIsUpdating(true);
    },
    onError(err) {
      toast({
        status: 'error',
        title: t('reset_error', { ns: 'common' })
      });
    }
  });
  return (
    <>
      <Button
        gap="4px"
        variant={'ghost'}
        px="8px"
        py="4px"
        h="auto"
        fontSize={'14px'}
        fontWeight={'400'}
        borderRadius={'4px'}
        color={'#2563EB'}
        isLoading={isUpdating}
        _loading={{
          boxSize: '20px'
        }}
        {...styles}
        onClick={() => {
          onOpen();
        }}
      >
        {/* <RefreshIcon boxSize={'12px'} color="grayModern.400" /> */}
        <Text>{t('reset')}</Text>
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent maxW={'360px'} bgColor={'#FFF'} backdropFilter="blur(150px)">
          <ModalCloseButton />
          <ModalHeader display={'flex'} alignItems={'center'}>
            {/* <WarnTriangeIcon
              color={'yellow.500'}
              boxSize={'20px'}
              mr={'10px'}
              fill={'yellow.500'}
            /> */}
            <Text>{t('bucket:reset_user_sk_title')}</Text>
          </ModalHeader>
          <ModalBody>
            <Text>{t('bucket:reset_user_sk_desc')}</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant={'solid'}
              {...styles}
              px="13.5px"
              py="10px"
              fontSize={'14px'}
              fontWeight={'500'}
              onClick={() => {
                mutation.mutate();
                onClose();
              }}
            >
              {t('file:confirm')}
            </Button>
            <Button
              variant={'outline'}
              px="17px"
              py="10px"
              fontSize={'14px'}
              fontWeight={'500'}
              borderColor={'#E4E4E7'}
              onClick={() => onClose()}
            >
              {t('cancel')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
