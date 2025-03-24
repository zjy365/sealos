import UpgradePlanModal, { UpgradePlanModalProps } from '@/components/Plans/UpgradeModal';
import { useDisclosure } from '@chakra-ui/react';

export default function useUpgradeModalInTranslation(
  restProps: Omit<UpgradePlanModalProps, 'isOpen' | 'onClose'>
) {
  const {
    isOpen: isUpgradeModalOpen,
    onOpen: openUpgradeModal,
    onClose: closeUpgradeModal
  } = useDisclosure();
  const { currentPlan } = restProps;
  const isUpgradable =
    currentPlan &&
    Array.isArray(currentPlan.upgradePlanList) &&
    currentPlan.upgradePlanList.length > 0;
  const transComponents = {
    Upgrade: (
      <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={openUpgradeModal} />
    )
  };
  const upgradeModal = (
    <UpgradePlanModal
      {...restProps}
      isOpen={isUpgradeModalOpen}
      onClose={closeUpgradeModal}
      currentPlan={currentPlan}
    />
  );
  return {
    isUpgradable,
    upgradeModal,
    transComponents,
    openUpgradeModal,
    closeUpgradeModal,
    isUpgradeModalOpen
  };
}
