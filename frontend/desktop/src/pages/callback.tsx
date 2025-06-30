import { bindRequest, getRegionToken, regionList, signInRequest, unBindRequest } from '@/api/auth';
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
import { useConfigStore } from '@/stores/config';
import { Region } from '@/types/region';

export default function Callback() {
  const router = useRouter();
  const setLastSigninProvider = useSessionStore((s) => s.setLastSigninProvider);
  const setProvider = useSessionStore((s) => s.setProvider);
  const setToken = useSessionStore((s) => s.setToken);
  const provider = useSessionStore((s) => s.provider);
  const compareState = useSessionStore((s) => s.compareState);
  const { toast } = useCustomToast();
  const { setMergeUserData, setMergeUserStatus } = useCallbackStore();
  const { cloudConfig } = useConfigStore();

  const redirectToFreeRegion = async (regionListData: { regionList: Region[] } | undefined) => {
    try {
      const freeRegions = regionListData?.regionList?.filter((r) => r.description.isFree);
      if (freeRegions && freeRegions.length > 0) {
        const freeRegionDomain = freeRegions[0].domain;
        toast({
          title: 'Redirecting to free region',
          description: 'You are being redirected to the free availability zone.',
          status: 'info',
          duration: 3000,
          isClosable: true
        });
        window.location.replace(`https://${freeRegionDomain}`);
      } else {
        window.location.replace('https://console.run.claw.cloud');
      }
    } catch (error) {
      console.error('Failed to redirect to free region:', error);
      window.location.replace('https://console.run.claw.cloud');
    }
  };

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const currentProvider = provider;

    (async () => {
      try {
        if (
          !currentProvider ||
          !['GITHUB', 'WECHAT', 'GOOGLE', 'OAUTH2'].includes(currentProvider)
        ) {
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
          const data = await signInRequest(currentProvider)({
            code,
            inviterId: getInviterId() ?? undefined,
            semData: getUserSemData() ?? undefined,
            bdVid: getBaiduId() ?? undefined
          });

          if (data.code === 200 && data.data?.token) {
            const token = data.data?.token;
            setToken(token);
            setLastSigninProvider(currentProvider);
            const needInit = data.data.needInit;

            if (needInit) {
              setProvider();
              await router.push('/workspace');
              return;
            }

            const regionTokenRes = await getRegionToken();

            if (regionTokenRes?.data) {
              try {
                const sessionResult = await sessionConfig(regionTokenRes.data);

                const userPlan = sessionResult?.subscription?.subscriptionPlan?.name;
                const isFreeUser = !userPlan || userPlan === 'Free';

                if (isFreeUser && cloudConfig?.regionUID) {
                  const regionListRes = await regionList();
                  const currentRegion = regionListRes.data?.regionList?.find(
                    (r) => r.uid === cloudConfig.regionUID
                  );

                  if (currentRegion && !currentRegion.description.isFree) {
                    console.log(
                      'Free user trying to access Pro region, redirecting to free region'
                    );
                    setProvider();
                    await redirectToFreeRegion(regionListRes.data);
                    return;
                  }
                }

                setProvider();
                await router.replace('/');
                return;
              } catch (error: any) {
                console.error('sessionConfig 或后续处理失败:', error);
                setProvider();
                try {
                  const regionListRes = await regionList();
                  if (regionListRes?.data) {
                    await redirectToFreeRegion(regionListRes.data);
                    return;
                  }
                } catch (regionError) {
                  console.error('获取区域列表失败:', regionError);
                }
                window.location.replace('https://console.run.claw.cloud');
                return;
              }
            } else {
              throw new Error('Failed to get region token');
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
            setProvider();
            await new Promise((resolve) => setTimeout(resolve, 5000));
            await router.replace('/signin');
          } else {
            throw new Error('Unknown error');
          }
        } else if (action === 'BIND') {
          const response = await bindRequest(currentProvider)({ code });
          if (response.message === BIND_STATUS.RESULT_SUCCESS) {
            setProvider();
            await router.replace('/');
          } else {
            setMergeUserData();
            setMergeUserStatus(MergeUserStatus.CONFLICT);
            setProvider();
            await router.replace('/');
          }
        } else if (action === 'UNBIND') {
          await unBindRequest(currentProvider)({ code });
          setProvider();
          await router.replace('/');
        } else {
          throw new Error('Unknown action');
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error?.message,
          status: 'error',
          duration: 5000,
          isClosable: true
        });
        setProvider();
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await router.replace('/signin');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <Flex w={'full'} h={'full'} justify={'center'} align={'center'}>
      <Spinner size="xl" />
    </Flex>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
