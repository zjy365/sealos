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
  Flex
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import ListCheckIcon from '@/components/Icons/ListCheckIcon';
export default function DeleteFileModal({
  onDelete,
  fileListLength,
  ...styles
}: ButtonProps & { onDelete: () => void; fileListLength: number }) {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { t } = useTranslation(['file', 'common']);
  return (
    <>
      <Button {...styles} onClick={onOpen} isDisabled={fileListLength === 0}>
        {/* <ListCheckIcon boxSize={'24px'} color="grayModern.500" />{' '} */}
        <Text color={'#1C4EF5'} display={['none', null, null, null, 'initial']}>
          {t('file:bulkDelete')}(
          {t('file:selectedItems', {
            count: fileListLength
          })}
          )
        </Text>
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent maxW={'448px'} bgColor={'#FFF'} backdropFilter="blur(150px)">
          <ModalCloseButton />
          <ModalHeader>{t('file:allDelete')}</ModalHeader>
          <ModalBody h="100%" w="100%" display={'flex'} flexDir={'column'}>
            <Text>{t('file:confirmDeleteFile')}</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant={'warningConfirm'}
              px="16px"
              py="10px"
              fontWeight={'500'}
              onClick={() => {
                onDelete();
                onClose();
              }}
              isDisabled={fileListLength === 0}
            >
              {t('file:delete')}
            </Button>
            <Button
              variant={'outline'}
              px="17px"
              py="10px"
              fontWeight={'500'}
              onClick={() => onClose()}
              isDisabled={false}
            >
              {t('common:cancel')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
