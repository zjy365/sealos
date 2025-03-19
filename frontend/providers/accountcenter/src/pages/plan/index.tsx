import { useQuery } from '@tanstack/react-query';
import { useLoading } from '@/hooks/useLoading';
import { useMemo, useState } from 'react';
import { serviceSideProps } from '@/utils/i18n';
import Layout from '@/components/Layout';
import { getPlanCreditsUsage, getPlans, getPlanSubscription } from '@/api/plan';
import CurrentPlan from '@/components/Plans/Current';
import { TPlanApiResponse } from '@/schema/plan';
import PlanCredits from '@/components/Plans/Credits';
import { Flex } from '@chakra-ui/react';

function Home() {
  const { Loading } = useLoading();
  const [initialized, setInitialized] = useState({
    plans: false,
    usage: false,
    subscription: false
  });

  const { data: plansResponse } = useQuery(['plans'], getPlans, {
    onSettled() {
      setInitialized((prev) => ({ ...prev, plans: true }));
    }
  });
  const { data: creditsUsage } = useQuery(['creditsUsage'], getPlanCreditsUsage, {
    onSettled() {
      setInitialized((prev) => ({ ...prev, usage: true }));
    }
  });
  const { data: subscriptionResponse } = useQuery(['planSubscription'], getPlanSubscription, {
    onSettled() {
      setInitialized((prev) => ({ ...prev, subscription: true }));
    }
  });
  const plans = plansResponse?.planList;
  const subscription = subscriptionResponse?.subscription;
  const isLoadingEnd = initialized.plans && initialized.subscription && initialized.usage;
  const { currentPlan, planMaxAmount } = useMemo(() => {
    const res: {
      planMaxAmount: number;
      currentPlan?: TPlanApiResponse;
    } = {
      planMaxAmount: 0
    };
    if (!plans || !subscription) return res;
    plans.forEach?.((p) => {
      res.planMaxAmount = Math.max(p.amount, res.planMaxAmount);
      if (p.id === subscription.PlanID) {
        res.currentPlan = p;
      }
    });
    return res;
  }, [plans, subscription]);
  const renderMain = () => {
    if (!isLoadingEnd) return null;
    if (!currentPlan) return null;
    return (
      <Flex flexDirection="column" rowGap="16px" pb="20px">
        <CurrentPlan
          plan={currentPlan}
          subscriptionResponse={subscriptionResponse}
          isMaxAmountPlan={currentPlan?.amount === planMaxAmount}
        />
        {creditsUsage ? <PlanCredits plan={currentPlan} creditsUsage={creditsUsage} /> : null}
      </Flex>
    );
  };
  return (
    <>
      <Layout>{renderMain()}</Layout>
      <Loading loading={!isLoadingEnd} />
    </>
  );
}

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content))
    }
  };
}

export default Home;
