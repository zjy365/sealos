import { TPlanApiResponse } from '@/schema/plan';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  Box,
  Flex
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { FC, useEffect, useState, useRef } from 'react';
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
  const [periodType, setPeriodType] = useState<'YEARLY' | 'MONTHLY'>('YEARLY');
  const yearlyRef = useRef<HTMLDivElement>(null);
  const monthlyRef = useRef<HTMLDivElement>(null);
  const [sliderStyle, setSliderStyle] = useState({
    left: '4px',
    width: '150px'
  });

  const handleCheckout = (data: CheckoutData) => {
    if (!selectedPlan) return;
    return updatePlan({
      planID: selectedPlan.id,
      planName: selectedPlan.name,
      planType: 'upgrade',
      period: periodType,
      ...data
    });
  };

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedPlan(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const updateSliderPosition = () => {
      if (yearlyRef.current && monthlyRef.current) {
        const yearlyWidth = yearlyRef.current.offsetWidth;
        const monthlyWidth = monthlyRef.current.offsetWidth;
        if (periodType === 'YEARLY') {
          setSliderStyle({
            left: '4px',
            width: `${yearlyWidth}px`
          });
        } else {
          setSliderStyle({
            left: `${yearlyWidth + 4}px`,
            width: `${monthlyWidth}px`
          });
        }
      }
    };

    updateSliderPosition();
    window.addEventListener('resize', updateSliderPosition);
    return () => window.removeEventListener('resize', updateSliderPosition);
  }, [periodType]);

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
          <PlanSelector
            {...rest}
            minHeight="416px"
            onSelect={handleSelectPlan}
            periodType={periodType}
          />
        </>
      );
    }
    if (step === 2 && selectedPlan) {
      const getSummary = () => {
        if (rest.currentPlan.amount === 0) {
          return Promise.resolve(getPlanOrderSummary({ ...selectedPlan, period: periodType }));
        }
        return getUpgradePlanAmount({
          planName: selectedPlan.name,
          period: periodType
        }).then((data) => {
          if (typeof data.amount === 'number') {
            return getPlanOrderSummary(
              { ...selectedPlan, period: periodType },
              data.amount,
              rest.currentPlan
            );
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
          <Flex alignItems={'center'} justifyContent={step === 1 ? 'space-between' : 'center'}>
            <Text fontSize="24px" fontWeight="600" textAlign="center">
              {step === 1 ? t('UpgradePlan') : 'Make Payments'}
            </Text>
            {step === 1 && (
              <Flex
                borderRadius="8px"
                border="1px solid #E4E4E7"
                alignItems="center"
                width="auto"
                height="40px"
                p={'4px'}
                bg={'#0000000D'}
                position="relative"
              >
                <Box
                  position="absolute"
                  left={sliderStyle.left}
                  width={sliderStyle.width}
                  height="32px"
                  bg="#fff"
                  borderRadius="6px"
                  transition="left 0.3s ease, width 0.3s ease"
                  zIndex={1}
                />
                <Flex
                  ref={yearlyRef}
                  position="relative"
                  zIndex={2}
                  p="6px 12px"
                  justifyContent="center"
                  alignItems="center"
                  gap="8px"
                  cursor={'pointer'}
                  onClick={() => setPeriodType('YEARLY')}
                >
                  <Text
                    color={periodType === 'YEARLY' ? '#18181B' : '#71717A'}
                    fontWeight={periodType === 'YEARLY' ? '500' : '400'}
                    transition="color 0.3s ease"
                  >
                    Yearly
                  </Text>
                  <Text
                    fontWeight="600"
                    background="linear-gradient(266deg, #2778FD 48.08%, #829DFE 92.43%)"
                    backgroundClip="text"
                    sx={{
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Save~50%
                  </Text>
                </Flex>
                <Flex
                  ref={monthlyRef}
                  position="relative"
                  zIndex={2}
                  p="6px 12px"
                  justifyContent="center"
                  alignItems="center"
                  gap="8px"
                  cursor={'pointer'}
                  onClick={() => setPeriodType('MONTHLY')}
                >
                  <Text
                    color={periodType === 'MONTHLY' ? '#18181B' : '#71717A'}
                    fontWeight={periodType === 'MONTHLY' ? '500' : '400'}
                    transition="color 0.3s ease"
                  >
                    Monthly
                  </Text>
                </Flex>
              </Flex>
            )}
          </Flex>
          {renderStep()}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
export default UpgradePlanModal;
