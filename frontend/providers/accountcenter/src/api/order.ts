import { GET } from '@/service/request';

export const checkOrderStatus = (tradeNo: string) => GET('/payment/order', { tradeNo });
