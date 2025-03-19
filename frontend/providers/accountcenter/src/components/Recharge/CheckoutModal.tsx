import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { FC } from 'react';
import CheckoutOrder from '../CheckoutOrder';
import { recharge } from '@/api/plan';
import { deFormatMoney } from '@/utils/format';
import useToastAPIResult from '@/hooks/useToastAPIResult';

interface RechargeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaySuccess?: () => void;
  /** 此处是真实数字，给接口要* */
  amount: number;
}
const RechargeCheckoutModal: FC<RechargeCheckoutModalProps> = ({
  isOpen,
  onClose,
  amount,
  onPaySuccess
}) => {
  const { t } = useTranslation();
  const { toastSuccess } = useToastAPIResult();
  const handleCheckout = (cardID: string | undefined) => {
    return recharge({
      amount: deFormatMoney(amount),
      cardID
    });
  };
  const handlePaySuccess = () => {
    toastSuccess(t('PaySuccess'));
    onClose();
    onPaySuccess?.();
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW="972px">
        <ModalCloseButton />
        <ModalBody borderRadius="16px" py="32px">
          <Text fontSize="24px" fontWeight="600" textAlign="center" mb="30px">
            {t('RechargeCredit')}
          </Text>
          <CheckoutOrder
            summary={{
              amount: `\$${amount}`,
              items: [
                {
                  name: t('RechargeCredit'),
                  amount: `\$${amount}`
                }
              ]
            }}
            onPaySuccess={handlePaySuccess}
            onCheckout={handleCheckout}
            minHeight="472px"
            autoRedirectToPay={isOpen}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
export default RechargeCheckoutModal;
