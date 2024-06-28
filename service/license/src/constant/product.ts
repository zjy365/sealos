import { ClusterFormType } from '@/types';

export type ServiceItem = { label: string; icon: 'check' | 'star' };

const baseServiceItem: ServiceItem[] = [
  {
    label: '应用管理',
    icon: 'check'
  },
  {
    label: '高可用数据库',
    icon: 'check'
  },
  {
    label: '应用市场',
    icon: 'check'
  },
  {
    label: '多租户',
    icon: 'check'
  },
  {
    label: '计量/配额',
    icon: 'check'
  }
];

export const standard: ServiceItem[] = [
  {
    label: '工单服务',
    icon: 'check'
  },
  ...baseServiceItem
];

export const company: ServiceItem[] = [
  {
    label: '私有化/离线部署',
    icon: 'star'
  },
  { label: '工单/即时通信服务', icon: 'check' },
  { label: '周一到周五，8h 内响应', icon: 'check' },
  ...baseServiceItem
];

export const contect: ServiceItem[] = [
  {
    label: '定制化开发与业务云原生化服务',
    icon: 'check'
  },
  { label: '支持超大规模', icon: 'check' },
  {
    label: '私有化/离线部署',
    icon: 'check'
  },
  { label: '工单/即时通信/专家对接/现场支持', icon: 'check' },
  { label: '周一到周日，24h 内响应', icon: 'check' },
  ...baseServiceItem
];

export const CpuSlideMarkList = [
  { label: 8, value: 8 },
  // { label: 16, value: 16 },
  // { label: 24, value: 24 },
  { label: 32, value: 32 },
  { label: 64, value: 64 },
  { label: 96, value: 96 },
  { label: 128, value: 128 },
  { label: 160, value: 160 },
  { label: 192, value: 192 },
  { label: 224, value: 224 },
  { label: 256, value: 256 }
];

export const MemorySlideMarkList = [
  { label: 16, value: 16 },
  // { label: 32, value: 32 },
  // { label: 64, value: 64 },
  { label: 128, value: 128 },
  { label: 256, value: 256 },
  { label: 384, value: 384 },
  { label: 512, value: 512 },
  { label: 640, value: 640 },
  { label: 768, value: 768 },
  { label: 896, value: 896 },
  { label: 1024, value: 1024 }
];

export const MonthMapList = [
  // unit month
  { label: '3个月', value: '3' },
  { label: '6个月', value: '6' },
  { label: '1年', value: '12' },
  { label: '2年', value: '24' },
  { label: '3年', value: '36' }
];

export const defaulClustertForm: ClusterFormType = {
  cpu: 8,
  memory: 16,
  months: '3',
  name: ''
};

export const freeClusterForm: ClusterFormType = {
  cpu: 8,
  memory: 8,
  months: '3',
  name: ''
};

export const cpuPriceMonth = 6; // ¥

export const memoryPriceMonth = 3; // ¥
