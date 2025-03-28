import { serviceSideProps } from '@/utils/i18n';
import { useRouter } from 'next/router';
import PlanPage from '@/components/PlanPage';
import CheckUpgradeTransaction from '@/components/CheckTransaction/Upgrade';

function PlanPageWithChceckTransaction() {
  const router = useRouter();
  const { checkUpgrade } = router.query;
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

export default PlanPageWithChceckTransaction;
