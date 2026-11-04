import { K8sApiDefault } from '@/services/backend/kubernetes/admin';
import { checkKubeconfig } from '@/services/backend/kubernetes/checkKubeconfig';
import { UpdateCRD } from '@/services/backend/kubernetes/user';
import { jsonRes } from '@/services/backend/response';
import { AccountMeta } from '@/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { initK8s, InvalidKubeconfigError } from 'sealos-desktop-sdk/service';

export type UpdateUserGuideParams = {
  activityType: 'beginner-guide';
  phase: 'launchpad' | 'database' | 'template' | 'terminal';
  phasePage: 'create' | 'detail' | 'index';
  shouldSendGift: boolean;
};

// req header is kubeconfig
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      activityType,
      phase,
      phasePage,
      shouldSendGift = false
    } = req.body as UpdateUserGuideParams;
    if (!activityType || !phase || !phasePage)
      return jsonRes(res, { code: 400, message: 'Desktop Bad Request: Invalid parameters' });

    const { namespace, kube_user } = await initK8s({ req });
    // A kubeconfig user name is caller-supplied metadata. Verify the actual
    // principal before using the administrator client on that Account.
    const identity = await checkKubeconfig(
      decodeURIComponent(req.headers.authorization || ''),
      kube_user.name
    );
    if (identity.code !== 200) {
      res.status(identity.code);
      return jsonRes(res, identity);
    }
    const defaultKc = K8sApiDefault();
    if (!namespace) return jsonRes(res, { code: 401, message: 'kubeConfig is vaild' });
    if (!defaultKc) return jsonRes(res, { code: 401, message: 'No cluster permissions' });

    const endTime = new Date().toISOString();

    const jsonPatch = shouldSendGift
      ? [
          {
            op: 'add',
            path: `/metadata/annotations/activity.${activityType}.current-phase`,
            value: phase
          },
          {
            op: 'add',
            path: `/metadata/annotations/activity.${activityType}.${phase}.endTime`,
            value: endTime
          },
          {
            op: 'add',
            path: `/metadata/annotations/frontend.guide.${phase}.${phasePage}`,
            value: endTime
          }
        ]
      : [
          {
            op: 'add',
            path: `/metadata/annotations/frontend.guide.${phase}.${phasePage}`,
            value: endTime
          }
        ];

    const reuslt = await UpdateCRD(defaultKc, AccountMeta, kube_user.name, jsonPatch);
    console.log('updateDesktopGuide', jsonPatch, reuslt?.body);

    jsonRes(res, { data: reuslt?.body });
  } catch (error) {
    if (error instanceof InvalidKubeconfigError) {
      res.status(401);
      return jsonRes(res, { code: 401, message: error.message });
    }
    console.log(error, 'get user account err');
    jsonRes(res, { code: 500, data: error });
  }
}
