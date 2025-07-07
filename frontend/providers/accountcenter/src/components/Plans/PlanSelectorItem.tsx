import { TLastTransactionResponse, TPlanApiResponse } from '@/schema/plan';
import { Box, Button, ButtonProps, Center, Flex, Text, Tooltip } from '@chakra-ui/react';
import { upperFirst } from 'lodash';
import { useTranslation } from 'next-i18next';
import { FC, useCallback } from 'react';
import usePlanFeatureTexts from './usePlanFeatureTexts';
import { formatMoneyStr } from '@/utils/format';
import CancelPlanButton from './CancelPlanButton';
import { Track } from '@sealos/ui';
import { Info, Check } from 'lucide-react';
import React from 'react';

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
  periodType: 'YEARLY' | 'MONTHLY';
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
  expanded = false,
  periodType
}) => {
  const { t } = useTranslation();
  const period = t(`Per${upperFirst(plan.period)}`, { defaultValue: '' }).toLowerCase();
  const currentPeriod = currentPlan.period;
  const isCurrent =
    currentPlan.id === plan.id && (plan.name === 'Free' || currentPeriod === periodType);
  const isFree = plan.amount === 0;
  const isCurrentPro = currentPlan.name === 'Pro';
  const featureTexts = usePlanFeatureTexts(plan, {
    inlcudeCredits: true,
    hideFreeMaxResourcesPerRegionText: true
  });
  const featureTextsPlaceholders: { key: string; text: string }[] = [];
  const renderFeatureText = ({ key, text }: { key: string; text: string }, index: number) => {
    return (
      <React.Fragment key={key}>
        <Flex
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
        {key.endsWith('-withbr') && <Box h="0px" borderBottom="1px dashed #E4E4E7" />}
      </React.Fragment>
    );
  };
  for (let i = 0; i < featureTextsMinLength - featureTexts.length; i++) {
    featureTextsPlaceholders.push({ key: `placeholder${i}`, text: '' });
  }
  const handlePurchase = () => {
    onSelect?.(plan);
  };

  // console.log(currentPlan, plan, 'currentPlan, plan', periodType);

  const renderButton = () => {
    // 当前计划
    if (isCurrent) {
      return (
        <Button {...buttonStyle} isDisabled>
          {t('YourCurrentPlan')}
        </Button>
      );
    }

    // 降级到Free计划
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

    // 判断是否允许从当前计划切换到目标计划
    const isEligibleForUpgrade = () => {
      const targetPeriod = periodType;

      // 如果是相同的计划名称，但周期不同
      if (plan.name === currentPlan.name && currentPeriod !== targetPeriod) {
        // 从月付到年付是升级
        return currentPeriod === 'MONTHLY' && targetPeriod === 'YEARLY';
      }

      // 不同计划名称的情况
      const currentLevel = getPlanLevel(currentPlan.name);
      const targetLevel = getPlanLevel(plan.name);

      // 更高级别的计划
      if (targetLevel > currentLevel) {
        if (currentPeriod === 'YEARLY') {
          return targetPeriod === 'YEARLY';
        }
        return true;
      }

      return false;
    };

    if (!isEligibleForUpgrade()) {
      return (
        <Button {...buttonStyle} isDisabled>
          {t('IneligibleForDowngrade')}
        </Button>
      );
    }

    // 允许升级的情况
    return (
      <Track.Click eventName={Track.events.purchase(plan.name)}>
        <Button
          {...buttonStyle}
          bg={
            plan.name === 'Hobby'
              ? 'linear-gradient(270deg, #116BFF 4.93%, #829DFE 86.35%);'
              : 'linear-gradient(270deg, #1C4EF5 5.12%, #826FF6 86.56%);'
          }
          _hover={{
            bg:
              plan.name === 'Hobby'
                ? 'linear-gradient(270deg, #116BFF 4.93%, #829DFE 86.35%);'
                : 'linear-gradient(270deg, #1C4EF5 5.12%, #826FF6 86.56%);'
          }}
          onClick={handlePurchase}
        >
          {t('PurchasePlan')}
        </Button>
      </Track.Click>
    );
  };

  // 辅助函数：获取计划等级
  const getPlanLevel = (planName: string) => {
    switch (planName) {
      case 'Free':
        return 0;
      case 'Hobby':
        return 1;
      case 'Pro':
        return 2;
      default:
        return -1;
    }
  };

  const renderIcon = () => {
    if (isFree) return null;
    return (
      <Center
        boxSize={'24px'}
        bg={
          plan.name === 'Hobby'
            ? 'linear-gradient(270deg, rgba(39, 120, 253, 0.20) 3.93%, rgba(39, 120, 253, 0.20) 18.25%, rgba(130, 157, 254, 0.20) 80.66%)'
            : 'linear-gradient(270deg, rgba(28, 78, 245, 0.20) 3.93%, rgba(111, 89, 245, 0.20) 80.66%);'
        }
        borderRadius={'4px'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
          <path
            d="M4.76116 8.09995C4.70759 7.89231 4.59937 7.70282 4.44774 7.55119C4.29611 7.39956 4.10662 7.29133 3.89898 7.23777L0.218079 6.28859C0.15528 6.27077 0.100008 6.23294 0.060651 6.18086C0.021294 6.12878 0 6.06528 0 6C0 5.93472 0.021294 5.87122 0.060651 5.81914C0.100008 5.76705 0.15528 5.72923 0.218079 5.71141L3.89898 4.76163C4.10655 4.70812 4.29599 4.59998 4.44761 4.44846C4.59923 4.29694 4.7075 4.10758 4.76116 3.90005L5.71034 0.219144C5.72798 0.156097 5.76576 0.100552 5.81792 0.0609847C5.87009 0.0214174 5.93376 0 5.99923 0C6.0647 0 6.12837 0.0214174 6.18053 0.0609847C6.23269 0.100552 6.27048 0.156097 6.28812 0.219144L7.23669 3.90005C7.29026 4.10769 7.39849 4.29718 7.55012 4.44881C7.70175 4.60044 7.89124 4.70867 8.09887 4.76223L11.7798 5.71081C11.8431 5.72827 11.8989 5.76601 11.9387 5.81825C11.9785 5.87049 12 5.93434 12 6C12 6.06566 11.9785 6.12951 11.9387 6.18175C11.8989 6.23399 11.8431 6.27173 11.7798 6.28919L8.09887 7.23777C7.89124 7.29133 7.70175 7.39956 7.55012 7.55119C7.39849 7.70282 7.29026 7.89231 7.23669 8.09995L6.28752 11.7809C6.26988 11.8439 6.23209 11.8994 6.17993 11.939C6.12777 11.9786 6.0641 12 5.99863 12C5.93316 12 5.86949 11.9786 5.81733 11.939C5.76516 11.8994 5.72738 11.8439 5.70973 11.7809L4.76116 8.09995Z"
            fill="url(#paint0_linear_782_54842)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_782_54842"
              x1="11.5346"
              y1="10.814"
              x2="2.25007"
              y2="10.7362"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={plan.name === 'Hobby' ? '#2778FD' : '#1C4EF5'} />
              <stop offset="0.186656" stopColor={plan.name === 'Hobby' ? '#2778FD' : '#1C4EF5'} />
              <stop offset="1" stopColor={plan.name === 'Hobby' ? '#829DFE' : '#6F59F5'} />
            </linearGradient>
          </defs>
        </svg>
      </Center>
    );
  };
  const renderPriceInfo = () => {
    const calculateSavings = () => {
      if (isFree || !plan.annualAmount) return '';
      const monthlyTotal = plan.amount * 12;
      const annualTotal = plan.annualAmount;
      const savings = monthlyTotal - annualTotal;
      return `$${formatMoneyStr(savings)} billed yearly`;
    };

    return (
      <Flex mt="16px" mb={periodType === 'YEARLY' ? '20px' : '40px'} flexDirection={'column'}>
        <Flex alignItems="baseline">
          {!isFree && periodType === 'YEARLY' && (
            <Text mr={'2px'} lineHeight="40px" fontSize="36px" fontWeight="600" color="#71717A">
              ${formatMoneyStr(plan.annualAmount / 12, true)}
            </Text>
          )}
          <Text lineHeight="40px" fontSize="36px" fontWeight="600" color="rgb(24, 24, 27)">
            ${formatMoneyStr(plan.amount)}
          </Text>
          <Text lineHeight="24px" fontSize="16px" fontWeight="400">
            /monthly
          </Text>
        </Flex>
        {periodType === 'YEARLY' && (
          <Text fontSize="14px" fontWeight="400" color="#71717A" height={'20px'}>
            {!isFree ? calculateSavings() : ''}
          </Text>
        )}
      </Flex>
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
      p="16px 20px"
      {...(plan.mostPopular && {
        border: '1px solid #8CAFFF',
        bg: 'rgba(140, 175, 255, 0.05)',
        boxShadow: '0px 0px 0px 4px rgba(140, 175, 255, 0.20)'
      })}
    >
      <Flex h="100%" flexDirection="column" justifyContent="space-between">
        <Box minH="80px">
          <Flex gap={'8px'} alignItems="center" fontWeight="600">
            {renderIcon()}
            <Text lineHeight="28px" fontSize="20px" color="rgb(24, 24, 27)">
              {plan.name}
            </Text>
          </Flex>
          <Text lineHeight="20px" mt="12px">
            {plan.description}
          </Text>
        </Box>
        <Box>
          {renderPriceInfo()}
          <Box>{renderButton()}</Box>
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
