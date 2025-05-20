import { bindRequest, getRegionToken, signInRequest, unBindRequest } from '@/api/auth';
import { useCustomToast } from '@/hooks/useCustomToast';
import useCallbackStore, { MergeUserStatus } from '@/stores/callback';
import useSessionStore from '@/stores/session';
import { BIND_STATUS } from '@/types/response/bind';
import { getBaiduId, getInviterId, getUserSemData, sessionConfig } from '@/utils/sessionConfig';
import { Flex, Spinner } from '@chakra-ui/react';
import { HttpStatusCode } from 'axios';
import { isString } from 'lodash';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
export default function Callback() {
  const router = useRouter();
  const setLastSigninProvider = useSessionStore((s) => s.setLastSigninProvider);
  const setProvider = useSessionStore((s) => s.setProvider);
  const setToken = useSessionStore((s) => s.setToken);
  const provider = useSessionStore((s) => s.provider);
  const compareState = useSessionStore((s) => s.compareState);
  const { toast } = useCustomToast();
  const { setMergeUserData, setMergeUserStatus } = useCallbackStore();
  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    (async () => {
      try {
        if (!provider || !['GITHUB', 'WECHAT', 'GOOGLE', 'OAUTH2'].includes(provider)) {
          throw new Error('unknown provider');
        }

        const { code, state } = router.query;
        if (!isString(code) || !isString(state)) {
          throw new Error('failed to get code and state');
        }

        const compareResult = compareState(state);
        if (!compareResult.isSuccess) {
          throw new Error('invalid state');
        }

        const { action } = compareResult;
        if (action === 'LOGIN') {
          const data = await signInRequest(provider)({
            code,
            inviterId: getInviterId() ?? undefined,
            semData: getUserSemData() ?? undefined,
            bdVid: getBaiduId() ?? undefined
          });
          setProvider();
          if (data.code === 200 && data.data?.token) {
            const token = data.data?.token;
            setToken(token);
            setLastSigninProvider(provider);
            const needInit = data.data.needInit;
            if (needInit) {
              await router.push('/workspace');
              return;
            }
            const regionTokenRes = await getRegionToken();
            if (regionTokenRes?.data) {
              await sessionConfig(regionTokenRes.data);
              await router.replace('/');
              return;
            }
          } else if (data.code === HttpStatusCode.Conflict) {
            if (data.message) {
              toast({
                title: 'Error',
                description: data.message,
                status: 'error',
                duration: 5000,
                isClosable: true
              });
            }
            await new Promise((resolve) => setTimeout(resolve, 5000));
            await router.replace('/signin');
          } else {
            throw new Error('Unknown error');
          }
        } else if (action === 'BIND') {
          const response = await bindRequest(provider)({ code });
          if (response.message === BIND_STATUS.RESULT_SUCCESS) {
            setProvider();
            await router.replace('/');
          } else {
            setMergeUserData();
            setMergeUserStatus(MergeUserStatus.CONFLICT);
            setProvider();
            await router.replace('/');
          }
          // else if (response.message === MERGE_USER_READY.MERGE_USER_CONTINUE) {
          //   const code = response.data?.code;
          //   if (!code) return;
          //   setMergeUserData({
          //     providerType: provider as ProviderType,
          //     code
          //   });
          //   setMergeUserStatus(MergeUserStatus.CANMERGE);
          //   setProvider();
          //   await router.replace('/');
          // } else if (response.message === MERGE_USER_READY.MERGE_USER_PROVIDER_CONFLICT) {
          //   setMergeUserData();
          //   setMergeUserStatus(MergeUserStatus.CONFLICT);
          //   setProvider();
          //   await router.replace('/');
          // }
        } else if (action === 'UNBIND') {
          await unBindRequest(provider)({ code });
          setProvider();
          await router.replace('/');
        } else {
          throw new Error('Unknown action');
        }
      } catch (error) {
        console.log(error);
        //@ts-ignore
        // if (error.code === 409 && error.message) {
        toast({
          title: 'Error',
          //@ts-ignore
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true
        });
        // }
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await router.replace('/signin');
      }
    })();
  }, [router]);

  return (
    <Flex w={'full'} h={'full'} justify={'center'} align={'center'}>
      <Spinner size="xl" />
    </Flex>
  );
}
