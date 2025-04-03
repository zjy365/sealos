import {
  TLastTransactionResponse,
  TPlanApiResponse,
  TSubscriptionApiResponse
} from '@/schema/plan';
import { Box, Button, ButtonProps, Flex, GridItem, Text } from '@chakra-ui/react';
import { upperFirst } from 'lodash';
import { useTranslation } from 'next-i18next';
import { FC } from 'react';
import usePlanFeatureTexts from './usePlanFeatureTexts';
import CircleCheck from '@/components/Icon/icons/circleCheck.svg';
import { formatMoneyStr } from '@/utils/format';
import CancelPlanButton from './CancelPlanButton';
import { Track } from '@sealos/ui';

export interface PlanSelectorItemProps {
  plan: TPlanApiResponse;
  currentPlan: TPlanApiResponse;
  freePlan: TPlanApiResponse | undefined;
  lastTransaction: TLastTransactionResponse | undefined;
  onSelect?: (plan: TPlanApiResponse) => void;
  onCancelSuccess?: () => void;
}
const buttonStyle: ButtonProps = {
  borderRadius: '8px',
  w: '100%',
  display: 'block',
  bg: 'rgb(24, 24, 27)',
  color: 'rgb(250, 250, 250)',
  _disabled: {
    opacity: '0.5',
    cursor: 'not-allowed'
  }
};
const PlanSelectorItem: FC<PlanSelectorItemProps> = ({
  plan,
  currentPlan,
  freePlan,
  lastTransaction,
  onSelect,
  onCancelSuccess
}) => {
  const { t } = useTranslation();
  const period = t(`Per${upperFirst(plan.period)}`, { defaultValue: '' }).toLowerCase();
  const isCurrent = currentPlan.id === plan.id;
  const isFree = plan.amount === 0;
  const featurTexts = usePlanFeatureTexts(plan, {
    inlcudeCredits: true,
    hideFreeMaxResourcesPerRegionText: true
  });
  const handlePurchase = () => {
    onSelect?.(plan);
  };
  const renderButton = () => {
    if (isCurrent) {
      return (
        <Button {...buttonStyle} isDisabled>
          {t('YourCurrentPlan')}
        </Button>
      );
    }
    if (isFree) {
      return (
        <CancelPlanButton
          plan={currentPlan}
          freePlan={freePlan}
          lastTransaction={lastTransaction}
          buttonProps={() => buttonStyle}
          text={() => t('CancelSubscription')}
          fallback={<Box h="40px" />}
          onCancelSuccess={onCancelSuccess}
        />
      );
    }
    return (
      <Track.Click eventName={Track.events.purchase(plan.name)}>
        <Button {...buttonStyle} onClick={handlePurchase}>
          {t('PurchasePlan')}
        </Button>
      </Track.Click>
    );
  };
  return (
    <Box
      h="100%"
      border="1px solid rgb(228, 228, 231)"
      borderRadius="16px"
      p="32px"
      color="rgb(113, 113, 122)"
      fontSize="14px"
      fontWeight="400"
      opacity={isCurrent ? '0.7' : undefined}
    >
      <Flex h="100%" flexDirection="column" justifyContent="space-between">
        <Box>
          <Flex justifyContent="space-between" alignItems="center" fontWeight="600">
            <Text lineHeight="28px" fontSize="20px" color="rgb(24, 24, 27)">
              {plan.name}
            </Text>
            {plan.mostPopular ? (
              <Box
                p="2px 10px"
                bg="rgb(28, 78, 245)"
                lineHeight="16px"
                fontSize="12px"
                color="#fff"
                borderRadius="9999px"
              >
                {t('MostPopular')}
              </Box>
            ) : null}
          </Flex>
          <Text lineHeight="20px" mt="12px">
            {plan.description}
          </Text>
        </Box>
        <Box>
          <Flex alignItems="baseline" my="24px">
            <Text lineHeight="40px" fontSize="36px" fontWeight="600" color="rgb(24, 24, 27)">
              ${formatMoneyStr(plan.amount)}
            </Text>
            <Text lineHeight="24px" fontSize="16px">
              {period ? `/${period}` : ''}
            </Text>
          </Flex>
          {renderButton()}
          <Flex mt="30px" flexDirection="column" gap="12px">
            {featurTexts.map(({ key, text }) => (
              <Flex key={key} gap="8px">
                <Box flexShrink={0} mt="2px">
                  <CircleCheck
                    width="16px"
                    height="16px"
                    stroke="rgb(28, 78, 245)"
                    strokeWidth="1.4px"
                  />
                </Box>
                <Text lineHeight="20px">{text}</Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};
export default PlanSelectorItem;
