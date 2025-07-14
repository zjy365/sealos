import { getCardList } from '@/api/card';
import { useLoading } from '@/hooks/useLoading';
import { TCardScheam } from '@/schema/card';
import {
  Box,
  Center,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Link,
  SimpleGrid,
  Text,
  VStack
} from '@chakra-ui/react';
import { Trans, useTranslation } from 'next-i18next';
import { FC, Fragment, ReactNode, useEffect, useMemo, useState } from 'react';
import Icon from '../Icon';
import upperFirst from '@/utils/upperFirst';
import lowerFirst from '@/utils/lowerFirst';
import ActionButton from '../ActionButton';
import useToastAPIResult, { useAPIErrorMessage } from '@/hooks/useToastAPIResult';
import { RepeatIcon } from '@chakra-ui/icons';
import BorderGradient from '../Gradient/Border';
import { Track } from '@sealos/ui';
import polling, { cancelPollingsByKey } from '@/utils/polling';
import { checkOrderStatus } from '@/api/order';
import RadioOption from '../RadioOption';
import Select from '../Select';
import { sealosApp } from 'sealos-desktop-sdk/app';

interface SummaryItems {
  amount: string;
  name: string;
  subContent?: ReactNode;
}
/** Summary展示 */
export interface Summary {
  /** 当天支付金额 */
  amount: string;
  period?: string;
  /** 周期支付金额 */
  periodicAmount?: string;
  /** 提示信息 */
  tip?: string;
  items: SummaryItems[];
  proratedCredit?: string;
}
export enum PayMethod {
  card = 'CARD',
  payPal = 'PAYPAL_CHECKOUT',
  alipay = 'ALIPAY_CN',
  alipayHK = 'ALIPAY_HK'
}
export interface CheckoutData {
  cardID?: string;
  payMethod: PayMethod;
}
interface CheckoutOrderProps {
  summary: Summary | (() => Promise<Summary>);
  onCheckout: (data: CheckoutData) => any;
  onPaySuccess?: () => void;
  autoProcessingPayAPIResult?: boolean;
  autoRedirectToPay?: boolean;
  minHeight?: string;
  // 隐藏无法订阅的支付方式
  isSubscription?: boolean;
}
function checkoutDataToString(data: CheckoutData) {
  return JSON.stringify(data);
}
function parseCheckoutData(str: string) {
  try {
    return JSON.parse(str) as CheckoutData;
  } catch (e) {
    return null;
  }
}
export function getExistCardPayMethod(card: TCardScheam) {
  if (card.cardBrand === PayMethod.alipay) return PayMethod.alipay;
  if (card.cardBrand === PayMethod.alipayHK) return PayMethod.alipayHK;
  return PayMethod.card;
}
enum RadioValue {
  new = 'new',
  existing = 'existing'
}
const shouldOpenInDesktopPayMethods = new Set([PayMethod.alipay, PayMethod.alipayHK]);
// type FormData = { billingnAddress: string; cardID: string; };
const newCardValue = checkoutDataToString({ payMethod: PayMethod.card });
const newCardOptionActiveStyle = {
  borderColor: 'rgb(28, 78, 245)',
  bg: 'rgba(28, 78, 245, 0.05)'
};
const CheckoutOrder: FC<CheckoutOrderProps> = ({
  summary: propSummary,
  onCheckout,
  minHeight,
  autoProcessingPayAPIResult = true,
  autoRedirectToPay = true,
  isSubscription,
  onPaySuccess
}) => {
  const getAPIErrorMessage = useAPIErrorMessage();
  const { Loading } = useLoading();
  const { t } = useTranslation();
  const [cards, setCards] = useState<TCardScheam[]>([]);
  const { toastAPIError, toastError } = useToastAPIResult();
  const [loading, setLoading] = useState({
    cards: true,
    summary: typeof propSummary === 'function' ? true : false
  });
  const [summary, setSummary] = useState<Summary | null>(
    typeof propSummary === 'function' ? null : propSummary
  );
  const [loadSummaryError, setLoadSummaryErrror] = useState<any>();
  const [radioValue, setRadioValue] = useState(RadioValue.new);
  const [existingPaymentMethod, setExistingPaymentMethod] = useState<string>();
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const fetchSummaryIfNeeded = () => {
    if (typeof propSummary === 'function') {
      setLoading((prev) => ({ ...prev, summary: true }));
      propSummary().then(
        (s) => {
          console.log('s propSummary', s);
          setSummary(s);
          setLoadSummaryErrror(null);
          setLoading((prev) => ({ ...prev, summary: false }));
        },
        (e) => {
          setLoadSummaryErrror(e);
          setLoading((prev) => ({ ...prev, summary: false }));
        }
      );
    }
  };
  useEffect(() => {
    return () => cancelPollingsByKey('order');
  }, []);
  useEffect(() => {
    getCardList()
      .catch(() => ({ cardList: [] }))
      .then((res) => {
        const cardList = Array.isArray(res?.cardList) ? res.cardList : [];
        setCards(cardList);
        setLoading((prev) => ({ ...prev, cards: false }));
        const defaultCard = cardList.find((card) => Boolean(card.default)) || cardList[0];
        if (defaultCard?.id) {
          setExistingPaymentMethod(
            checkoutDataToString({
              payMethod: getExistCardPayMethod(defaultCard),
              cardID: defaultCard.id
            })
          );
          setRadioValue(RadioValue.existing);
        } else {
          setNewPaymentMethod(newCardValue);
          setRadioValue(RadioValue.new);
        }
      });
    fetchSummaryIfNeeded();
  }, []);
  const renderTotalAmount = (label: string, value: string | undefined) => {
    return (
      <Flex justifyContent="space-between" mb="24px" alignItems="center">
        <Text fontSize="14px" fontWeight="500" lineHeight="20px">
          {label}
        </Text>
        <Text fontSize="14px" lineHeight="20px" fontWeight="500" color="rgb(9, 9, 11)">
          {value}
        </Text>
      </Flex>
    );
  };
  const renderPeriodAmountOfSummary = () => {
    if (!summary || !summary.period || !summary.periodicAmount) return null;
    const periodText = summary.period.toLowerCase();
    return renderTotalAmount(t('TotalBilledWithPeriod', { periodText }), summary.periodicAmount);
  };

  const handleCheckout = async () => {
    const value = radioValue === RadioValue.existing ? existingPaymentMethod : newPaymentMethod;
    if (!value) {
      toastError(t('PleaseSelectPaymentMethod'));
      return;
    }
    const checkoutData = parseCheckoutData(value);
    if (!checkoutData) {
      toastError(t('UnknowError'));
      return;
    }
    const res = onCheckout(checkoutData);
    if (!autoProcessingPayAPIResult) {
      return res;
    }
    try {
      const data = await res;
      if (!data.success) {
        if (data.error) {
          toastError(data.error);
        } else {
          toastError(t('UnknowError'));
        }
        return data;
      }
      if (!data.redirectUrl) {
        // 已有卡才没redirect
        if (checkoutData.cardID) {
          if (data.tradeNo) {
            await polling(() => checkOrderStatus(data.tradeNo), {
              shouldStop: (res) => res.status === 'SUCCESS',
              key: 'order'
            }).result;
          }
          onPaySuccess?.();
        } else {
          toastError(t('UnknowError'));
        }
        return data;
      }
      if (autoRedirectToPay) {
        if (shouldOpenInDesktopPayMethods.has(checkoutData.payMethod)) {
          sealosApp.runEvents('open', { url: data.redirectUrl });
          return;
        }
        location.href = data.redirectUrl;
        return data;
      }
      return data;
    } catch (e) {
      toastAPIError(e);
      return Promise.reject(e);
    }
  };

  console.log(summary, 'summary index');

  const renderSummary = () => {
    if (loading.summary) return <Loading fixed={false} loading />;
    if (loadSummaryError) {
      return (
        <Flex alignItems="center">
          <Text color="rgb(255, 77, 79)">{getAPIErrorMessage(loadSummaryError)}</Text>
          <Flex
            ml="4px"
            flexGrow="0"
            onClick={fetchSummaryIfNeeded}
            alignItems="center"
            color="rgb(22, 119, 255)"
            cursor="pointer"
          >
            <RepeatIcon mr="2px" />
            <Text>{t('Reload')}</Text>
          </Flex>
        </Flex>
      );
    }
    return (
      <>
        {summary?.tip ? (
          <Box
            borderRadius="6px"
            bg="rgba(52, 96, 238, 0.05)"
            p="8px"
            mb="24px"
            mt={'12px'}
            color="rgb(52, 96, 238)"
            fontSize={'14px'}
            fontWeight={400}
          >
            {summary.tip}
          </Box>
        ) : null}
        {Array.isArray(summary?.items)
          ? summary?.items.map((item) => (
              <Fragment key={item.name}>
                <Flex justifyContent="space-between" mt="24px" alignItems="center">
                  <Text fontSize="16px" fontWeight="500">
                    {item.name}
                  </Text>
                  <Text fontSize="18px" lineHeight="28px" fontWeight="600" color="rgb(9, 9, 11)">
                    {item.amount}
                  </Text>
                </Flex>
                {/* {item.subContent ? <Box mt="12px">{item.subContent}</Box> : null} */}
              </Fragment>
            ))
          : null}
        <Divider my="12px" borderColor="#E6EAF4" opacity="1" />
        {renderPeriodAmountOfSummary()}
        {summary?.proratedCredit
          ? renderTotalAmount('Prorated credit', summary.proratedCredit)
          : null}
        {renderTotalAmount(t('DueToday'), summary?.amount)}
      </>
    );
  };
  const cardOptions = useMemo(() => {
    const existing = cards.map((card) => {
      const payMethod = getExistCardPayMethod(card);
      const labelText =
        payMethod === PayMethod.card
          ? t('CardEndsIn', { no: card.cardNo })
          : `${t(payMethod)} ${card.cardNo}`;
      return {
        label: (
          <Flex cursor="pointer" h="32px" alignItems="center" gap="8px">
            <Center
              w="35px"
              h="24px"
              border="1px solid rgb(228, 228, 231)"
              bg="#fff"
              borderRadius="4px"
            >
              <Icon
                name={card.cardBrand.toLowerCase() as 'mastercard' | 'visa'}
                maxH="24px"
                w="24px"
              />
            </Center>
            <Text fontSize="14px" fontWeight="500">
              {labelText}
            </Text>
          </Flex>
        ),
        value: checkoutDataToString({
          payMethod,
          cardID: card.id
        })
      };
    });
    let newMethods = [
      {
        value: newCardValue,
        icons: (
          <>
            <Icon name="mastercard" height="20px" />
            <Icon name="visa" height="11px" />
          </>
        )
      },
      {
        value: checkoutDataToString({ payMethod: PayMethod.payPal }),
        icons: <Icon name="payPal" height="26px" />,
        canSubscription: false
      },
      {
        value: checkoutDataToString({ payMethod: PayMethod.alipay }),
        icons: <Icon name="alipay_cn" height="11px" />
      },
      {
        value: checkoutDataToString({ payMethod: PayMethod.alipayHK }),
        icons: <Icon name="alipay_hk" height="13px" />
      }
    ];
    if (isSubscription) {
      newMethods = newMethods.filter((method) => method.canSubscription !== false);
    }
    return { existing, new: newMethods };
  }, [cards, isSubscription, t]);
  const renderExistingCards = () => {
    if (cardOptions.existing.length > 0) {
      return (
        <Flex flexDir="column" gap="10px">
          <RadioOption
            p="0"
            name="payment-method-raid"
            value={radioValue}
            isChecked={radioValue === RadioValue.existing}
            onChange={(e) => {
              if (e.currentTarget.checked) {
                setRadioValue(RadioValue.existing);
                setNewPaymentMethod('');
              }
            }}
          >
            {t('UseExistingPaymentMethod')}
          </RadioOption>
          <Select
            options={cardOptions.existing}
            value={existingPaymentMethod}
            variants="outline-white"
            height="44px"
            width="100%"
            showSearch
            onChange={(value) => {
              setExistingPaymentMethod(value);
              setNewPaymentMethod('');
              setRadioValue(RadioValue.existing);
            }}
          />
        </Flex>
      );
    }
    return null;
  };
  return (
    <BorderGradient
      borderGradientWidth={1}
      borderRadius={16}
      boxShadow="0px 1px 2px 0px rgba(0, 0, 0, 0.05)"
      borderGradient={
        <linearGradient x1="448" y1="1" x2="448" y2="473" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B0CBFF" />
          <stop offset="1" stopColor="#D8D1FE" />
        </linearGradient>
      }
    >
      <Flex color="rgb(24, 24, 27)" minH={minHeight}>
        <Flex p="32px 40px" w="50%" flexDirection="column">
          <Box>
            <FormControl position="relative">
              <FormLabel fontSize="16px" fontWeight="600" lineHeight="1" mb="16px">
                {t('ChoosePaymentMethod')}
              </FormLabel>
              {loading.cards ? (
                <Loading fixed={false} loading />
              ) : (
                <VStack
                  align="stretch"
                  spacing="20px"
                  divider={<Divider borderColor="rgb(228, 228, 231)" />}
                >
                  {renderExistingCards()}
                  <Flex flexDir="column" gap="10px">
                    <RadioOption
                      p="0"
                      name="payment-method-raid"
                      value={radioValue}
                      isChecked={radioValue === RadioValue.new}
                      onChange={(e) => {
                        if (e.currentTarget.checked) {
                          setRadioValue(RadioValue.new);
                          if (!newPaymentMethod) {
                            setNewPaymentMethod(newCardValue);
                          }
                        }
                      }}
                    >
                      {t('AddNewPaymentMethod')}
                    </RadioOption>
                    <SimpleGrid columns={2} spacing="8px">
                      {cardOptions.new.map((option) => {
                        const isActive = option.value === newPaymentMethod;
                        const style = isActive ? newCardOptionActiveStyle : {};
                        return (
                          <Center
                            key={option.value}
                            h="40px"
                            bg="rgb(248, 248, 248)"
                            borderWidth="1px"
                            borderStyle="solid"
                            borderColor="transparent"
                            borderRadius="8px"
                            cursor="pointer"
                            gap="15px"
                            onClick={() => {
                              setNewPaymentMethod(option.value);
                              setRadioValue(RadioValue.new);
                            }}
                            _hover={newCardOptionActiveStyle}
                            {...style}
                          >
                            {option.icons}
                          </Center>
                        );
                      })}
                    </SimpleGrid>
                  </Flex>
                </VStack>
              )}
            </FormControl>
          </Box>
          <Box>
            <Track.Click eventName={Track.events.checkout}>
              <ActionButton
                w="100%"
                borderRadius="8px"
                display="block"
                mt="50px"
                mb="24px"
                isDisabled={loading.cards || loading.summary || loadSummaryError}
                onClick={handleCheckout}
              >
                {t('Checkout')}
              </ActionButton>
            </Track.Click>
            <Text fontSize="12px" lineHeight="16px" fontWeight="400" color="rgb(115, 115, 115)">
              <Trans
                i18nKey={t('ReadTermsConditionsAndPrivacyPolicy')}
                components={{
                  Link: (
                    <Link
                      href="https://docs.run.claw.cloud/app-platform/legal/terms-and-conditions"
                      textDecoration="underline"
                      target="_blank"
                    />
                  )
                }}
              />
            </Text>
          </Box>
        </Flex>
        <Box
          p="32px"
          bg="rgb(240, 245, 255)"
          w="50%"
          borderTopRightRadius="16px"
          borderBottomRightRadius="16px"
          position="relative"
        >
          <Text fontSize="16px" fontWeight="600" lineHeight="1">
            {t('OrderSummary')}
          </Text>
          {renderSummary()}
        </Box>
      </Flex>
    </BorderGradient>
  );
};

export default CheckoutOrder;
