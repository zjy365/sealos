import { TCreditsUsageResponse, TPlanApiResponse } from '@/schema/plan';
import { formatDate, formatMoneyStr } from '@/utils/format';
import {
  Card,
  CardHeader,
  CardBody,
  Flex,
  Text,
  Progress,
  Grid,
  GridItem,
  Box,
  Button
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { CSSProperties, FC, ReactNode } from 'react';
import Recharge from '../Recharge';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { sealosApp } from 'sealos-desktop-sdk/app';
import { TUserInfoReponse } from '@/schema/user';
import { differenceInMonths } from 'date-fns';

interface CreditsProps {
  plan: TPlanApiResponse;
  creditsUsage: TCreditsUsageResponse;
  userInfo: TUserInfoReponse | undefined;
  isLoadingUserInfo?: boolean;
  onPaySuccess?: () => void;
}
const PlanCredits: FC<CreditsProps> = ({
  plan,
  creditsUsage,
  onPaySuccess,
  isLoadingUserInfo: loadingUserInfo,
  userInfo
}) => {
  const { t } = useTranslation();
  const renderLabel = (text: string, ballColor: string | null) => {
    return (
      <Flex
        _before={
          ballColor === null
            ? undefined
            : {
                content: '""',
                display: 'block',
                w: '8px',
                h: '8px',
                borderRadius: '50%',
                bg: ballColor
              }
        }
        gap="4px"
        alignItems="center"
      >
        <Text color="#18181B" lineHeight="16px" fontSize="12px" fontWeight="500">
          {text}
        </Text>
      </Flex>
    );
  };
  const giftCredit: TCreditsUsageResponse['github'] = creditsUsage.github || { total: 0, used: 0 };
  const planCredit: TCreditsUsageResponse['currentPlan'] = creditsUsage.currentPlan || {
    total: 0,
    used: 0
  };
  const chargedCredit: TCreditsUsageResponse['charged'] = creditsUsage.charged || {
    total: 0,
    used: 0
  };
  const restGift = giftCredit.total - giftCredit.used;
  const restCharged = chargedCredit.total - chargedCredit.used;
  const renderExpireDate = (date: any) => {
    return date ? (
      <Text
        color="rgba(113, 113, 122, 1)"
        fontSize="12px"
        fontWeight="400"
        lineHeight="16px"
        mt="4px"
      >
        {t('ExpireDate', { date: formatDate(date) })}
      </Text>
    ) : null;
  };
  const renderGiftCreditContent = (giftExp: ReactNode) => {
    if (loadingUserInfo && !userInfo) {
      return null;
    }
    if (userInfo && !userInfo.bindings.github) {
      const userCreateMonthDiffToday =
        typeof userInfo.user.createdAt === 'number'
          ? differenceInMonths(new Date(), new Date(userInfo.user.createdAt))
          : 0;
      if (userCreateMonthDiffToday >= 1) {
        return (
          <>
            <Text
              mt="8px"
              lineHeight="16px"
              fontSize="12px"
              fontWeight={400}
              color="rgb(113, 113, 122)"
            >
              {t('BindGithubGiftCreditHint')}
            </Text>
            <Box>
              <Button
                mt="15px"
                colorScheme="gray"
                variant="ghost"
                bg="#F4F4F5"
                p="8px 12px"
                rightIcon={<ArrowForwardIcon />}
                onClick={() => {
                  return sealosApp.runEvents(`bindGithub`);
                }}
              >
                {t('ConnectAccount', { platform: 'Github' })}
              </Button>
            </Box>
          </>
        );
      }
    }
    return (
      <>
        <Text mt="12px" fontSize="30px" fontWeight="600">
          ${formatMoneyStr(restGift, 'floor')}
        </Text>
        {giftExp}
        <Progress
          mt="20px"
          value={restGift === 0 ? 0 : (restGift / giftCredit.total) * 100}
          borderRadius="9999px"
          h="8px"
        />
      </>
    );
  };
  const renderBody = () => {
    const gridDivider = (
      <Box
        position="absolute"
        left="-24px"
        top="8px"
        bottom="8px"
        bg="rgba(244, 244, 245, 1)"
        width="1px"
      />
    );
    const renderChargedGridItem = () => {
      return (
        <GridItem position="relative">
          {gridDivider}
          <Flex flexDirection="column">
            {renderLabel(t('PlanRechargedCreditsLabel'), null)}
            <Text mt="12px" fontSize="30px" fontWeight="600">
              ${formatMoneyStr(restCharged, 'floor')}
            </Text>
            {typeof chargedCredit.total === 'number' && renderExpireDate(chargedCredit.time)}
          </Flex>
        </GridItem>
      );
    };
    if (plan.amount === 0) {
      const freePlanGift = (
        <Flex flexDirection="column" rowGap="12px" py="4px">
          <Flex alignItems="baseline" gap="12px">
            <Text lineHeight="36px" fontSize="30px" fontWeight="600" color="#18181B">
              ${formatMoneyStr(restGift, 'floor')}
            </Text>
            <Text fontSize="16px" fontWeight="400" color="#737373">
              ${formatMoneyStr(giftCredit.used, 'floor')}/{formatMoneyStr(giftCredit.total)}{' '}
              {t('Used').toLowerCase()}
            </Text>
          </Flex>
          <Progress
            value={restGift === 0 ? 0 : (restGift / giftCredit.total) * 100}
            borderRadius="9999px"
            h="8px"
          />
          {renderLabel(t('PlanGiftCreditsLabel'), '#1C4EF5')}
        </Flex>
      );
      if (!isNaN(restCharged) && restCharged <= 0) {
        return freePlanGift;
      }
      return (
        <Grid templateColumns="1fr 1fr" columnGap="48px">
          <GridItem>{freePlanGift}</GridItem>
          {renderChargedGridItem()}
        </Grid>
      );
    }
    const giftExp = renderExpireDate(giftCredit.time);
    const planExp = renderExpireDate(planCredit.time);
    const restPlan = planCredit.total - planCredit.used;
    return (
      <>
        <Grid templateColumns="1fr 1fr 1fr" columnGap="48px">
          <GridItem>
            <Flex flexDirection="column">
              {renderLabel(t('PlanGiftCreditsLabel'), '#1C4EF5')}
              {renderGiftCreditContent(giftExp)}
            </Flex>
          </GridItem>
          <GridItem position="relative">
            {gridDivider}
            <Flex flexDirection="column">
              {renderLabel(t('PlanIncludedCreditsLabel'), 'rgba(28, 78, 245, .3)')}
              <Text mt="12px" fontSize="30px" fontWeight="600">
                ${formatMoneyStr(restPlan, 'floor')}
              </Text>
              {planExp}
              <Progress
                mt="20px"
                value={restPlan === 0 ? 0 : (restPlan / planCredit.total) * 100}
                borderRadius="9999px"
                h="8px"
                // 修改颜色的hack。这个组件只支持colorScheme修改颜色
                style={
                  {
                    '--chakra-colors-blue-500': 'rgba(28, 78, 245, .3)'
                  } as CSSProperties
                }
              />
            </Flex>
          </GridItem>
          {renderChargedGridItem()}
        </Grid>
        <Box mt="48px">
          <Recharge onPaySuccess={onPaySuccess} />
        </Box>
      </>
    );
  };
  return (
    <Card variant="outline">
      <CardHeader>{t('CreditsAvailable')}</CardHeader>
      <CardBody>{renderBody()}</CardBody>
    </Card>
  );
};
export default PlanCredits;
