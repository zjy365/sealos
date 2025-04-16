import Cron from 'croner';

declare global {
  var updateRepoCronJob: Cron;
}

export type QueryType = {
  name: string;
  templateName: string;
};

export interface YamlItemType {
  filename: string;
  value: string;
}

export type ServiceEnvType = {
  SEALOS_DOMAIN: string;
  INGRESS_SECRET: string;
};

export type EnvResponse = {
  FORCED_LANGUAGE: string;
  SEALOS_CLOUD_DOMAIN: string;
  SEALOS_CERT_SECRET_NAME: string;
  CLAWCLOUD_CLOUD_DOMAIN: string; // 等于 SEALOS_CLOUD_DOMAIN
  CLAWCLOUD_CERT_SECRET_NAME: string; // 等于 SEALOS_CERT_SECRET_NAME
  TEMPLATE_REPO_URL: string;
  TEMPLATE_REPO_BRANCH: string;
  SEALOS_NAMESPACE: string;
  SEALOS_SERVICE_ACCOUNT: string;
  CLAWCLOUD_NAMESPACE: string; // 等于 SEALOS_NAMESPACE
  CLAWCLOUD_SERVICE_ACCOUNT: string; // 等于 SEALOS_SERVICE_ACCOUNT
  SHOW_AUTHOR: string;
  DESKTOP_DOMAIN: string;
  CURRENCY_SYMBOL: 'shellCoin' | 'cny' | 'usd';
};
