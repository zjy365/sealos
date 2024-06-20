import { authSession } from '@/services/backend/auth';
import { getK8s } from '@/services/backend/kubernetes';
import { jsonRes } from '@/services/backend/response';
import { ApiResp } from '@/services/kubernet';
import type { NextApiRequest, NextApiResponse } from 'next';

export type ExportAppPayload = {
  yaml: string;
  images: { name: string }[];
  appname: string;
  namespace: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  try {
    const exportAppBaseUrl = process.env.EXPORT_APP_URL || '';
    const generatePath = '/registry/v1alpha1/artifact/generate';

    await getK8s({
      kubeconfig: await authSession(req.headers)
    });

    const data = req.body as ExportAppPayload;

    const temp = await fetch(
      `${exportAppBaseUrl}${generatePath}?namespace=${data.namespace}&&appname=${data.appname}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          images: data.images,
          appName: data.appname,
          appNamespace: data.namespace,
          manifests: data.yaml
        })
      }
    );

    const result: {
      artifact_id: string;
      download_uri: string;
      error: string;
    } = await temp.json();

    console.log(result);

    jsonRes(res, {
      data: {
        downloadPath: `${exportAppBaseUrl}${result.download_uri}`,
        error: result.error
      }
    });
  } catch (err: any) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
