import { GET } from './request';

export interface ExpansionRuleData {
  page_number: number;
  page_size: number;
  rules: ExpansionRule[];
  total: number;
}

export interface ExpansionRuleParams {
  page_number: number;
  page_size: number;
  user_id: string;
  rule_name?: string;
  rule_type?: string;
}

export interface ExpansionRule {
  cid: number;
  created_at: string;
  expansion_pct: number;
  id: number;
  max_range: number;
  min_range: number;
  rule_name: string;
  rule_type: string;
  updated_at: string;
  valid_end?: string;
  valid_start: string;
}

export function getExpansionRule(params: ExpansionRuleParams) {
  return GET<ExpansionRuleData>('/api/runcc/expansion_rule', {
    cid: '1',
    ...params
  });
}
