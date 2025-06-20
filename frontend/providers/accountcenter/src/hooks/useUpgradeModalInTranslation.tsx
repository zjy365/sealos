import UpgradePlanModal, { UpgradePlanModalProps } from '@/components/Plans/UpgradeModal';
import { useDisclosure } from '@chakra-ui/react';
import { Track } from '@sealos/ui';

export default function useUpgradeModalInTranslation(
  restProps: Omit<
    UpgradePlanModalProps,
    'isOpen' | 'onClose' | 'hoverIndex' | 'setHoverIndex' | 'expanded'
  >
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
      <Track.TransClick
        element={
          <span
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={openUpgradeModal}
          />
        }
        eventName={Track.events.accountCenterUpgradeClick(currentPlan.name)}
      />
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
