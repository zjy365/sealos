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
  ModalCloseButton,
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
import { FC, SyntheticEvent, useState, useEffect } from 'react';
import RechargeCheckoutModal from './CheckoutModal';
import { CircleAlert, ArrowRight } from 'lucide-react';
import { getExpansionRule, calcExpansion } from '@/api/plan';
import { ExpansionRule } from '@/service/crmApi/expansionRule';
import { displayMoney } from '@/utils/format';

interface RechargeProps {
  showBonus?: boolean;
  onPaySuccess?: () => void;
}
const minCustomAmount = 5;
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
const Recharge: FC<RechargeProps> = ({ showBonus, onPaySuccess }) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [inputValue, setInputValue] = useState(String(minCustomAmount));
  const [inputErrorKey, setInputErrorKey] = useState('');
  const {
    isOpen: isCheckoutModalOpen,
    onOpen: openCheckoutModal,
    onClose: closeCheckoutModal
  } = useDisclosure();
  const {
    isOpen: isBonusMetricsOpen,
    onOpen: openBonusMetricsOpen,
    onClose: closeBonusMetricsOpen
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
  const [bonusMetrics, setBonusMetrics] = useState<any[]>([]);

  useEffect(() => {
    async function fetchBonusMetrics() {
      const res = await getExpansionRule();
      setBonusMetrics(res.sort((a, b) => a.min_range - b.min_range));
    }
    if (showBonus) {
      fetchBonusMetrics();
    } else {
      setBonusMetrics([
        { min_range: 5, expansion_pct: 0 },
        { min_range: 100, expansion_pct: 50 }
      ]);
    }
  }, [showBonus]);

  const [bonusCount, setBonusCount] = useState('0');
  useEffect(() => {
    let cancel = false;
    const timer = setTimeout(async () => {
      if (!inputValue || isNaN(Number(inputValue))) return;
      const res = await calcExpansion(Number(inputValue) * 100);
      if (typeof res.amount === 'number' && !cancel) {
        setBonusCount(displayMoney(res.amount / 100));
      }
    }, 500);

    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [inputValue]);
  // const getBonusMetrics = (amount: number) => {
  //   // const index = bonusMetrics.findLastIndex((item) => item.min_range <= amount);
  //   // if (index === -1) {
  //   //   return 0;
  //   // }
  //   // return ((bonusMetrics[index].expansion_pct * amount) / 100).toFixed(2);

  // };
  return (
    <>
      <Text lineHeight="28px" fontSize="18px" fontWeight="600" mb="16px">
        {t('Recharge')}
      </Text>

      <Flex
        p={'18px 24px'}
        background={
          'linear-gradient(270.48deg, rgba(39, 120, 253, 0.1) 3.93%, rgba(39, 120, 253, 0.1) 18.25%, rgba(135, 161, 255, 0.1) 80.66%)'
        }
        rounded={'8px'}
        mb={'16px'}
        justifyContent={'space-between'}
      >
        <Text fontSize="14px" lineHeight={'20px'} fontWeight="400" color="#18181B" mr={'12px'}>
          {t('RechargeHint')}
        </Text>
        <Text
          fontSize="14px"
          lineHeight={'20px'}
          fontWeight="500"
          color="#1C4EF5"
          cursor={'pointer'}
          onClick={openBonusMetricsOpen}
        >
          {t('RechargeHint2')}
        </Text>
      </Flex>

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
            {showBonus ? (
              <>
                <Flex
                  p={'16px'}
                  background={
                    'linear-gradient(270.48deg, rgba(39, 120, 253, 0.1) 3.93%, rgba(39, 120, 253, 0.1) 18.25%, rgba(135, 161, 255, 0.1) 80.66%)'
                  }
                  rounded={'8px'}
                  mb={'16px'}
                >
                  <Text
                    fontSize="14px"
                    lineHeight={'20px'}
                    fontWeight="400"
                    color="#18181B"
                    mr={'12px'}
                  >
                    {t('bonusMetricsAlert')}
                  </Text>
                </Flex>
                <FormControl isInvalid={Boolean(inputErrorKey)}>
                  <Flex mb={'8px'} alignItems={'center'}>
                    <Text
                      width={'284px'}
                      flexShrink={0}
                      fontSize={'14px'}
                      fontWeight={500}
                      color={'#18181B'}
                    >
                      {t('recharge')}
                    </Text>
                    <Text fontSize={'14px'} fontWeight={500} color={'#18181B'}>
                      {t('bonus')}
                    </Text>
                  </Flex>
                  <Flex alignItems={'center'} gap={'12px'}>
                    <Input
                      width={'240px'}
                      flexShrink={0}
                      type="number"
                      min={minCustomAmount}
                      max={maxCustomAmount}
                      step={1}
                      value={inputValue}
                      onChange={handleCustomAmountInputChange}
                      placeholder={t('RechargeCustomAmountPlaceholder')}
                    />
                    <Box>
                      <ArrowRight size={'20px'} color="#737373"></ArrowRight>
                    </Box>
                    <Input
                      flex={1}
                      type="number"
                      readOnly
                      value={bonusCount}
                      cursor={'not-allowed'}
                    />
                  </Flex>
                  {/* <FormLabel mt={"16px"} color={"#71717A"}>{t('RechargeCustomAmountHint')}</FormLabel> */}
                  <Box minH="21px" overflow="hidden">
                    <FormErrorMessage>
                      {inputErrorKey ? t(inputErrorKey, { label: t('Amount') }) : ''}
                    </FormErrorMessage>
                  </Box>
                </FormControl>
              </>
            ) : (
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
            )}
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
        onPaySuccess={onPaySuccess}
      />
      <Modal isOpen={isBonusMetricsOpen} onClose={closeBonusMetricsOpen} isCentered>
        <ModalOverlay />
        <ModalContent maxW="576px">
          <ModalHeader>{t('bonusMetrics')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>{t('bonusMetricsHint')}</Text>
            <Flex mt={'16px'} flexDirection={'column'}>
              <Grid gridTemplateColumns={'1fr 1fr'} background={'#FAFAFA'} borderRadius={'8px'}>
                <Text px={'16px'} fontSize={'14px'} lineHeight={'40px'} color={'#71717A'}>{`${t(
                  'rechargeAmount'
                )} ($)`}</Text>
                <Text px={'16px'} fontSize={'14px'} lineHeight={'40px'} color={'#71717A'}>
                  {t('creditExpansion')}
                </Text>
              </Grid>
              {bonusMetrics.map((item, index, arr) => (
                <Grid
                  key={item.min_range}
                  gridTemplateColumns={'1fr 1fr'}
                  borderBottom={'1px solid #F1F1F3'}
                >
                  <Text px={'16px'} fontSize={'14px'} lineHeight={'48px'} color={'#18181B'}>
                    {index === arr.length - 1
                      ? `>= ${item.min_range}`
                      : `${item.min_range} - ${arr[index + 1].min_range}`}
                  </Text>
                  <Text
                    px={'16px'}
                    fontSize={'14px'}
                    lineHeight={'48px'}
                    color={'#18181B'}
                  >{`${item.expansion_pct}%`}</Text>
                </Grid>
              ))}
            </Flex>
            <Flex mt={'16px'} gap={'8px'}>
              <Box mt={'2px'}>
                <CircleAlert size={'16px'} color={'#71717A'}></CircleAlert>
              </Box>
              <Text fontSize={'14px'} color={'#71717A'}>
                {t('bonusMetricsAlert')}
              </Text>
            </Flex>
            <Box minH="21px" overflow="hidden"></Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
export default Recharge;
