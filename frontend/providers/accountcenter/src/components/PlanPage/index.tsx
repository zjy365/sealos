import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { getLastTransaction, getPlanCreditsUsage, getPlans, getPlanSubscription } from '@/api/plan';
import CurrentPlan from '@/components/Plans/Current';
import { TPlanApiResponse } from '@/schema/plan';
import PlanCredits from '@/components/Plans/Credits';
import { Flex } from '@chakra-ui/react';
import Alert from '@/components/Alert';
import { useAPIErrorMessage } from '@/hooks/useToastAPIResult';
import PlanAlert from '@/components/Alert/PlanAlert';
import CreditsAlert from '@/components/Alert/CreditsAlert';
import FreeConnectGithubAlert from '@/components/Alert/FreeConnectGithubAlert';
import { getUserInfo } from '@/api/user';

export default function PlanPage() {
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
  const { data: lastTransactionResponse, refetch: refetchLastTransaction } = useQuery(
    ['lastTransaction'],
    getLastTransaction,
    {
      onSettled() {
        setInitialized((prev) => ({ ...prev, lastTransaction: true }));
      }
    }
  );
  const { data: userInfo, isLoading: isLoadingUserInfo } = useQuery(['userInfo'], getUserInfo, {
    refetchOnWindowFocus: true
  });
  const firstError = plansError || creditsError || subscriptionError;
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
    const currentPlanIsFree = currentPlan.amount === 0;
    return (
      <Flex flexDirection="column" rowGap="16px" pb="20px">
        {currentPlanIsFree ? (
          <FreeConnectGithubAlert
            userInfo={userInfo}
            subscriptionResponse={subscriptionResponse}
            plans={plans}
            currentPlan={currentPlan}
            freePlan={freePlan}
            lastTransaction={lastTransactionResponse?.transcation}
          />
        ) : null}
        <CreditsAlert
          creditsUsage={creditsUsage}
          plans={plans}
          currentPlan={currentPlan}
          freePlan={freePlan}
          lastTransaction={lastTransactionResponse?.transcation}
        />
        <PlanAlert
          plans={plans}
          lastTransaction={lastTransactionResponse?.transcation}
          includeCancelling
        />
        <CurrentPlan
          plans={plans}
          plan={currentPlan}
          subscriptionResponse={subscriptionResponse}
          lastTransaction={lastTransactionResponse?.transcation}
          isMaxAmountPlan={currentPlan?.amount === planMaxAmount}
          freePlan={freePlan}
          refresh={refresh}
        />
        {creditsUsage ? (
          <PlanCredits
            userInfo={userInfo}
            isLoadingUserInfo={isLoadingUserInfo}
            plan={currentPlan}
            creditsUsage={creditsUsage}
            onPaySuccess={refresh}
          />
        ) : null}
      </Flex>
    );
  };
  return <Layout loading={!isLoadingEnd}>{renderMain()}</Layout>;
}
