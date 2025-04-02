import { deleteBucket } from '@/api/bucket';
import DeleteIcon from '@/components/Icons/DeleteIcon';
import { QueryKey } from '@/consts';
import { useToast } from '@/hooks/useToast';
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
  ButtonProps,
  Input,
  Flex,
  FlexProps,
  Highlight
} from '@chakra-ui/react';
import { WarnTriangeIcon } from '@sealos/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

export default function DeleteBucketModal({
  bucketName,
  layout = 'md',
  ...styles
}: (ButtonProps | FlexProps) & { bucketName: string; layout?: 'md' | 'sm' }) {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { toast } = useToast();
  const { t } = useTranslation(['common', 'bucket', 'file']);
  const [inputVal, setInputVal] = useState('');
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteBucket,
    onSuccess() {
      queryClient.invalidateQueries([QueryKey.bucketList]);
    }
  });
  return (
    <>
      {layout === 'md' ? (
        <Button
          gap="8px"
          px="24px"
          py="10px"
          fill={'grayModern.600'}
          color={'grayModern.600'}
          {...(styles as ButtonProps)}
          onClick={() => {
            onOpen();
          }}
        >
          <DeleteIcon boxSize={'16px'} fill={'inherit'} />
          <Text color={'inherit'}>{t('delete')}</Text>
        </Button>
      ) : (
        <Flex
          px="4px"
          py="6px"
          onClick={() => {
            onOpen();
          }}
          w="full"
          align={'center'}
          color={'grayModern.600'}
          {...(styles as FlexProps)}
        >
          <DeleteIcon w="16px" h="16px" color={'inherit'} mr="8px" />
          <Text color={'inherit'}>{t('delete')}</Text>
        </Flex>
      )}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent maxW={'448px'} bgColor={'#FFF'} backdropFilter="blur(150px)">
          <ModalCloseButton />
          <ModalHeader display={'flex'} alignItems={'center'}>
            {/* <WarnTriangeIcon
              color={'yellow.500'}
              boxSize={'20px'}
              mr={'10px'}
              fill={'yellow.500'}
            /> */}
            <Text>{t('bucket:deleteBucket')}</Text>
          </ModalHeader>
          <ModalBody gap={'16px'} h="100%" w="100%" display={'flex'} flexDir={'column'}>
            <Text fontSize={'14px'} p={'16px'} color={'#DC2626'} bg={'#FEF2F2'}>
              {t('bucket:confirmDeleteBucket')}
            </Text>
            <Text fontSize={'14px'}>
              <Highlight styles={{ fontWeight: 600 }} query={bucketName}>
                {t('bucket:enterBucketNameConfirmation', { bucketName })}
              </Highlight>
            </Text>
            <Input
              h={'40px'}
              type="text"
              variant={'outline'}
              width={'full'}
              placeholder={t('bucket:bucketName')}
              value={inputVal}
              onChange={(v) => setInputVal(v.target.value.trim())}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant={'warningConfirm'}
              {...(styles as ButtonProps)}
              px="16px"
              py="10px"
              borderRadius={'8px'}
              fontWeight={'500'}
              color={'#FEF2F2'}
              onClick={() => {
                if (inputVal !== bucketName) {
                  toast({
                    title: t('bucket:enterValidBucketName'),
                    status: 'error'
                  });
                  return;
                }
                mutation.mutate({
                  bucketName
                });
                onClose();
              }}
            >
              {t('file:delete')}
            </Button>
            <Button
              variant={'outline'}
              px="17px"
              py="10px"
              borderRadius={'8px'}
              fontWeight={'500'}
              onClick={onClose}
            >
              {t('cancel')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
