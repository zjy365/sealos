import { TLastTransactionResponse, TPlanApiResponse } from '@/schema/plan';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  Box
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { FC } from 'react';
import CheckoutOrder, { CheckoutData } from '../CheckoutOrder';
import useGetPlanOrderSummary from '../CheckoutOrder/useGetPlanOrderSummary';
import { getPlans, updatePlan } from '@/api/plan';
import urls from '@/utils/urls';
import { useRouter } from 'next/router';
export interface RetryRenewPayModalProps {
  plans?: TPlanApiResponse[];
  lastTransaction: TLastTransactionResponse;
  isOpen: boolean;
  onClose: () => void;
}
const RetryRenewPayModal: FC<RetryRenewPayModalProps> = ({
  plans: propPlans,
  lastTransaction,
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const getPlanOrderSummary = useGetPlanOrderSummary();
  const handleCheckout = (data: CheckoutData) => {
    return updatePlan({
      planID: lastTransaction.NewPlanID,
      planName: lastTransaction.NewPlanName,
      planType: 'renewal',
      ...data,
      period: lastTransaction.PayPeriod || 'MONTHLY'
    });
  };
  const handlePaySuccess = () => {
    router.push({
      pathname: urls.page.plan,
      search: '?checkUpgrade'
    });
  };
  const getSummary = async () => {
    let plans: TPlanApiResponse[];
    if (Array.isArray(propPlans) && propPlans.length > 0) {
      plans = propPlans;
    } else {
      plans = (await getPlans()).planList;
      if (!Array.isArray(plans)) {
        throw new Error(t('FetchPlansError'));
      }
    }
    const plan = plans.find((p) => p.id === lastTransaction.NewPlanID);
    if (!plan) {
      throw new Error('PlanNotExist');
    }
    return getPlanOrderSummary({ ...plan, period: lastTransaction.PayPeriod });
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW="972px">
        <ModalCloseButton />
        <ModalBody borderRadius="16px" py="32px">
          <Text fontSize="24px" fontWeight="600" textAlign="center">
            {t('MakePayment')}
          </Text>
          <Box mt="30px">
            <CheckoutOrder
              summary={getSummary}
              minHeight="484px"
              onCheckout={handleCheckout}
              autoRedirectToPay={isOpen}
              onPaySuccess={handlePaySuccess}
              isSubscription
            />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
export default RetryRenewPayModal;
