import { useToast } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';

export function useAPIErrorMessage() {
  const { t } = useTranslation();
  return function getAPIErrorMessage(error: any) {
    if (error == null) return null;
    if (typeof error === 'string') return error;
    if (typeof error.message === 'string') return error.message;
    return t('UnknowError');
  };
}
export default function useToastAPIResult() {
  const getAPIErrorMessage = useAPIErrorMessage();
  const toast = useToast();
  const toastError = (text: string) => {
    toast({
      title: text,
      status: 'error',
      duration: 2000,
      isClosable: true,
      position: 'top'
    });
  };
  const toastAPIError = (error: any) => {
    toastError(getAPIErrorMessage(error));
  };
  const toastSuccess = (text: string) => {
    toast({
      title: text,
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top'
    });
  };

  return { toastAPIError, toast, getAPIErrorMessage, toastSuccess, toastError };
}
