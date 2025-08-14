import { authSession } from '@/services/backend/auth';
import { getK8s } from '@/services/backend/kubernetes';
import { jsonRes } from '@/services/backend/response';
import { sendCreateTemplateEvent } from '@/services/amqp';
import { ApiResp } from '@/services/kubernet';
import { adjustResourcesInYaml } from '@/utils/resource-adjuster';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  const { yamlList, type = 'create' } = req.body as {
    yamlList: string[];
    type: 'create' | 'replace' | 'dryrun';
  };

  if (!yamlList) {
    return jsonRes(res, {
      code: 500,
      error: 'yaml list is empty'
    });
  }

  try {
    const { kubeconfig, tokenPayload } = await authSession(req.headers);
    const { applyYamlList } = await getK8s({ kubeconfig });

    const defaultRatios = {
      cpu: parseFloat(process.env.RESOURCE_CPU_RATIO || '0.05'),
      memory: parseFloat(process.env.RESOURCE_MEMORY_RATIO || '0.1')
    };

    const adjustedYamlList = yamlList.map((yaml) => adjustResourcesInYaml(yaml, defaultRatios));

    const applyRes = await applyYamlList(adjustedYamlList, type);

    sendCreateTemplateEvent(tokenPayload.userUid);

    jsonRes(res, { data: applyRes.map((item) => item.kind) });
  } catch (err: any) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
