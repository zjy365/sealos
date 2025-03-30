import PersonalInfoComponent from '@/components/cc/PersonalInfo';
import SignLayout from '@/components/cc/SignLayout';
import { compareFirstLanguages } from '@/utils/tools';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function PersonalInfoPage() {
  return (
    <SignLayout>
      <PersonalInfoComponent />
    </SignLayout>
  );
}
export async function getServerSideProps({ req, res, locales }: any) {
  // const local =
  //   req?.cookies?.NEXT_LOCALE || compareFirstLanguages(req?.headers?.['accept-language'] || 'en');
  const local = 'en';
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
