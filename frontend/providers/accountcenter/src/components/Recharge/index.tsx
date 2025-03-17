import {
  Grid,
  GridItem,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  useDisclosure,
  GridItemProps,
  Flex,
  Box
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { FC, SyntheticEvent, useState } from 'react';
import RechargeCheckoutModal from './CheckoutModal';

interface RechargeProps {
  onRecharge?: (amount: number) => void;
}
const minCustomAmount = 10;
const maxCustomAmount = 10000;
const amounts = [10, 20, 30];
const gridItemStyle: GridItemProps = {
  bg: 'rgba(249, 249, 249, 1)',
  h: '64px',
  verticalAlign: 'middle',
  borderRadius: '8px',
  fontSize: '20px',
  fontWeight: '600',
  color: 'rgba(24, 24, 27, 1)',
  cursor: 'pointer'
};
function isInvalidAmount(numberValue: number) {
  return (
    isNaN(numberValue) ||
    numberValue < minCustomAmount ||
    numberValue > maxCustomAmount ||
    !Number.isInteger(numberValue)
  );
}
const Recharge: FC<RechargeProps> = (props) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [inputValue, setInputValue] = useState(String(minCustomAmount));
  const [inputErrorKey, setInputErrorKey] = useState('');
  const {
    isOpen: isCheckoutModalOpen,
    onOpen: openCheckoutModal,
    onClose: closeCheckoutModal
  } = useDisclosure();
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  const recharge = (amount: number) => {
    setCheckoutAmount(amount);
    openCheckoutModal();
  };
  const handleCustomAmountClick = () => {
    setInputValue(String(minCustomAmount));
    setInputErrorKey('');
    onOpen();
  };
  const handleCustomAmountConfirm = () => {
    const amount = Number(inputValue);
    if (isInvalidAmount(amount)) return;
    onClose();
    recharge(amount);
  };
  const handleCustomAmountInputChange = (e: SyntheticEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    setInputValue(value);
    if (value.trim() === '') {
      setInputErrorKey('FormRequiredMessage');
      return;
    }
    const numberValue = Number(value);
    if (isInvalidAmount(numberValue)) {
      setInputErrorKey('RechargeCustomAmountFormatMessage');
      return;
    }
    setInputErrorKey('');
  };
  return (
    <>
      <Text lineHeight="28px" fontSize="18px" fontWeight="600" mb="16px">
        {t('Recharge')}
      </Text>
      <Grid templateColumns="repeat(4,1fr)" gap="12px">
        {amounts.map((amount) => (
          <GridItem key={amount} {...gridItemStyle} onClick={() => recharge(amount)}>
            <Flex h="100%" alignItems="center" justifyContent="center">
              <Text fontSize="16px">$</Text>
              <Text>{amount}</Text>
            </Flex>
          </GridItem>
        ))}
        <GridItem {...gridItemStyle} onClick={handleCustomAmountClick}>
          <Flex h="100%" alignItems="center" justifyContent="center">
            {t('RechargeCustomAmount')}
          </Flex>
        </GridItem>
      </Grid>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent maxW="456px">
          <ModalHeader>{t('RechargeCustomAmountModalTitle')}</ModalHeader>
          <ModalBody>
            <FormControl isInvalid={Boolean(inputErrorKey)}>
              <FormLabel>{t('RechargeCustomAmountHint')}</FormLabel>
              <Input
                type="number"
                min={minCustomAmount}
                max={maxCustomAmount}
                step={1}
                value={inputValue}
                onChange={handleCustomAmountInputChange}
              />
              <Box minH="21px" overflow="hidden">
                <FormErrorMessage>
                  {inputErrorKey ? t(inputErrorKey, { label: t('Amount') }) : ''}
                </FormErrorMessage>
              </Box>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleCustomAmountConfirm}>{t('Confirm')}</Button>
            <Button variant="ghost" onClick={onClose}>
              {t('Cancel')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <RechargeCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={closeCheckoutModal}
        amount={checkoutAmount}
      />
    </>
  );
};
export default Recharge;
