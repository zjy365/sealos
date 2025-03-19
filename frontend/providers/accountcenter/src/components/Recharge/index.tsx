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
  Flex
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { FC, SyntheticEvent, useState } from 'react';

interface RechargeProps {
  onRecharge?: (amount: number) => void;
}
const minCustomAmount = 10;
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
const Recharge: FC<RechargeProps> = (props) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [inputValue, setInputValue] = useState(String(minCustomAmount));
  const [inputErrorKey, setInputErrorKey] = useState('');
  const recharge = (amount: number) => {};
  const handleCustomAmountClick = () => {
    // setInputValue(String(minCustomAmount));
    // setInputErrorKey('');
    // onOpen();
  };
  const handleCustomAmountConfirm = () => {
    const amount = Number(inputValue);
    if (isNaN(amount) || amount < minCustomAmount) return;
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
    if (isNaN(numberValue) || numberValue < 10 || !Number.isInteger(numberValue)) {
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
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('RechargeCustomAmountModalTitle')}</ModalHeader>
          <ModalBody></ModalBody>
          <FormControl>
            <FormLabel>{t('RechargeCustomAmountHint')}</FormLabel>
            <Input
              type="number"
              min="10"
              max="10000"
              step={1}
              value={inputValue}
              onChange={handleCustomAmountInputChange}
            />
            {inputErrorKey ? (
              <FormErrorMessage>{t(inputErrorKey, { label: t('Amount') })}</FormErrorMessage>
            ) : null}
          </FormControl>
          <ModalFooter>
            <Button onClick={handleCustomAmountConfirm}>{t('Confirm')}</Button>
            <Button variant="ghost" onClick={onClose}>
              {t('Cancel')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default Recharge;
