import { useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';
import { serviceSideProps } from '@/utils/i18n';
import { useTranslation } from 'next-i18next';

interface PayResultProps {}
const PayResult: FC<PayResultProps> = (props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  useEffect(() => {
    const { stripeState } = router.query;
    if (stripeState === 'success') {
      toast({
        status: 'success',
        duration: 4000,
        title: t('PaySuccess'),
        isClosable: true,
        position: 'top'
      });
    } else if (stripeState === 'error') {
      toast({
        status: 'error',
        duration: 4000,
        title: t('PayResultFailed'),
        isClosable: true,
        position: 'top'
      });
    } else {
      return;
    }
    router.replace('/plan');
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
export default PayResult;
