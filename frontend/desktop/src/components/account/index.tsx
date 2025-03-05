import Notification from '@/components/notification';
import { useCopyData } from '@/hooks/useCopyData';
import { useConfigStore } from '@/stores/config';
import useSessionStore from '@/stores/session';
import download from '@/utils/downloadFIle';
import {
  Box,
  Button,
  Center,
  Divider,
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
import { useCallback, useRef, useState } from 'react';
import LangSelectSimple from '../LangSelect/simple';
import { blurBackgroundStyles } from '../desktop_content';
import RegionToggle from '../region/RegionToggle';
import WorkspaceToggle from '../team/WorkspaceToggle';
import GithubComponent from './github';
import { ArrowIcon, ChevronDownIcon } from '../icons';
import useAppStore from '@/stores/app';
import AccountCenter, { AccountCenterRef } from './AccountCenter';
import CustomTooltip from '../AppDock/CustomTooltip';
import {
  User,
  BarChart2,
  CreditCard,
  Settings,
  Download,
  LogOut,
  Copy,
  Bell,
  Sparkles
} from 'lucide-react';
import UpgradePlanModal from './UpgradePlanModal';

const baseItemStyle = {
  minW: '40px',
  h: '40px',
  fontSize: '14px',
  fontWeight: '500',
  color: '#262626'
};

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
  const accountCenterRef = useRef<AccountCenterRef>(null);
  const onAmount = useCallback((amount: number) => setNotificationAmount(amount), []);
  const upgradePlanDisclosure = useDisclosure();

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
    <Box position={'relative'} flex={1}>
      <Flex justifyContent={'space-between'} alignItems={'center'} height={'100%'} zIndex={3}>
        <Flex alignItems={'center'} gap={'12px'}>
          <Center boxSize={'40px'} bg={'#FFF'} borderRadius={'full'}>
            <Image src={'/logo.svg'} alt="Logo" width="32px" height="32px" />
          </Center>

          <RegionToggle />

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="8"
            height="24"
            viewBox="0 0 8 24"
            fill="none"
          >
            <path
              d="M1 22.625L6.69402 1.37463"
              stroke="black"
              strokeOpacity="0.15"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          <WorkspaceToggle />
        </Flex>

        <Flex gap={'12px'} position={'relative'} zIndex={3} height={'100%'} alignItems={'center'}>
          <AccountCenter ref={accountCenterRef} variant={'white-bg-icon'} p="4px" />

          {/* {layoutConfig?.common.workorderEnabled && (
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
          )} */}

          <Box
            cursor={'pointer'}
            height="36px"
            padding="8px 12px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap="6px"
            borderRadius="8px"
            background="linear-gradient(95deg, rgba(73, 116, 255, 0.15) 3.77%, rgba(38, 53, 255, 0.15) 67.5%)"
            _hover={{
              background:
                'linear-gradient(95deg, rgba(73, 116, 255, 0.15) 3.77%, rgba(38, 53, 255, 0.15) 67.5%)'
            }}
            onClick={upgradePlanDisclosure.onOpen}
          >
            <Sparkles size={16} color="#1C4EF5" />
            <Text color="#1C4EF5" fontWeight="medium">
              {t('cc:upgrade_plan')}
            </Text>
          </Box>

          <Center
            cursor={'pointer'}
            {...baseItemStyle}
            px={'8px'}
            borderRadius={'8px'}
            _hover={{
              background: 'rgba(0, 0, 0, 0.05);'
            }}
            onClick={() => window.open(layoutConfig?.common?.docsUrl)}
          >
            {t('cc:guide')}
          </Center>

          {layoutConfig?.common.docsUrl && (
            <Center
              cursor={'pointer'}
              {...baseItemStyle}
              borderRadius={'8px'}
              px={'8px'}
              _hover={{
                background: 'rgba(0, 0, 0, 0.05);'
              }}
              onClick={() => window.open(layoutConfig?.common?.docsUrl)}
            >
              {t('common:doc')}
            </Center>
          )}

          <Box>
            <Center
              cursor={'pointer'}
              {...baseItemStyle}
              borderRadius={'full'}
              _hover={{
                background: '#FFF'
              }}
              background={showDisclosure.isOpen ? '#FFF' : 'transparent'}
              onClick={() => showDisclosure.onOpen()}
            >
              <Bell size={20} color={'#262626'} />
            </Center>
            <Notification key={'notification'} disclosure={showDisclosure} onAmount={onAmount} />
          </Box>
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
            <MenuList p="0" borderRadius="12px" overflow="hidden" boxShadow="lg" minW="246px">
              <Box p="16px">
                <Button
                  width={'46px'}
                  height="24px"
                  size="sm"
                  px="16px"
                  bg="#1C4EF5"
                  color="white"
                  borderRadius="32px"
                  fontSize="12px"
                  fontWeight="500"
                  mb="16px"
                  _hover={{ bg: '#1677FF' }}
                >
                  FREE
                </Button>
                <Text color={'#18181B'} fontSize="14px" fontWeight="500" mb="8px">
                  {user?.name}
                </Text>
                <Text color="#737373" fontSize="14px" lineHeight="22px" mb="4px">
                  ID:{user?.userId}
                </Text>
                <Text color="#737373" fontSize="14px" lineHeight="22px">
                  NS:{user?.nsid}
                </Text>
              </Box>
              <Divider borderColor={'#F4F4F5'} />
              <Box p={'8px'}>
                {layoutConfig?.common.accountSettingEnabled && (
                  <MenuItem
                    mt="0px"
                    py="6px"
                    px="8px"
                    borderRadius="8px"
                    _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
                    onClick={() => accountCenterRef.current?.openModal()}
                  >
                    <Flex alignItems="center" gap="8px">
                      <Center w="20px" h="20px">
                        <User size={16} color="#737373" />
                      </Center>
                      <Text fontSize="14px" fontWeight="500">
                        {t('common:account_settings')}
                      </Text>
                    </Flex>
                  </MenuItem>
                )}

                <MenuItem
                  mt="0px"
                  py="6px"
                  px="8px"
                  borderRadius="8px"
                  _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
                  onClick={() => router.push('/account/usage')}
                >
                  <Flex alignItems="center" gap="8px">
                    <Center w="20px" h="20px">
                      <BarChart2 size={16} color="#737373" />
                    </Center>
                    <Text fontSize="14px" fontWeight="500">
                      {t('cc:usage_analysis')}
                    </Text>
                  </Flex>
                </MenuItem>

                <MenuItem
                  py="6px"
                  px="8px"
                  borderRadius="8px"
                  _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
                  onClick={() => router.push('/account/billing')}
                >
                  <Flex alignItems="center" gap="8px">
                    <Center w="20px" h="20px">
                      <CreditCard size={16} color="#737373" />
                    </Center>
                    <Text fontSize="14px" fontWeight="500">
                      {t('cc:plan_and_billing')}
                    </Text>
                  </Flex>
                </MenuItem>

                <MenuItem
                  py="6px"
                  px="8px"
                  borderRadius="8px"
                  _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
                  onClick={() => router.push('/account/settings')}
                >
                  <Flex alignItems="center" gap="8px">
                    <Center w="20px" h="20px">
                      <Settings size={16} color="#737373" />
                    </Center>
                    <Text fontSize="14px" fontWeight="500">
                      {t('cc:settings')}
                    </Text>
                  </Flex>
                </MenuItem>

                <MenuItem
                  py="6px"
                  px="8px"
                  borderRadius="8px"
                  _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
                  onClick={() => kubeconfig && download('kubeconfig.yaml', kubeconfig)}
                >
                  <Flex alignItems="center" gap="8px" justifyContent="space-between" width="100%">
                    <Flex alignItems="center" gap="8px">
                      <Center w="20px" h="20px">
                        <Download size={16} color="#737373" />
                      </Center>
                      <Text fontSize="14px" fontWeight="500">
                        Kubeconfig
                      </Text>
                    </Flex>
                    <IconButton
                      size="16px"
                      variant="ghost"
                      icon={<Copy size="16px" color="#737373" />}
                      aria-label="Copy Kubeconfig"
                      onClick={(e) => {
                        e.stopPropagation();
                        kubeconfig && copyData(kubeconfig);
                      }}
                    />
                  </Flex>
                </MenuItem>
              </Box>
              <Divider bg={'#E4E4E7'} />
              <Box p="8px">
                <MenuItem
                  py="6px"
                  px="8px"
                  borderRadius="8px"
                  _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
                  onClick={logout}
                >
                  <Flex alignItems="center" gap="8px" justifyContent="space-between" width="100%">
                    <Flex alignItems="center" gap="8px">
                      <Center w="20px" h="20px">
                        <LogOut size={16} color="#737373" />
                      </Center>
                      <Text fontSize="14px" fontWeight="500">
                        {t('common:log_out')}
                      </Text>
                    </Flex>
                  </Flex>
                </MenuItem>
              </Box>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      <UpgradePlanModal
        isOpen={upgradePlanDisclosure.isOpen}
        onClose={upgradePlanDisclosure.onClose}
      />
    </Box>
  );
}
