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
  /** 此处是真实数字，给接口要* */
  amount: number;
}
const RechargeCheckoutModal: FC<RechargeCheckoutModalProps> = ({ isOpen, onClose, amount }) => {
  const { t } = useTranslation();
  const { toastError, toastAPIError } = useToastAPIResult();
  const handleCheckout = (cardID: string | undefined) => {
    return recharge({
      amount: deFormatMoney(amount),
      cardID
    }).then(
      (data) => {
        if (data.redirectUrl && isOpen) {
          location.href = data.redirectUrl;
          onClose();
          return;
        }
        if (data.error) {
          toastError(data.error);
          return;
        }
        toastError(t('UnknowError'));
      },
      (e) => {
        toastAPIError(e);
      }
    );
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
            onCheckout={handleCheckout}
            minHeight="472px"
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
export default RechargeCheckoutModal;
