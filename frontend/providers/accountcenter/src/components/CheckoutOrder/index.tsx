import { getCardList } from '@/api/card';
import { useLoading } from '@/hooks/useLoading';
import { TCardScheam } from '@/schema/card';
import { Box, Center, Divider, Flex, FormControl, FormLabel, Link, Text } from '@chakra-ui/react';
import { Trans, useTranslation } from 'next-i18next';
import { FC, Fragment, ReactNode, useEffect, useState } from 'react';
import Icon from '../Icon';
import upperFirst from '@/utils/upperFirst';
import lowerFirst from '@/utils/lowerFirst';
import ActionButton from '../ActionButton';
import { useAPIErrorMessage } from '@/hooks/useToastAPIResult';
import { RepeatIcon } from '@chakra-ui/icons';
import RadioOptionGroup from '../RadioOption/Group';

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
  items: SummaryItems[];
}
interface CheckoutOrderProps {
  summary: Summary | (() => Promise<Summary>);
  onCheckout: (cardId: string | undefined) => any;
  minHeight?: string;
}
// type FormData = { billingnAddress: string; cardID: string; };
const newCardValue = 'newCard';
const CheckoutOrder: FC<CheckoutOrderProps> = ({ summary: propSummary, onCheckout, minHeight }) => {
  const getAPIErrorMessage = useAPIErrorMessage();
  const { Loading } = useLoading();
  const { t } = useTranslation();
  const [cards, setCards] = useState<TCardScheam[]>([]);
  const [loading, setLoading] = useState({
    cards: true,
    summary: typeof propSummary === 'function' ? true : false
  });
  const [summary, setSummary] = useState<Summary | null>(
    typeof propSummary === 'function' ? null : propSummary
  );
  const [loadSummaryError, setLoadSummaryErrror] = useState<any>();
  const [cardID, setCardID] = useState('');
  const fetchSummaryIfNeeded = () => {
    if (typeof propSummary === 'function') {
      setLoading((prev) => ({ ...prev, summary: true }));
      propSummary().then(
        (s) => {
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
    getCardList()
      .catch(() => ({ cardList: [] }))
      .then((res) => {
        const cardList = Array.isArray(res?.cardList) ? res.cardList : [];
        setCards(cardList);
        setLoading((prev) => ({ ...prev, cards: false }));
        setCardID(cardList[0]?.id || newCardValue);
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
    const periodText = lowerFirst(t(upperFirst(summary.period), { defaultValue: summary.period }));
    return renderTotalAmount(t('TotalBilledWithPeriod', { periodText }), summary.periodicAmount);
  };
  const handleCheckout = () => {
    return onCheckout(cardID === newCardValue ? undefined : cardID);
  };
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
                {item.subContent ? <Box mt="12px">{item.subContent}</Box> : null}
              </Fragment>
            ))
          : null}
        <Divider my="12px" borderColor="#E6EAF4" opacity="1" />
        {renderPeriodAmountOfSummary()}
        {renderTotalAmount(t('DueToday'), summary?.amount)}
      </>
    );
  };
  const cardOptions = cards.map((card) => {
    return {
      label: t('CardEndsIn', { no: card.cardNo }),
      value: card.id,
      icons: (
        <Center h="24px">
          <Icon name={card.cardBrand.toLowerCase() as 'mastercard' | 'visa'} />
        </Center>
      )
    };
  });
  cardOptions.push({
    label: t('CreditCard'),
    value: newCardValue,
    icons: (
      <>
        <Center h="24px">
          <Icon name="visa" />
        </Center>
        <Center h="24px">
          <Icon name="mastercard" />
        </Center>
      </>
    )
  });
  return (
    <Flex
      border="1px solid transparent"
      bg="linear-gradient(#fff, #fff) padding-box, linear-gradient(180deg, #B0CBFF 0%, #D8D1FE 100%) border-box"
      backgroundClip="border-box"
      boxShadow="0px 1px 2px 0px rgba(0, 0, 0, 0.05)"
      borderRadius="16px"
      color="rgb(24, 24, 27)"
      minH={minHeight}
    >
      <Flex
        p="32px 40px"
        w="50%"
        flexDirection="column"
        // justifyContent='space-between'
      >
        <Box>
          <FormControl position="relative">
            <FormLabel fontSize="16px" fontWeight="600" lineHeight="1" mb="16px">
              {t('PaymentDetails')}
            </FormLabel>
            {loading.cards ? (
              <Loading fixed={false} loading />
            ) : (
              <RadioOptionGroup
                options={cardOptions}
                value={cardID}
                onChange={setCardID}
                name="cardID"
              />
            )}
          </FormControl>
        </Box>
        <Box>
          <ActionButton
            w="100%"
            borderRadius="8px"
            display="block"
            mt="50px"
            mb="24px"
            onClick={handleCheckout}
          >
            {t('Checkout')}
          </ActionButton>
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
  );
};

export default CheckoutOrder;
