import { useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';
import { serviceSideProps } from '@/utils/i18n';
import { useTranslation } from 'next-i18next';
import urls from '@/utils/urls';
import type { Url } from 'next/dist/shared/lib/router/router';

const Index: FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  useEffect(() => {
    const { scene, paymentType, stripeState } = router.query;
    let replaceTo: Url = urls.page.setting;
    if (paymentType === 'SUBSCRIPTION') {
      replaceTo = {
        pathname: urls.page.plan,
        search: '?checkUpgrade'
      };
    } else if (paymentType === 'ACCOUNT_RECHARGE' || stripeState) {
      replaceTo = urls.page.plan;
    }
    // scene 参数，可以跳转到指定页面的部分
    if (typeof scene === 'string') {
      const sceneUrl = urls.getSceneRedirectUrl(scene);
      if (sceneUrl) {
        replaceTo = sceneUrl;
      }
    }
    router.replace(replaceTo);
  }, []);
  return null;
};
export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content))
    }
  };
}
export default Index;
