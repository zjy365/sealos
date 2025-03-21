import { useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';
import { serviceSideProps } from '@/utils/i18n';
import { useTranslation } from 'next-i18next';
import urls from '@/utils/urls';

const Index: FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  useEffect(() => {
    const { stripeState, scene } = router.query;
    let replaceTo = '/setting';
    if (stripeState === 'success') {
      toast({
        status: 'success',
        duration: 4000,
        title: t('PaySuccess'),
        isClosable: true,
        position: 'top'
      });
      replaceTo = '/plan';
    } else if (stripeState === 'error') {
      toast({
        status: 'error',
        duration: 4000,
        title: t('PayResultFailed'),
        isClosable: true,
        position: 'top'
      });
      replaceTo = '/plan';
    }
    // scene 参数，可以跳转到指定页面的部分，也可组合达到如：scene=upgrade&stripeState=error 提示支付失败 然后跳转/plan打开updrade弹窗等效果。
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
