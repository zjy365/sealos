import { TPlanApiResponse } from '@/schema/plan';
import { Summary } from '.';
import { formatMoneyStr } from '@/utils/format';
import { useTranslation } from 'next-i18next';
import { useGetPlanFeatureTexts } from '@/components/Plans/usePlanFeatureTexts';
import { Box, Flex, Text } from '@chakra-ui/react';
import CircleCheck from '@/components/Icon/icons/circleCheck.svg';

export default function useGetPlanOrderSummary() {
  const { t } = useTranslation();
  const getPlanFeatureTexts = useGetPlanFeatureTexts();
  const getItemPeriodText = (plan: TPlanApiResponse) => {
    const periodMap: Record<string, string> = {
      MONTHLY: 'Month',
      YEARLY: 'Year',
      WEEKLY: 'Week',
      DAILY: 'Day'
    };
    const normalizedPeriod = periodMap[plan.period] || plan.period.toLowerCase();
    const shortText = t(`Per${normalizedPeriod}Short`, { defaultValue: '' });
    if (shortText) return shortText.toLowerCase();
    return t(`Per${normalizedPeriod}`, { defaultValue: plan.period }).toLowerCase();
  };

  return function getOrderSummaryOfPlan(
    plan: TPlanApiResponse,
    todayDue?: number,
    currentPlan?: TPlanApiResponse
  ): Summary {
    // 获取正确的套餐价格
    const getPlanAmount = () => {
      return plan.period === 'YEARLY' ? plan.annualAmount : plan.amount;
    };

    const amount = typeof todayDue === 'number' && todayDue > 0 ? todayDue : getPlanAmount();

    const featurTexts = getPlanFeatureTexts(plan, {
      inlcudeCredits: true,
      hideFreeMaxResourcesPerRegionText: true
    });

    // 检测升级情况
    const getTipMessage = () => {
      if (!currentPlan) {
        return '';
      }

      // 一、Free计划升级到任何付费计划：无提示
      if (currentPlan.name === 'Free') {
        return '';
      }

      // 二、同计划从月付转年付：周期变更提示
      if (
        currentPlan.name === plan.name &&
        currentPlan.period === 'MONTHLY' &&
        plan.period === 'YEARLY'
      ) {
        return 'Your subscription will convert to an annual plan upon successful payment.';
      }

      // 三、不同计划且从月付转年付：周期变更+立即生效
      if (
        currentPlan.name !== plan.name &&
        currentPlan.period === 'MONTHLY' &&
        plan.period === 'YEARLY'
      ) {
        return 'Your subscription will convert to an annual plan upon successful payment. New plan will be effective immediately.';
      }

      // 四、不同计划同周期升级 或 年付升级到年付：仅立即生效
      if (currentPlan.name !== plan.name) {
        return 'New plan will be effective immediately.';
      }

      // 其他情况无提示
      return '';
    };

    const planAmount = getPlanAmount();

    // 计算按比例抵扣金额
    const proratedCreditAmount = planAmount - amount;
    const proratedCreditStr =
      proratedCreditAmount !== 0 ? `-$${formatMoneyStr(Math.abs(proratedCreditAmount))}` : '';

    return {
      amount: `\$${formatMoneyStr(amount)}`,
      period: plan.period,
      periodicAmount: `\$${formatMoneyStr(planAmount)}`,
      proratedCredit: proratedCreditStr,
      tip: getTipMessage(),
      items: [
        {
          name: t('PlanFullName', { name: plan.name }),
          amount: `\$${formatMoneyStr(planAmount)}/${getItemPeriodText(plan)}`,
          subContent: (
            <Flex flexDirection="column" gap="8px">
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
                  <Text
                    lineHeight="20px"
                    color="rgb(113, 113, 122)"
                    fontSize="14px"
                    fontWeight="400"
                  >
                    {text}
                  </Text>
                </Flex>
              ))}
            </Flex>
          )
        }
      ]
    };
  };
}
