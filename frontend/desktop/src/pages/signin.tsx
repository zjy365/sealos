import SigninComponent from '@/components/cc/Sign';
import SignLayout from '@/components/cc/SignLayout';
import LangSelectSimple from '@/components/LangSelect/simple';
import { compareFirstLanguages } from '@/utils/tools';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function SigninPage() {
  return (
    <SignLayout>
      <LangSelectSimple visibility={'hidden'} />
      <SigninComponent />
    </SignLayout>
  );
}

export async function getServerSideProps({ req, res, locales }: any) {
  const local =
    req?.cookies?.NEXT_LOCALE || compareFirstLanguages(req?.headers?.['accept-language'] || 'zh');
  res.setHeader('Set-Cookie', `NEXT_LOCALE=${local}; Max-Age=2592000; Secure; SameSite=None`);

  const queryClient = new QueryClient();
  const props = {
    ...(await serverSideTranslations(local, undefined, null, locales || [])),
    dehydratedState: dehydrate(queryClient)
  };
  return {
    props
  };
}
