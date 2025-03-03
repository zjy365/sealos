import { useMessage } from '@sealos/ui';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { sealosApp } from 'sealos-desktop-sdk/app';
import { Box, Button, Flex } from '@chakra-ui/react';
import { useCallback, useMemo, useState } from 'react';

import { useRouter } from '@/i18n';
import { useDevboxStore } from '@/stores/devbox';
import { useGlobalStore } from '@/stores/global';
import { pauseDevbox, restartDevbox, startDevbox } from '@/api/devbox';

import { DevboxDetailTypeV2 } from '@/types/devbox';

import MyIcon from '@/components/Icon';
import IDEButton from '@/components/IDEButton';
import DelModal from '@/components/modals/DelModal';
import DevboxStatusTag from '@/components/DevboxStatusTag';

const Header = ({ refetchDevboxDetail }: { refetchDevboxDetail: () => void }) => {
  const router = useRouter();
  const t = useTranslations();
  const { message: toast } = useMessage();

  const { devboxDetail, setDevboxList } = useDevboxStore();
  const { screenWidth, setLoading } = useGlobalStore();

  const [delDevbox, setDelDevbox] = useState<DevboxDetailTypeV2 | null>(null);
  const isBigButton = useMemo(() => screenWidth > 1000, [screenWidth]);

  const { refetch: refetchDevboxList } = useQuery(['devboxListQuery'], setDevboxList, {
    onSettled(res) {
      if (!res) return;
    }
  });

  const handlePauseDevbox = useCallback(
    async (devbox: DevboxDetailTypeV2) => {
      try {
        setLoading(true);
        await pauseDevbox({ devboxName: devbox.name });
        toast({
          title: t('pause_success'),
          status: 'success'
        });
      } catch (error: any) {
        toast({
          title: typeof error === 'string' ? error : error.message || t('pause_error'),
          status: 'error'
        });
        console.error(error);
      }
      refetchDevboxDetail();
      setLoading(false);
    },
    [refetchDevboxDetail, setLoading, t, toast]
  );
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
    <Flex justify="space-between" align="center" pl={4} pt={2} flexWrap={'wrap'} gap={5}>
      {/* left back button and title */}
      <Flex alignItems={'center'} gap={2}>
        <MyIcon
          name="arrowLeft"
          w={'24px'}
          color={'white'}
          onClick={() => router.push('/')}
          cursor={'pointer'}
          mt={1}
          ml={1}
        />
        <Box fontSize="2xl" fontWeight="bold">
          {devboxDetail.name}
        </Box>
        {/* status  */}
        <DevboxStatusTag status={devboxDetail.status} h={'27px'} />
      </Flex>
      {/* right main button group */}
      <Flex gap={5}>
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
            color: 'brightBlue.600'
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
              onClick={() => handlePauseDevbox(devboxDetail)}
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
            isBigButton={isBigButton}
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
    </Flex>
  );
};

export default Header;
