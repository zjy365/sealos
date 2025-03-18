import { TCardScheam } from '@/schema/card';
import { GET, POST } from '@/service/request';

export const getCardList = () => GET<{ cardList: TCardScheam[] }>('/card/list');

export const setDefaultCard = (cardID: string) => POST('/card/setDefault', { cardID });

export const deleteCard = (cardID: string) => POST('/card/delete', { cardID });
