import { TPlanApiResponse, TSubscriptionApiResponse } from '@/schema/plan';
import { Grid, GridItem } from '@chakra-ui/react';
import { FC, useMemo } from 'react';
import PlanSelectorItem, { PlanSelectorItemProps } from './PlanSelectorItem';

export interface PlanSelectorProps extends Omit<PlanSelectorItemProps, 'plan'> {
  plans: TPlanApiResponse[];
  minHeight?: string;
}
const PlanSelector: FC<PlanSelectorProps> = ({ plans, minHeight, ...rest }) => {
  const sortedPlans = useMemo(() => {
    if (!Array.isArray(plans)) return [];
    const copy = [...plans];
    copy.sort((a, b) => a.amount - b.amount);
    return copy;
  }, [plans]);
  if (!Array.isArray(plans) || !plans.length) return null;
  return (
    <Grid templateColumns={`repeat(${plans.length}, 1fr)`} gap="24px">
      {sortedPlans.map((plan) => {
        return (
          <GridItem key={plan.id} minH={minHeight}>
            <PlanSelectorItem plan={plan} {...rest} />
          </GridItem>
        );
      })}
    </Grid>
  );
};
export default PlanSelector;
