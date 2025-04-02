import {
  Text,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalOverlay,
  useDisclosure,
  ButtonProps,
  SimpleGrid,
  Box,
  IconButton,
  HStack,
  Spinner,
  VStack,
  Grid,
  GridItem,
  Flex
} from '@chakra-ui/react';
import ListIcon from '@/components/Icons/ListIcon';
import { initUser } from '@/api/bucket';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { QueryKey } from '@/consts';
import { useCopyData } from '@/utils/tools';
import CopyIcon from '@/components/Icons/CopyIcon';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import UpdateSecretKeyModal from '../UpdateSecretKeyModal';
import useSessionStore from '@/store/session';
import { useOssStore } from '@/store/ossStore';
export default function ParamterModal({ ...styles }: ButtonProps) {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { copyData } = useCopyData();
  const { t } = useTranslation();
  const { session } = useSessionStore();
  const { secret, setSecret, setIsUpdating } = useOssStore();
  // const {isUpdating}

  const miniouser = useQuery([QueryKey.bucketUser, { session }], initUser, {
    refetchInterval(data, query) {
      const newSecret = data?.secret;
      const needRefresh = !newSecret || newSecret.specVersion > newSecret.version;
      if (needRefresh) {
        return 3000;
      } else {
        return false;
      }
    }
  });

  useEffect(() => {
    if (miniouser.isSuccess) {
      const newSecret = miniouser.data.secret;
      if (newSecret.specVersion <= newSecret.version) {
        setIsUpdating(false);
        setSecret(newSecret);
      } else {
        setIsUpdating(true);
      }
    } else {
      setIsUpdating(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [miniouser.data]);

  const accessKey = secret?.CONSOLE_ACCESS_KEY || '';
  const secretKey = secret?.CONSOLE_SECRET_KEY || '';
  const internal = secret?.internal || '';
  const external = secret?.external || '';
  const itemList: { key: string; value: string }[] = useMemo(
    () => [
      { key: 'Access Key', value: accessKey },
      { key: 'Secret Key', value: secretKey },
      { key: 'Internal', value: internal },
      { key: 'External', value: external }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [secret]
  );
  return (
    <>
      <Button
        onClick={onOpen}
        gap={'8px'}
        variant={'outline'}
        color={'#18181B'}
        fontWeight={500}
        {...styles}
      >
        <Text>{t('s3ServiceParams')}</Text>
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered trapFocus={false}>
        <ModalOverlay />
        <ModalContent maxW={'600px'} bgColor={'#FFF'} backdropFilter="blur(150px)">
          <ModalCloseButton />
          <ModalHeader>{t('s3ServiceParams')}</ModalHeader>
          <ModalBody h="100%" w="100%">
            {miniouser.isSuccess ? (
              <VStack gap={'16px'} width={'full'} flex={1}>
                <Flex p={'16px'} w={'full'} bg={'#EFF6FF'} borderRadius={'8px'}>
                  <Text fontSize={'14px'}>{t('accessKeyTip')}</Text>
                </Flex>
                <Flex flexDirection={'column'} width={'full'} rowGap={'16px'} columnGap={'60px'}>
                  {itemList.map((item) => (
                    <Flex
                      h={'48px'}
                      borderBottom={'1px solid #F1F1F3'}
                      key={item.key}
                      alignItems={'center'}
                    >
                      <Text width={'120px'}>{item.key}</Text>
                      <HStack flex={1} gap="9px" color={'grayModern.700'}>
                        <Text textOverflow={'ellipsis'} whiteSpace={'nowrap'} overflow={'hidden'}>
                          {item.value}
                        </Text>
                        <IconButton
                          aria-label={'copy'}
                          variant={'white-bg-icon'}
                          p="4px"
                          icon={<CopyIcon boxSize={'14px'} />}
                          onClick={() => {
                            copyData(item.value);
                          }}
                        />
                        {'Secret Key' === item.key && (
                          <Flex flex={1} justifyContent={'flex-end'}>
                            <UpdateSecretKeyModal />
                          </Flex>
                        )}
                      </HStack>
                    </Flex>
                  ))}
                </Flex>
              </VStack>
            ) : (
              <Spinner />
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant={'solid'}
              alignSelf={'self-end'}
              px="13.5px"
              py="10px"
              fontWeight={'500'}
              onClick={() => {
                onClose();
              }}
            >
              {t('confirm')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
