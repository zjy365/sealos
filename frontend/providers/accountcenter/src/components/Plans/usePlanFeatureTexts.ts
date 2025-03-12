import { TPlanApiResponse, TPlanMaxResourcesObject } from '@/schema/plan';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

export default function usePlanFeatureTexts(plan: TPlanApiResponse) {
  const { t } = useTranslation();
  const isFree = plan.amount === 0;
  const maxResourceObject = useMemo(() => {
    try {
      return JSON.parse(plan.maxResources) as TPlanMaxResourcesObject;
    } catch {
      return null;
    }
  }, [plan]);
  const res: Array<{ key: string; text: string }> = [];
  if (maxResourceObject?.cpu && maxResourceObject.memory) {
    let text = `${maxResourceObject.cpu} vCPU / ${maxResourceObject.memory} ${t('RAM')}`;
    if (isFree && maxResourceObject.storage) {
      text += ` / ${maxResourceObject.storage} ${t('Disk')}`;
      text = t('PerRegion', { text });
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
      count: plan.maxWorkspaces,
      countText: getWorkspaceCountText()
    })} / ${t('Region').toLowerCase()}`,
    key: 'workspace'
  });
  res.push({
    text: `${t('PlanSeatCount', { count: plan.maxSeats, countText: getSeatCountText() })} / ${t(
      'workspace'
    ).toLowerCase()}`,
    key: 'seats'
  });
  return res;
}
