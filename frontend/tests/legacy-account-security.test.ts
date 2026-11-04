import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import Module from 'node:module';
import path from 'node:path';
import { EventEmitter } from 'node:events';
import https from 'node:https';
import { KubeConfig } from '../packages/client-sdk/node_modules/@kubernetes/client-node';
import { InvalidKubeconfigError } from '../packages/client-sdk/src/utils/kubeconfig';

const loader = Module as unknown as { _load: (...args: any[]) => any };
afterEach(() => mock.restoreAll());
const accountMeta = {
  group: 'account.sealos.io',
  version: 'v1',
  namespace: 'sealos-system',
  plural: 'accounts'
};

function loadFile(file: string, modules: Record<string, unknown>) {
  const original = loader._load;
  mock.method(loader, '_load', function (this: unknown, id: string, ...args: unknown[]) {
    return Object.hasOwn(modules, id) ? modules[id] : original.call(this, id, ...args);
  });
  const filename = path.resolve(__dirname, '../desktop/src', file);
  delete require.cache[require.resolve(filename)];
  return require(filename);
}

function response() {
  const result = { status: 200, body: undefined as any };
  const res = {
    status: (code: number) => {
      result.status = code;
      return res;
    },
    json: (body: unknown) => {
      result.body = body;
      return res;
    }
  };
  return { res, result };
}
const request = () => ({
  headers: { authorization: encodeURIComponent('fixture-kubeconfig') },
  body: { activityType: 'beginner-guide', phase: 'launchpad', phasePage: 'create' }
});

for (const route of ['getAccount', 'updateGuide']) {
  test(`${route} returns HTTP 401 for unsafe credentials without privileged work`, async () => {
    let privileged = 0;
    const { default: handler } = loadFile(`pages/api/v1alpha/account/${route}.ts`, {
      'sealos-desktop-sdk/service': {
        InvalidKubeconfigError,
        initK8s: async () => {
          throw new InvalidKubeconfigError();
        }
      },
      '@/types': { AccountMeta: accountMeta },
      '@/services/backend/kubernetes/admin': {
        K8sApiDefault: () => {
          privileged++;
        }
      },
      '@/services/backend/kubernetes/user': {
        UpdateCRD: () => {
          privileged++;
        }
      },
      '@/services/backend/kubernetes/checkKubeconfig': {
        checkKubeconfig: () => {
          privileged++;
        }
      },
      '@/services/backend/response': { jsonRes: (res: any, body: unknown) => res.json(body) }
    });
    const { res, result } = response();
    await handler(request(), res);
    assert.equal(result.status, 401);
    assert.equal(result.body.code, 401);
    assert.equal(privileged, 0);
  });
}

for (const code of [401, 503, 200]) {
  test(`updateGuide gates admin patch on verified identity (${code})`, async () => {
    const order: string[] = [];
    const { default: handler } = loadFile('pages/api/v1alpha/account/updateGuide.ts', {
      'sealos-desktop-sdk/service': {
        InvalidKubeconfigError,
        initK8s: async () => ({ namespace: 'ns-alice', kube_user: { name: 'alice' } })
      },
      '@/types': { AccountMeta: accountMeta },
      '@/services/backend/kubernetes/checkKubeconfig': {
        checkKubeconfig: async (raw: string, user: string) => {
          assert.equal(raw, 'fixture-kubeconfig');
          assert.equal(user, 'alice');
          order.push('verify');
          return { code, message: 'fixture' };
        }
      },
      '@/services/backend/kubernetes/admin': {
        K8sApiDefault: () => {
          order.push('admin');
          return {};
        }
      },
      '@/services/backend/kubernetes/user': {
        UpdateCRD: async (_kc: unknown, _meta: unknown, user: string) => {
          assert.equal(user, 'alice');
          order.push('patch');
          return { body: {} };
        }
      },
      '@/services/backend/response': { jsonRes: (res: any, body: unknown) => res.json(body) }
    });
    const { res, result } = response();
    await handler(request(), res);
    assert.deepEqual(order, code === 200 ? ['verify', 'admin', 'patch'] : ['verify']);
    if (code !== 200) assert.equal(result.status, code);
  });
}

for (const actualUser of ['alice', 'system:serviceaccount:user-system:alice', 'bob']) {
  test(`SelfSubjectReview validates ${actualUser} with server CA`, async () => {
    let requests = 0;
    mock.method(
      https,
      'request',
      (_url: unknown, options: any, callback: (res: unknown) => void) => {
        requests++;
        assert.equal(options.headers.Authorization, 'Bearer fixture-token');
        assert.deepEqual(options.ca, Buffer.from('trusted-ca'));
        assert.equal(options.rejectUnauthorized, true);
        const req = new EventEmitter() as any;
        req.end = () => {
          const res = new EventEmitter() as any;
          res.statusCode = 201;
          res.setEncoding = () => {};
          callback(res);
          res.emit('data', JSON.stringify({ status: { userInfo: { username: actualUser } } }));
          res.emit('end');
        };
        return req;
      }
    );
    const { checkKubeconfig } = loadFile('services/backend/kubernetes/checkKubeconfig.ts', {
      '@/constants/account': { userSystemNamespace: 'user-system' },
      './admin': {
        K8sApiDefault: () => {
          const kc = new KubeConfig();
          kc.loadFromClusterAndUser(
            {
              name: 'trusted',
              server: 'https://trusted.invalid',
              caData: 'dHJ1c3RlZC1jYQ==',
              skipTLSVerify: false
            },
            { name: 'admin', token: 'must-not-use' }
          );
          return kc;
        }
      }
    });
    const raw = JSON.stringify({
      'current-context': 'c',
      contexts: [{ name: 'c', context: { cluster: 'c', user: 'alice' } }],
      clusters: [
        {
          name: 'c',
          cluster: {
            server: 'https://caller.invalid',
            'certificate-authority-data': 'Y2FsbGVyLWNh'
          }
        }
      ],
      users: [{ name: 'alice', user: { token: 'fixture-token' } }]
    });
    assert.equal((await checkKubeconfig(raw, 'alice')).code, actualUser === 'bob' ? 401 : 200);
    assert.equal(requests, 1);
  });
}
