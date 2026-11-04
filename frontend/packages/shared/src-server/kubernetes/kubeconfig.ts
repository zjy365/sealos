// Both published SDKs bundle this pure policy module; it has no runtime dependencies.
export class InvalidKubeconfigError extends Error {
  readonly statusCode = 401;

  constructor() {
    super('Invalid kubeconfig: only inline token or client certificate credentials are supported');
    this.name = 'InvalidKubeconfigError';
  }
}

type RecordValue = Record<string, unknown>;
const invalid = (): never => {
  throw new InvalidKubeconfigError();
};
const object = (value: unknown): RecordValue =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as RecordValue)
    : invalid();
const text = (value: unknown): string =>
  typeof value === 'string' && value.trim() ? value : invalid();
const optionalText = (value: unknown): string | undefined =>
  value === undefined ? undefined : text(value);

function entries(value: unknown): RecordValue[] {
  if (!Array.isArray(value) || !value.length || value.length > 256) return invalid();
  const result = value.map(object);
  const names = result.map((entry) => text(entry['name']));
  if (new Set(names).size !== names.length) return invalid();
  return result;
}

function onlyKeys(value: RecordValue, allowed: string[]) {
  if (Object.keys(value).some((key) => !allowed.includes(key))) invalid();
}

export function parseInlineKubeconfig(raw: string, parse: (raw: string) => unknown) {
  try {
    if (typeof raw !== 'string' || !raw.trim() || raw.length > 256 * 1024) return invalid();
    const config = object(parse(raw));
    const contexts = entries(config['contexts']);
    const clusters = entries(config['clusters']);
    const users = entries(config['users']);

    // Check every entry, including inactive users. Never let a library interpret
    // exec/auth-provider, token-file, local certificate paths or proxy settings.
    for (const entry of users) {
      onlyKeys(object(entry['user']), ['token', 'client-certificate-data', 'client-key-data']);
    }
    for (const entry of clusters) {
      onlyKeys(object(entry['cluster']), [
        'server',
        'certificate-authority-data',
        'insecure-skip-tls-verify',
        'tls-server-name',
        'disable-compression'
      ]);
    }
    for (const entry of contexts) {
      onlyKeys(object(entry['context']), ['cluster', 'user', 'namespace', 'extensions']);
    }

    const contextName = text(config['current-context']);
    const context = object(contexts.find((entry) => entry['name'] === contextName)?.['context']);
    const clusterEntry = clusters.find((entry) => entry['name'] === text(context['cluster']));
    const userEntry = users.find((entry) => entry['name'] === text(context['user']));
    if (!clusterEntry || !userEntry) return invalid();
    const cluster = object(clusterEntry['cluster']);
    const user = object(userEntry['user']);
    const token = optionalText(user['token']);
    const certData = optionalText(user['client-certificate-data']);
    const keyData = optionalText(user['client-key-data']);
    if ((!token && !(certData && keyData)) || Boolean(certData) !== Boolean(keyData)) {
      return invalid();
    }
    const namespace = optionalText(context['namespace']);
    if (
      namespace &&
      (namespace.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(namespace))
    ) {
      return invalid();
    }
    return {
      contextName,
      namespace,
      server: text(cluster['server']).replace(/\/$/, ''),
      user: { name: text(userEntry['name']), token, certData, keyData }
    };
  } catch {
    // Parser errors can include the original YAML and its credentials.
    throw new InvalidKubeconfigError();
  }
}

export type TrustedCluster = {
  name: string;
  server: string;
  caData?: string;
  caFile?: string;
  tlsServerName?: string;
};

export function inlineKubeconfigOptions(
  config: ReturnType<typeof parseInlineKubeconfig>,
  cluster: TrustedCluster
) {
  const url = new URL(cluster['server']);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Invalid trusted Kubernetes server');
  }
  return {
    clusters: [
      {
        name: cluster.name,
        server: cluster['server'],
        caData: cluster.caData,
        caFile: cluster.caFile,
        tlsServerName: cluster.tlsServerName,
        skipTLSVerify: false
      }
    ],
    users: [config.user],
    contexts: [
      {
        name: config.contextName,
        cluster: cluster.name,
        user: config.user.name,
        namespace: config.namespace
      }
    ],
    currentContext: config.contextName
  };
}
