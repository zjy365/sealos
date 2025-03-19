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
import { useQuery } from '@tanstack/react-query';
import { getUserInfo } from '@/api/user';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { sealosApp } from 'sealos-desktop-sdk/app';

interface CreditsProps {
  plan: TPlanApiResponse;
  creditsUsage: TCreditsUsageResponse;
  onPaySuccess?: () => void;
}
const PlanCredits: FC<CreditsProps> = ({ plan, creditsUsage, onPaySuccess }) => {
  const { t } = useTranslation();
  const { data: userInfo, isLoading: loadingUserInfo } = useQuery(['userInfo'], getUserInfo, {
    refetchOnWindowFocus: true
  });
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
    return (
      <>
        <Text mt="12px" fontSize="30px" fontWeight="600">
          ${formatMoneyStr(creditsUsage.gift.used)}
        </Text>
        {giftExp}
        <Progress
          mt="20px"
          value={(creditsUsage.gift.used / creditsUsage.gift.total) * 100}
          borderRadius="9999px"
          h="8px"
        />
      </>
    );
  };
  const renderBody = () => {
    if (plan.amount === 0) {
      const rest = creditsUsage.gift.total - creditsUsage.gift.used;
      return (
        <Flex flexDirection="column" rowGap="12px" py="4px">
          <Flex alignItems="baseline" gap="12px">
            <Text lineHeight="36px" fontSize="30px" fontWeight="600" color="#18181B">
              ${formatMoneyStr(rest)}
            </Text>
            <Text fontSize="16px" fontWeight="400" color="#737373">
              ${formatMoneyStr(creditsUsage.gift.used)}/{formatMoneyStr(creditsUsage.gift.total)}{' '}
              {t('Used').toLowerCase()}
            </Text>
          </Flex>
          <Progress
            value={(creditsUsage.gift.used / creditsUsage.gift.total) * 100}
            borderRadius="9999px"
            h="8px"
          />
          {renderLabel(t('PlanGiftCreditsLabel'), '#1C4EF5')}
        </Flex>
      );
    }
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
    const giftExp = renderExpireDate(creditsUsage.gift.time);
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
                ${formatMoneyStr(creditsUsage.gift.total)}
              </Text>
              {giftExp}
              <Progress
                mt="20px"
                value={100}
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
          <GridItem position="relative">
            {gridDivider}
            <Flex flexDirection="column">
              {renderLabel(t('PlanRechargedCreditsLabel'), null)}
              <Text mt="12px" fontSize="30px" fontWeight="600">
                ${formatMoneyStr(creditsUsage.charged.total - creditsUsage.charged.used)}
              </Text>
              {typeof creditsUsage.charged.total === 'number' &&
                renderExpireDate(creditsUsage.charged.time)}
            </Flex>
          </GridItem>
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
