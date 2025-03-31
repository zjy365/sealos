import {
  AbsoluteCenter,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  FormErrorMessage,
  Flex,
  useColorModeValue
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCustomToast } from '@/hooks/useCustomToast';
import { GoogleIcon, GithubIcon, ClawCloudIcon } from '../icons';
import {
  ILoginParams,
  IRegisterParamsWithoutName,
  loginParamsSchema,
  registerParamsWithoutNameSchema
} from '@/schema/ccSvc';
import { useSignupStore } from '@/stores/signup';
import { ccEmailSignIn, ccEmailSignUpCheck, getRegionToken } from '@/api/auth';
import { useConfigStore } from '@/stores/config';
import useSessionStore from '@/stores/session';
import { OauthProvider } from '@/types/user';
import { sessionConfig } from '@/utils/sessionConfig';
import Link from 'next/link';
import email from '@/pages/api/auth/email';

export default function SigninComponent() {
  const { t } = useTranslation();
  const { toast } = useCustomToast();
  const [tabIndex, setTabIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { setSignupData, signupData } = useSignupStore();
  const conf = useConfigStore().authConfig;
  const { generateState, setProvider, setToken } = useSessionStore();
  const {
    register: registerSignin,
    handleSubmit: handleSigninSubmit,
    formState: { errors: signinErrors }
  } = useForm<ILoginParams>({
    resolver: zodResolver(loginParamsSchema),
    mode: 'onChange'
  });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors }
  } = useForm<IRegisterParamsWithoutName>({
    resolver: zodResolver(registerParamsWithoutNameSchema),
    mode: 'onChange',
    defaultValues: {
      email: signupData?.email || '',
      password: signupData?.password || ''
    }
  });

  const handleSubmit = (type: 'signin' | 'signup') => {
    if (type === 'signin') {
      return handleSigninSubmit(onSignin)();
    } else {
      return handleSignupSubmit(onSignup)();
    }
  };

  const onSignin = async (data: ILoginParams) => {
    try {
      setIsLoading(true);
      const result = await ccEmailSignIn(data);

      const token = result.data?.token;
      if (!token) throw Error('get token error');

      setToken(token, rememberMe);

      if (result.data?.needInit) {
        toast({
          title: t('cc:sign_in_success'),
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top'
        });
        await router.push('/unlockcard');
      } else {
        const regionTokenRes = await getRegionToken();
        if (regionTokenRes?.data) {
          await sessionConfig(regionTokenRes.data);
          toast({
            title: t('cc:sign_in_success'),
            status: 'success',
            duration: 3000,
            isClosable: true,
            position: 'top'
          });
          await router.replace('/');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      // @ts-ignore
      if (error.code === 403) {
        // 提示英文的密码/用户错误
        toast({
          title: t('cc:sign_in_failed'),
          description: 'Please check your username and password and try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top'
        });
        return;
      }

      toast({
        title: t('cc:sign_in_failed'),
        description: (error as Error)?.message || t('cc:unknown_error'),
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSignup = async (data: IRegisterParamsWithoutName) => {
    try {
      setIsLoading(true);
      const result = await ccEmailSignUpCheck({ email: data.email });
      if (result.code !== 201) {
        toast({
          title: t('cc:sign_up_failed'),
          description: result.message || t('cc:unknown_error'),
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top'
        });
      }
      setSignupData({
        email: data.email,
        password: data.password
      });

      router.push('/personalinfo');
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: OauthProvider) => {
    if (!conf) {
      console.error('Auth config not found');
      return;
    }

    const state = generateState();
    setProvider(provider);

    const oauthLogin = async ({ url }: { url: string }) => {
      window.location.href = url;
    };

    const oauthProxyLogin = async ({
      state,
      provider,
      proxyAddress,
      id
    }: {
      state: string;
      proxyAddress: string;
      provider: OauthProvider;
      id: string;
    }) => {
      const target = new URL(proxyAddress);
      const callback = new URL(conf.callbackURL);
      target.searchParams.append(
        'oauthProxyState',
        encodeURIComponent(callback.toString()) + '_' + state
      );
      target.searchParams.append('oauthProxyClientID', id);
      target.searchParams.append('oauthProxyProvider', provider);
      router.replace(target.toString());
    };

    try {
      switch (provider) {
        case 'GITHUB': {
          const githubConf = conf.idp.github;
          if (!githubConf) {
            throw new Error('GitHub configuration not found');
          }
          if (githubConf.proxyAddress) {
            await oauthProxyLogin({
              provider,
              state,
              proxyAddress: githubConf.proxyAddress,
              id: githubConf.clientID
            });
          } else {
            await oauthLogin({
              url: `https://github.com/login/oauth/authorize?client_id=${githubConf.clientID}&redirect_uri=${conf.callbackURL}&scope=user:email%20read:user&state=${state}`
            });
          }
          break;
        }
        case 'GOOGLE': {
          const googleConf = conf.idp.google;
          if (!googleConf) {
            throw new Error('Google configuration not found');
          }
          const scope = encodeURIComponent(`profile openid email`);
          if (googleConf.proxyAddress) {
            await oauthProxyLogin({
              state,
              provider,
              proxyAddress: googleConf.proxyAddress,
              id: googleConf.clientID
            });
          } else {
            await oauthLogin({
              url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleConf.clientID}&redirect_uri=${conf.callbackURL}&response_type=code&state=${state}&scope=${scope}&include_granted_scopes=true`
            });
          }
          break;
        }
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast({
        title: t('cc:sign_in_failed'),
        description: error instanceof Error ? error.message : t('cc:unknown_error'),
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
    }
  };

  const bg = useColorModeValue('white', 'gray.700');

  return (
    <Flex minH="100vh" align="center" justify="center" bg={bg} w={'50%'} direction={'column'}>
      <ClawCloudIcon w={'160px'} h={'24px'} position={'absolute'} top={'20px'} left={'20px'} />
      <Box mx="auto" maxW="lg" px={4}>
        <Box fontSize={'24px'} fontWeight={600} mb={'24px'}>
          Welcome to ClawCloud Run
        </Box>
        <Stack spacing={'24px'}>
          <Box
            borderWidth="1px"
            borderRadius="12px"
            p={'12px'}
            borderColor="#8CAFFF"
            bg="rgba(140, 175, 255, 0.05)"
          >
            <Flex alignItems="center" justifyContent="center" direction="column">
              <Box fontSize="xl" fontWeight="bold" color="blue.500" mb={4}>
                Monthly $5 credits available with Github
              </Box>
              <Button
                borderRadius={'8px'}
                variant="outline"
                onClick={() => handleSocialLogin('GITHUB' as OauthProvider)}
                w={'100%'}
                _hover={{
                  bg: 'grayModern.50'
                }}
                boxShadow={'none'}
                leftIcon={<GithubIcon />}
              >
                GitHub
              </Button>
            </Flex>
          </Box>
          {/* OR Divider */}
          <Box position="relative">
            <Divider />
            <AbsoluteCenter bg="white" px="4" color="#94949B">
              OR
            </AbsoluteCenter>
          </Box>

          {/* Social Login Buttons */}
          <Stack direction="row" spacing={4} w={'full'}>
            <Button
              borderRadius={'8px'}
              variant="outline"
              onClick={() => handleSocialLogin('GOOGLE' as OauthProvider)}
              w={'100%'}
              boxShadow={'none'}
              _hover={{
                bg: 'grayModern.50'
              }}
              leftIcon={<GoogleIcon />}
            >
              Google
            </Button>
          </Stack>

          {/* Terms and Conditions */}
          <Box fontSize="sm" color="gray.500">
            By proceeding you acknowledge that you have read, understood and agree to our{' '}
            <Box
              as={Link}
              href="https://docs.run.claw.cloud/app-platform/legal/terms-and-conditions"
              target="_blank"
              textDecoration="underline"
            >
              Terms and Conditions
            </Box>
            &nbsp;and&nbsp;
            <Box
              as={Link}
              href="https://docs.run.claw.cloud/app-platform/legal/privacy-policy"
              target="_blank"
              textDecoration="underline"
            >
              Privacy Policy.
            </Box>
          </Box>
        </Stack>
      </Box>
    </Flex>
  );
}
