import { DELETE, GET, POST } from '@/service/request';
import { V1Pod } from '@kubernetes/client-node';

export const getMigratePodList = (
  migrateName: string,
  migrateType: 'network' | 'file' = 'network'
) =>
  GET<V1Pod[]>('/api/migrate/getPodList', { migrateName, migrateType }).then((res) => {
    return res.sort((a, b) => {
      const startTimeA = new Date(a.metadata?.creationTimestamp || '').getTime();
      const startTimeB = new Date(b.metadata?.creationTimestamp || '').getTime();
      return startTimeA - startTimeB;
    });
  });

export const getLogByNameAndContainerName = (data: {
  containerName: string;
  podName: string;
  stream: boolean;
  logSize?: number;
  sinceTime?: number;
  previous?: boolean;
}) => POST<string>('/api/migrate/getLogByName', data);

export const getPodStatusByName = (podName: string) =>
  GET(`/api/pod/getPodStatus?podName=${podName}`);

export const deleteMigrateJobByName = (name: string) =>
  DELETE(`/api/migrate/delJobByName?name=${name}`);
