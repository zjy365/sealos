import { TPlanApiResponse, TSubscriptionApiResponse } from '@/schema/plan';
import { Box, Button, Flex, Grid, GridItem, Text } from '@chakra-ui/react';
import { FC, useMemo, useState } from 'react';
import PlanSelectorItem, { PlanSelectorItemProps } from './PlanSelectorItem';
import { useTranslation } from 'react-i18next';
import { ArrowDown } from 'lucide-react';

export interface PlanSelectorProps
  extends Omit<PlanSelectorItemProps, 'plan' | 'hoverIndex' | 'setHoverIndex' | 'expanded'> {
  plans: TPlanApiResponse[];
  minHeight?: string;
}
const PlanSelector: FC<PlanSelectorProps> = ({ plans, minHeight, ...rest }) => {
  const { t } = useTranslation();
  const sortedPlans = useMemo(() => {
    if (!Array.isArray(plans)) return [];
    const copy = [...plans];
    copy.sort((a, b) => a.amount - b.amount);
    return copy;
  }, [plans]);
  if (!Array.isArray(plans) || !plans.length) return null;
  const [hoverIndex, setHoverIndex] = useState(-1);
  const [expanded, setExpanded] = useState(false);

  return (
    <Box overflowY="scroll" h="584px">
      <Grid
        templateColumns={`repeat(${plans.length}, 1fr)`}
        gap="32px"
        borderY="1px dashed #E4E4E7"
        mt="20px"
        py="12px"
      >
        {sortedPlans.map((plan) => {
          return (
            <GridItem key={plan.id} minH={minHeight}>
              <PlanSelectorItem
                plan={plan}
                {...rest}
                hoverIndex={hoverIndex}
                setHoverIndex={setHoverIndex}
                expanded={expanded}
              />
            </GridItem>
          );
        })}
      </Grid>
      <Flex justifyContent="center" mt="20px">
        <Button
          variant="ghost"
          cursor="pointer"
          bg="#EEEEEE"
          rounded="100px"
          h="28px"
          fontSize="16px"
          fontWeight="400"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <Flex alignItems="center" gap="4px">
            <Text>{t('expandFeatures')}</Text>
            <Flex
              transition="transform 0.3s ease-in-out"
              transform={expanded ? 'rotate(180deg)' : 'rotate(0deg)'}
            >
              <ArrowDown width="16px" height="16px" />
            </Flex>
          </Flex>
        </Button>
      </Flex>
    </Box>
  );
};
export default PlanSelector;
