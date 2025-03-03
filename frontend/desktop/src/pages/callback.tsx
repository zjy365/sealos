import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useSessionStore from '@/stores/session';
import { ApiResp } from '@/types';
import { Flex, Spinner } from '@chakra-ui/react';
import { isString } from 'lodash';
import { bindRequest, getRegionToken, signInRequest, unBindRequest } from '@/api/auth';
import { getBaiduId, getInviterId, getUserSemData, sessionConfig } from '@/utils/sessionConfig';
import useCallbackStore, { MergeUserStatus } from '@/stores/callback';
import { ProviderType } from 'prisma/global/generated/client';
import request from '@/services/request';
import { BIND_STATUS } from '@/types/response/bind';
import { MERGE_USER_READY } from '@/types/response/utils';
export default function Callback() {
  const router = useRouter();
  const setProvider = useSessionStore((s) => s.setProvider);
  const setToken = useSessionStore((s) => s.setToken);
  const provider = useSessionStore((s) => s.provider);
  const compareState = useSessionStore((s) => s.compareState);
  const { setMergeUserData, setMergeUserStatus } = useCallbackStore();
  useEffect(() => {
    if (!router.isReady) return;
    let isProxy: boolean = false;
    (async () => {
      try {
        if (!provider || !['GITHUB', 'WECHAT', 'GOOGLE', 'OAUTH2'].includes(provider))
          throw new Error('provider error');
        const { code, state } = router.query;
        if (!isString(code) || !isString(state)) throw new Error('failed to get code and state');
        const compareResult = compareState(state);
        if (!compareResult.isSuccess) throw new Error('invalid state');
        if (compareResult.action === 'PROXY') {
          // proxy oauth2.0, PROXY_URL_[ACTION]_STATE
          const [_url, ...ret] = compareResult.statePayload;
          await new Promise<URL>((resolve, reject) => {
            resolve(new URL(decodeURIComponent(_url)));
          })
            .then(async (url) => {
              const result = (await request(`/api/auth/canProxy?domain=${url.host}`)) as ApiResp<{
                containDomain: boolean;
              }>;
              isProxy = true;
              if (result.data?.containDomain) {
                url.searchParams.append('code', code);
                url.searchParams.append('state', ret.join('_'));
                await router.replace(url.toString());
              }
            })
            .catch(() => {
              Promise.resolve();
            });
          if (isProxy) {
            // prevent once token
            setProvider();
            isProxy = false;
            return;
          }
        } else {
          const { statePayload, action } = compareResult;
          // return
          if (action === 'LOGIN') {
            const data = await signInRequest(provider)({
              code,
              inviterId: getInviterId() ?? undefined,
              semData: getUserSemData() ?? undefined,
              bdVid: getBaiduId() ?? undefined
            });
            // const data = {
            //   code: 200,
            //   data: {
            //     token:
            //       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyVWlkIjoiNTcxZDY0ODYtYzBlYS00MzQ0LWJlMDMtODI5MmFlYTdmODI1IiwidXNlcklkIjoiSFZqeTVPNkRoUCIsImlhdCI6MTc0MTc2ODEzMCwiZXhwIjoxNzQxNzY4MTkwfQ.tLVnglTHEPBOaQwgVwefMsiniWj72Ai00N1MMd8f9I8',
            //     user: {
            //       name: 'xudaotutou',
            //       avatar: 'https://avatars.githubusercontent.com/u/71751336?v=4',
            //       userUid: '571d6486-c0ea-4344-be03-8292aea7f825'
            //     },
            //     needInit: true
            //   }
            // };
            setProvider();
            if (data.code === 200 && data.data?.token) {
              const token = data.data?.token;
              setToken(token);
              const needInit = data.data.needInit;
              console.log('needInit', needInit);
              if (needInit) {
                // await router.push('/personalinfo');
                await router.push('/unlockcard');
                return;
              }
              const regionTokenRes = await getRegionToken();
              if (regionTokenRes?.data) {
                await sessionConfig(regionTokenRes.data);
                await router.replace('/');
              }
            } else {
              throw new Error();
            }
          } else if (action === 'BIND') {
            const response = await bindRequest(provider)({ code });
            if (response.message === BIND_STATUS.RESULT_SUCCESS) {
              setProvider();
              await router.replace('/');
            } else if (response.message === MERGE_USER_READY.MERGE_USER_CONTINUE) {
              const code = response.data?.code;
              if (!code) return;
              setMergeUserData({
                providerType: provider as ProviderType,
                code
              });
              setMergeUserStatus(MergeUserStatus.CANMERGE);
              setProvider();
              await router.replace('/');
            } else if (response.message === MERGE_USER_READY.MERGE_USER_PROVIDER_CONFLICT) {
              setMergeUserData();
              setMergeUserStatus(MergeUserStatus.CONFLICT);
              setProvider();
              await router.replace('/');
            }
          } else if (action === 'UNBIND') {
            await unBindRequest(provider)({ code });
            setProvider();
            await router.replace('/');
          }
        }
      } catch (error) {
        console.error(error);
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
