import { RechargeBillingItem } from '@/types/billing';

export type TInvoiceDetail = {
  title: string;
  tax: string;
  bank: string;
  type?: string;
  bankAccount: string;
  address?: string;
  phone?: string;
  fax?: string;
};
export type TInvoiceContract = {
  person: string;
  phone: string;
  email: string;
};
export type ReqGenInvoice = {
  detail: TInvoiceDetail;
  contract: TInvoiceContract & { code: string };
  billings: RechargeBillingItem[];
  token: string;
};
export type Tbilling = {
  order_id: string;
  amount: number;
  regionUID: string;
  userUID: string;
  createdTime: Date;
};

export type InvoicesCollection = {
  amount: number;
  detail: TInvoiceDetail;
  billings: Tbilling[];
  contract: TInvoiceContract;
  k8s_user: string;
  createdTime: Date;
};
type InoviceStatus = 'COMPLETED' | 'PENDING' | 'REJECTED';
export type InvoicePayload = {
  ActivityType: string;
  Amount: number;
  CardUID: object;
  ChargeSource: string;
  CodeURL: string;
  CreatedAt: Date;
  Gift: number;
  ID: string;
  InvoiceAt: boolean;
  Message: string;
  Method: string;
  RegionUID: string;
  RegionUserOwner: string;
  Remark: string;
  TradeNO: string;
  Type: string;
  UserUID: string;
};
export type InvoiceListData = {
  total: number;
  totalPage: number;
  invoices: InvoicePayload[];
};
