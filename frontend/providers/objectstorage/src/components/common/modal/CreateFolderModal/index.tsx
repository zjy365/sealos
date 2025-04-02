import {
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalFooter,
  useDisclosure,
  IconButtonProps,
  Button,
  Input,
  Flex
} from '@chakra-ui/react';
import CreateFolderIcon from '@/components/Icons/CreateFolderIcon';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { putObject } from '@/api/s3';
import { useOssStore } from '@/store/ossStore';
import { FolderPlaceholder, QueryKey } from '@/consts';
import { useTranslation } from 'next-i18next';
import { useToast } from '@/hooks/useToast';
export default function CreateFolderModal({ ...styles }: Omit<IconButtonProps, 'aria-label'>) {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [folderName, setFolderName] = useState('');
  const queryClient = useQueryClient();
  const oss = useOssStore();
  const { t } = useTranslation('file');
  const { t: commonT } = useTranslation('common');
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: putObject(oss.client!),
    onSuccess() {
      queryClient.invalidateQueries([QueryKey.minioFileList]);
      onClose();
    },
    onError(error) {
      toast({
        //@ts-ignore
        title: error.message,
        status: 'error'
      });
      onClose();
    }
  });
  return (
    <>
      <Button
        display={'flex'}
        gap={'8px'}
        p="4px"
        minW={'unset'}
        onClick={() => onOpen()}
        {...styles}
      >
        {/* <CreateFolderIcon boxSize="24px" color={'grayModern.500'} /> */}
        <Text color="#1C4EF5" display={['none', null, null, null, 'initial']}>
          {t('createFolder')}
        </Text>
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent maxW={'448px'} backdropFilter="blur(150px)">
          <ModalCloseButton />
          <ModalHeader>{t('createFolder')}</ModalHeader>
          <ModalBody h="100%" w="100%" display={'flex'} flexDir={'column'}>
            <Flex gap={'8px'} direction={'column'}>
              <Text color={'#71717A'} fontSize={'14px'} fontWeight={'500'}>
                {t('folderName')}
              </Text>
              <Input
                type="text"
                variant={'outline'}
                h={'40px'}
                w={'100%'}
                placeholder={t('folderName')}
                value={folderName}
                onChange={(v) => setFolderName(v.target.value.trim())}
              />
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              variant={'solid'}
              px="13.5px"
              py="10px"
              fontWeight={'500'}
              onClick={() => {
                const Bucket = oss.currentBucket?.name;
                const Key = [...oss.prefix, folderName, FolderPlaceholder].join('/');
                Bucket && Key && mutation.mutate({ Bucket, Key });
                setFolderName('');
              }}
              isDisabled={!folderName}
            >
              {t('confirm')}
            </Button>
            <Button
              variant={'outline'}
              px="13.5px"
              py="10px"
              fontWeight={'500'}
              onClick={onClose}
              isDisabled={mutation.isLoading}
            >
              {commonT('cancel')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
