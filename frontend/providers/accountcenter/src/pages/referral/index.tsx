import { ReferralStats, getReferralLink, getReferralStats } from '@/api/referral';
import Alert from '@/components/Alert';
import TextGradient from '@/components/Gradient/Text';
import Layout from '@/components/Layout';
import { useCopyData } from '@/hooks/useCopyData';
import { useAPIErrorMessage } from '@/hooks/useToastAPIResult';
import { serviceSideProps } from '@/utils/i18n';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  StackDivider,
  Stat,
  StatLabel,
  Text,
  VStack
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Gift, Sparkle } from 'lucide-react';
import { Trans, useTranslation } from 'next-i18next';
import { FC, ReactNode, cloneElement } from 'react';

interface ReferralPageProps {}
const ReferralPage: FC<ReferralPageProps> = () => {
  const getAPIErrorMessage = useAPIErrorMessage();
  const { t } = useTranslation();
  const bonusHint = t('ReferralBonus', { returnObjects: true }) as string[];
  const { copyData } = useCopyData();
  const {
    data: linkResponse,
    error: getLinkError,
    isInitialLoading: loadingLink
  } = useQuery(['referralLink'], getReferralLink);
  const {
    data: statsResponse,
    error: getStatsError,
    isInitialLoading: loadingStats
  } = useQuery(['referralStats'], getReferralStats, {
    refetchOnWindowFocus: true
  });
  const link = linkResponse?.data?.link;
  const isLinkAvailable = linkResponse?.code !== 404 && link;
  const stats = isLinkAvailable
    ? statsResponse?.data
    : ({
        total: 0,
        // reward: []
        reward_count: 0
      } as ReferralStats);
  const copyLink = () => {
    if (link) {
      copyData(link);
    }
  };
  const isLoading = loadingLink || loadingStats;
  const renderStat = (title: string, value: ReactNode) => {
    return (
      <Stat padding="16px" border="1px solid rgb(228, 228, 231)" borderRadius="12px">
        <StatLabel fontSize="12px" mb="18px">
          {title}
        </StatLabel>
        <Text fontSize="12px" color="rgb(113, 113, 122)" fontWeight="400">
          {value}
        </Text>
      </Stat>
    );
  };
  const error = getLinkError || getStatsError;
  const countTransComponents = {
    Strong: (
      <span
        style={{
          fontWeight: '600',
          color: 'rgb(24, 24, 27)',
          fontSize: '30px',
          marginRight: '8px',
          lineHeight: '1'
        }}
      />
    )
  };
  const renderMain = () => {
    if (error) {
      return <Alert type="error" text={getAPIErrorMessage(error)} />;
    }
    return (
      <>
        <svg style={{ position: 'absolute', overflow: 'hidden', height: '0px', width: '0px' }}>
          <defs>
            <linearGradient
              id="referralBonusStarFill"
              x1={14.1509}
              y1={13.349}
              x2={3.83449}
              y2={13.2625}
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#2778FD" />
              <stop offset={0.186656} stopColor="#2778FD" />
              <stop offset={1} stopColor="#829DFE" />
            </linearGradient>
            <linearGradient
              id="referralBonusStarStroke"
              x1={14.1509}
              y1={13.349}
              x2={3.83449}
              y2={13.2625}
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#2778FD" />
              <stop offset={0.186656} stopColor="#2778FD" />
              <stop offset={1} stopColor="#829DFE" />
            </linearGradient>
            <clipPath id="clip0_5304_51457">
              <rect width={16} height={16} fill="white" />
            </clipPath>
          </defs>
        </svg>
        <Card variant="outline">
          <CardHeader>{t('ReferralShareLinkTitle')}</CardHeader>
          <CardBody>
            {/* <Text fontSize="14px" lineHeight="20px" color="rgb(17, 24, 36)" fontWeight="400">
              {t('ReferralShareLinkDesc')}
            </Text> */}
            <Flex
              mt="24px"
              py="12px"
              pl="12px"
              pr="16px"
              bg="rgb(249, 249, 249)"
              borderRadius="12px"
              gap="12px"
              alignItems="center"
            >
              <Flex
                borderRadius="50%"
                bg="linear-gradient(180deg, #C5D1FF 0%, #849BF0 100%)"
                w="36px"
                h="36px"
                alignItems="center"
                justifyContent="center"
                flexGrow={0}
              >
                <Gift width={20} height={20} stroke="#fff" />
              </Flex>
              <Box flexGrow={isLinkAvailable ? 1 : 0}>
                <Text fontSize="14px" lineHeight="20px" color="#18181B" fontWeight="500">
                  {t('ReferralLink')}
                </Text>
                {isLinkAvailable ? (
                  <Text mt="4px" fontSize="12px" fontWeight="400" color="#71717A">
                    {link}
                  </Text>
                ) : null}
              </Box>
              {isLinkAvailable ? (
                <Button
                  colorScheme="blackAlpha"
                  variant="outline"
                  onClick={copyLink}
                  flexGrow={0}
                  h="36px"
                >
                  {t('CopyLink')}
                </Button>
              ) : (
                <Text
                  border="1px dashed #D4D4D4"
                  px="8px"
                  lineHeight="20px"
                  color="#737373"
                  fontSize="12px"
                  fontWeight="400"
                  borderRadius="100px"
                >
                  {t('NotAvailableYet')}
                </Text>
              )}
            </Flex>
          </CardBody>
        </Card>
        <Card variant="outline">
          <CardHeader>{t('ReferralStats')}</CardHeader>
          <CardBody>
            {Array.isArray(bonusHint) && (
              <VStack
                divider={<StackDivider borderColor="#E4E4E7" my="16px!important" />}
                borderRadius="12px"
                bg="linear-gradient(270.48deg, rgba(39, 120, 253, 0.1) 3.93%, rgba(39, 120, 253, 0.1) 18.25%, rgba(135, 161, 255, 0.1) 80.66%)"
                padding="12px"
              >
                {bonusHint.map((hint, index) => {
                  const textCommonStyle = {
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontWeight: '400'
                  };
                  return (
                    <Flex
                      key={index}
                      gap="4px"
                      justifyContent="flex-start"
                      alignItems="flex-start"
                      w="100%"
                    >
                      <Flex gap="4px" alignItems="center" flexGrow={0} flexShrink={0} w="96px">
                        <Sparkle
                          width={16}
                          height={16}
                          fill="url(#referralBonusStarFill)"
                          stroke="url(#referralBonusStarStroke)"
                        />
                        <TextGradient
                          whiteSpace="nowrap"
                          {...textCommonStyle}
                          gradient="linear-gradient(180deg, #3E6FF4 0%, #0E4BF1 100%)"
                        >
                          {t('BonusWithIndex', { index: index + 1 })}
                        </TextGradient>
                      </Flex>
                      <Text
                        {...textCommonStyle}
                        color="rgb(17, 24, 36)"
                        flexGrow={1}
                        whiteSpace="pre-wrap"
                      >
                        {hint}
                      </Text>
                    </Flex>
                  );
                })}
              </VStack>
            )}
            <Grid templateColumns="1fr 1fr" gap="16px" mt="24px">
              <GridItem>
                {renderStat(
                  t('ReferralStatsInvitedUsers'),
                  typeof stats?.reward_count === 'number'
                    ? cloneElement(countTransComponents.Strong, {}, stats.reward_count)
                    : null
                )}
              </GridItem>
              <GridItem>
                {renderStat(
                  t('ReferralStatsRewards'),
                  <Trans
                    i18nKey="ReferralRewardsCount"
                    components={countTransComponents}
                    values={{ count: stats?.reward_count }}
                  />
                )}
              </GridItem>
            </Grid>
          </CardBody>
        </Card>
      </>
    );
  };
  return (
    <Layout>
      <Flex
        filter={isLoading ? 'blur(3px)' : undefined}
        transition="filter .3s"
        direction="column"
        rowGap="24px"
        pointerEvents={isLoading ? 'none' : undefined}
      >
        {renderMain()}
      </Flex>
    </Layout>
  );
};
export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content))
    }
  };
}

export default ReferralPage;
