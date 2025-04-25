import { useCustomToast } from '@/hooks/useCustomToast';
import { useConfigStore } from '@/stores/config';
import useSessionStore from '@/stores/session';
import { OauthProvider } from '@/types/user';
import { Box, Button, Flex, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { Track } from '@sealos/ui';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { ClawCloudIcon, GithubIcon, GoogleIcon } from '../icons';

export default function SigninComponent() {
  const { t } = useTranslation();
  const { toast } = useCustomToast();
  const { cloudConfig, authConfig } = useConfigStore();
  const { generateState, setProvider } = useSessionStore();

  const handleSocialLogin = async (provider: OauthProvider) => {
    if (!authConfig) {
      console.error('Auth config not found');
      return;
    }

    if (!cloudConfig) {
      console.error('Cloud config not found');
      return;
    }

    const state = generateState();
    setProvider(provider);

    const oauthLogin = async ({ url }: { url: string }) => {
      window.location.href = url;
    };

    try {
      switch (provider) {
        case 'GITHUB': {
          const githubConf = authConfig.idp.github;
          if (!githubConf) {
            throw new Error('GitHub configuration not found');
          }
          const callbackUrl = encodeURIComponent(
            `${authConfig.callbackURL}?regionDomain=${cloudConfig.domain}`
          );
          await oauthLogin({
            url: `https://github.com/login/oauth/authorize?client_id=${githubConf.clientID}&redirect_uri=${callbackUrl}&scope=user:email%20read:user&state=${state}`
          });
          break;
        }
        case 'GOOGLE': {
          const googleConf = authConfig.idp.google;
          if (!googleConf) {
            throw new Error('Google configuration not found');
          }
          const scope = encodeURIComponent(`profile openid email`);
          const callbackUrl = encodeURIComponent(
            `${authConfig.callbackURL}?regionDomain=${cloudConfig.domain}`
          );
          await oauthLogin({
            url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleConf.clientID}&redirect_uri=${callbackUrl}&response_type=code&regionDomain=${cloudConfig.domain}&state=${state}&scope=${scope}&include_granted_scopes=true`
          });
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
      <ClawCloudIcon w={'163px'} h={'22px'} position={'absolute'} top={'20px'} left={'20px'} />
      <Box mx="auto" maxW="lg" px={4}>
        <Box fontSize={'24px'} fontWeight={600} mb={'12px'}>
          Welcome to ClawCloud Run
        </Box>

        <Box color={'#71717A'} fontWeight={400} fontSize={'14px'} mb={'24px'}>
          <Text>First-Time Benefit: $5 Credit</Text>
          <Text>- For Github users, eligibility requires registration at least 7 days ago.</Text>
          <Text>- For Gmail users, no other requirements.</Text>
          <Text>Recurring Monthly Benefit: $5 Credit</Text>
          <Text>
            - Unlock by binding your Github account (Your GitHub account needs to be registered for
            180+ days).
          </Text>
        </Box>

        <Stack spacing={'12px'} mb={'24px'}>
          <Track.Click eventName={Track.events.signinGithub}>
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
          </Track.Click>
          <Track.Click eventName={Track.events.signinGoogle}>
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
          </Track.Click>
        </Stack>

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
      </Box>
    </Flex>
  );
}
