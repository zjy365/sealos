import assert from 'node:assert/strict';
import { afterEach, beforeEach, mock, test } from 'node:test';
import fs from 'node:fs';
import childProcess from 'node:child_process';
import { KubeConfig } from '../packages/client-sdk/node_modules/@kubernetes/client-node';
import { createKubeConfig } from '../packages/client-sdk/src/utils/kubeconfig';
import { initK8s } from '../packages/client-sdk/src/utils/kubernetes';
import { K8sApi as desktopK8s } from '../desktop/src/services/backend/kubernetes/user';
import { K8sApi as licenseK8s } from '../providers/license/src/services/backend/kubernetes';
import { K8sApi as costcenterK8s } from '../providers/costcenter/src/service/backend/kubernetes';
import { AuthService } from '../packages/metrics-sdk/src/auth/auth';

const isInvalidKubeconfig = (error: unknown): boolean =>
  error instanceof Error &&
  error.name === 'InvalidKubeconfigError' &&
  (error as Error & { statusCode: number }).statusCode === 401;

const trusted = {
  name: 'trusted',
  server: 'https://trusted.invalid',
  caData: 'dHJ1c3RlZC1jYQ==',
  skipTLSVerify: false
};
function fixture(user: Record<string, unknown> = { token: 'fixture-token' }) {
  return {
    'current-context': 'active',
    contexts: [
      { name: 'inactive', context: { cluster: 'c', user: 'alice', namespace: 'ns-wrong' } },
      { name: 'active', context: { cluster: 'c', user: 'alice', namespace: 'ns-active' } }
    ],
    clusters: [
      {
        name: 'c',
        cluster: {
          server: 'https://caller.invalid',
          'certificate-authority-data': 'Y2FsbGVyLWNh',
          'insecure-skip-tls-verify': true
        }
      }
    ],
    users: [{ name: 'alice', user }]
  };
}

beforeEach(() => {
  mock.method(KubeConfig.prototype, 'loadFromDefault', function (this: KubeConfig) {
    this.loadFromClusterAndUser(trusted, { name: 'server-admin', token: 'must-not-use' });
  });
});
afterEach(() => mock.restoreAll());

const unsafeUsers = [
  { exec: { command: 'must-never-run' } },
  { 'auth-provider': { name: 'exec', config: { exec: { command: 'must-never-run' } } } },
  { 'auth-provider': { name: 'gcp', config: { 'cmd-path': 'must-never-run' } } },
  { 'auth-provider': { name: 'tokenFile', config: { tokenFile: '/must-not-read' } } },
  { 'token-file': '/must-not-read' },
  { tokenFile: '/must-not-read' },
  { 'client-certificate': '/must-not-read' },
  { 'client-key': '/must-not-read' },
  { as: 'system:admin' }
];

for (const unsafe of unsafeUsers) {
  test(`all five loaders reject ${Object.keys(unsafe)[0]} before side effects`, () => {
    const defaults = mock.method(KubeConfig.prototype, 'loadFromDefault');
    const fromString = mock.method(KubeConfig.prototype, 'loadFromString');
    const reads = mock.method(fs, 'readFileSync');
    const spawn = mock.method(childProcess, 'spawn');
    const spawnSync = mock.method(childProcess, 'spawnSync');
    const execSync = mock.method(childProcess, 'execSync');
    const raw = JSON.stringify(fixture({ token: 'fixture-token', ...unsafe }));
    for (const load of [createKubeConfig, desktopK8s, licenseK8s, costcenterK8s]) {
      assert.throws(() => load(raw), isInvalidKubeconfig);
    }
    assert.throws(() => new AuthService(raw).resolveNamespace(), isInvalidKubeconfig);
    for (const spy of [defaults, fromString, reads, spawn, spawnSync, execSync])
      assert.equal(spy.mock.callCount(), 0);
  });
}

for (const field of ['certificate-authority', 'proxy-url', 'caFile']) {
  test(`rejects cluster ${field}`, () => {
    const config = fixture();
    Object.assign(config.clusters[0].cluster, { [field]: '/must-not-read' });
    assert.throws(() => createKubeConfig(JSON.stringify(config)), isInvalidKubeconfig);
  });
}

test('rejects inactive executable users and missing credentials', () => {
  const config = fixture();
  config.users.push({ name: 'inactive', user: unsafeUsers[0] });
  assert.throws(() => createKubeConfig(JSON.stringify(config)), isInvalidKubeconfig);
  for (const user of [{}, { token: '' }, { 'client-certificate-data': 'Y2VydA==' }]) {
    assert.throws(() => createKubeConfig(JSON.stringify(fixture(user))), isInvalidKubeconfig);
  }
});

test('rejects malformed/oversized/ambiguous input without echoing credentials', () => {
  for (const raw of ['credential-secret: [', 'x'.repeat(256 * 1024 + 1), 'null']) {
    assert.throws(
      () => createKubeConfig(raw),
      (error: unknown) => isInvalidKubeconfig(error) && !String(error).includes('credential-secret')
    );
  }
  const config = fixture();
  config.users.push(config.users[0]);
  assert.throws(() => createKubeConfig(JSON.stringify(config)), isInvalidKubeconfig);
  config.users.pop();
  config['current-context'] = 'missing';
  assert.throws(() => createKubeConfig(JSON.stringify(config)), isInvalidKubeconfig);
});

test('normal credentials and current context survive while server/CA/TLS policy remain trusted', async () => {
  const raw = JSON.stringify(fixture());
  for (const load of [createKubeConfig, desktopK8s, licenseK8s, costcenterK8s]) {
    const kc = load(raw);
    assert.equal(kc.getCurrentUser()?.token, 'fixture-token');
    assert.equal(kc.getCurrentCluster()?.server, trusted.server);
    assert.equal(kc.getCurrentCluster()?.caData, trusted.caData);
    assert.equal(kc.getCurrentCluster()?.skipTLSVerify, false);
    assert.equal(kc.getContextObject(kc.getCurrentContext())?.namespace, 'ns-active');
  }
  const options: any = {};
  await createKubeConfig(raw).applytoHTTPSOptions(options);
  assert.deepEqual(options.ca, Buffer.from('trusted-ca'));
  assert.equal(options.headers.Authorization, 'Bearer fixture-token');
  const session = await initK8s({ req: { headers: { authorization: encodeURIComponent(raw) } } });
  assert.equal(session.namespace, 'ns-active');
  const cert = createKubeConfig(
    JSON.stringify(fixture({ 'client-certificate-data': 'Y2VydA==', 'client-key-data': 'a2V5' }))
  );
  assert.equal(cert.getCurrentUser()?.certData, 'Y2VydA==');
  assert.equal(cert.getCurrentUser()?.keyData, 'a2V5');
});

test('missing/malformed Authorization is rejected before client creation', async () => {
  for (const authorization of [
    undefined,
    '%invalid',
    encodeURIComponent(JSON.stringify(fixture(unsafeUsers[0])))
  ]) {
    await assert.rejects(initK8s({ req: { headers: { authorization } } }), isInvalidKubeconfig);
  }
});
