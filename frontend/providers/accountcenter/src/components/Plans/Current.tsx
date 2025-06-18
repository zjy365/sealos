import {
  TLastTransactionResponse,
  TPlanApiResponse,
  TSubscriptionApiResponse,
  TUserKycApiResponse
} from '@/schema/plan';
import {
  Box,
  Card,
  Flex,
  Text,
  Button,
  Divider,
  Grid,
  GridItem,
  CardBody,
  HTMLChakraProps,
  useDisclosure
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { FC, useMemo } from 'react';
import StarIcon from '@/components/Icon/icons/star.svg';
import UpgradeStarIcon from '@/components/Icon/icons/upgradePlanStar.svg';
import CircleCheck from '@/components/Icon/icons/circleCheck.svg';
import usePlanFeatureTexts from './usePlanFeatureTexts';
import { formatDate, formatMoney } from '@/utils/format';
import upperFirst from '@/utils/upperFirst';
import CancelPlanButton from './CancelPlanButton';
import UpgradePlanModal from './UpgradeModal';
import { isPlanCancelling } from './planStatus';
import useScene from '@/hooks/useScene';
import { Track, MyTooltip } from '@sealos/ui';
import { InfoOutlineIcon } from '@chakra-ui/icons';

interface CurrentPlanProps {
  plans: TPlanApiResponse[];
  plan: TPlanApiResponse;
  freePlan: TPlanApiResponse | undefined;
  isMaxAmountPlan?: boolean;
  lastTransaction: TLastTransactionResponse | undefined;
  subscriptionResponse: TSubscriptionApiResponse | undefined;
  refresh: () => void;
  kycInfo: TUserKycApiResponse | undefined;
}
const planStyleConfig = {
  free: {
    card: {
      bg: 'transparent',
      color: '#18181B',
      position: 'relative',
      _before: {
        content: '""',
        position: 'absolute',
        top: '-1px',
        left: '-1px',
        bottom: '-1px',
        right: '-1px',
        boxSizing: 'border-box',
        border: '1px solid transparent',
        bg: 'linear-gradient(#fff,#fff) padding-box,linear-gradient(270.48deg, rgba(39, 120, 253, 0.3) 3.93%, rgba(39, 120, 253, 0.3) 18.25%, rgba(135, 161, 255, 0.3) 80.66%) border-box',
        backgroundClip: 'border-box',
        zIndex: 1,
        borderRadius: '12px'
      },
      _after: {
        bg: 'linear-gradient(270.48deg, rgba(39, 120, 253, 0.1) 3.93%, rgba(39, 120, 253, 0.1) 18.25%, rgba(135, 161, 255, 0.1) 80.66%)',
        content: '""',
        position: 'absolute',
        top: '0',
        left: '0',
        bottom: '0',
        right: '0',
        zIndex: 2,
        borderRadius: '12px'
      }
    } as HTMLChakraProps<'div'>,
    feature: {
      tickColor: 'rgb(28, 78, 245)',
      color: '#71717A'
    },
    upgradeButton: {}
  },
  maxAmount: {
    card: {
      bg: 'linear-gradient(270.48deg, #1C4EF5 3.93%, #6F59F5 80.66%)',
      color: '#FAFAFA'
    }
  },
  normal: {
    card: {
      bg: 'linear-gradient(270.48deg, #2778FD 3.93%, #2778FD 18.25%, #829DFE 80.66%)',
      color: '#FAFAFA'
    },
    feature: {
      tickColor: 'rgba(255, 255, 255, 0.6)',
      color: '#fff'
    },
    upgradeButton: {
      bg: '#fff',
      color: 'rgba(24, 24, 27, 1)',
      _hover: {
        bg: '#fff',
        color: 'rgba(24, 24, 27, 1)'
      },
      _active: {
        bg: '#fff',
        color: 'rgba(24, 24, 27, 1)'
      }
    }
  }
};
const CurrentPlan: FC<CurrentPlanProps> = ({
  plan,
  isMaxAmountPlan,
  subscriptionResponse,
  lastTransaction,
  freePlan,
  refresh,
  plans,
  kycInfo
}) => {
  const { t } = useTranslation();
  const featurTexts = usePlanFeatureTexts(plan);
  const isFree = plan.amount === 0;
  const styleConfig = useMemo(() => {
    if (isFree) return { ...planStyleConfig.normal, ...planStyleConfig.free };
    if (isMaxAmountPlan) return { ...planStyleConfig.normal, ...planStyleConfig.maxAmount };
    return planStyleConfig.normal;
  }, [isFree, isMaxAmountPlan]);
  const isUpgradable = Array.isArray(plan.upgradePlanList) && plan.upgradePlanList.length > 0;
  const isCancelled = isPlanCancelling(lastTransaction);
  const {
    isOpen: isUpgradeModalOpen,
    onOpen: openUpgradeModal,
    onClose: closeUpgradeModal
  } = useDisclosure();
  useScene('upgrade', () => {
    openUpgradeModal();
  });
  const renderFeature = (text: string, key: string) => {
    return (
      <GridItem key={key} visibility={text === '' ? 'hidden' : undefined}>
        <Flex columnGap="8px" alignItems="center">
          <CircleCheck
            width="16"
            height="16"
            stroke={styleConfig.feature.tickColor}
            strokeWidth="1.33"
          />
          <Text
            lineHeight="20px"
            fontSize="14px"
            fontWeight="400"
            color={styleConfig.feature.color}
          >
            {text}
          </Text>
        </Flex>
      </GridItem>
    );
  };
  const renderDate = () => {
    if (isCancelled) {
      return (
        <GridItem>
          <Text mb="8px" fontSize="14px" lineHeight="20px" fontWeight="400" color="#71717A">
            {t('CancelsAt')}
          </Text>
          <Text color="#09090B" fontSize="16px" fontWeight="600">
            {formatDate(lastTransaction?.StartAt)}
          </Text>
        </GridItem>
      );
    }
    if (isFree || !subscriptionResponse?.subscription) {
      return null;
    }
    return (
      <GridItem>
        <Text mb="8px" fontSize="14px" lineHeight="20px" fontWeight="400" color="#71717A">
          {t('NextPaymentDate')}
        </Text>
        <Text color="#09090B" fontSize="16px" fontWeight="600">
          {formatDate(subscriptionResponse.subscription.NextCycleDate)}
        </Text>
      </GridItem>
    );
  };
  const getMonthlyGiftAmount = (kycInfo: TUserKycApiResponse | undefined): string => {
    const status = kycInfo?.kycInfo?.Status;
    switch (status) {
      case 'pending':
      case 'completed':
        return '$5';
      case 'failed':
        return '$0';
      default:
        return '';
    }
  };
  const getPlanIncludedAmount = (plan: TPlanApiResponse): string => {
    const planName = plan?.name;
    switch (planName) {
      case 'Free':
        return '$0';
      case 'Hobby':
        return '$5';
      case 'Pro':
        return '$20';
      default:
        return '';
    }
  };
  return (
    <>
      <Card variant="outline">
        <CardBody p="8px">
          <Box
            border="1px"
            borderColor="transparent"
            borderRadius="12px"
            p="24px"
            {...styleConfig.card}
          >
            <Box position="relative" zIndex={3}>
              <Flex justifyContent="space-between" alignItems="center">
                <Flex fontWeight="600" fontSize="24px" lineHeight="32px" alignItems="flex-start">
                  <Text>{plan.name}</Text>
                  {isFree ? null : <StarIcon width="12" height="12" fill="#fff" />}
                </Flex>
                <Flex columnGap="12px">
                  {isUpgradable && (
                    <Track.Click eventName={Track.events.accountCenterUpgradeClick(plan.name)}>
                      <Button
                        h="36px"
                        leftIcon={<UpgradeStarIcon width="13" height="13" stroke="currentColor" />}
                        {...styleConfig.upgradeButton}
                        onClick={openUpgradeModal}
                      >
                        {t('UpgradePlan')}
                      </Button>
                    </Track.Click>
                  )}
                  <CancelPlanButton
                    plan={plan}
                    lastTransaction={lastTransaction}
                    freePlan={freePlan}
                    onCancelSuccess={refresh}
                  />
                </Flex>
              </Flex>
              <Divider m="18px 0" borderColor="#F4F4F5" />
              {/* <Grid templateColumns="auto auto auto" rowGap="8px" columnGap="48px"> */}
              <Grid templateColumns="1fr 1fr 1fr" gap="16px" p="20px 0">
                {featurTexts.map(({ text, key }) => renderFeature(text, key))}
              </Grid>
            </Box>
          </Box>
          <Grid p="20px 24px" templateColumns="1fr 1fr 1fr" gap="16px">
            <GridItem>
              <Flex align="center" gap={2} mb="8px">
                <Text fontSize="14px" lineHeight="20px" fontWeight="400" color="#71717A">
                  {t('MonthlyGift', {
                    period: t(`Per${upperFirst(plan.period)}`, { defaultValue: '' })
                  })}
                </Text>
                <MyTooltip
                  label={t('MonthlyGiftDescription', {
                    date: formatDate(kycInfo?.kycInfo?.NextAt)
                  })}
                  placement="top"
                  height="60px"
                  maxW="200px"
                  padding="3"
                  fontSize="12px"
                  wordBreak="break-all"
                >
                  <InfoOutlineIcon color={'#71717A'} w={'16px'} h={'16px'} />
                </MyTooltip>
              </Flex>
              {/* <Text color="#09090B" fontSize="16px" fontWeight="600">
                {typeof plan.amount === 'number' && plan.amount >= 0
                  ? `\$${formatMoney(plan.amount)}`
                  : ''}
              </Text> */}
              <Text color="#09090B" fontSize="16px" fontWeight="600">
                {getMonthlyGiftAmount(kycInfo)}
              </Text>
            </GridItem>
            <GridItem>
              <Text mb="8px" fontSize="14px" lineHeight="20px" fontWeight="400" color="#71717A">
                {t('PlanIncludedCreditsLabel')}
              </Text>
              <Flex gap="8px">
                {/* <Text color="#09090B" fontSize="16px" fontWeight="600">
                  {typeof plan.giftAmount === 'number' && plan.giftAmount > 0
                    ? `\$${formatMoney(plan.giftAmount)}`
                    : ''}
                </Text> */}
                <Text color="#09090B" fontSize="16px" fontWeight="600">
                  {getPlanIncludedAmount(plan)}
                </Text>
                {/* <Text
                  p="6px 8px"
                  border="1px solid rgb(52, 211, 153)"
                  fontSize="12px"
                  fontWeight="400"
                  lineHeight={1}
                  color="rgb(6, 95, 70)"
                  borderRadius="100px"
                  bg="rgb(220, 252, 231)"
                >
                  {t('Sent')}
                </Text> */}
              </Flex>
            </GridItem>
            {renderDate()}
          </Grid>
        </CardBody>
      </Card>
      <UpgradePlanModal
        plans={plans}
        currentPlan={plan}
        freePlan={freePlan}
        lastTransaction={lastTransaction}
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
      />
    </>
  );
};
export default CurrentPlan;
