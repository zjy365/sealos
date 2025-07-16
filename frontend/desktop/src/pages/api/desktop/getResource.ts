import { generateBillingToken, verifyAccessToken } from '@/services/backend/auth';
import { getUserKubeconfigNotPatch } from '@/services/backend/kubernetes/admin';
import { K8sApi } from '@/services/backend/kubernetes/user';
import { jsonRes } from '@/services/backend/response';
import { UserQuotaItemType } from '@/types/user';
import { cpuFormatToM, memoryFormatToMi } from '@/utils/format';
import * as k8s from '@kubernetes/client-node';
import type { NextApiRequest, NextApiResponse } from 'next';

// 流量单位转换函数
function formatTrafficBytes(bytes: number): { value: string; unit: string; rawBytes: number } {
  if (bytes === 0) return { value: '0', unit: 'B', rawBytes: 0 };

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return {
    value: (bytes / Math.pow(k, i)).toFixed(2),
    unit: units[i],
    rawBytes: bytes
  };
}

function parseResourceValue(value: string) {
  const unit = value.match(/[a-zA-Z]+$/);
  const number = parseFloat(value);
  if (!unit) return number;

  switch (unit[0]) {
    case 'm':
      return number / 1000; // For CPU millicores to cores
    case 'Ki':
      return number / (1024 * 1024); // For Ki to Gi
    case 'Mi':
      return number / 1024; // For Mi to Gi
    case 'Gi':
      return number; // Already in Gi
    default:
      return number; // Assume raw number if no unit
  }
}

async function getUserQuota(kc: k8s.KubeConfig, namespace: string): Promise<UserQuotaItemType[]> {
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

  const {
    body: { status }
  } = await k8sApi.readNamespacedResourceQuota(`quota-${namespace}`, namespace);

  return [
    {
      type: 'cpu',
      limit: cpuFormatToM(status?.hard?.['limits.cpu'] || '') / 1000,
      used: cpuFormatToM(status?.used?.['limits.cpu'] || '') / 1000
    },
    {
      type: 'memory',
      limit: memoryFormatToMi(status?.hard?.['limits.memory'] || '') / 1024,
      used: memoryFormatToMi(status?.used?.['limits.memory'] || '') / 1024
    },
    {
      type: 'storage',
      limit: memoryFormatToMi(status?.hard?.['requests.storage'] || '') / 1024,
      used: memoryFormatToMi(status?.used?.['requests.storage'] || '') / 1024
    },
    {
      type: 'nodeports',
      limit: Number(status?.hard?.['services.nodeports']) || 0,
      used: Number(status?.used?.['services.nodeports']) || 0
    },
    {
      type: 'pods',
      limit: Number(status?.hard?.['pods'] || -1) || 0,
      used: Number(status?.used?.['pods'] || -1) || 0
    },
    {
      type: 'gpu',
      limit: Number(status?.hard?.['requests.nvidia.com/gpu'] || 0),
      used: Number(status?.used?.['requests.nvidia.com/gpu'] || 0)
    }
  ];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const payload = await verifyAccessToken(req.headers);
    if (!payload) return jsonRes(res, { code: 401, message: 'failed to get info' });
    const namespace = payload.workspaceId;
    const userKc = await getUserKubeconfigNotPatch(payload.userCrName);
    if (!userKc) return jsonRes(res, { code: 404, message: 'user is not found' });

    const base = global.AppConfig.desktop.auth.billingUrl as string;
    const trafficUrl = base + '/account/v1alpha1/user-traffic-used';

    const billingToken = generateBillingToken({
      userUid: payload.userUid,
      userId: payload.userId
    });
    const headers = {
      Authorization: `Bearer ${billingToken}`,
      'Content-Type': 'application/json'
    };

    // 获取流量数据
    let trafficData = null;
    try {
      const result = await fetch(trafficUrl, {
        method: 'POST',
        headers
      });
      const data = await result.json();
      if (data?.trafficUsed?.sent_bytes) {
        const sentBytes = data.trafficUsed.sent_bytes;
        trafficData = {
          ...formatTrafficBytes(sentBytes),
          status: data.trafficUsed.status,
          lastUpdated: data.trafficUsed.UpdatedAt
        };
      }
    } catch (error) {
      console.error('获取流量数据失败', error);
    }
    const kc = K8sApi(userKc);
    const client = kc.makeApiClient(k8s.CoreV1Api);

    // todo: 获取配额数据
    // let quota: UserQuotaItemType[] = [];
    // try {
    //   quota = await getUserQuota(kc, namespace);
    // } catch (error) {
    //   console.error('获取配额数据失败', error);
    // }
    // console.log(quota, 'quota');

    const podList = (await client.listNamespacedPod(namespace)).body.items;

    let totalCpuLimits = 0;
    let totalMemoryLimits = 0;
    let totalStorageRequests = 0;
    let runningPodCount = 0;
    let totalGpuCount = 0;
    let totalPodCount = 0;

    for (const pod of podList) {
      if (pod.status?.phase === 'Succeeded') continue;
      if (!pod?.spec) continue;

      totalPodCount++;

      if (pod.status?.phase !== 'Running') continue;

      runningPodCount++;

      for (const container of pod?.spec.containers) {
        if (!container?.resources) continue;
        const limits = container?.resources.limits as {
          cpu: string;
          memory: string;
          ['nvidia.com/gpu']?: string;
        };
        totalCpuLimits += parseResourceValue(limits.cpu);
        totalMemoryLimits += parseResourceValue(limits.memory);

        totalGpuCount += Number(limits['nvidia.com/gpu'] || 0);
      }

      if (!pod?.spec?.volumes) continue;
      for (const volume of pod.spec.volumes) {
        if (!volume.persistentVolumeClaim?.claimName) continue;
        const pvcName = volume.persistentVolumeClaim.claimName;

        try {
          const pvc = await client.readNamespacedPersistentVolumeClaim(pvcName, namespace);
          const storage = pvc?.body?.spec?.resources?.requests?.storage || '0';
          totalStorageRequests += parseResourceValue(storage);
        } catch (error) {
          console.error('Failed to read PVC:', pvcName, error);
        }
      }
    }

    return jsonRes(res, {
      data: {
        totalCpu: totalCpuLimits.toFixed(2),
        totalMemory: totalMemoryLimits.toFixed(2),
        totalStorage: totalStorageRequests.toFixed(2),
        runningPodCount,
        totalPodCount,
        totalGpuCount,
        traffic: trafficData,
        quota: undefined
      }
    });
  } catch (err) {
    console.log(err, 'err');
    jsonRes(res, { code: 500, data: err });
  }
}
