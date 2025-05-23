import { FC } from 'react';
import { isPlanCancelling, isPlanRenewFailed } from '../Plans/planStatus';
import { formatDate } from '@/utils/format';
import { Button, useDisclosure } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import Alert from '.';
import { TLastTransactionResponse, TPlanApiResponse } from '@/schema/plan';
import RetryRenewPayModal from '../Plans/RetryRenewPayModal';

interface PlanAlertProps {
  plans?: TPlanApiResponse[] | undefined;
  lastTransaction: TLastTransactionResponse | undefined;
  /** 是否需要显示取消的提醒 */
  includeCancelling?: boolean;
}

const PlanAlert: FC<PlanAlertProps> = ({ lastTransaction, includeCancelling, plans }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  if (!lastTransaction) return null;
  if (includeCancelling && isPlanCancelling(lastTransaction)) {
    return (
      <Alert
        type={'warn'}
        text={t('FreeAlert', { day: formatDate(lastTransaction.StartAt) })}
      ></Alert>
    );
  }
  if (isPlanRenewFailed(lastTransaction)) {
    return (
      <>
        <Alert type={'error'} text={t('PayFailed')}>
          <Button h={'full'} onClick={onOpen}>
            {t('MakePayment')}
          </Button>
        </Alert>
        <RetryRenewPayModal
          plans={plans}
          lastTransaction={lastTransaction}
          isOpen={isOpen}
          onClose={onClose}
        />
      </>
    );
  }
  return null;
};
export default PlanAlert;
