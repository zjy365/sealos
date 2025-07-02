import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import img from 'public/images/switchRegionBg.png';
import {
  getLastTransaction,
  getPlanCreditsUsage,
  getPlans,
  getPlanSubscription,
  getUserKycInfo
} from '@/api/plan';
import CurrentPlan from '@/components/Plans/Current';
import { TPlanApiResponse } from '@/schema/plan';
import PlanCredits from '@/components/Plans/Credits';
import {
  Box,
  Button,
  Text,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure
} from '@chakra-ui/react';
import Alert from '@/components/Alert';
import { useAPIErrorMessage } from '@/hooks/useToastAPIResult';
import PlanAlert from '@/components/Alert/PlanAlert';
import CreditsAlert from '@/components/Alert/CreditsAlert';
import FreeConnectGithubAlert from '@/components/Alert/FreeConnectGithubAlert';
import { getUserInfo } from '@/api/user';
import { sealosApp } from 'sealos-desktop-sdk/app';
import { jwtDecode } from 'jwt-decode';
import { getRawRegionList } from '@/api/usage';
import { RawRegion } from '@/types/region';
import { getToken, getUserSession } from '@/utils/user';
import { ArrowRightIcon } from 'lucide-react';
import RegionToggle from './RegionToggle';
import { useGlobalStore } from '@/store/global';
import { Track } from '@sealos/ui';

export default function PlanPage() {
  const [initialized, setInitialized] = useState({
    plans: false,
    usage: false,
    subscription: false,
    lastTransaction: false,
    kycInfo: false
  });
  const { upgradeSuccess, setUpgradeSuccess } = useGlobalStore();
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
  console.log(plansResponse, 'plansResponse');

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
  const { data: regionListData } = useQuery(['rawRegionlist'], getRawRegionList, {
    cacheTime: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const regionList: RawRegion[] = useMemo(() => {
    return (regionListData?.regionList || []).filter((item) => !item?.description.isFree);
  }, [regionListData]);

  const token = getToken();
  const curRegionUid = useMemo(() => {
    try {
      return jwtDecode<{ regionUid: string }>(token!).regionUid;
    } catch {
      return '';
    }
  }, [token]);
  const [selectedRegionUid, setSelectedRegion] = useState(curRegionUid);
  const switchRegion = (regionUid: string) => {
    sealosApp.runEvents('switchRegion', regionUid);
  };
  const { data: lastTransactionResponse, refetch: refetchLastTransaction } = useQuery(
    ['lastTransaction'],
    getLastTransaction,
    {
      onSettled() {
        setInitialized((prev) => ({ ...prev, lastTransaction: true }));
      }
    }
  );
  const {
    data: userKycInfoResponse,
    refetch: refetchUserKycInfo,
    error: userKycInfoError
  } = useQuery(['kycInfo'], getUserKycInfo, {
    onSettled() {
      setInitialized((prev) => ({ ...prev, kycInfo: true }));
    }
  });
  const { data: userInfo, isLoading: isLoadingUserInfo } = useQuery(['userInfo'], getUserInfo, {
    refetchOnWindowFocus: true
  });
  const firstError = plansError || creditsError || subscriptionError || userKycInfoError;
  const refresh = () => {
    refetchPlans();
    refetchCreditsUsage();
    refetchSubscription();
    refetchLastTransaction();
    refetchUserKycInfo();
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
  const { isOpen, onClose } = useDisclosure({
    defaultIsOpen: upgradeSuccess
  });
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
          kycInfo={userKycInfoResponse}
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
  return (
    <>
      <Layout loading={!isLoadingEnd}>{renderMain()}</Layout>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setUpgradeSuccess(false);
        }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent
          maxW="384px"
          borderRadius="16px"
          bgColor={'#FFFFFF'}
          p={0}
          sx={{
            _before: 'unset'
          }}
          overflow={'hidden'}
          border="1px solid #2778FD"
          boxShadow="0px 12px 24px rgba(0, 0, 0, 0.12)"
        >
          <ModalHeader p={0}>
            <Box h="180px" bg={`url(${img.src})`} bgSize="cover"></Box>
          </ModalHeader>
          <ModalBody p={6}>
            <Text fontSize="24px" fontWeight="semibold" mb={3}>
              Upgrade Successfully
            </Text>
            <Text fontSize="14px" color="gray.700" mb="16px">
              For ensured stability and better experiences, switch to members-only AZ now.
            </Text>
            <RegionToggle
              regionList={regionList}
              setCurrentRegion={setSelectedRegion}
              currentRegionUid={selectedRegionUid}
            />
            <Track.Click eventName={Track.events.upgradeSwitch}>
              <Button
                w="full"
                variant="solid"
                rightIcon={<ArrowRightIcon></ArrowRightIcon>}
                mb={'16px'}
                onClick={() => switchRegion(selectedRegionUid)}
              >
                Switch Now
              </Button>
            </Track.Click>
            <Divider borderColor="#E4E4E7" borderStyle="dashed" mb={'22px'} />

            {/* <Button w="full" variant="ghost" color={'#18181B'} onClick={onClose}> */}
            <Track.Click eventName={Track.events.upgradeContinue}>
              <Button
                w="full"
                variant="ghost"
                color={'#18181B'}
                onClick={() => {
                  onClose();
                }}
              >
                Continue with current availability zone
              </Button>
            </Track.Click>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
