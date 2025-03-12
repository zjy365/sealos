import { isValid } from 'date-fns';

// 1¥=1000000
export const formatMoney = (money: number) => money / 1000000;
export const deFormatMoney = (money: number) => money * 1000000;
export const displayMoney = (money: number) => money.toFixed(2);
export const formatMoneyStr = (money: any) => {
  if (typeof money !== 'number') return '- -';
  return `${formatMoney(money)}`;
};
export function formatDate(date: any) {
  const d = new Date(date);
  if (!isValid(d)) return '- -';
  return d.toLocaleDateString();
}
