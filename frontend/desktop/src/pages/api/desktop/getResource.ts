import { verifyAccessToken } from '@/services/backend/auth';
import { prisma } from '@/services/backend/db/init';
import { getUserKubeconfigNotPatch, K8sApiDefault } from '@/services/backend/kubernetes/admin';
import { K8sApi } from '@/services/backend/kubernetes/user';
import { jsonRes } from '@/services/backend/response';
import { switchKubeconfigNamespace } from '@/utils/switchKubeconfigNamespace';
import * as k8s from '@kubernetes/client-node';
import type { NextApiRequest, NextApiResponse } from 'next';
import { JoinStatus } from 'prisma/region/generated/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const payload = await verifyAccessToken(req.headers);
    if (!payload) return jsonRes(res, { code: 401, message: 'failed to get info' });
    const namespace = payload.workspaceId;
    const userKc = await getUserKubeconfigNotPatch(payload.userCrName);
    if (!userKc) return jsonRes(res, { code: 404, message: 'user is not found' });
    // const curKcClient = K8sApi(userKc);
    // const realKc = switchKubeconfigNamespace(_kc, namespace);
    // const kc = K8sApi(realKc);
    // if (!kc) return jsonRes(res, { code: 404, message: 'The kubeconfig is not found' });

    // const result = await kc.makeApiClient(k8s.CoreV1Api).listNamespacedPod(namespace);
    const client = K8sApi(userKc).makeApiClient(k8s.CoreV1Api);
    // const regionResource = await prisma.userCr.findUnique({
    //   where: {
    //     userUid: payload.userUid
    //   },
    //   select: {
    //     userWorkspace: {
    //       select: {
    //         workspace: {
    //           select: {
    //             id: true
    //           }
    //         },
    //         status: true,
    //         isPrivate: true,
    //         role: true
    //       }
    //     }
    //   }
    // });
    // const relationList = (regionResource?.userWorkspace || []).filter(
    //   (n) => n.role === 'OWNER' && n.status === 'IN_WORKSPACE'
    // );
    const podList = (await client.listNamespacedPod(namespace)).body.items;
    // (
    // await Promise.all(
    //   relationList.map(async (relation) => {
    //     const namespace = relation.workspace.id;
    //       return (await client.listNamespacedPod(namespace)).body.items;
    //     })
    //   )
    // ).flatMap((podList) => podList);
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
        // const realKc = switchKubeconfigNamespace(userKc, namespace);
        // const kc = K8sApi(realKc);
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
        totalGpuCount
        // result: result.body.items
      }
    });
  } catch (err) {
    jsonRes(res, { code: 500, data: err });
  }
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
