import { colorScheme } from '@/utils/commonStyles';
import { DeleteIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Text,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Alert,
  AlertDescription,
  FormControl,
  FormLabel,
  Input
} from '@chakra-ui/react';
import { FC, SyntheticEvent, useRef, useState } from 'react';
import { Trans, useTranslation } from 'next-i18next';
import { deleteUser } from '@/api/user';
import useToastAPIResult from '@/hooks/useToastAPIResult';
import Icon from '@/components/Icon';

interface DeleteAccountProps {
  userName?: string;
}
const DeleteAccount: FC<DeleteAccountProps> = ({ userName }) => {
  const { t } = useTranslation();
  const { toastAPIError, toastError } = useToastAPIResult();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [inputValue, setInputValue] = useState('');
  const handleInputChange = (e: SyntheticEvent<HTMLInputElement>) => {
    setInputValue(e.currentTarget.value);
  };
  const openAlert = () => {
    setInputValue('');
    onOpen();
  };
  const handleDelete = () => {
    if (userName?.trim() !== inputValue.trim()) {
      toastError(t('DeleteAccountInputUsernameNotMatch', { userName }));
      return;
    }
    return deleteUser().then(
      () => {
        location.reload();
        onClose();
      },
      (e) => {
        toastAPIError(e);
      }
    );
  };
  return (
    <>
      {/* colorScheme='red' not work here */}
      <Card {...colorScheme.red.card} variant="outline">
        <CardBody py="24px">
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <Text fontSize="18px" fontWeight={600} lineHeight="28px">
                {t('DeleteAccount')}
              </Text>
              <Text mt="8px" fontSize="14px" lineHeight="18px" color="#71717A">
                {t('DeleteAccountTip')}
              </Text>
            </Box>
            <Button
              variant="danger"
              leftIcon={<Icon name="delete" fill="#fff" w="16px" h="16px" />}
              onClick={openAlert}
            >
              {t('Delete')}
            </Button>
          </Flex>
        </CardBody>
      </Card>
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent maxW="448px">
            <AlertDialogHeader>{t('DeleteAccount')}</AlertDialogHeader>
            <AlertDialogBody>
              <Alert status="error" variant="danger">
                <AlertDescription>{t('DeleteAccountConfirmAlert')}</AlertDescription>
              </Alert>
              <FormControl mt="16px">
                <FormLabel color="#71717A">
                  <Trans
                    i18nKey="DeleteAccountConfirmAlertUserName"
                    values={{ userName }}
                    components={{
                      UserName: <span style={{ color: '#18181B', fontWeight: 500 }} />
                    }}
                  />
                </FormLabel>
                <Input value={inputValue} bg="#fff" w="100%" onChange={handleInputChange} />
              </FormControl>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button variant="danger" onClick={handleDelete}>
                {t('Delete')}
              </Button>
              <Button colorScheme="blackAlpha" variant="outline" ref={cancelRef} onClick={onClose}>
                {t('Cancel')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
export default DeleteAccount;
