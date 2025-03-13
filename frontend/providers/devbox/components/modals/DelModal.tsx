import {
  Box,
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text
} from '@chakra-ui/react';
import { Loader } from 'lucide-react';
import { useMessage } from '@sealos/ui';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { delDevbox } from '@/api/devbox';
import { useIDEStore } from '@/stores/ide';
import { DevboxDetailTypeV2, DevboxListItemTypeV2 } from '@/types/devbox';

const DelModal = ({
  devbox,
  onClose,
  refetchDevboxList,
  onSuccess
}: {
  devbox: DevboxListItemTypeV2 | DevboxDetailTypeV2;
  onClose: () => void;
  onSuccess: () => void;
  refetchDevboxList: () => void;
}) => {
  const t = useTranslations();
  const { message: toast } = useMessage();
  const { removeDevboxIDE } = useIDEStore();

  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleDelDevbox = useCallback(async () => {
    try {
      setLoading(true);
      await delDevbox(devbox.name);
      removeDevboxIDE(devbox.name);
      toast({
        title: t('delete_successful'),
        status: 'success'
      });
      onSuccess();
      onClose();

      let retryCount = 0;
      const maxRetries = 3;
      const retryInterval = 3000;

      const retry = async () => {
        if (retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryInterval));
          await refetchDevboxList();
          retryCount++;
        }
      };
      retry();
    } catch (error: any) {
      toast({
        title: typeof error === 'string' ? error : error.message || t('delete_failed'),
        status: 'error'
      });
      console.error(error);
    }
    setLoading(false);
  }, [devbox.name, removeDevboxIDE, toast, t, onSuccess, onClose, refetchDevboxList]);

  return (
    <Modal isOpen onClose={onClose} lockFocusAcrossFrames={false} size={'lg'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader bg={'white'} borderBottom={'0px'}>
          <Flex pt={4} fontWeight={'600'} pl={4} fontSize={'20px'}>
            {t('delete_warning')}
          </Flex>
        </ModalHeader>
        <ModalBody pb={4} pt={4}>
          <Box fontSize={'12px'} color={'#DC2626'} bg={'#FEF2F2'} borderRadius={'4px'} p={2}>
            {t('delete_warning_content_2')}
          </Box>
          <Box mt={4} color={'#71717A'}>
            {t.rich('please_enter_devbox_name_confirm', {
              name: devbox.name,
              strong: (chunks) => (
                <Text
                  fontWeight={'bold'}
                  display={'inline-block'}
                  userSelect={'all'}
                  color={'black'}
                >
                  {chunks}
                </Text>
              )
            })}
          </Box>
          <Input
            placeholder={devbox.name}
            value={inputValue}
            bg={'white'}
            h={'40px'}
            onChange={(e) => setInputValue(e.target.value)}
            mt={4}
            w={'100%'}
            border={'1px solid'}
            borderColor={'grayModern.200'}
            borderRadius={'4px'}
            p={2}
          />
        </ModalBody>
        <ModalFooter mr={'auto'} gap={'4'}>
          <Button
            color={'white'}
            bg={'#DC2626'}
            isLoading={loading}
            spinner={<Loader size={'16px'} />}
            loadingText="Deleting..."
            _hover={{ bg: '#DC2626' }}
            onClick={handleDelDevbox}
            isDisabled={inputValue !== devbox.name}
          >
            {t('confirm_delete')}
          </Button>
          <Button
            onClick={onClose}
            variant={'outline'}
            boxShadow={'none'}
            _hover={{ bg: 'grayModern.50' }}
          >
            {t('cancel')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DelModal;
