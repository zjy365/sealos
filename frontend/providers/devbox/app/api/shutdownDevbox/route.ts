import { NextRequest } from 'next/server';

import { devboxKey } from '@/constants/devbox';
import { jsonRes } from '@/services/backend/response';
import { authSession } from '@/services/backend/auth';
import { getK8s } from '@/services/backend/kubernetes';
import { RequestSchema } from './schema';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = RequestSchema.safeParse(body);

    if (!validationResult.success) {
      return jsonRes({
        code: 400,
        message: 'Invalid request body',
        error: validationResult.error.errors
      });
    }

    const { devboxName, shutdownMode } = validationResult.data;
    const headerList = req.headers;

    const { k8sCustomObjects, namespace, k8sNetworkingApp } = await getK8s({
      kubeconfig: await authSession(headerList)
    });

    // get ingress and modify ingress annotations
    const ingressesResponse = await k8sNetworkingApp.listNamespacedIngress(
      namespace,
      undefined,
      undefined,
      undefined,
      undefined,
      `${devboxKey}=${devboxName}`
    );
    const ingresses: any = (ingressesResponse.body as { items: any[] }).items;

    ingresses.forEach(async (ingress: any) => {
      const annotationsIngressClass =
        ingress.metadata?.annotations?.['kubernetes.io/ingress.class'];
      const specIngressClass = ingress.spec?.ingressClassName;

      if (
        (annotationsIngressClass && annotationsIngressClass === 'nginx') ||
        (specIngressClass && specIngressClass === 'nginx')
      ) {
        if (annotationsIngressClass) {
          await k8sNetworkingApp.patchNamespacedIngress(
            ingress.metadata.name,
            namespace,
            { metadata: { annotations: { 'kubernetes.io/ingress.class': 'pause' } } },
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            {
              headers: {
                'Content-Type': 'application/merge-patch+json'
              }
            }
          );
        } else if (specIngressClass) {
          await k8sNetworkingApp.patchNamespacedIngress(
            ingress.metadata.name,
            namespace,
            { spec: { ingressClassName: 'pause' } },
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            {
              headers: {
                'Content-Type': 'application/merge-patch+json'
              }
            }
          );
        }
      }
    });

    await k8sCustomObjects.patchNamespacedCustomObject(
      'devbox.sealos.io',
      'v1alpha1',
      namespace,
      'devboxes',
      devboxName,
      { spec: { state: shutdownMode } },
      undefined,
      undefined,
      undefined,
      {
        headers: {
          'Content-Type': 'application/merge-patch+json'
        }
      }
    );

    return jsonRes({
      data: 'success shutdown devbox'
    });
  } catch (err: any) {
    return jsonRes({
      code: 500,
      message: err?.message || 'Internal server error',
      error: err
    });
  }
}
