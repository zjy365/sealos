import { FC } from 'react';
import { UpgradePlanModalProps } from '../Plans/UpgradeModal';
import { TUserInfoReponse } from '@/schema/user';
import { useDisclosure } from '@chakra-ui/react';
import useUpgradeModalInTranslation from '@/hooks/useUpgradeModalInTranslation';
import Alert from '.';
import { Trans, useTranslation } from 'next-i18next';
import { TSubscriptionApiResponse } from '@/schema/plan';
import { differenceInDays } from 'date-fns';

interface FreeConnectGithubAlertProps extends Omit<UpgradePlanModalProps, 'isOpen' | 'onClose'> {
  userInfo: TUserInfoReponse | undefined;
  subscriptionResponse: TSubscriptionApiResponse | undefined;
}
const FreeConnectGithubAlert: FC<FreeConnectGithubAlertProps> = ({
  userInfo,
  subscriptionResponse,
  ...rest
}) => {
  const { upgradeModal, transComponents } = useUpgradeModalInTranslation(rest);
  const { t } = useTranslation();
  if (
    !userInfo ||
    userInfo.bindings.github ||
    rest.currentPlan.amount !== 0 ||
    !subscriptionResponse
  )
    return null;
  const daysToNextCycle = differenceInDays(
    new Date(subscriptionResponse.subscription.NextCycleDate),
    new Date()
  );
  if (isNaN(daysToNextCycle)) return null;
  return (
    <>
      <Alert
        type="warn"
        text={
          <Trans
            i18nKey="FreePlanConnectGithubWarn"
            components={transComponents}
            values={{
              daysText: t('days', { count: daysToNextCycle < 1 ? 1 : daysToNextCycle })
            }}
          />
        }
      />
      {upgradeModal}
    </>
  );
};
export default FreeConnectGithubAlert;
