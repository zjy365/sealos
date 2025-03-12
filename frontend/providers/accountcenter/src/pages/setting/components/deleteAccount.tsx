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
import { FC, useRef } from 'react';
import { Trans, useTranslation } from 'next-i18next';
import { deleteUser } from '@/api/user';

interface DeleteAccountProps {
  userName?: string;
}
const DeleteAccount: FC<DeleteAccountProps> = ({ userName }) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const handleDelete = () => {
    return deleteUser().then(() => {
      location.reload();
      onClose();
    });
  };
  return (
    <>
      {/* colorScheme='red' not work here */}
      <Card {...colorScheme.red.card} variant="outline">
        <CardBody>
          <Flex justifyContent="space-between" alignItems="start">
            <Box>
              <Text fontSize="18px" fontWeight={600} lineHeight="28px">
                {t('DeleteAccount')}
              </Text>
              <Text mt="8px" fontSize="14px" lineHeight="18px" color="#71717A">
                {t('DeleteAccountTip')}
              </Text>
            </Box>
            <Button variant="danger" leftIcon={<DeleteIcon />} onClick={onOpen}>
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
                <Input bg="#fff" w="100%" />
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
