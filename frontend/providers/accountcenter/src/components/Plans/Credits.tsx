import { TCreditsUsageResponse, TPlanApiResponse } from '@/schema/plan';
import { TUserInfoResponse } from '@/schema/user';
import { formatDate, formatMoneyStr } from '@/utils/format';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Progress,
  Text
} from '@chakra-ui/react';
import { differenceInMonths } from 'date-fns';
import { useTranslation } from 'next-i18next';
import { CSSProperties, FC, ReactNode } from 'react';
import { sealosApp } from 'sealos-desktop-sdk/app';
import Recharge from '../Recharge';
import BonusDetail from './BonusDetail';
import { getInvoiceList } from '@/api/invoice';
import React from 'react';

interface CreditsProps {
  plan: TPlanApiResponse;
  creditsUsage: TCreditsUsageResponse;
  userInfo: TUserInfoResponse | undefined;
  isLoadingUserInfo?: boolean;
  onPaySuccess?: () => void;
  onUpgrade?: () => void;
  showUpgradeButton?: boolean;
}
const PlanCredits: FC<CreditsProps> = ({
  plan,
  creditsUsage,
  onPaySuccess,
  isLoadingUserInfo: loadingUserInfo,
  userInfo,
  onUpgrade,
  showUpgradeButton = false
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
  const showBonus = userInfo?.user?.agency ?? false;
  const isFreePlan = plan.amount === 0;
  const giftCredit: TCreditsUsageResponse['github'] = creditsUsage.github || { total: 0, used: 0 };
  if (!isFreePlan) {
    // 如果是免费，giftCredit的值就是creditsUsage.github
    // 否则就是creditsUsage.gift - creditsUsage.currentPlan - creditsUsage.bonus
    giftCredit.total = Math.max(
      0,
      creditsUsage.gift.total -
        (creditsUsage.currentPlan?.total || 0) -
        (creditsUsage.bonus?.total || 0)
    );
    giftCredit.used = Math.max(
      0,
      creditsUsage.gift.used -
        (creditsUsage.currentPlan?.used || 0) -
        (creditsUsage.bonus?.used || 0)
    );
    giftCredit.time = creditsUsage.gift?.time || undefined;
  }
  const planCredit: TCreditsUsageResponse['currentPlan'] = creditsUsage.currentPlan || {
    total: 0,
    used: 0
  };
  const chargedCredit: TCreditsUsageResponse['charged'] = creditsUsage.charged || {
    total: 0,
    used: 0
  };
  const bonusCredit: TCreditsUsageResponse['bonus'] = creditsUsage.bonus || { total: 0, used: 0 };
  const restGift = giftCredit.total - giftCredit.used;
  const restCharged = chargedCredit.total - chargedCredit.used;
  const restPlan = planCredit.total - planCredit.used;
  const restBonus = bonusCredit.total - bonusCredit.used;
  const restAll = isFreePlan ? restGift : restCharged + restGift + restPlan + restBonus;
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
    if (userInfo && !userInfo.bindings.github && restGift === 0) {
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
  const [invoiceGiftSum, setInvoiceGiftSum] = React.useState<number>(0);

  React.useEffect(() => {
    if (userInfo?.user?.agency === false) {
      getInvoiceList()
        .then((res) => {
          const sum = (res.payments || []).reduce((acc, cur) => acc + (cur.Gift || 0), 0);
          setInvoiceGiftSum(sum);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [userInfo]);

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
            {renderLabel(t('PlanRechargedCreditsLabel'), '#14B8A6')}
            <Text mt="12px" fontSize="30px" fontWeight="600">
              ${formatMoneyStr(showBonus ? restCharged : restCharged - invoiceGiftSum, 'floor')}
            </Text>
            {typeof chargedCredit.total === 'number' && renderExpireDate(chargedCredit.time)}
          </Flex>
        </GridItem>
      );
    };
    const renderBonusGridItem = (bonusExp: ReactNode) => {
      return (
        <GridItem position="relative">
          {gridDivider}
          <Flex flexDirection="column">
            {renderLabel(t('PlanBonusCreditsLabel'), '#8B5CF6')}
            <Text mt="12px" fontSize="30px" fontWeight="600">
              {userInfo?.user?.agency === false
                ? `$${formatMoneyStr(invoiceGiftSum, 'floor')}`
                : `$${formatMoneyStr(restBonus, 'floor')}`}
            </Text>
            {bonusExp}
            <BonusDetail userInfo={userInfo}></BonusDetail>
          </Flex>
        </GridItem>
      );
    };
    if (isFreePlan) {
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
            colorScheme={'facebook'}
            style={
              {
                '--chakra-colors-facebook-500': '#1C4EF5'
              } as CSSProperties
            }
          />
          {renderLabel(t('PlanGiftCreditsLabel'), '#1C4EF5')}
          <Flex
            justifyContent={'space-between'}
            alignItems={'center'}
            p="12px 16px"
            borderRadius="8px"
            bg="linear-gradient(270deg, rgba(39, 120, 253, 0.10) 3.93%, rgba(39, 120, 253, 0.10) 18.25%, rgba(135, 161, 255, 0.10) 80.66%)"
          >
            <Box color={'#18181B'} fontSize={'14px'} fontWeight={400}>
              To get top-up bonus, please upgrade your plan to hobby or pro.
            </Box>
            <Button color="#1C4EF5" size="14px" fontWeight={500} variant="link" onClick={onUpgrade}>
              Upgrade Now
            </Button>
          </Flex>
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
    const bonusExp = renderExpireDate(bonusCredit.time);
    return (
      <>
        <Grid templateColumns={'1fr 1fr 1fr 1fr'} columnGap="48px">
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
          {renderBonusGridItem(bonusExp)}
        </Grid>
        <Box mt="48px">
          <Recharge showBonus={showBonus} onPaySuccess={onPaySuccess} />
        </Box>
      </>
    );
  };
  return (
    <Card variant="outline">
      <CardHeader>
        {showBonus && !isFreePlan
          ? `${t('CreditsAvailable')}: $${formatMoneyStr(restAll, 'floor')}`
          : t('CreditsAvailable')}
      </CardHeader>
      <CardBody>{renderBody()}</CardBody>
    </Card>
  );
};
export default PlanCredits;
