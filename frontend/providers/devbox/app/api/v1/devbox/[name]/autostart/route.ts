import { NextRequest } from 'next/server';
import { authSession } from '@/services/backend/auth';
import { getK8s } from '@/services/backend/kubernetes';
import { jsonRes } from '@/services/backend/response';
import { generateDevboxRbacAndJob } from '@/utils/rbacJobGenerator';
import { AutostartRequestSchema } from './schema';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    let body = {};
    const requestText = await req.text();
    if (requestText.trim()) {
      try {
        body = JSON.parse(requestText);
      } catch {
        return jsonRes({
          code: 400,
          message: 'Invalid JSON in request body'
        });
      }
    }
    
    const validationResult = AutostartRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return jsonRes({
        code: 400,
        message: 'Invalid request body',
        error: validationResult.error.errors
      });
    }

    const { execCommand } = validationResult.data || {};
    const devboxName = params.name;

    if (!/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(devboxName)) {
      return jsonRes({
        code: 400,
        message: 'Invalid devbox name format'
      });
    }

    const headerList = req.headers;
    const { applyYamlList, k8sCustomObjects, namespace } = await getK8s({
      kubeconfig: await authSession(headerList)
    });

    try {
      const { body: devboxBody } = await k8sCustomObjects.getNamespacedCustomObject(
        'devbox.sealos.io',
        'v1alpha1',
        namespace,
        'devboxes',
        devboxName
      ) as { body: any };

      if (!devboxBody.metadata?.uid) {
        return jsonRes({
          code: 404,
          message: 'Devbox not found'
        });
      }

      const devboxUID = devboxBody.metadata.uid;

      const rbacJobYamls = generateDevboxRbacAndJob({
        devboxName,
        devboxNamespace: namespace,
        devboxUID,
        execCommand
      });

      await applyYamlList(rbacJobYamls, 'create');

      return jsonRes({
        data: {
          devboxName,
          autostartCreated: true,
          resources: [
            `${devboxName}-executor`,
            `${devboxName}-executor-role`,
            `${devboxName}-executor-binding`,
            `${devboxName}-exec-job`
          ]
        }
      });

    } catch (error: any) {
      if (error.response?.statusCode === 404) {
        return jsonRes({
          code: 404,
          message: 'Devbox not found'
        });
      }
      throw error;
    }

  } catch (err: any) {
    return jsonRes({
      code: 500,
      message: err?.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err : undefined
    });
  }
}
