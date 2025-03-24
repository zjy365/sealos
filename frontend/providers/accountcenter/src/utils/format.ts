import { isValid } from 'date-fns';

// 1¥=1000000
export const formatMoney = (money: number) => money / 1000000;
export const deFormatMoney = (money: number) => money * 1000000;
export const displayMoney = (money: number) => money.toFixed(2);
export const formatMoneyStr = (money: any, fixed: boolean | 'floor' = false) => {
  if (typeof money !== 'number') return '- -';
  if (fixed === 'floor') {
    return `${Math.floor(formatMoney(money) * 100) / 100}`;
  }
  if (fixed) {
    return `${formatMoney(money).toFixed(2)}`;
  }
  return `${formatMoney(money)}`;
};
export function formatDate(date: any) {
  const d = new Date(date);
  if (!isValid(d)) return '- -';
  return d.toLocaleDateString();
}
