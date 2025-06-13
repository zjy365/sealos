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
    const parsed = JSON.parse(plan.maxResources) as TPlanMaxResourcesObject;
    if (parsed.memory && typeof parsed.memory === 'string') {
      parsed.memory = parsed.memory.replace('GiB', 'GB');
    }
    return parsed;
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
      let text = `${maxResourceObject.cpu} vCPU / ${maxResourceObject.memory} ${t('RAM')}`;
      res.push({
        text,
        key: 'cpu-memory'
      });
    }
    if (isFree && maxResourceObject?.storage) {
      res.push({
        text: `${maxResourceObject.storage} ${t('DiskDesc')}`,
        key: 'disk-withbr'
      });
    } else {
      res.push({
        text: `Unlimited ${t('DiskDesc')}`,
        key: 'disk-withbr'
      });
    }
    // res.push({
    //   text: '',
    //   key: 'br-0'
    // });
    const getCountText = (
      count: number,
      config: {
        singleText?: string;
        multipleText?: string;
        showSingle?: boolean;
        showMultiple?: boolean;
      } = {}
    ) => {
      const {
        singleText = t('Single'),
        multipleText = t('Multiple'),
        showSingle = false,
        showMultiple = true
      } = config;
      if (count === 1 && showSingle) {
        return singleText;
      }
      if (count === -1 && showMultiple) {
        return multipleText;
      }
      return count;
    };
    res.push({
      text: `${t('PlanWorkspaceCount', {
        count: plan.maxWorkspaces === -1 ? Infinity : plan.maxWorkspaces,
        countText: getCountText(plan.maxWorkspaces)
      })} / ${t('AZ')}`,
      key: 'workspace'
    });
    res.push({
      text: `${t('PlanSeatCount', {
        count: plan.maxSeats === -1 ? Infinity : plan.maxSeats,
        countText: getCountText(plan.maxSeats)
      })} / ${t('workspace').toLowerCase()}`,
      key: 'seats'
    });
    res.push({
      text: `${t('MultipleRegions')}`,
      key: 'regions'
    });
    res.push({
      text: `${!isFree ? t('membersOnly') : t('free')} ${t('AZ')}`,
      key: 'AZ-withbr'
    });
    // res.push({
    //   text: '',
    //   key: 'br-1'
    // });
    res.push({
      text: `${plan?.nodePort || (isFree ? 1 : 100)} ${t('nodePort')}`,
      key: 'nodeport-withIcon'
    });
    res.push({
      text: `${plan?.podCount || (isFree ? 4 : 100)} ${t('pod', {
        count: plan?.podCount || (isFree ? 4 : 100)
      })}`,
      key: 'pod'
    });
    res.push({
      text: `${plan?.logRetention || (isFree ? 7 : 30)} ${t('dayslog')}`,
      key: 'log'
    });
    res.push({
      text: `${isFree ? t('community') : t('expert')} ${t('support')}`,
      key: 'support'
    });
    if (!isFree) {
      res.push({
        text: t('API'),
        key: 'api'
      });
      res.push({
        text: t('SLO'),
        key: 'slo'
      });
    }
    return res;
  };
}
export default function usePlanFeatureTexts(plan: TPlanApiResponse, opts: Options = {}) {
  const maxResourceObject = useMemo(() => parseMaxResourcesObject(plan), [plan]);
  return useGetPlanFeatureTexts()(plan, { ...opts, maxResourceObject });
}
