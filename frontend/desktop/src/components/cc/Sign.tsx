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
import { ccEmailSignIn, getRegionToken } from '@/api/auth';
import { useConfigStore } from '@/stores/config';
import useSessionStore from '@/stores/session';
import { OauthProvider } from '@/types/user';
import { sessionConfig } from '@/utils/sessionConfig';

export default function SigninComponent() {
  const { t } = useTranslation();
  const { toast } = useCustomToast();
  const [tabIndex, setTabIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { setSignupData } = useSignupStore();
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
    mode: 'onChange'
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
      setToken(token);
      console.log(result);
      // 成功提示

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
        description: error instanceof Error ? error.message : t('cc:unknown_error'),
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
      console.log('signup data:', data);

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
          const scope = encodeURIComponent(
            `https://www.googleapis.com/auth/userinfo.profile openid`
          );
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
      <ClawCloudIcon w={'134px'} h={'24px'} position={'absolute'} top={'20px'} left={'20px'} />
      <Stack spacing={8} mx="auto" maxW="lg" px={4} h={'60%'}>
        <Box rounded="lg" p={8}>
          <Tabs index={tabIndex} onChange={(index) => setTabIndex(index)}>
            <TabList mb="30px" bg="#F4F4F5" p={2} borderRadius="md" borderBottom="none">
              <Tab _selected={{ bg: 'white', borderRadius: 'md' }} w="50%">
                {t('cc:sign_in')}
              </Tab>
              <Tab _selected={{ bg: 'white', borderRadius: 'md' }} w="50%">
                {t('cc:sign_up')}
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <Stack spacing={4}>
                  {/* Email Address */}
                  <FormControl isInvalid={!!signinErrors.email}>
                    <FormLabel>{t('cc:email')}</FormLabel>
                    <Input
                      type="email"
                      height={'40px'}
                      bg={'white'}
                      width={'full'}
                      placeholder="Email"
                      {...registerSignin('email')}
                    />
                    <FormErrorMessage>{signinErrors.email?.message}</FormErrorMessage>
                  </FormControl>

                  {/* Password */}
                  <FormControl isInvalid={!!signinErrors.password}>
                    <FormLabel
                      display={'flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Box as="span" justifyContent={'space-between'}>
                        {t('cc:password')}
                      </Box>
                      <Box
                        as="span"
                        color="gray.500"
                        display={'inline-block'}
                        ml={2}
                        textDecoration={'underline'}
                      >
                        {t('cc:password_hint')}
                      </Box>
                    </FormLabel>
                    <Input
                      type="password"
                      height={'40px'}
                      bg={'white'}
                      width={'full'}
                      placeholder="Password"
                      {...registerSignin('password')}
                    />
                    <FormErrorMessage>{signinErrors.password?.message}</FormErrorMessage>
                  </FormControl>

                  {/* Remember Me Checkbox */}
                  <Checkbox
                    isChecked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{
                      '.chakra-checkbox__control': {
                        borderRadius: '4px',
                        borderWidth: '1px',
                        borderColor: 'gray.900',
                        _checked: {
                          bg: 'gray.900',
                          color: 'white'
                        },
                        _hover: {
                          borderColor: 'gray.900'
                        }
                      },
                      '.chakra-checkbox__label': {
                        fontSize: 'md',
                        color: 'gray.900',
                        fontWeight: 'medium'
                      }
                    }}
                  >
                    {t('cc:remember_me')}
                  </Checkbox>

                  <Button
                    variant="solid"
                    colorScheme="blue"
                    isLoading={isLoading}
                    onClick={() => handleSubmit('signin')}
                    rightIcon={<ArrowRight width={20} height={20} />}
                  >
                    {t('cc:sign_in')}
                  </Button>

                  {/* OR Divider */}
                  <Box position="relative" my={'4'}>
                    <Divider />
                    <AbsoluteCenter bg="white" px="4" color="#94949B">
                      {t('cc:or_sign_in_with')}
                    </AbsoluteCenter>
                  </Box>

                  {/* Social Login Buttons */}
                  <Stack direction="row" spacing={4} w={'full'}>
                    <Button
                      variant="outline"
                      onClick={() => handleSocialLogin('GOOGLE' as OauthProvider)}
                      w={'50%'}
                      boxShadow={'none'}
                      _hover={{
                        bg: 'grayModern.50'
                      }}
                      leftIcon={<GoogleIcon />}
                    >
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSocialLogin('GITHUB' as OauthProvider)}
                      w={'50%'}
                      _hover={{
                        bg: 'grayModern.50'
                      }}
                      boxShadow={'none'}
                      leftIcon={<GithubIcon />}
                    >
                      GitHub
                    </Button>
                  </Stack>

                  {/* Terms and Conditions */}
                  <Box fontSize="sm" color="gray.500">
                    By proceeding you acknowledge that you have read, understood and agree to our{' '}
                    <Box display="inline" textDecoration={'underline'}>
                      Terms and Conditions , and Privacy Policy.
                    </Box>
                  </Box>
                </Stack>
              </TabPanel>
              <TabPanel p={0}>
                <Stack spacing={4}>
                  {/* Email Address */}
                  <FormControl isInvalid={!!signupErrors.email}>
                    <FormLabel>{t('cc:email')}</FormLabel>
                    <Input
                      type="email"
                      height={'40px'}
                      bg={'white'}
                      width={'full'}
                      placeholder="Email"
                      {...registerSignup('email')}
                    />
                    <FormErrorMessage>{signupErrors.email?.message}</FormErrorMessage>
                  </FormControl>

                  {/* Password */}
                  <FormControl isInvalid={!!signupErrors.password}>
                    <FormLabel>{t('cc:password')}</FormLabel>
                    <Input
                      type="password"
                      height={'40px'}
                      bg={'white'}
                      width={'full'}
                      placeholder="Password"
                      {...registerSignup('password')}
                    />
                    <FormErrorMessage>{signupErrors.password?.message}</FormErrorMessage>
                  </FormControl>

                  {/* Confirm Password */}
                  <FormControl isInvalid={!!signupErrors.confirmPassword}>
                    <FormLabel>{t('cc:confirm_password')}</FormLabel>
                    <Input
                      type="password"
                      height={'40px'}
                      bg={'white'}
                      width={'full'}
                      placeholder="Confirm Password"
                      {...registerSignup('confirmPassword')}
                    />
                    <FormErrorMessage>{signupErrors.confirmPassword?.message}</FormErrorMessage>
                  </FormControl>

                  {/* Country - Hidden but with default value */}
                  <Input type="hidden" value="US" {...registerSignup('country')} />

                  {/* Language - Hidden but with default value */}
                  <Input type="hidden" value="en" {...registerSignup('language')} />

                  <Button
                    variant="solid"
                    colorScheme="blue"
                    isLoading={isLoading}
                    onClick={() => handleSubmit('signup')}
                    rightIcon={<ArrowRight width={20} height={20} />}
                  >
                    {t('cc:continue')}
                  </Button>

                  {/* OR Divider */}
                  <Box position="relative" my={'4'}>
                    <Divider />
                    <AbsoluteCenter bg="white" px="4" color="#94949B">
                      {t('cc:or_sign_up_with')}
                    </AbsoluteCenter>
                  </Box>

                  {/* Social Login Buttons */}
                  <Stack direction="row" spacing={4} w={'full'}>
                    <Button
                      variant="outline"
                      onClick={() => handleSocialLogin('GOOGLE' as OauthProvider)}
                      w={'50%'}
                      boxShadow={'none'}
                      _hover={{
                        bg: 'grayModern.50'
                      }}
                      leftIcon={<GoogleIcon />}
                      isDisabled={!conf?.idp.google.enabled}
                    >
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSocialLogin('GITHUB' as OauthProvider)}
                      w={'50%'}
                      _hover={{
                        bg: 'grayModern.50'
                      }}
                      boxShadow={'none'}
                      leftIcon={<GithubIcon />}
                      isDisabled={!conf?.idp.github.enabled}
                    >
                      GitHub
                    </Button>
                  </Stack>

                  {/* Terms and Conditions */}
                  <Box fontSize="sm" color="gray.500">
                    By proceeding you acknowledge that you have read, understood and agree to our{' '}
                    <Box textDecoration={'underline'}>
                      Terms and Conditions , and Privacy Policy.
                    </Box>
                  </Box>
                </Stack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Stack>
    </Flex>
  );
}
