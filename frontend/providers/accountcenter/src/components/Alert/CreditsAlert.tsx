import { TCreditsUsageResponse, TPlanApiResponse } from '@/schema/plan';
import { formatMoney } from '@/utils/format';
import { FC } from 'react';
import Alert from '.';
import { Trans } from 'next-i18next';
import UpgradePlanModal, { UpgradePlanModalProps } from '../Plans/UpgradeModal';
import { useDisclosure } from '@chakra-ui/react';

interface CreditsAlertProps extends Omit<UpgradePlanModalProps, 'isOpen' | 'onClose'> {
  creditsUsage: TCreditsUsageResponse | undefined;
}
function nanToZero(n: any) {
  return typeof n === 'number' ? n : 0;
}
const CreditsAlert: FC<CreditsAlertProps> = ({ creditsUsage, currentPlan, ...restProps }) => {
  const {
    isOpen: isUpgradeModalOpen,
    onOpen: openUpgradeModal,
    onClose: closeUpgradeModal
  } = useDisclosure();
  if (!creditsUsage) {
    return null;
  }
  const total = nanToZero(creditsUsage.gift.total) + nanToZero(creditsUsage.charged.total);
  const used = nanToZero(creditsUsage.gift.used) + nanToZero(creditsUsage.charged.used);
  const rest = formatMoney(total - used);
  if (rest >= 5) {
    return null;
  }
  const isUpgradable =
    currentPlan &&
    Array.isArray(currentPlan.upgradePlanList) &&
    currentPlan.upgradePlanList.length > 0;
  const transComponents = {
    Upgrade: (
      <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={openUpgradeModal} />
    )
  };
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
      <UpgradePlanModal
        {...restProps}
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        currentPlan={currentPlan}
      />
    </>
  );
};
export default CreditsAlert;
