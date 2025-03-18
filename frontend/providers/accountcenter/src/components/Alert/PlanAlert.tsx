import { FC } from 'react';
import { isPlanCancelling, isPlanRenewFailed } from '../Plans/planStatus';
import { formatDate } from '@/utils/format';
import { Button } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import Alert from '.';
import { TLastTransactionResponse } from '@/schema/plan';

interface PlanAlertProps {
  lastTransaction: TLastTransactionResponse | undefined;
  /** 是否需要显示取消的提醒 */
  includeCancelling?: boolean;
}

const PlanAlert: FC<PlanAlertProps> = ({ lastTransaction, includeCancelling }) => {
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
      <Alert type={'error'} text={t('PayFailed')}>
        <Button h={'full'}>{t('MakePayment')}</Button>
      </Alert>
    );
  }
  return null;
};
export default PlanAlert;
