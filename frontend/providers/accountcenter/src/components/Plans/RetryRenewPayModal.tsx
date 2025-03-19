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
import CheckoutOrder from '../CheckoutOrder';
import useGetPlanOrderSummary from '../CheckoutOrder/useGetPlanOrderSummary';
import { getPlans, updatePlan } from '@/api/plan';
import useToastAPIResult from '@/hooks/useToastAPIResult';

export interface RetryRenewPayModalProps {
  plans?: TPlanApiResponse[];
  lastTransaction: TLastTransactionResponse;
  isOpen: boolean;
  onClose: () => void;
  onPaySuccess?: () => void;
}
const RetryRenewPayModal: FC<RetryRenewPayModalProps> = ({
  plans: propPlans,
  lastTransaction,
  isOpen,
  onClose,
  onPaySuccess
}) => {
  const { t } = useTranslation();
  const { toastSuccess } = useToastAPIResult();
  const getPlanOrderSummary = useGetPlanOrderSummary();
  const handleCheckout = (cardID: string | undefined) => {
    return updatePlan({
      cardID,
      planID: lastTransaction.NewPlanID,
      planName: lastTransaction.NewPlanName,
      planType: 'renewal'
    });
  };
  const handlePaySuccess = () => {
    toastSuccess(t('PaySuccess'));
    onClose();
    onPaySuccess?.();
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
    return getPlanOrderSummary(plan);
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
            />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
export default RetryRenewPayModal;
