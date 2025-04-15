import SigninComponent from '@/components/cc/Sign';
import SignLayout from '@/components/cc/SignLayout';
import LangSelectSimple from '@/components/LangSelect/simple';
import { useConfigStore } from '@/stores/config';
import { setCookie } from '@/utils/cookieUtils';
import { crmReferral, referral } from '@/utils/referral';
import { compareFirstLanguages } from '@/utils/tools';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect } from 'react';
import { EVENT_NAME } from 'sealos-desktop-sdk';
import { masterApp } from 'sealos-desktop-sdk/master';

export default function SigninPage() {
  const { t, i18n } = useTranslation();
  const { layoutConfig } = useConfigStore();

  useEffect(() => {
    const switchLanguage = (targetLang: string) => {
      masterApp?.sendMessageToAll({
        apiName: 'event-bus',
        eventName: EVENT_NAME.CHANGE_I18N,
        data: {
          currentLanguage: targetLang
        }
      });
      setCookie('NEXT_LOCALE', targetLang, {
        expires: 30,
        sameSite: 'None',
        secure: true
      });
      i18n?.changeLanguage(targetLang);
    };

    if (layoutConfig?.forcedLanguage && i18n?.language !== layoutConfig.forcedLanguage) {
      switchLanguage(layoutConfig.forcedLanguage);
    }
  }, [layoutConfig, i18n]);

  return (
    <SignLayout>
      <LangSelectSimple visibility={'hidden'} />
      <SigninComponent />
    </SignLayout>
  );
}

export async function getServerSideProps({ req, res, locales, query }: any) {
  const cookies = [];
  const referralCookie = referral.getCookiesUseInServerSideProps(
    { query, host: global.AppConfig?.cloud.domain },
    'Track'
  );
  if (referralCookie) {
    cookies.push(referralCookie);
  }

  const crmReferralCookie = crmReferral.getCookiesUseInServerSideProps(
    { query, host: global.AppConfig?.cloud.domain },
    'Track'
  );
  if (crmReferralCookie) {
    cookies.push(crmReferralCookie);
  }

  // const local =
  //   req?.cookies?.NEXT_LOCALE || compareFirstLanguages(req?.headers?.['accept-language'] || 'en');
  const local = 'en';
  cookies.push(`NEXT_LOCALE=${local}; Max-Age=2592000; Secure; SameSite=None`);
  res.setHeader('Set-Cookie', cookies);

  const queryClient = new QueryClient();
  const props = {
    ...(await serverSideTranslations(local, undefined, null, locales || [])),
    dehydratedState: dehydrate(queryClient)
  };
  return {
    props
  };
}
