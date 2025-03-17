import { GET, POST } from '@/service/request';

export const getInvoiceList = () => GET('/billing/listInvoice');
