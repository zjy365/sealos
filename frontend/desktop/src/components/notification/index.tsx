import Iconfont from '@/components/iconfont';
import request from '@/services/request';
import useAppStore from '@/stores/app';
import { formatTime } from '@/utils/tools';
import { Box, Button, Center, Flex, Text, UseDisclosureReturn } from '@chakra-ui/react';
import { ClearOutlineIcon, CloseIcon, NotificationIcon, WarnIcon, useMessage } from '@sealos/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { produce } from 'immer';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';
import styles from './index.module.scss';
import { TNotification } from '@/types';
import { listNotification } from '@/api/platform';
import { TriangleAlert, X } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
dayjs.extend(relativeTime);
dayjs.locale('en');

type NotificationProps = {
  disclosure: UseDisclosureReturn;
  onAmount: (amount: number) => void;
};

export default function Notification(props: NotificationProps) {
  const { t, i18n } = useTranslation();
  const { disclosure, onAmount } = props;
  const { installedApps, openApp } = useAppStore();
  const [notifications, setNotifications] = useState<TNotification[]>([]);
  const { message } = useMessage();
  const isForbiddenRef = useRef(false);

  const [MessageConfig, setMessageConfig] = useState<{
    popupMessage?: TNotification;
  }>({
    popupMessage: undefined
  });

  const { refetch } = useQuery(['getNotifications'], () => listNotification(), {
    onSuccess: (data) => {
      if (data.data) {
        handleNotificationData(data.data);
      }
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000
  });

  const compareByTimestamp = (a: TNotification, b: TNotification) => b?.timestamp - a?.timestamp;

  const handleNotificationData = (data: TNotification[]) => {
    const sortedMessages = data.sort(compareByTimestamp);
    const unReadCount = data.filter((item) => !item.isRead).length;

    if (
      sortedMessages?.[0]?.desktopPopup &&
      !isForbiddenRef.current &&
      !sortedMessages?.[0]?.isRead
    ) {
      setMessageConfig(
        produce((draft) => {
          draft.popupMessage = sortedMessages[0];
        })
      );
    }

    onAmount(unReadCount);
    setNotifications(sortedMessages);
  };

  const readMsgMutation = useMutation({
    mutationFn: (name: string[]) =>
      request.post<{ code: number; reason: string }>('/api/notification/read', { name }),
    onSettled: () => refetch(),
    onSuccess: (data) => {
      if (data.data.code === 403) {
        isForbiddenRef.current = true;
        message({
          status: 'warning',
          title: data.data.reason
        });
        setMessageConfig(
          produce((draft) => {
            draft.popupMessage = undefined;
          })
        );
      }
    }
  });

  const handleReadMessage = (item: TNotification) => {
    if (!item.isRead) {
      readMsgMutation.mutate([item?.name]);
    }
  };

  const handleCharge = () => {
    const costCenter = installedApps.find((i) => i.key === 'system-costcenter');
    if (!costCenter) return;
    openApp(costCenter, {
      query: {
        openRecharge: 'true'
      }
    });
  };

  useEffect(() => {
    if (i18n.language) {
      refetch();
    }
  }, [i18n.language, refetch]);

  const getNotificationIcon = (from: string | undefined) => {
    switch (from) {
      case 'Debt-System':
        return <WarnIcon />;
      case 'Active-System':
        return '🎉';
      default:
        return <NotificationIcon color={'brightBlue.300'} />;
    }
  };

  const getNotificationIconColor = (from: string | undefined) => {
    switch (from) {
      case 'Debt-System':
        return '#DC2626';
      case 'Active-System':
        return '#F97316';
      default:
        return '#F97316';
    }
  };

  const markAllAsRead = () => {
    const names = notifications?.map((item: TNotification) => item?.name);
    readMsgMutation.mutate(names);
    setMessageConfig(
      produce((draft) => {
        draft.popupMessage = undefined;
      })
    );
  };

  return disclosure.isOpen ? (
    <>
      <Box className={styles.bg} onClick={() => disclosure.onClose()} cursor={'auto'}></Box>
      <Box className={clsx(styles.container)}>
        <Flex
          h={'44px'}
          alignItems={'center'}
          position="relative"
          pl={'20px'}
          pr={'16px'}
          borderBottom={'1px solid #F4F4F5'}
        >
          <Text>{t('cc:alert')}</Text>

          <Flex alignItems={'center'} gap={'12px'} ml={'auto'} cursor={'pointer'}>
            <Text color={'#1C4EF5'} fontSize={'12px'} fontWeight={500} onClick={markAllAsRead}>
              {t('common:read_all')}
            </Text>
            <X
              cursor={'pointer'}
              size={16}
              color="#737373"
              onClick={() => disclosure.onClose()}
              style={{ marginLeft: 'auto' }}
            />
          </Flex>
        </Flex>

        <Flex direction={'column'} h="430px" className={styles.scrollWrap}>
          {notifications?.map((item: TNotification) => (
            <Flex
              cursor={'pointer'}
              key={item?.uid}
              onClick={() => handleReadMessage(item)}
              position="relative"
              borderBottom={'1px solid #f4f4f5'}
              p={'12px 20px'}
              gap={'12px'}
            >
              <Center
                flexShrink={0}
                width="32px"
                height="32px"
                borderRadius="full"
                border="1px solid #F4F4F5"
                position={'relative'}
              >
                <TriangleAlert size={20} color={getNotificationIconColor(item?.i18n['en']?.from)} />
                {!item.isRead && (
                  <Box
                    position="absolute"
                    top="0px"
                    right="0px"
                    w="6px"
                    h="6px"
                    borderRadius="50%"
                    bg="red.500"
                  />
                )}
              </Center>
              <Box>
                <Text fontSize={'14px'} fontWeight={500} color={'#000000'}>
                  {item.i18n[i18n.language]?.title}
                </Text>
                <Text
                  height={'32px'}
                  mt={'2px'}
                  whiteSpace="pre-wrap"
                  fontSize={'12px'}
                  color={'#737373'}
                  noOfLines={2}
                  overflow={'hidden'}
                  textOverflow={'ellipsis'}
                >
                  {item.i18n[i18n.language]?.message}
                </Text>
                <Text mt="8px" fontSize={'14px'} fontWeight={400} color={'#18181B'}>
                  {dayjs((item?.timestamp || 0) * 1000).fromNow()}
                </Text>
              </Box>
            </Flex>
          ))}
        </Flex>
      </Box>
    </>
  ) : (
    <>
      {MessageConfig?.popupMessage && (
        <Box
          cursor={'default'}
          position={'absolute'}
          w="396px"
          top={'70px'}
          right={'60px'}
          bg="#FFF"
          boxShadow={'0px 4px 12px 0px rgba(0, 0, 0, 0.08)'}
          borderRadius={'12px'}
          p="24px"
          zIndex={9}
        >
          <Flex alignItems={'center'} position={'relative'}>
            <TriangleAlert
              size={20}
              color={getNotificationIconColor(MessageConfig.popupMessage?.i18n['en']?.from)}
            />
            <Text fontSize={'16px'} fontWeight={600} ml="6px">
              {MessageConfig.popupMessage?.i18n[i18n.language]?.title}
            </Text>
            <X
              size={20}
              color="#18181B"
              style={{
                position: 'absolute',
                right: '0px',
                top: '0px',
                color: '#18181B'
              }}
              cursor={'pointer'}
              onClick={() => {
                const temp = MessageConfig.popupMessage;
                setMessageConfig(
                  produce((draft) => {
                    draft.popupMessage = undefined;
                  })
                );
                readMsgMutation.mutate([temp?.name || '']);
              }}
            />
          </Flex>
          <Text whiteSpace="pre-wrap" mt="8px" fontSize={'14px'} fontWeight={400} color={'#18181B'}>
            {MessageConfig.popupMessage?.i18n[i18n.language]?.message}
          </Text>

          <Flex alignItems={'center'} mt="16px">
            {MessageConfig.popupMessage?.i18n['en']?.from === 'Debt-System' && (
              <Button
                w="92px"
                h="32px"
                variant={'solid'}
                color={'#FAFAFA'}
                borderRadius={'8px'}
                onClick={() => {
                  const temp = MessageConfig.popupMessage;
                  setMessageConfig(
                    produce((draft) => {
                      draft.popupMessage = undefined;
                    })
                  );
                  readMsgMutation.mutate([temp?.name || '']);
                  handleCharge();
                }}
              >
                {t('common:charge')}
              </Button>
            )}
          </Flex>
        </Box>
      )}
    </>
  );
}
