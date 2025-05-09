import { useCallback, useRef, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  useDisclosure,
  Text,
  List,
  ListItem,
  Select,
  Flex
} from '@chakra-ui/react';
import { useTranslations } from 'next-intl';


export const useScheduleModal = ({
  title = 'prompt',
  defaultPauseTime = -1
}: {
  title?: string;
  defaultPauseTime?: number;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const t = useTranslations();
  const [pauseTime, setPauseTime] = useState(defaultPauseTime);
  const confirmCb = useRef<any>();
  const cancelCb = useRef<any>();

  const openConfirm = useCallback(
    (confirm?: any, cancel?: any) => {
      return function () {
        onOpen();
        confirmCb.current = confirm;
        cancelCb.current = cancel;
      };
    },
    [onOpen]
  );

  const ConfirmModal = (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t(title)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box bg={'#EFF6FF'} fontSize={'14px'} color={'#18181B'} lineHeight={'20px'} p={'16px'} mb={'16px'} borderRadius={'8px'}>
            <Text>
              {t('scheduleTipTitle')}
            </Text>
            <List styleType={'disc'} pl={4}>
              <ListItem>
                {t.rich('scheduleTipDesc1', {
                  highlight: (chunks) => <Text as="span" fontWeight={'bold'}>{chunks}</Text>
                })}
              </ListItem>
              <ListItem>
                {t.rich('scheduleTipDesc2', {
                  highlight: (chunks) => <Text as="span" fontWeight={'bold'}>{chunks}</Text>
                })}
              </ListItem>
            </List>
          </Box>
          <Box mb={'16px'}>
            <Text mb={2} fontSize={'14px'} fontWeight={'500'} color={'#71717A'}>
              {t('pauseAfter')}
            </Text>
            <Select h={'40px'} value={pauseTime} onChange={(e) => setPauseTime(+e.target.value)}>
              <option value="-1">never</option>
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="6">6 hours</option>
              <option value="12">12 hours</option>
              <option value="24">24 hours</option>
            </Select>
          </Box>
          <Flex gap={'12px'}>
            <Button
              variant={'solid'}
              onClick={() => {
                onClose();
                typeof confirmCb.current === 'function' && confirmCb.current(pauseTime);
              }}
            >
              {t('confirm')}
            </Button>
            <Button 
              variant={'outline'}
              onClick={() => {
                onClose();
                typeof cancelCb.current === 'function' && cancelCb.current();
              }}
            >
              {t('cancel')}
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  return {
    openConfirm,
    ConfirmModal
  };
};
