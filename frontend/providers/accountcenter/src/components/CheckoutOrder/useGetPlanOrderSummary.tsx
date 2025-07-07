import { TPlanApiResponse } from '@/schema/plan';
import { Summary } from '.';
import { formatMoneyStr } from '@/utils/format';
import { useTranslation } from 'next-i18next';
import { upperFirst } from 'lodash';
import { useGetPlanFeatureTexts } from '@/components/Plans/usePlanFeatureTexts';
import { Box, Flex, Text } from '@chakra-ui/react';
import CircleCheck from '@/components/Icon/icons/circleCheck.svg';

export default function useGetPlanOrderSummary() {
  const { t } = useTranslation();
  const getPlanFeatureTexts = useGetPlanFeatureTexts();
  const getItemPeriodText = (plan: TPlanApiResponse) => {
    const upperFirstPeriod = upperFirst(plan.period);
    console.log(`Per${upperFirstPeriod}Short`, upperFirstPeriod, plan, 123123);
    const shortText = t(`Per${upperFirstPeriod}Short`, { defaultValue: '' });
    if (shortText) return shortText.toLowerCase();
    return t(`Per${upperFirstPeriod}`, { defaultValue: plan.period }).toLowerCase();
  };
  return function getOrderSummaryOfPlan(plan: TPlanApiResponse, todayDue?: number): Summary {
    const amount = typeof todayDue === 'number' && todayDue > 0 ? todayDue : plan.amount;
    const featurTexts = getPlanFeatureTexts(plan, {
      inlcudeCredits: true,
      hideFreeMaxResourcesPerRegionText: true
    });
    return {
      amount: `\$${formatMoneyStr(amount)}`,
      period: plan.period,
      periodicAmount: `\$${formatMoneyStr(plan.amount)}`,
      items: [
        {
          name: t('PlanFullName', { name: plan.name }),
          amount: `\$${formatMoneyStr(plan.amount)}/${getItemPeriodText(plan)}`,
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
