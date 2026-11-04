import { InvalidKubeconfigError } from 'sealos-desktop-sdk/service';
import type { NextApiRequest } from 'next';

export const authSession = async (req: NextApiRequest) => {
  if (!req.headers) throw new InvalidKubeconfigError();
  const { authorization } = req.headers;
  if (!authorization) throw new InvalidKubeconfigError();

  try {
    const kubeConfig = decodeURIComponent(authorization);
    return Promise.resolve(kubeConfig);
  } catch (err) {
    throw new InvalidKubeconfigError();
  }
};
