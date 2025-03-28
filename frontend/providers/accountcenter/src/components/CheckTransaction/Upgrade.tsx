import { useLoading } from '@/hooks/useLoading';
import useToastAPIResult from '@/hooks/useToastAPIResult';
import { TLastTransactionResponse } from '@/schema/plan';
import urls from '@/utils/urls';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { FC, useCallback, useEffect, useRef } from 'react';
import Layout from '../Layout';
import { getLastTransaction } from '@/api/plan';

const CheckTransaction: FC = () => {
  const { toastError, toastSuccess } = useToastAPIResult();
  const router = useRouter();
  const { t } = useTranslation();
  const getData = useCallback(() => {
    return getLastTransaction().then(
      (res) => res?.transcation || ({} as Partial<TLastTransactionResponse>)
    );
  }, []);
  const { data } = useQuery(['transaction'], getData, {
    refetchOnWindowFocus: true,
    refetchInterval: 2000,
    retry: 3
  });
  const pendingCountRef = useRef(0);
  useEffect(() => {
    if (!data) return;
    // Free升级其他是created
    if (data.Operator !== 'upgraded' && data.Operator !== 'created') {
      router.replace(urls.page.plan);
      return;
    }
    if (data.Status === 'failed') {
      toastError(t('UpgradeFailed'));
      router.replace(urls.page.plan);
      return;
    }
    if (data.Status === 'completed') {
      if (pendingCountRef.current > 0) {
        toastSuccess(t('UpgradeSuccess'));
      }
      router.replace(urls.page.plan);
    }
    pendingCountRef.current += 1;
  }, [data]);
  return <Layout loading />;
};
export default CheckTransaction;
