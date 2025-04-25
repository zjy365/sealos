import { useConfigStore } from '@/stores/config';
import useSessionStore from '@/stores/session';
import { OauthProvider } from '@/types/user';
import { Button, Center, Flex, FlexProps, Icon, Image, Text } from '@chakra-ui/react';
import { GithubIcon, GoogleIcon } from '@sealos/ui';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { MouseEventHandler, useMemo } from 'react';
const AuthList = ({
  zeroTab = false,
  isAgreeCb,
  ...props
}: { zeroTab?: boolean; isAgreeCb: () => boolean } & FlexProps) => {
  const { authConfig, cloudConfig } = useConfigStore();
  const { t } = useTranslation(['common']);
  const router = useRouter();
  const logo = useConfigStore().layoutConfig?.logo;

  const { generateState, setProvider } = useSessionStore();
  const authList: { icon: typeof Icon; cb: MouseEventHandler; need: boolean; text: string }[] =
    useMemo(() => {
      if (!authConfig) return [];
      if (!cloudConfig) return [];

      const oauthLogin = async ({ url, provider }: { url: string; provider?: OauthProvider }) => {
        setProvider(provider);
        window.location.href = url;
      };

      return [
        {
          icon: GithubIcon,
          cb: (e) => {
            e.preventDefault();
            if (!isAgreeCb()) return;
            const state = generateState();
            const githubConf = authConfig?.idp.github;
            const callbackUrl = encodeURIComponent(
              `${authConfig.callbackURL}?regionDomain=${cloudConfig.domain}`
            );
            oauthLogin({
              provider: 'GITHUB',
              url: `https://github.com/login/oauth/authorize?client_id=${githubConf?.clientID}&redirect_uri=${callbackUrl}&scope=user:email%20read:user&state=${state}`
            });
          },
          text: t('login_with_github'),
          need: authConfig?.idp.github.enabled
        },
        {
          icon: GoogleIcon,
          cb: (e) => {
            e.preventDefault();
            if (!isAgreeCb()) return;
            const state = generateState();
            const googleConf = authConfig?.idp.google;
            const scope = encodeURIComponent(`profile email openid`);
            const callbackUrl = encodeURIComponent(
              `${authConfig.callbackURL}?regionDomain=${cloudConfig.domain}`
            );
            oauthLogin({
              provider: 'GOOGLE',
              url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleConf.clientID}&redirect_uri=${callbackUrl}&response_type=code&state=${state}&scope=${scope}&include_granted_scopes=true`
            });
          },
          text: t('login_with_google'),
          need: authConfig.idp.google.enabled as boolean
        },
        {
          icon: () => (
            <Center>
              <Image alt="logo" width={'20px'} src={logo || '/logo.svg'}></Image>
            </Center>
          ),
          cb: (e) => {
            e.preventDefault();
            const state = generateState();
            const oauth2Conf = authConfig?.idp.oauth2;
            oauthLogin({
              provider: 'OAUTH2',
              url: `${oauth2Conf?.authURL}?client_id=${oauth2Conf.clientID}&redirect_uri=${oauth2Conf.callbackURL}&response_type=code&state=${state}&regionDomain=${cloudConfig?.domain}`
            });
          },
          text: t('login_with_oauth2'),
          need: authConfig.idp.oauth2?.enabled as boolean
        }
      ];
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authConfig, cloudConfig, logo, router, isAgreeCb]);

  return (
    <Flex
      {...(zeroTab
        ? {
            gap: '16px',
            flexDirection: 'column'
          }
        : {
            gap: '14px'
          })}
      {...props}
    >
      {authList
        .filter((item) => item.need)
        .map((item, index) => (
          <Button
            key={index}
            onClick={item.cb}
            {...(zeroTab
              ? {
                  h: '40px',
                  w: '300px',
                  gap: '10px',
                  boxShadow: '0px 0px 1px 0px #13336B14; 0px 1px 2px 0px #13336B0D;',
                  display: 'flex',
                  bgColor: '#FFFFFFA6',
                  borderRadius: '8px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  _hover: {
                    bgColor: '#FFFFFF80'
                  }
                }
              : {
                  w: '32px',
                  h: '32px',
                  bgColor: 'rgba(255, 255, 255, 0.65)',
                  borderRadius: 'full'
                })}
            variant={'unstyled'}
            size={'xs'}
          >
            <item.icon boxSize="20px" />
            {zeroTab && (
              <Text fontWeight={500} fontSize={'14px'} color={'grayModern.900'}>
                {item.text}
              </Text>
            )}
          </Button>
        ))}
    </Flex>
  );
};

export default AuthList;
