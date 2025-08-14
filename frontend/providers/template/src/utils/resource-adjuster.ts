import JsYaml from 'js-yaml';
import { cpuFormatToM, memoryFormatToMi } from './tools';

interface ResourceConfig {
  requests?: {
    cpu?: string;
    memory?: string;
    [key: string]: any;
  };
  limits?: {
    cpu?: string;
    memory?: string;
    [key: string]: any;
  };
}

interface AdjustmentRatios {
  cpu: number;
  memory: number;
}

export function adjustResourcesInYaml(
  yamlString: string,
  ratios: AdjustmentRatios = { cpu: 0.05, memory: 0.1 }
): string {
  try {
    const docs = JsYaml.loadAll(yamlString);

    const adjustedDocs = docs.map((doc) => {
      if (!doc || typeof doc !== 'object') return doc;

      const k8sDoc = doc as any;
      return adjustResourcesInDoc(k8sDoc, ratios);
    });

    return adjustedDocs.map((doc) => JsYaml.dump(doc)).join('---\n');
  } catch (error) {
    console.error('Failed to adjust resources in YAML:', error);
    return yamlString;
  }
}

function adjustResourcesInDoc(doc: any, ratios: AdjustmentRatios): any {
  if (!doc || typeof doc !== 'object') return doc;

  const adjustedDoc = JSON.parse(JSON.stringify(doc));

  adjustContainersRecursively(adjustedDoc, ratios);

  return adjustedDoc;
}

function adjustContainersRecursively(obj: any, ratios: AdjustmentRatios): void {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    obj.forEach((item) => adjustContainersRecursively(item, ratios));
    return;
  }

  if (obj.containers && Array.isArray(obj.containers)) {
    obj.containers.forEach((container: any) => {
      if (container.resources) {
        container.resources = adjustContainerResources(container.resources, ratios);
      }
    });
  }

  Object.keys(obj).forEach((key) => {
    adjustContainersRecursively(obj[key], ratios);
  });
}

function adjustContainerResources(
  resources: ResourceConfig,
  ratios: AdjustmentRatios
): ResourceConfig {
  const adjusted = { ...resources };

  if (!adjusted.requests) {
    adjusted.requests = {};
  }

  if (adjusted.limits?.cpu) {
    const cpuLimitValue = cpuFormatToM(adjusted.limits.cpu);
    adjusted.requests.cpu = `${Math.floor(cpuLimitValue * ratios.cpu)}m`;
  } else if (adjusted.requests.cpu) {
    const cpuRequestValue = cpuFormatToM(adjusted.requests.cpu);
    adjusted.requests.cpu = `${Math.floor(cpuRequestValue * ratios.cpu)}m`;
  }

  if (adjusted.limits?.memory) {
    const memoryLimitValue = memoryFormatToMi(adjusted.limits.memory);
    adjusted.requests.memory = `${Math.floor(memoryLimitValue * ratios.memory)}Mi`;
  } else if (adjusted.requests.memory) {
    const memoryRequestValue = memoryFormatToMi(adjusted.requests.memory);
    adjusted.requests.memory = `${Math.floor(memoryRequestValue * ratios.memory)}Mi`;
  }

  return adjusted;
}
