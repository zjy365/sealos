import { TPlanApiResponse } from '@/schema/plan';
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
import { FC, useEffect, useState } from 'react';
import PlanSelector, { PlanSelectorProps } from './PlanSelector';
import CheckoutOrder, { CheckoutData } from '../CheckoutOrder';
import useGetPlanOrderSummary from '../CheckoutOrder/useGetPlanOrderSummary';
import { getUpgradePlanAmount, updatePlan } from '@/api/plan';
import { useRouter } from 'next/router';
import urls from '@/utils/urls';

export interface UpgradePlanModalProps
  extends Omit<PlanSelectorProps, 'minHeight' | 'hoverIndex' | 'setHoverIndex' | 'expanded'> {
  isOpen: boolean;
  onClose: () => void;
}
const UpgradePlanModal: FC<UpgradePlanModalProps> = ({ isOpen, onClose, ...rest }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<TPlanApiResponse | null>(null);
  const getPlanOrderSummary = useGetPlanOrderSummary();
  const handleCheckout = (data: CheckoutData) => {
    if (!selectedPlan) return;
    return updatePlan({
      planID: selectedPlan.id,
      planName: selectedPlan.name,
      planType: 'upgrade',
      ...data
    });
  };
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedPlan(null);
    }
  }, [isOpen]);
  const handleSelectPlan = (plan: TPlanApiResponse) => {
    if (plan) {
      setSelectedPlan(plan);
      setStep(2);
    }
  };
  const handlePaySuccess = () => {
    router.push({
      pathname: urls.page.plan,
      search: '?checkUpgrade'
    });
  };
  const renderStep = () => {
    if (step === 1) {
      return (
        <>
          {/* <Text
            color="rgb(113, 113, 122)"
            fontSize="16px"
            fontWeight="400"
            mb="24px"
            mt="12px"
            textAlign="center"
          >
            {t('UpgradePlanDesc')}
          </Text> */}
          <PlanSelector {...rest} minHeight="416px" onSelect={handleSelectPlan} />
        </>
      );
    }
    if (step === 2 && selectedPlan) {
      const getSummary = () => {
        if (rest.currentPlan.amount === 0) {
          return Promise.resolve(getPlanOrderSummary(selectedPlan));
        }
        return getUpgradePlanAmount(selectedPlan.name).then((data) => {
          if (typeof data.amount === 'number') {
            return getPlanOrderSummary(selectedPlan, data.amount);
          }
          throw new Error(t('GetUpgradeAmountError'));
        });
      };
      return (
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
      );
    }
    return null;
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW="1112px">
        <ModalCloseButton />
        <ModalBody borderRadius="16px" py="32px" px="40px">
          <Text fontSize="24px" fontWeight="600" textAlign="center">
            {t('UpgradePlan')}
          </Text>
          {renderStep()}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
export default UpgradePlanModal;
