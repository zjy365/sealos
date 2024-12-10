import { NextRequest } from 'next/server'

import type { Env } from '@/types/static'
import { defaultEnv } from '@/stores/env'
import { jsonRes } from '@/services/backend/response'
import { getK8s } from '@/services/backend/kubernetes'
import { authSession } from '@/services/backend/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const headerList = req.headers

    const { namespace } = await getK8s({
      kubeconfig: await authSession(headerList)
    })

    return jsonRes<Env>({
      data: {
        sealosDomain: process.env.SEALOS_DOMAIN || defaultEnv.sealosDomain,
        ingressSecret: process.env.INGRESS_SECRET || defaultEnv.ingressSecret,
        registryAddr: process.env.REGISTRY_ADDR || defaultEnv.registryAddr,
        devboxAffinityEnable: process.env.DEVBOX_AFFINITY_ENABLE || defaultEnv.devboxAffinityEnable,
        squashEnable: process.env.SQUASH_ENABLE || defaultEnv.squashEnable,
        namespace: namespace || defaultEnv.namespace,
        rootRuntimeNamespace: process.env.ROOT_RUNTIME_NAMESPACE || defaultEnv.rootRuntimeNamespace,
        ingressDomain: process.env.INGRESS_DOMAIN || defaultEnv.ingressDomain,
        currencySymbol: (process.env.CURRENCY_SYMBOL || defaultEnv.currencySymbol) as
          | 'shellCoin'
          | 'cny'
          | 'usd'
      }
    })
  } catch (err: any) {
    return jsonRes({
      code: 500,
      error: err
    })
  }
}