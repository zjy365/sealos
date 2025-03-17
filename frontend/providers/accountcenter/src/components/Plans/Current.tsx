import { TPlanApiResponse, TPlanMaxResourcesObject, TSubscriptionApiResponse } from '@/schema/plan';
import {
  Box,
  Card,
  Flex,
  Text,
  Image,
  Button,
  Divider,
  Grid,
  GridItem,
  CardBody,
  HTMLChakraProps
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { FC, useMemo } from 'react';
import StarIcon from '../../../public/images/star.svg';
import UpgradeStarIcon from '../../../public/images/upgrade-plan-star.svg';
import CircleCheck from '../../../public/images/circle-check.svg';
import usePlanFeatureTexts from './usePlanFeatureTexts';
import { formatDate, formatMoney } from '@/utils/format';
import upperFirst from '@/utils/upperFirst';

interface CurrentPlanProps {
  plan: TPlanApiResponse;
  isMaxAmountPlan?: boolean;
  subscriptionResponse: TSubscriptionApiResponse | undefined;
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
      tickColor: '#1C4EF5',
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
      tickColor: '#fff',
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
const CurrentPlan: FC<CurrentPlanProps> = ({ plan, isMaxAmountPlan, subscriptionResponse }) => {
  const { t } = useTranslation();
  const featurTexts = usePlanFeatureTexts(plan);
  const isFree = plan.amount === 0;
  const styleConfig = useMemo(() => {
    if (isFree) return { ...planStyleConfig.normal, ...planStyleConfig.free };
    if (isMaxAmountPlan) return { ...planStyleConfig.normal, ...planStyleConfig.maxAmount };
    return planStyleConfig.normal;
  }, [isFree, isMaxAmountPlan]);
  const isUpgradable = Array.isArray(plan.upgradePlanList) && plan.upgradePlanList.length > 0;
  const isCancellable =
    Array.isArray(plan.downgradePlanList) && plan.downgradePlanList.includes('Free');
  const renderFeature = (text: string, key: string) => {
    return (
      <GridItem key={key}>
        <Flex columnGap="8px" alignItems="center">
          <CircleCheck width="16" height="16" stroke={styleConfig.feature.tickColor} />
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
  return (
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
                  <Button
                    h="36px"
                    leftIcon={<UpgradeStarIcon width="13" height="13" stroke="currentColor" />}
                    {...styleConfig.upgradeButton}
                  >
                    {t('UpgradePlan')}
                  </Button>
                )}
                {isCancellable && (
                  <Button
                    variant="outline"
                    h="36px"
                    border="1px solid #E4E4E766"
                    bg="transparent"
                    color="#fff"
                    _hover={{
                      color: '#fff'
                    }}
                    _active={{
                      color: '#fff'
                    }}
                  >
                    {t('CancelPlan')}
                  </Button>
                )}
              </Flex>
            </Flex>
            <Divider m="18px 0" borderColor="#F4F4F5" />
            <Grid templateColumns="auto auto auto" rowGap="8px" columnGap="48px">
              {featurTexts.map(({ text, key }) => renderFeature(text, key))}
            </Grid>
          </Box>
        </Box>
        <Grid p="20px 24px" templateColumns="1fr 1fr 1fr" gap="16px">
          <GridItem>
            <Text mb="8px" fontSize="14px" lineHeight="20px" fontWeight="400" color="#71717A">
              {t('PeriodPrice', {
                period: t(`Per${upperFirst(plan.period)}`, { defaultValue: '' })
              })}
            </Text>
            <Text color="#09090B" fontSize="16px" fontWeight="600">
              {typeof plan.amount === 'number' && plan.amount >= 0
                ? `\$${formatMoney(plan.amount)}`
                : ''}
            </Text>
          </GridItem>
          <GridItem>
            <Text mb="8px" fontSize="14px" lineHeight="20px" fontWeight="400" color="#71717A">
              {t('MonthlyGiftCredits')}
            </Text>
            <Text color="#09090B" fontSize="16px" fontWeight="600">
              {typeof plan.giftAmount === 'number' && plan.giftAmount > 0
                ? `\$${formatMoney(plan.giftAmount)}`
                : ''}
            </Text>
          </GridItem>
          {isFree || !subscriptionResponse?.subscription ? null : (
            <GridItem>
              <Text mb="8px" fontSize="14px" lineHeight="20px" fontWeight="400" color="#71717A">
                {t('NextPaymentDate')}
              </Text>
              <Text color="#09090B" fontSize="16px" fontWeight="600">
                {formatDate(subscriptionResponse.subscription.NextCycleDate)}
              </Text>
            </GridItem>
          )}
        </Grid>
      </CardBody>
    </Card>
  );
};
export default CurrentPlan;
