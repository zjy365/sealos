import {
  TLastTransactionResponse,
  TPlanApiResponse,
  TSubscriptionApiResponse
} from '@/schema/plan';
import { Box, Button, ButtonProps, Flex, GridItem, Text, Tooltip } from '@chakra-ui/react';
import { upperFirst } from 'lodash';
import { useTranslation } from 'next-i18next';
import { FC, ReactNode } from 'react';
import usePlanFeatureTexts from './usePlanFeatureTexts';
import { formatMoneyStr } from '@/utils/format';
import CancelPlanButton from './CancelPlanButton';
import { Track } from '@sealos/ui';
import { Info, Check } from 'lucide-react';

export interface PlanSelectorItemProps {
  plan: TPlanApiResponse;
  currentPlan: TPlanApiResponse;
  freePlan: TPlanApiResponse | undefined;
  lastTransaction: TLastTransactionResponse | undefined;
  onSelect?: (plan: TPlanApiResponse) => void;
  onCancelSuccess?: () => void;
  hoverIndex?: number;
  setHoverIndex?: (index: number) => void;
  expanded?: boolean;
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
  },
  h: '40px'
};
// 控制 placeholder 的个数，设为 plan 中 featureTexts 的长度的最大值
const featureTextsMinLength = 13;
// 未展开前最多显示的条数
const featureDefaultLength = 6;
const PlanSelectorItem: FC<PlanSelectorItemProps> = ({
  plan,
  currentPlan,
  freePlan,
  lastTransaction,
  onSelect,
  onCancelSuccess,
  hoverIndex = -1,
  setHoverIndex = () => {},
  expanded = false
}) => {
  const { t } = useTranslation();
  const period = t(`Per${upperFirst(plan.period)}`, { defaultValue: '' }).toLowerCase();
  const isCurrent = currentPlan.id === plan.id;
  const isFree = plan.amount === 0;
  const isCurrentPro = currentPlan.name === 'Pro';
  const featureTexts = usePlanFeatureTexts(plan, {
    inlcudeCredits: true,
    hideFreeMaxResourcesPerRegionText: true
  });
  const featureTextsPlaceholders: { key: string; text: string }[] = [];
  const renderFeatureText = ({ key, text }: { key: string; text: string }, index: number) => {
    return (
      <>
        <Flex
          key={key}
          gap="8px"
          bg={hoverIndex === index ? '#F5F5F5' : ''}
          rounded="2px"
          visibility={text === '' ? 'hidden' : undefined}
          alignItems="center"
          _hover={{
            bg: 'linear-gradient(270.48deg, rgba(39, 120, 253, 0.1) 3.93%, rgba(39, 120, 253, 0.1) 18.25%, rgba(135, 161, 255, 0.1) 80.66%)'
          }}
          onMouseEnter={() => setHoverIndex(index)}
          onMouseLeave={() => setHoverIndex(-1)}
        >
          <Box flexShrink={0} mt="2px">
            <Check width="16px" height="16px" stroke="#1C4EF5" strokeWidth="1.4px" />
          </Box>
          <Text lineHeight="20px">{text || 'placeholder'}</Text>
          {key === 'nodeport-withIcon' && (
            <Tooltip
              label="Included Database public connection and Devbox SSH connection"
              bg="white"
              color="black"
              borderRadius="8px"
              boxShadow="0px 2px 8px rgba(0, 0, 0, 0.15)"
              fontSize="14px"
              placement="top"
              fontWeight="400"
              p="12px"
            >
              <Info width="16px" height="16px" />
            </Tooltip>
          )}
        </Flex>
        {key.endsWith('-withbr') && <Box key={key} h="0px" borderBottom="1px dashed #E4E4E7" />}
      </>
    );
  };
  for (let i = 0; i < featureTextsMinLength - featureTexts.length; i++) {
    featureTextsPlaceholders.push({ key: `placeholder${i}`, text: '' });
  }
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
        <Button {...buttonStyle} onClick={handlePurchase} isDisabled={isCurrentPro}>
          {t('PurchasePlan')}
        </Button>
      </Track.Click>
    );
  };
  return (
    <Box
      h="100%"
      borderRadius="16px"
      color="rgb(113, 113, 122)"
      fontSize="14px"
      fontWeight="400"
      opacity={isCurrent ? '0.7' : undefined}
    >
      <Flex h="100%" flexDirection="column" justifyContent="space-between">
        <Box minH="80px">
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
          <Text mt="24px" mb="12px" fontSize="14px" fontWeight="500" color="#18181B">
            Key Features
          </Text>
          <Flex flexDirection="column" gap="12px">
            {[...featureTexts, ...featureTextsPlaceholders]
              .slice(0, expanded ? undefined : featureDefaultLength)
              .map(renderFeatureText)}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};
export default PlanSelectorItem;
