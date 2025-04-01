import { TPlanApiResponse, TPlanMaxResourcesObject } from '@/schema/plan';
import { formatMoneyStr } from '@/utils/format';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

interface Options {
  inlcudeCredits?: boolean;
  hideFreeMaxResourcesPerRegionText?: boolean;
  maxResourceObject?: TPlanMaxResourcesObject | null;
}
function parseMaxResourcesObject(plan: TPlanApiResponse) {
  try {
    return JSON.parse(plan.maxResources) as TPlanMaxResourcesObject;
  } catch {
    return null;
  }
}
export function useGetPlanFeatureTexts() {
  const { t } = useTranslation();
  return function (plan: TPlanApiResponse, opts: Options = {}) {
    const isFree = plan.amount === 0;
    const maxResourceObject = opts.maxResourceObject || parseMaxResourcesObject(plan);
    const res: Array<{ key: string; text: string }> = [];
    if (opts.inlcudeCredits) {
      res.push({
        text: t('PlanIncludesCredits', {
          amount: formatMoneyStr(plan.giftAmount)
        }),
        key: 'credits'
      });
    }
    if (maxResourceObject?.cpu && maxResourceObject.memory) {
      let text = `Up to ${maxResourceObject.cpu} vCPU / ${maxResourceObject.memory} ${t('RAM')}`;
      if (isFree && maxResourceObject.storage) {
        text += ` / ${maxResourceObject.storage} ${t('Disk')}`;
        if (!opts.hideFreeMaxResourcesPerRegionText) {
          text = t('PerRegion', { text });
        }
      }
      res.push({
        text,
        key: 'resources'
      });
    }
    res.push({
      text: t(isFree ? 'FreeTraffic' : 'PlanTraffic'),
      key: 'traffic'
    });
    res.push({
      text: t('MultipleRegions'),
      key: 'regions'
    });
    const getWorkspaceCountText = () => {
      if (plan.maxWorkspaces === 1) {
        return t('Single');
      }
      if (plan.maxWorkspaces === -1) {
        return t('Multiple');
      }
      return plan.maxWorkspaces;
    };
    const getSeatCountText = () => {
      if (plan.maxSeats === -1) {
        return t('Multiple');
      }
      return plan.maxSeats;
    };
    res.push({
      text: `${t('PlanWorkspaceCount', {
        count: plan.maxWorkspaces === -1 ? Infinity : plan.maxWorkspaces,
        countText: getWorkspaceCountText()
      })} / ${t('Region').toLowerCase()}`,
      key: 'workspace'
    });
    res.push({
      text: `${t('PlanSeatCount', {
        count: plan.maxSeats === -1 ? Infinity : plan.maxSeats,
        countText: getSeatCountText()
      })} / ${t('workspace').toLowerCase()}`,
      key: 'seats'
    });
    return res;
  };
}
export default function usePlanFeatureTexts(plan: TPlanApiResponse, opts: Options = {}) {
  const maxResourceObject = useMemo(() => parseMaxResourcesObject(plan), [plan]);
  return useGetPlanFeatureTexts()(plan, { ...opts, maxResourceObject });
}
