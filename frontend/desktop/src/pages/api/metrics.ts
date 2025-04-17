import { NextApiRequest, NextApiResponse } from 'next';
import { register } from 'prom-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 更新指标
  const metrics = await register.metrics();

  res.setHeader('Content-Type', register.contentType);
  res.send(metrics);
}
