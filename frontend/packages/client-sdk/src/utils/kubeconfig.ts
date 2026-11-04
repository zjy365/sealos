import { KubeConfig, type Cluster } from '@kubernetes/client-node';
import { load } from 'js-yaml';
import {
  inlineKubeconfigOptions,
  parseInlineKubeconfig
} from '../../../shared/src-server/kubernetes/kubeconfig';

export { InvalidKubeconfigError } from '../../../shared/src-server/kubernetes/kubeconfig';

export function getInlineKubeconfigOptions(raw: string, trustedCluster?: Cluster) {
  const config = parseInlineKubeconfig(raw, load);
  if (!trustedCluster) {
    const defaults = new KubeConfig();
    defaults.loadFromDefault();
    trustedCluster = defaults.getCurrentCluster() ?? undefined;
  }
  if (!trustedCluster) throw new Error('No trusted Kubernetes cluster configured');
  return inlineKubeconfigOptions(config, trustedCluster);
}

export function createKubeConfig(raw: string, trustedCluster?: Cluster): KubeConfig {
  const options = getInlineKubeconfigOptions(raw, trustedCluster);
  const kc = new KubeConfig();
  kc.loadFromOptions(options);
  return kc;
}
