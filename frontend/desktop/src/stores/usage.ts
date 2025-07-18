import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { PLAN_LIMIT } from '@/constants/account';
import { getResource } from '@/api/platform';

export interface ResourceData {
  totalCpu: string;
  totalMemory: string;
  totalStorage: string;
  runningPodCount: string;
  totalPodCount: string;
  totalGpuCount: string;
  traffic: {
    value: string;
    unit: string;
    rawBytes: number;
    status?: string;
    lastUpdated?: string;
  } | null;
}

export interface ResourceExceeded {
  type: 'pod' | 'traffic' | 'cpu' | 'memory' | 'storage';
  message: string;
  currentValue: number;
  limitValue: number;
}

type State = {
  resourceData: ResourceData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchResourceData: () => Promise<ResourceData>;
  setResourceData: (data: ResourceData) => void;

  // Computed values
  getTrafficUsageInGB: () => number;
  checkResourceLimits: (planName: string) => ResourceExceeded[];
  getUpgradeAlertMessage: (planName: string) => string | null;
};

export const useUsageStore = create<State>()(
  devtools(
    immer((set, get) => ({
      resourceData: null,
      isLoading: false,
      error: null,

      fetchResourceData: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await getResource();
          if (response?.data) {
            set((state) => {
              state.resourceData = response.data as ResourceData;
              state.isLoading = false;
            });
            return response.data;
          } else {
            set((state) => {
              state.error = 'No data received';
              state.isLoading = false;
            });
            throw new Error('No data received');
          }
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch resource data';
            state.isLoading = false;
          });
          throw error;
        }
      },

      setResourceData: (data: ResourceData) => {
        set((state) => {
          state.resourceData = data;
        });
      },

      getTrafficUsageInGB: () => {
        const data = get().resourceData;
        if (!data?.traffic?.rawBytes) return 0;
        return data.traffic.rawBytes / (1024 * 1024 * 1024);
      },

      checkResourceLimits: (planName: string): ResourceExceeded[] => {
        const data = get().resourceData;
        if (!data) return [];

        const limits = PLAN_LIMIT[planName as keyof typeof PLAN_LIMIT];
        if (!limits) return [];

        const exceeded: ResourceExceeded[] = [];
        const trafficUsageGB = get().getTrafficUsageInGB();
        const healthyPods = Number(data.runningPodCount || 0);
        const totalCpu = Number(data.totalCpu || 0);
        const totalMemory = Number(data.totalMemory || 0);
        const totalStorage = Number(data.totalStorage || 0);

        // 检查 Pod 限制
        if (limits.pod > 0 && healthyPods >= limits.pod) {
          exceeded.push({
            type: 'pod',
            message: 'Pod limit reached',
            currentValue: healthyPods,
            limitValue: limits.pod
          });
        }

        // 检查流量限制
        if (limits.network > 0 && trafficUsageGB > limits.network) {
          exceeded.push({
            type: 'traffic',
            message: `Traffic limit exceeded (${trafficUsageGB.toFixed(2)}G/${limits.network}G)`,
            currentValue: trafficUsageGB,
            limitValue: limits.network
          });
        }

        // 检查 CPU 限制
        if (limits.cpu > 0 && totalCpu > limits.cpu) {
          exceeded.push({
            type: 'cpu',
            message: `CPU limit exceeded (${totalCpu}/${limits.cpu} cores)`,
            currentValue: totalCpu,
            limitValue: limits.cpu
          });
        }

        // 检查内存限制
        if (limits.memory > 0 && totalMemory > limits.memory) {
          exceeded.push({
            type: 'memory',
            message: `Memory limit exceeded (${totalMemory}G/${limits.memory}G)`,
            currentValue: totalMemory,
            limitValue: limits.memory
          });
        }

        // 检查存储限制
        if (limits.storage > 0 && totalStorage > limits.storage) {
          exceeded.push({
            type: 'storage',
            message: `Storage limit exceeded (${totalStorage}G/${limits.storage}G)`,
            currentValue: totalStorage,
            limitValue: limits.storage
          });
        }

        return exceeded;
      },

      getUpgradeAlertMessage: (planName: string): string | null => {
        const exceeded = get().checkResourceLimits(planName);
        if (exceeded.length === 0) return null;

        const messages = exceeded.map((item) => item.message);
        return messages.join('. ') + '. Upgrade your plan to unlock higher quotas.';
      }
    })),
    {
      name: 'usage-store'
    }
  )
);
