import { serviceSideProps } from '@/utils/i18n';
import { useRouter } from 'next/router';
import PlanPage from '@/components/PlanPage';
import CheckUpgradeTransaction from '@/components/CheckTransaction/Upgrade';
import { useEffect } from 'react';
import polling, { cancelPollingsByKey } from '@/utils/polling';
import { checkOrderStatus } from '@/api/order';
import urls from '@/utils/urls';
import Layout from '@/components/Layout';

function PlanPageWithCheckTransaction() {
  const router = useRouter();
  const { checkUpgrade, tradeNo: tradeNoQuery } = router.query;
  const tradeNo = Array.isArray(tradeNoQuery) ? tradeNoQuery[0] : tradeNoQuery;
  useEffect(() => {
    if (tradeNo) {
      polling(() => checkOrderStatus(tradeNo), {
        shouldStop: (res) => res.status === 'SUCCESS',
        key: 'order'
      }).result.then(() => {
        router.replace(urls.page.plan);
      });
    }
    return () => {
      cancelPollingsByKey('order');
    };
  }, [tradeNo]);
  if (tradeNo) {
    return <Layout loading />;
  }
  if (checkUpgrade == null) {
    return <PlanPage />;
  }
  return <CheckUpgradeTransaction />;
}

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content))
    }
  };
}

export default PlanPageWithCheckTransaction;
