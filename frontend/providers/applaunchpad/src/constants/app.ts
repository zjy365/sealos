import { TAppSourceType } from '@/types/app';

export enum AppStatusEnum {
  running = 'running',
  creating = 'creating',
  waiting = 'waiting',
  error = 'error',
  pause = 'pause'
}
export const appStatusMap = {
  [AppStatusEnum.running]: {
    label: 'Running',
    value: AppStatusEnum.running,
    color: 'black',
    backgroundColor: '#ECFDF5',
    dotColor: '#10B981'
  },
  [AppStatusEnum.creating]: {
    label: 'Creating',
    value: AppStatusEnum.creating,
    color: 'grayModern.500',
    backgroundColor: 'grayModern.100',
    dotColor: 'grayModern.500'
  },
  [AppStatusEnum.error]: {
    label: 'Abnormality Detected',
    value: AppStatusEnum.error,
    color: 'black',
    backgroundColor: '#FEF2F2',
    dotColor: '#EF4444'
  },
  [AppStatusEnum.pause]: {
    label: 'Paused',
    value: AppStatusEnum.pause,
    color: 'black',
    backgroundColor: '#F1F5F9',
    dotColor: '#6B7280'
  },
  [AppStatusEnum.waiting]: {
    label: 'Waiting',
    value: AppStatusEnum.waiting,
    color: 'black',
    backgroundColor: '#E0F2FE',
    dotColor: '#0EA5E9'
  }
};

export enum PodStatusEnum {
  waiting = 'waiting',
  running = 'running',
  terminated = 'terminated'
}
export const podStatusMap = {
  [PodStatusEnum.running]: {
    label: 'active',
    value: PodStatusEnum.running,
    color: '#3CCA7F'
  },
  [PodStatusEnum.waiting]: {
    label: 'waiting',
    value: PodStatusEnum.waiting,
    color: '#787A90',
    reason: '',
    message: ''
  },
  [PodStatusEnum.terminated]: {
    label: 'terminated',
    value: PodStatusEnum.terminated,
    color: '#8172D8',
    reason: '',
    message: ''
  }
};

export const ProtocolList = [
  { value: 'HTTP', label: 'https://' },
  { value: 'GRPC', label: 'grpcs://' },
  { value: 'WS', label: 'wss://' }
];

export const defaultSliderKey = 'default';
export const pauseKey = 'deploy.cloud.sealos.io/pause';
export const maxReplicasKey = 'deploy.cloud.sealos.io/maxReplicas';
export const minReplicasKey = 'deploy.cloud.sealos.io/minReplicas';
export const deployPVCResizeKey = 'deploy.cloud.sealos.io/resize';
export const appDeployKey = 'cloud.sealos.io/app-deploy-manager';
export const publicDomainKey = `cloud.sealos.io/app-deploy-manager-domain`;
export const gpuNodeSelectorKey = 'nvidia.com/gpu.product';
export const gpuResourceKey = 'nvidia.com/gpu';
export const templateDeployKey = 'cloud.sealos.io/deploy-on-sealos';
export const sealafDeployKey = 'sealaf-app';

export enum Coin {
  cny = 'cny',
  shellCoin = 'shellCoin',
  usd = 'usd'
}

export const AppSourceConfigs: Array<{
  key: string;
  type: TAppSourceType;
}> = [
  { key: templateDeployKey, type: 'app_store' },
  { key: sealafDeployKey, type: 'sealaf' }
];
