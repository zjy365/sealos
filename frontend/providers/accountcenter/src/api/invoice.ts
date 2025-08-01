import { GET, POST } from '@/service/request';

export interface PaymentItem {
  ID: string;
  UserUID: string;
  RegionUID: string;
  CreatedAt: string;
  RegionUserOwner: string;
  Method: string;
  Amount: number;
  Gift: number;
  TradeNO: string;
  CodeURL: string;
  InvoicedAt: boolean;
  Remark: string;
  ActivityType: string;
  Message: string;
  CardUID: string;
  Type: string;
  ChargeSource: string;
}

export interface InvoiceListResponse {
  payments: PaymentItem[];
  total: number;
  totalPage: number;
}

export const getInvoiceList = () => GET<InvoiceListResponse>('/billing/listInvoice');
