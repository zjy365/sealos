import { useMessage } from '@sealos/ui';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { sealosApp } from 'sealos-desktop-sdk/app';
import { Box, Button, Flex } from '@chakra-ui/react';
import { useCallback, useMemo, useState } from 'react';

import { useRouter } from '@/i18n';
import { useDevboxStore } from '@/stores/devbox';
import { useGlobalStore } from '@/stores/global';
import { restartDevbox, startDevbox } from '@/api/devbox';

import { DevboxDetailTypeV2 } from '@/types/devbox';

import MyIcon from '@/components/Icon';
import IDEButton from '@/components/IDEButton';
import DelModal from '@/components/modals/DelModal';
import DevboxStatusTag from '@/components/DevboxStatusTag';
import { ArrowLeft } from 'lucide-react';
import ShutdownModal from '@/components/modals/ShutdownModal';
import { DevboxStatusEnum } from '@/constants/devbox';

const Header = ({ refetchDevboxDetail }: { refetchDevboxDetail: () => void }) => {
  const router = useRouter();
  const t = useTranslations();
  const { message: toast } = useMessage();

  const { screenWidth, setLoading } = useGlobalStore();

  const { devboxDetail, setDevboxList } = useDevboxStore();
  const isBigButton = useMemo(() => screenWidth > 1000, [screenWidth]);

  const [onOpenShutdown, setOnOpenShutdown] = useState(false);
  const [delDevbox, setDelDevbox] = useState<DevboxDetailTypeV2 | null>(null);

  const { refetch: refetchDevboxList } = useQuery(['devboxListQuery'], setDevboxList, {
    onSettled(res) {
      if (!res) return;
    }
  });

  const handleRestartDevbox = useCallback(
    async (devbox: DevboxDetailTypeV2) => {
      try {
        setLoading(true);
        await restartDevbox({ devboxName: devbox.name });
        toast({
          title: t('restart_success'),
          status: 'success'
        });
      } catch (error: any) {
        toast({
          title: typeof error === 'string' ? error : error.message || t('restart_error'),
          status: 'error'
        });
        console.error(error, '==');
      }
      refetchDevboxDetail();
      setLoading(false);
    },
    [setLoading, t, toast, refetchDevboxDetail]
  );
  const handleStartDevbox = useCallback(
    async (devbox: DevboxDetailTypeV2) => {
      try {
        setLoading(true);
        await startDevbox({ devboxName: devbox.name });
        toast({
          title: t('start_success'),
          status: 'success'
        });
      } catch (error: any) {
        toast({
          title: typeof error === 'string' ? error : error.message || t('start_error'),
          status: 'error'
        });
        console.error(error, '==');
      }
      refetchDevboxDetail();
      setLoading(false);
    },
    [setLoading, t, toast, refetchDevboxDetail]
  );
  const handleGoToTerminal = useCallback(
    async (devbox: DevboxDetailTypeV2) => {
      const defaultCommand = `kubectl exec -it $(kubectl get po -l app.kubernetes.io/name=${devbox.name} -oname) -- sh -c "clear; (bash || ash || sh)"`;
      try {
        sealosApp.runEvents('openDesktopApp', {
          appKey: 'system-terminal',
          query: {
            defaultCommand
          },
          messageData: { type: 'new terminal', command: defaultCommand }
        });
      } catch (error: any) {
        toast({
          title: typeof error === 'string' ? error : error.message || t('jump_terminal_error'),
          status: 'error'
        });
        console.error(error);
      }
    },
    [t, toast]
  );
  if (!devboxDetail) return null;
  return (
    <Flex justify="space-between" align="center" pt={2} flexWrap={'wrap'} gap={5}>
      {/* left back button and title */}
      <Flex alignItems={'center'} gap={2} p={0} cursor={'pointer'} onClick={() => router.push('/')}>
        <ArrowLeft size={'24px'} />
        <Box fontSize="24px" fontWeight="600">
          {devboxDetail.name}
        </Box>
        {/* status  */}
        <DevboxStatusTag
            status={devboxDetail.status}
            h={'27px'}
            isShutdown={devboxDetail.status.value === DevboxStatusEnum.Shutdown}
          />
      </Flex>
      {/* right main button group */}
      <Flex gap={'12px'}>
        {/* delete button */}
        <Button
          h={'40px'}
          fontSize={'14px'}
          boxShadow={'none'}
          bg={'white'}
          color={'#737373'}
          _hover={{
            color: 'red.600'
          }}
          borderWidth={1}
          onClick={() => setDelDevbox(devboxDetail)}
        >
          <MyIcon name={'delete'} w={'16px'} />
        </Button>
        {/* terminal button */}
        <Button
          boxShadow={'none'}
          h={'40px'}
          fontSize={'14px'}
          bg={'white'}
          color={'grayModern.400'}
          _hover={{
            bg: 'grayModern.50'
          }}
          borderWidth={1}
          onClick={() => handleGoToTerminal(devboxDetail)}
        >
          <MyIcon name={'terminal'} w={'16px'} color={'white'} />
        </Button>

        {/* control button group */}
        <Flex>
          {/* shutdown button */}
          {devboxDetail.status.value === 'Running' && (
            <Button
              className="guide-close-button"
              h={'40px'}
              fontSize={'14px'}
              boxShadow={'none'}
              w={'96px'}
              bg={'white'}
              borderRadius={'8px 0px 0px 8px'}
              color={'grayModern.900'}
              _hover={{
                color: 'brightBlue.600'
              }}
              borderWidth={'1px'}
              onClick={() => setOnOpenShutdown(true)}
            >
              {t('pause')}
            </Button>
          )}
          {/* start button */}
          {devboxDetail.status.value === 'Stopped' && (
            <Button
              h={'40px'}
              boxShadow={'none'}
              fontSize={'14px'}
              bg={'white'}
              w={'96px'}
              borderRadius={'8px 0px 0px 8px'}
              color={'grayModern.900'}
              _hover={{
                color: 'brightBlue.600'
              }}
              borderWidth={'1px'}
              onClick={() => handleStartDevbox(devboxDetail)}
            >
              {t('start')}
            </Button>
          )}
          {/* update button */}
          <Button
            h={'40px'}
            w={'96px'}
            borderRadius={'none'}
            boxShadow={'none'}
            fontSize={'14px'}
            bg={'white'}
            color={'grayModern.900'}
            _hover={{
              color: 'brightBlue.600'
            }}
            borderWidth={'1px 0px 1px 0px'}
            {...(devboxDetail.status.value === 'Stopped' && {
              borderRadius: '0px 8px 8px 0px',
              borderWidth: '1px 1px 1px 0px'
            })}
            onClick={() => router.push(`/devbox/create?name=${devboxDetail.name}`)}
          >
            {t('update')}
          </Button>
          {/* restart button */}
          {devboxDetail.status.value !== 'Stopped' && (
            <Button
              h={'40px'}
              w={'96px'}
              boxShadow={'none'}
              fontSize={'14px'}
              bg={'white'}
              borderRadius={'0px 8px 8px 0px'}
              color={'grayModern.900'}
              _hover={{
                color: 'brightBlue.600'
              }}
              borderWidth={'1px 1px 1px 1px'}
              onClick={() => handleRestartDevbox(devboxDetail)}
            >
              {t('restart')}
            </Button>
          )}
        </Flex>

        {/* IDE button */}
        <Box>
          <IDEButton
            runtimeType={devboxDetail.iconId}
            devboxName={devboxDetail.name}
            sshPort={devboxDetail.sshPort as number}
            status={devboxDetail.status}
            leftButtonProps={{
              fontSize: '14px',
              height: '40px',
              width: '120px',
              border: '1px solid var(--base-border, #E4E4E7)',
              // borderWidth: '1px 0 1px 1px',
              bg: 'white',
              boxShadow: 'none',
              pl: '12px',
              pr: 'auto',
              color: 'grayModern.900'
            }}
            rightButtonProps={{
              height: '40px',
              border: '1px solid var(--base-border, #E4E4E7)',
              borderWidth: '1px 1px 1px 0',
              bg: 'white',
              color: 'grayModern.900',
              mr: 0,
              boxShadow: 'none'
              // boxShadow:
              //   '2px 1px 2px 0px rgba(19, 51, 107, 0.05),0px 0px 1px 0px rgba(19, 51, 107, 0.08)'
            }}
          />
        </Box>
        <Button
          h={'40px'}
          fontSize={'14px'}
          bg={'white'}
          isDisabled={devboxDetail.status.value !== 'Running'}
          color={'grayModern.600'}
          _hover={{
            color: 'brightBlue.600'
          }}
          borderWidth={1}
          leftIcon={isBigButton ? <MyIcon name={'terminal'} w={'16px'} /> : undefined}
          onClick={() => handleGoToTerminal(devboxDetail)}
        >
          {isBigButton ? t('terminal') : <MyIcon name={'terminal'} w={'16px'} />}
        </Button>
        {devboxDetail.status.value === 'Running' && (
          <Button
            className="guide-close-button"
            h={'40px'}
            fontSize={'14px'}
            bg={'white'}
            color={'grayModern.600'}
            _hover={{
              color: 'brightBlue.600'
            }}
            borderWidth={1}
            leftIcon={isBigButton ? <MyIcon name={'shutdown'} w={'16px'} /> : undefined}
            onClick={() => setOnOpenShutdown(true)}
          >
            {isBigButton ? t('pause') : <MyIcon name={'shutdown'} w={'16px'} />}
          </Button>
        )}
        {(devboxDetail.status.value === 'Stopped' || devboxDetail.status.value === 'Shutdown') && (
          <Button
            h={'40px'}
            fontSize={'14px'}
            bg={'white'}
            color={'grayModern.600'}
            _hover={{
              color: 'brightBlue.600'
            }}
            borderWidth={1}
            leftIcon={isBigButton ? <MyIcon name={'start'} w={'16px'} /> : undefined}
            onClick={() => handleStartDevbox(devboxDetail)}
          >
            {isBigButton ? t('start') : <MyIcon name={'start'} w={'16px'} />}
          </Button>
        )}
        <Button
          h={'40px'}
          fontSize={'14px'}
          bg={'white'}
          color={'grayModern.600'}
          _hover={{
            color: 'brightBlue.600'
          }}
          borderWidth={1}
          leftIcon={isBigButton ? <MyIcon name={'change'} w={'16px'} /> : undefined}
          onClick={() => router.push(`/devbox/create?name=${devboxDetail.name}`)}
        >
          {!isBigButton ? <MyIcon name={'change'} w={'16px'} /> : t('update')}
        </Button>
        {devboxDetail.status.value !== 'Stopped' && devboxDetail.status.value !== 'Shutdown' && (
          <Button
            h={'40px'}
            fontSize={'14px'}
            bg={'white'}
            color={'grayModern.600'}
            _hover={{
              color: 'brightBlue.600'
            }}
            borderWidth={1}
            leftIcon={isBigButton ? <MyIcon name={'restart'} w={'16px'} /> : undefined}
            onClick={() => handleRestartDevbox(devboxDetail)}
          >
            {isBigButton ? t('restart') : <MyIcon name={'restart'} w={'16px'} />}
          </Button>
        )}
        <Button
          h={'40px'}
          fontSize={'14px'}
          bg={'white'}
          color={'grayModern.600'}
          _hover={{
            color: 'red.600'
          }}
          borderWidth={1}
          leftIcon={isBigButton ? <MyIcon name={'delete'} w={'16px'} /> : undefined}
          onClick={() => setDelDevbox(devboxDetail)}
        >
          {isBigButton ? t('delete') : <MyIcon name={'delete'} w={'16px'} />}
        </Button>
      </Flex>
      {delDevbox && (
        <DelModal
          devbox={delDevbox}
          onClose={() => setDelDevbox(null)}
          onSuccess={() => {
            setDelDevbox(null);
            router.push('/');
          }}
          refetchDevboxList={refetchDevboxList}
        />
      )}
      {onOpenShutdown && devboxDetail && (
        <ShutdownModal
          onSuccess={() => {
            refetchDevboxDetail();
            setOnOpenShutdown(false);
          }}
          onClose={() => {
            setOnOpenShutdown(false);
          }}
          devbox={devboxDetail}
        />
      )}
    </Flex>
  );
};

export default Header;
