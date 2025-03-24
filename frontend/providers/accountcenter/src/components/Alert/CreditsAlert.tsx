import { TCreditsUsageResponse } from '@/schema/plan';
import { formatMoney } from '@/utils/format';
import { FC } from 'react';
import Alert from '.';
import { Trans } from 'next-i18next';
import { UpgradePlanModalProps } from '../Plans/UpgradeModal';
import useUpgradeModalInTranslation from '@/hooks/useUpgradeModalInTranslation';

interface CreditsAlertProps extends Omit<UpgradePlanModalProps, 'isOpen' | 'onClose'> {
  creditsUsage: TCreditsUsageResponse | undefined;
}
function nanToZero(n: any) {
  return typeof n === 'number' ? n : 0;
}
const CreditsAlert: FC<CreditsAlertProps> = ({ creditsUsage, ...restProps }) => {
  const { upgradeModal, transComponents, isUpgradable } = useUpgradeModalInTranslation(restProps);
  if (!creditsUsage) {
    return null;
  }
  const total = nanToZero(creditsUsage.github.total) + nanToZero(creditsUsage.charged.total);
  const used = nanToZero(creditsUsage.github.used) + nanToZero(creditsUsage.charged.used);
  const rest = formatMoney(total - used);
  if (rest >= 5) {
    return null;
  }
  const renderAlert = () => {
    if (rest <= 0) {
      return (
        <Alert
          type="error"
          text={
            <Trans
              i18nKey={isUpgradable ? 'CreditsExhaustedWithUpgrade' : 'CreditsExhausted'}
              components={transComponents}
            />
          }
        />
      );
    }
    return (
      <Alert
        type="warn"
        text={
          <Trans
            i18nKey={isUpgradable ? 'CreditsRunningOutWithUpgrade' : 'CreditsRunningOut'}
            components={transComponents}
          />
        }
      />
    );
  };
  return (
    <>
      {renderAlert()}
      {upgradeModal}
    </>
  );
};
export default CreditsAlert;
