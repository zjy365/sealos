import { useQuery } from '@tanstack/react-query';
import { useLoading } from '@/hooks/useLoading';
import { useMemo, useState } from 'react';
import { serviceSideProps } from '@/utils/i18n';
import Layout from '@/components/Layout';
import { getLastTransaction, getPlanCreditsUsage, getPlans, getPlanSubscription } from '@/api/plan';
import CurrentPlan from '@/components/Plans/Current';
import { TPlanApiResponse } from '@/schema/plan';
import PlanCredits from '@/components/Plans/Credits';
import { Flex } from '@chakra-ui/react';
import Alert from '@/components/Alert';
import { formatDate } from '@/utils/format';
import { useAPIErrorMessage } from '@/hooks/useToastAPIResult';
import PlanAlert from '@/components/Alert/PlanAlert';

function Home() {
  const { Loading } = useLoading();
  const [initialized, setInitialized] = useState({
    plans: false,
    usage: false,
    subscription: false,
    lastTransaction: false
  });
  const getAPIErrorMessage = useAPIErrorMessage();
  const {
    data: plansResponse,
    refetch: refetchPlans,
    error: plansError
  } = useQuery(['plans'], getPlans, {
    onSettled() {
      setInitialized((prev) => ({ ...prev, plans: true }));
    }
  });
  const {
    data: creditsUsage,
    refetch: refetchCreditsUsage,
    error: creditsError
  } = useQuery(['creditsUsage'], getPlanCreditsUsage, {
    onSettled() {
      setInitialized((prev) => ({ ...prev, usage: true }));
    }
  });
  const {
    data: subscriptionResponse,
    refetch: refetchSubscription,
    error: subscriptionError
  } = useQuery(['planSubscription'], getPlanSubscription, {
    onSettled() {
      setInitialized((prev) => ({ ...prev, subscription: true }));
    }
  });
  const {
    data: lastTransactionResponse,
    refetch: refetchLastTransaction,
    error: lastTransactionError
  } = useQuery(['lastTransaction'], getLastTransaction, {
    onSettled() {
      setInitialized((prev) => ({ ...prev, lastTransaction: true }));
    }
  });
  const firstError = plansError || creditsError || subscriptionError || lastTransactionError;
  const refresh = () => {
    refetchPlans();
    refetchCreditsUsage();
    refetchSubscription();
    refetchLastTransaction();
  };
  const plans = plansResponse?.planList;
  const subscription = subscriptionResponse?.subscription;
  const isLoadingEnd =
    initialized.plans &&
    initialized.subscription &&
    initialized.usage &&
    initialized.lastTransaction;
  const { currentPlan, planMaxAmount, freePlan } = useMemo(() => {
    const res: {
      planMaxAmount: number;
      currentPlan?: TPlanApiResponse;
      freePlan?: TPlanApiResponse;
    } = {
      planMaxAmount: 0
    };
    if (!plans || !subscription) return res;
    plans.forEach?.((p) => {
      res.planMaxAmount = Math.max(p.amount, res.planMaxAmount);
      if (p.id === subscription.PlanID) {
        res.currentPlan = p;
      }
      if (p.amount === 0) {
        res.freePlan = p;
      }
    });
    return res;
  }, [plans, subscription]);
  const renderMain = () => {
    if (!isLoadingEnd) return null;
    if (firstError) {
      return <Alert type="error" text={getAPIErrorMessage(firstError)} />;
    }
    if (!currentPlan || !plans) return null;
    return (
      <Flex flexDirection="column" rowGap="16px" pb="20px">
        <PlanAlert lastTransaction={lastTransactionResponse?.transcation} includeCancelling />
        <CurrentPlan
          plans={plans}
          plan={currentPlan}
          subscriptionResponse={subscriptionResponse}
          lastTransaction={lastTransactionResponse?.transcation}
          isMaxAmountPlan={currentPlan?.amount === planMaxAmount}
          freePlan={freePlan}
          refresh={refresh}
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
