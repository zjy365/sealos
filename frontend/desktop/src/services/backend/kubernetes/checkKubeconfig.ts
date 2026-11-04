import { userSystemNamespace } from '@/constants/account';
import { KubeConfig } from '@kubernetes/client-node';
import { request, RequestOptions } from 'node:https';
import { createKubeConfig } from 'sealos-desktop-sdk/service';
import { K8sApiDefault } from './admin';

type CheckResult = { code: number; message: string };
const unavailable = (): CheckResult => ({
  code: 503,
  message: 'Unable to validate kubeconfig. Please try again.'
});
const invalid = (): CheckResult => ({ code: 401, message: 'Kubeconfig is no longer valid' });

// Invalid credentials or certificate failures make the current kubeconfig unusable.
const invalidKubeconfigErrors = new Set([
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'CERT_HAS_EXPIRED',
  'CERT_NOT_YET_VALID',
  'ERR_TLS_CERT_ALTNAME_INVALID',
  'ERR_SSL_TLSV1_ALERT_UNKNOWN_CA',
  'ERR_SSL_SSLV3_ALERT_BAD_CERTIFICATE',
  'ERR_SSL_SSLV3_ALERT_CERTIFICATE_EXPIRED',
  'ERR_OSSL_PEM_NO_START_LINE',
  'ERR_INVALID_CHAR'
]);

async function requestJson(
  kc: KubeConfig,
  path: string,
  payload: Record<string, string>,
  signal: AbortSignal
): Promise<{ statusCode?: number; body: any }> {
  const url = new URL(path, kc.getCurrentCluster()!.server);
  const body = JSON.stringify(payload);
  const options: RequestOptions = {
    method: 'POST',
    agent: false,
    rejectUnauthorized: true,
    signal,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };
  await kc.applytoHTTPSOptions(options);
  return new Promise((resolve, reject) => {
    const req = request(url, options, (res) => {
      let responseBody = '';
      res.setEncoding('utf8');
      res.on('error', reject);
      res.on('data', (chunk: string) => {
        responseBody += chunk;
        if (responseBody.length > 64 * 1024) req.destroy(new Error('Response too large'));
      });
      res.on('end', () => {
        let parsedBody;
        try {
          parsedBody = JSON.parse(responseBody);
        } catch {
          /* Preserve HTTP status even for non-JSON errors. */
        }
        resolve({ statusCode: res.statusCode, body: parsedBody });
      });
    });
    req.on('error', reject);
    req.end(body);
  });
}

async function whoami(kc: KubeConfig, expectedUser: string): Promise<CheckResult> {
  // Match kubectl's version fallback; all attempts share one timeout signal.
  const signal = AbortSignal.timeout(5000);
  for (const version of ['v1', 'v1beta1', 'v1alpha1']) {
    const { statusCode, body } = await requestJson(
      kc,
      `/apis/authentication.k8s.io/${version}/selfsubjectreviews`,
      { apiVersion: `authentication.k8s.io/${version}`, kind: 'SelfSubjectReview' },
      signal
    );
    if (statusCode === 401) return invalid();
    if (statusCode === 404) continue;
    // Forbidden and server errors do not prove expiry.
    if (statusCode !== 200 && statusCode !== 201) return unavailable();
    const username = body?.status?.userInfo?.username;
    if (typeof username !== 'string' || !username) return unavailable();
    return username === expectedUser ||
      username === `system:serviceaccount:${userSystemNamespace}:${expectedUser}`
      ? { code: 200, message: 'Successfully' }
      : invalid();
  }
  return unavailable();
}

export async function checkKubeconfig(raw: string, expectedUser: string): Promise<CheckResult> {
  let trustedCluster;
  try {
    trustedCluster = K8sApiDefault().getCurrentCluster();
    if (!trustedCluster || new URL(trustedCluster.server).protocol !== 'https:')
      return unavailable();
  } catch {
    return unavailable();
  }

  let kc: KubeConfig;
  try {
    kc = createKubeConfig(raw, trustedCluster);
  } catch {
    return invalid();
  }

  try {
    return await whoami(kc, expectedUser);
  } catch (error) {
    if (invalidKubeconfigErrors.has((error as NodeJS.ErrnoException).code || '')) return invalid();
    // Do not log transport errors: HTTPS request options contain credentials.
    return unavailable();
  }
}
