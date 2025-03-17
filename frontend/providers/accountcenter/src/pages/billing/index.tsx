import { useLoading } from '@/hooks/useLoading';
import { useEffect, useState } from 'react';
import { serviceSideProps } from '@/utils/i18n';
import Layout from '@/components/Layout';
import Payment from './components/payment';
import Invoice from './components/invoice';
import { getCardList, setDefaultCard, deleteCard } from '@/api/card';
import { getInvoiceList } from '@/api/invoice';
import { CardSchema } from '@/schema/card';
import type { InvoicePayload } from '@/types/invoice';
import z from 'zod';
import { getLastTransaction } from '@/api/plan';
import { useTranslation } from 'next-i18next';
import { TLastTransactionResponse } from '@/schema/plan';
import PlanAlert from '@/components/Alert/PlanAlert';

function Billing() {
  const { t } = useTranslation();
  const { Loading } = useLoading();
  const [initialized, setInitialized] = useState(false);
  const [cardList, setCardList] = useState<z.infer<typeof CardSchema>[]>([]);
  const [invoiceList, setInvoiceList] = useState<InvoicePayload[]>([]);
  const [lastTransaction, setLastTransaction] = useState<TLastTransactionResponse>();
  useEffect(() => {
    async function fetchData() {
      const card = getCardList().then((res) => {
        setCardList(res?.cardList || []);
      });
      const invoice = getInvoiceList().then((res) => {
        setInvoiceList(res?.payments || []);
      });
      await Promise.all([card, invoice]);
      setInitialized(true);
    }
    fetchData();
  }, []);
  useEffect(() => {
    getLastTransaction().then((res) => {
      setLastTransaction(res?.transcation);
    });
  }, []);

  const handleSetDefault = (id: string) => {
    setInitialized(false);
    setDefaultCard(id).then(() => {
      getCardList().then((res) => {
        setCardList(res?.cardList || []);
        setInitialized(true);
      });
    });
  };
  const handleDelete = (id: string) => {
    setInitialized(false);
    deleteCard(id).then(() => {
      getCardList().then((res) => {
        setCardList(res?.cardList || []);
        setInitialized(true);
      });
    });
  };

  return (
    <>
      <Layout>
        <PlanAlert lastTransaction={lastTransaction} />
        <Payment
          handleDelete={handleDelete}
          handleSetDefault={handleSetDefault}
          cardList={cardList}
          mb={'12px'}
          mt={'12px'}
        ></Payment>
        <Invoice invoiceList={invoiceList}></Invoice>
      </Layout>
      <Loading loading={!initialized} />
    </>
  );
}

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content))
    }
  };
}

export default Billing;
