import Notification from '@/components/notification';
import { useCopyData } from '@/hooks/useCopyData';
import { useConfigStore } from '@/stores/config';
import useSessionStore from '@/stores/session';
import download from '@/utils/downloadFIle';
import {
  Box,
  Button,
  Center,
  Flex,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { CopyIcon, DocsIcon, DownloadIcon, LogoutIcon, NotificationIcon } from '@sealos/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import LangSelectSimple from '../LangSelect/simple';
import { blurBackgroundStyles } from '../desktop_content';
import RegionToggle from '../region/RegionToggle';
import WorkspaceToggle from '../team/WorkspaceToggle';
import GithubComponent from './github';
import { ArrowIcon, ChevronDownIcon } from '../icons';
import useAppStore from '@/stores/app';
import AccountCenter from './AccountCenter';
import CustomTooltip from '../AppDock/CustomTooltip';

const baseItemStyle = {
  w: '52px',
  h: '40px',
  background: 'rgba(255, 255, 255, 0.07)',
  color: 'white',
  borderRadius: '100px',
  _hover: {
    background: 'rgba(255, 255, 255, 0.15)'
  }
};

{
  /* <Flex height={'68px'} px="32px" alignItems="center" justifyContent="space-between">
        <Flex alignItems="center" gap="4">
          <Box>
            <img src="/logo.svg" alt="Logo" width="32" height="32" />
          </Box>
          <Flex alignItems="center" gap="1">
            <Box fontWeight="medium">Hong Kong</Box>
            <Box color="gray.500">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Box>
          </Flex>
          <Box mx="2" color="gray.300">
            /
          </Box>
          <Flex alignItems="center" gap="1">
            <Box fontWeight="medium">Workspace-1</Box>
            <Box color="gray.500">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Box>
          </Flex>
        </Flex>

        <Flex alignItems="center" gap="4">
          <Flex
            alignItems="center"
            gap="1"
            bg="blue.50"
            color="blue.600"
            px="3"
            py="1.5"
            borderRadius="md"
          >
            <Box as="span">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Box>
            <Box fontWeight="medium">升级计划</Box>
          </Flex>

          <Box fontWeight="medium">Guide</Box>
          <Box fontWeight="medium">Docs</Box>

          <Box position="relative">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.73 21a2 2 0 0 1-3.46 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>

          <Box
            width="32px"
            height="32px"
            borderRadius="full"
            overflow="hidden"
            bg="orange.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="orange.600"
            fontWeight="bold"
          >
            用户
          </Box>
        </Flex>
      </Flex> */
}

export default function Account() {
  const { layoutConfig } = useConfigStore();
  const [showId, setShowId] = useState(true);
  const router = useRouter();
  const { copyData } = useCopyData();
  const { t } = useTranslation();
  const { delSession, session, setToken } = useSessionStore();
  const user = session?.user;
  const queryclient = useQueryClient();
  const kubeconfig = session?.kubeconfig || '';
  const showDisclosure = useDisclosure();
  const [notificationAmount, setNotificationAmount] = useState(0);
  const { installedApps, openApp } = useAppStore();

  const onAmount = useCallback((amount: number) => setNotificationAmount(amount), []);

  const logout = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    delSession();
    queryclient.clear();
    router.replace('/signin');
    setToken('');
  };

  const openWorkOrderApp = () => {
    const workorder = installedApps.find((t) => t.key === 'system-workorder');
    if (!workorder) return;
    openApp(workorder);
  };

  return (
    <Box position={'relative'} flex={1} bg={'red'}>
      <Flex position={'relative'} zIndex={3} height={'100%'} alignItems={'center'}>
        <Flex mt={'16px'} justifyContent={'space-between'} position={'relative'}>
          {layoutConfig?.common.docsUrl && (
            <CustomTooltip placement={'bottom'} label={t('common:doc')}>
              <Center
                cursor={'pointer'}
                {...baseItemStyle}
                onClick={() => window.open(layoutConfig?.common?.docsUrl)}
              >
                <DocsIcon />
              </Center>
            </CustomTooltip>
          )}
          <CustomTooltip placement={'bottom'} label={t('common:language')}>
            <Center>
              <LangSelectSimple {...baseItemStyle} />
            </Center>
          </CustomTooltip>
          {layoutConfig?.common.githubStarEnabled && (
            <CustomTooltip placement="bottom" label={t('common:github')}>
              <Center>
                <GithubComponent {...baseItemStyle} />
              </Center>
            </CustomTooltip>
          )}

          <CustomTooltip placement={'bottom'} label={t('common:notification')}>
            <Center cursor={'pointer'} {...baseItemStyle} onClick={() => showDisclosure.onOpen()}>
              <NotificationIcon color={'white'} />
            </Center>
          </CustomTooltip>
          <Notification key={'notification'} disclosure={showDisclosure} onAmount={onAmount} />
        </Flex>

        <RegionToggle />

        <WorkspaceToggle />

        {layoutConfig?.common.accountSettingEnabled && (
          <Flex
            borderBottom={'1px solid rgba(255, 255, 255, 0.05)'}
            color={'white'}
            fontSize={'base'}
            fontWeight={'bold'}
            justifyContent={'space-between'}
            alignItems={'center'}
            py={'12px'}
            px={'16px'}
          >
            <Text>{t('common:account_settings')}</Text>
            <AccountCenter variant={'white-bg-icon'} p="4px" />
          </Flex>
        )}

        {layoutConfig?.common.workorderEnabled && (
          <Flex
            borderBottom={'1px solid rgba(255, 255, 255, 0.05)'}
            color={'white'}
            fontSize={'base'}
            fontWeight={'bold'}
            justifyContent={'space-between'}
            alignItems={'center'}
            py={'12px'}
            px={'16px'}
          >
            <Text>{t('common:work_order')}</Text>
            <IconButton
              variant={'white-bg-icon'}
              p="4px"
              onClick={openWorkOrderApp}
              icon={<ArrowIcon fill={'rgba(255, 255, 255, 0.7)'} />}
              aria-label={'setting'}
            />
          </Flex>
        )}

        <Flex
          color={'white'}
          fontSize={'base'}
          fontWeight={'bold'}
          justifyContent={'space-between'}
          alignItems={'center'}
          py={'12px'}
          px={'16px'}
        >
          <Text>Kubeconfig</Text>
          <Flex alignItems={'center'}>
            <IconButton
              variant={'white-bg-icon'}
              p="4px"
              ml="auto"
              mr="4px"
              onClick={() => kubeconfig && download('kubeconfig.yaml', kubeconfig)}
              icon={
                <DownloadIcon
                  boxSize={'16px'}
                  color={'rgba(255, 255, 255, 0.7)'}
                  fill={'rgba(255, 255, 255, 0.7)'}
                />
              }
              aria-label={'Download kc'}
            />
            <IconButton
              variant={'white-bg-icon'}
              p="4px"
              onClick={() => kubeconfig && copyData(kubeconfig)}
              icon={<CopyIcon boxSize={'16px'} fill={'rgba(255, 255, 255, 0.7)'} />}
              aria-label={'copy kc'}
            />
          </Flex>
        </Flex>
        <Flex alignItems={'center'}>
          <Box>
            <Text lineHeight={'20px'} color={'white'} fontSize={'14px'} fontWeight={500}>
              {user?.name}
            </Text>
            <Flex
              cursor={'pointer'}
              gap="2px"
              fontSize={'11px'}
              lineHeight={'16px'}
              fontWeight={'500'}
              color={'rgba(255, 255, 255, 0.70)'}
              alignItems={'center'}
            >
              <Text onClick={() => setShowId((s) => !s)}>
                {showId ? `ID:${user?.userId}` : `NS:${user?.nsid}`}
              </Text>
              <CopyIcon
                onClick={() => {
                  if (user?.userId && user.nsid) copyData(showId ? user?.userId : user?.nsid);
                }}
                boxSize={'12px'}
                fill={'rgba(255, 255, 255, 0.70)'}
              />
            </Flex>
          </Box>
          <Center
            p={'4px'}
            h={'fit-content'}
            borderRadius={'4px'}
            ml={'auto'}
            cursor={'pointer'}
            _hover={{
              background: 'rgba(255, 255, 255, 0.15)'
            }}
          >
            <LogoutIcon boxSize={'14px'} fill={'white'} />
            <Text ml="4px" color={'white'} fontSize={'12px'} fontWeight={500} onClick={logout}>
              {t('common:log_out')}
            </Text>
          </Center>
        </Flex>

        <Menu>
          <MenuButton height={'40px'} width={'40px'}>
            <Center width={'40px'} height={'40px'} bg={'#9FC0FF'} borderRadius="full" mr={'8px'}>
              <Image
                width={user?.avatar && user.avatar.trim() !== '' ? 'full' : '20px'}
                height={user?.avatar && user.avatar.trim() !== '' ? 'full' : '20px'}
                objectFit={'cover'}
                borderRadius="full"
                src={user?.avatar}
                fallbackSrc={'/images/default-user.svg'}
                alt="user avator"
                draggable={'false'}
              />
            </Center>
          </MenuButton>
          <MenuList p="0" borderRadius="12px" overflow="hidden" boxShadow="lg" minW="280px">
            <Box p="24px">
              <Button
                size="sm"
                height="32px"
                px="16px"
                bg="#1677FF"
                color="white"
                borderRadius="32px"
                fontSize="14px"
                fontWeight="500"
                mb="16px"
                _hover={{ bg: '#1677FF' }}
              >
                FREE
              </Button>
              <Text fontSize="24px" fontWeight="600" lineHeight="32px" mb="8px">
                {user?.name}
              </Text>
              <Text color="#666666" fontSize="14px" lineHeight="22px">
                ID:{user?.userId}
              </Text>
              <Text color="#666666" fontSize="14px" lineHeight="22px">
                NS:{user?.nsid}
              </Text>
            </Box>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
}
