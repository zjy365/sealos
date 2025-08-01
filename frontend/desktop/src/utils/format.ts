import dayjs from 'dayjs';

export const formatTime = (time: string | number | Date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(time).format(format);
};
export const k8sFormatTime = (time: string | number | Date) => {
  return dayjs(time).format('TYYMM-DDTHH-mm-ss');
};
// 1¥=10000
export const formatMoney = (mone: number) => {
  return mone / 1000000;
};
export const deFormatMoney = (money: number) => money * 1000000;

export function formatUrl(url: string, query: Record<string, string>) {
  const urlObj = new URL(url);
  // 添加新的查询参数
  for (const key in query) {
    urlObj.searchParams.append(key, query[key]);
  }
  return urlObj.toString();
}

/**
 * 解析 openapp 参数，提取应用名称和查询参数
 *
 * 支持以下几种格式：
 * 1. system-account-center - 只有应用名称
 * 2. system-account-center?page=plan - 应用名称 + 查询参数
 * 3. system-account-center/redirect?page=plan - 应用名称 + 路径 + 查询参数
 *
 * @param openapp openapp 参数值
 * @returns 解析后的应用名称和查询参数
 */
export const parseOpenappQuery = (openapp: string) => {
  if (!openapp) return { appkey: '', appQuery: '' };

  let param = decodeURIComponent(openapp);

  // 处理应用名称中可能包含的路径
  const slashIndex = param.indexOf('/');
  const questionMarkIndex = param.indexOf('?');

  let appkey = '';
  let appQuery = '';

  // 情况1: 如果没有 / 和 ?，整个字符串就是 appkey
  // 例如: system-account-center
  if (slashIndex === -1 && questionMarkIndex === -1) {
    appkey = param;
  }
  // 情况2: 如果有 / 但没有 ?，或者 / 在 ? 之前
  // 例如: system-account-center/redirect 或 system-account-center/redirect?page=plan
  else if (slashIndex !== -1 && (questionMarkIndex === -1 || slashIndex < questionMarkIndex)) {
    appkey = param.substring(0, slashIndex);
    appQuery = param.substring(slashIndex);
  }
  // 情况3: 如果有 ? 但没有 /，或者 ? 在 / 之前
  // 例如: system-account-center?page=plan
  else {
    appkey = param.substring(0, questionMarkIndex);
    appQuery = param.substring(questionMarkIndex + 1);
  }

  return {
    appkey,
    appQuery
  };
};

export const getRemainingTime = (expirationTime: number) => {
  const currentTime = Math.floor(Date.now() / 1000);

  if (currentTime >= expirationTime) {
    return 'expired';
  }

  const remainingTimeInSeconds = expirationTime - currentTime;
  const hours = Math.floor(remainingTimeInSeconds / 3600);
  const minutes = Math.floor((remainingTimeInSeconds % 3600) / 60);
  const seconds = remainingTimeInSeconds % 60;

  const formattedTime = `${hours}小时${minutes}分钟`;
  return formattedTime;
};

export function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex === -1) {
    return email;
  }

  const username = email.substring(0, atIndex);
  const domain = email.substring(atIndex);

  if (username.length <= 3) {
    return username + '****' + domain;
  }

  const maskedUsername =
    username.substring(0, 3) +
    '*'.repeat(username.length - 4) +
    username.substring(username.length - 1);
  return maskedUsername + domain;
}

/**
 * memory format
 */
export const memoryFormatToMi = (memory: string) => {
  if (!memory || memory === '0') {
    return 0;
  }

  let value = parseFloat(memory);

  if (/Ki/gi.test(memory)) {
    value = value / 1024;
  } else if (/Mi/gi.test(memory)) {
    value = value;
  } else if (/Gi/gi.test(memory)) {
    value = value * 1024;
  } else if (/Ti/gi.test(memory)) {
    value = value * 1024 * 1024;
  } else {
    value = 0;
  }

  return Number(value.toFixed(2));
};

/**
 * cpu format
 */
export const cpuFormatToM = (cpu: string) => {
  if (!cpu || cpu === '0') {
    return 0;
  }
  let value = parseFloat(cpu);

  if (/n/gi.test(cpu)) {
    value = value / 1000 / 1000;
  } else if (/u/gi.test(cpu)) {
    value = value / 1000;
  } else if (/m/gi.test(cpu)) {
    value = value;
  } else {
    value = value * 1000;
  }
  if (value < 0.1) return 0;
  return Number(value.toFixed(4));
};
