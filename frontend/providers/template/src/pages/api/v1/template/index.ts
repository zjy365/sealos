import { jsonRes } from '@/services/backend/response';
import { TemplateType } from '@/types/app';
import { findTopKeyWords } from '@/utils/template';
import { parseGithubUrl } from '@/utils/tools';
import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { Cron } from 'croner';

const DEFAULT_LANGUAGE = 'en';
const DEFAULT_MENU_COUNT = 10;
const CRON_INTERVAL = '*/5 * * * *';
const TIMEZONE = 'Asia/Shanghai';
const RESOURCE_TYPE = 'template';
const HTTP_OK = 200;
const HTTP_ERROR = 500;

export function replaceRawWithCDN(url: string, cdnUrl: string) {
  let parsedUrl = parseGithubUrl(url);
  if (!parsedUrl || !cdnUrl) return url;
  if (parsedUrl.hostname === 'raw.githubusercontent.com') {
    const newUrl = `https://${cdnUrl}/gh/${parsedUrl.organization}/${parsedUrl.repository}@${parsedUrl.branch}/${parsedUrl.remainingPath}`;
    return newUrl;
  }
  return url;
}

export const readTemplates = (
  jsonPath: string,
  cdnUrl?: string,
  blacklistedCategories?: string[],
  language?: string
): TemplateType[] => {
  const jsonData = fs.readFileSync(jsonPath, 'utf8');
  const _templates: TemplateType[] = JSON.parse(jsonData);

  const templates = _templates
    .filter((item) => {
      const isBlacklisted =
        blacklistedCategories &&
        blacklistedCategories.some((category) =>
          (item?.spec?.categories ?? []).map((c) => c.toLowerCase()).includes(category)
        );
      return !item?.spec?.draft && !isBlacklisted;
    })
    .map((item) => {
      if (!!cdnUrl) {
        item.spec.readme = replaceRawWithCDN(item.spec.readme, cdnUrl);
        item.spec.icon = replaceRawWithCDN(item.spec.icon, cdnUrl);
      }
      return item;
    })
    .filter((item) => {
      if (!language) return true;

      if (!item.spec.locale) return true;

      if (item.spec.locale === language || (item.spec.i18n && item.spec.i18n[language]))
        return true;

      return false;
    });

  return templates;
};
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const language = (req.query.language as string) || DEFAULT_LANGUAGE;
  const originalPath = process.cwd();
  const jsonPath = path.resolve(originalPath, 'templates.json');
  const cdnUrl = process.env.CDN_URL;
  const baseurl = `http://${process.env.HOSTNAME || 'localhost'}:${process.env.PORT || 3000}`;
  const blacklistedCategories = process.env.BLACKLIST_CATEGORIES
    ? process.env.BLACKLIST_CATEGORIES.split(',')
    : [];
  const menuCount = Number(process.env.SIDEBAR_MENU_COUNT) || DEFAULT_MENU_COUNT;

  try {
    if (!global.updateRepoCronJob) {
      global.updateRepoCronJob = new Cron(
        CRON_INTERVAL,
        async () => {
          await fetch(`${baseurl}/api/updateRepo`);
          const now = new Date().toLocaleString('en-US', { timeZone: TIMEZONE });
          console.log(`[${now}] updateRepoCronJob`);
        },
        {
          timezone: TIMEZONE
        }
      );
    }

    if (!fs.existsSync(jsonPath)) {
      console.log(`${baseurl}/api/updateRepo`);
      await fetch(`${baseurl}/api/updateRepo`);
    }

    const templates = readTemplates(jsonPath, cdnUrl, blacklistedCategories, language);

    const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    console.log(`[${timestamp}] language: ${language}, templates count: ${templates.length}`);

    // Build simplified template list (without resource calculation for better performance)
    const simplifiedTemplates = templates.map((template) => {
      const locale = language || DEFAULT_LANGUAGE;
      const i18nData = template.spec?.i18n?.[locale];

      return {
        name: template.metadata.name,
        uid: template.metadata.uid,
        resourceType: RESOURCE_TYPE,
        readme: i18nData?.readme || template.spec.readme || '',
        icon: i18nData?.icon || template.spec.icon || '',
        description: i18nData?.description || template.spec.description || '',
        gitRepo: template.spec.gitRepo || '',
        category: template.spec.categories || [],
        input: template.spec.inputs || {},
        deployCount: template.spec.deployCount || 0
      };
    });

    const categories = templates.map((item) => (item.spec?.categories ? item.spec.categories : []));
    const topKeys = findTopKeyWords(categories, menuCount);

    jsonRes(res, {
      data: {
        templates: simplifiedTemplates,
        menuKeys: topKeys.join(',')
      },
      code: HTTP_OK
    });
  } catch (error) {
    jsonRes(res, { code: HTTP_ERROR, data: 'api listTemplate error', error: error });
  }
}
