import useUpgradeModalInTranslation from '@/hooks/useUpgradeModalInTranslation';
import { TSubscriptionApiResponse } from '@/schema/plan';
import { TUserInfoResponse } from '@/schema/user';
import { Track } from '@sealos/ui';
import { differenceInDays } from 'date-fns';
import { Trans, useTranslation } from 'next-i18next';
import { FC } from 'react';
import Alert from '.';
import { UpgradePlanModalProps } from '../Plans/UpgradeModal';

interface FreeConnectGithubAlertProps
  extends Omit<
    UpgradePlanModalProps,
    'isOpen' | 'onClose' | 'hoverIndex' | 'setHoverIndex' | 'expanded'
  > {
  userInfo: TUserInfoResponse | undefined;
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
    <Track.Mount eventName={Track.events.accountCenterUpgrade(rest.currentPlan.name)}>
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
    </Track.Mount>
  );
};
export default FreeConnectGithubAlert;
