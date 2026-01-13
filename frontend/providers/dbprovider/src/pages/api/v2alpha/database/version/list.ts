import { getK8s, K8sApiDefault } from '@/services/backend/kubernetes';
import { handleK8sError, jsonRes } from '@/services/backend/response';
import type { NextApiRequest, NextApiResponse } from 'next';
import { versionListSchema } from '@/types/schemas/db';
import { DBTypeEnum } from '@/constants/db';
import * as k8s from '@kubernetes/client-node';
import z from 'zod';

// Databases that use ComponentVersion (cmpv) instead of ClusterVersion (cv)
const COMPONENT_VERSION_DBS = [DBTypeEnum.mongodb, DBTypeEnum.redis, DBTypeEnum.clickhouse];

/**
 * Parse component versions from ComponentVersion CR
 */
const parseComponentVersions = (cmpvItem: any): string[] => {
  const versions =
    cmpvItem?.status?.serviceVersions || cmpvItem?.spec?.compatibilityRules?.[0]?.releases || [];
  if (typeof versions === 'string') {
    return versions.split(',').map((version: string) => version.trim());
  }
  if (Array.isArray(versions)) {
    return versions.map((version: any) =>
      typeof version === 'string' ? version : version.name || version.version
    );
  }
  return [];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const kc = K8sApiDefault();
  const k8sCustomObjects = kc.makeApiClient(k8s.CustomObjectsApi);

  if (req.method === 'GET') {
    try {
      const DBVersion: z.Infer<typeof versionListSchema> = {
        [DBTypeEnum.postgresql]: [],
        [DBTypeEnum.mongodb]: [],
        [DBTypeEnum.mysql]: [],
        [DBTypeEnum.notapemysql]: [],
        [DBTypeEnum.redis]: [],
        [DBTypeEnum.kafka]: [],
        [DBTypeEnum.qdrant]: [],
        [DBTypeEnum.nebula]: [],
        [DBTypeEnum.weaviate]: [],
        [DBTypeEnum.milvus]: [],
        [DBTypeEnum.pulsar]: [],
        [DBTypeEnum.clickhouse]: []
      };

      // Fetch ClusterVersions (cv) - for most databases
      try {
        const { body: cvBody } = (await k8sCustomObjects.listClusterCustomObject(
          'apps.kubeblocks.io',
          'v1alpha1',
          'clusterversions'
        )) as any;

        console.log({ cvBody });

        cvBody.items.forEach((item: any) => {
          const db = item?.spec?.clusterDefinitionRef as `${DBTypeEnum}`;

          // Only use ClusterVersion for databases not using ComponentVersion
          if (
            DBVersion[db] &&
            !COMPONENT_VERSION_DBS.includes(db as DBTypeEnum) &&
            item?.metadata?.name &&
            !DBVersion[db].includes(item.metadata.name)
          ) {
            DBVersion[db].unshift(item.metadata.name);
          }
        });
      } catch (cvError) {
        console.log('Error fetching ClusterVersions:', cvError);
      }

      // Fetch ComponentVersions (cmpv) - for MongoDB, Redis, and ClickHouse
      try {
        const { body: cmpvBody } = (await k8sCustomObjects.listClusterCustomObject(
          'apps.kubeblocks.io',
          'v1alpha1',
          'componentversions'
        )) as any;

        cmpvBody.items.forEach((item: any) => {
          const componentName = item?.metadata?.name;
          let dbType: DBTypeEnum | null = null;
          let versionPrefix = '';

          // Map component names to database types and set version prefix
          if (componentName === 'mongodb') {
            dbType = DBTypeEnum.mongodb;
            versionPrefix = 'mongodb-';
          } else if (
            componentName === 'redis' ||
            componentName === 'redis-cluster' ||
            componentName === 'redis-sentinel'
          ) {
            dbType = DBTypeEnum.redis;
            versionPrefix = 'redis-';
          } else if (componentName === 'clickhouse') {
            dbType = DBTypeEnum.clickhouse;
            versionPrefix = 'clickhouse-';
          }

          if (dbType && DBVersion[dbType]) {
            const versions = parseComponentVersions(item);
            versions.forEach((version) => {
              // Add prefix to match static data format and avoid duplicates
              const prefixedVersion = `${versionPrefix}${version}`;

              if (!DBVersion[dbType!].includes(prefixedVersion)) {
                DBVersion[dbType!].push(prefixedVersion);
              }
            });
          }
        });
      } catch (cmpvError) {
        console.log('Error fetching ComponentVersions:', cmpvError);
      }

      // Sort versions for better UX (latest first for each database)
      Object.keys(DBVersion).forEach((dbType) => {
        DBVersion[dbType as keyof typeof DBVersion].sort((a, b) => {
          // Try to sort by version number if possible
          const aVersion = a.match(/[\d.]+/)?.[0];
          const bVersion = b.match(/[\d.]+/)?.[0];
          if (aVersion && bVersion) {
            return bVersion.localeCompare(aVersion, undefined, {
              numeric: true,
              sensitivity: 'base'
            });
          }
          return b.localeCompare(a);
        });
      });

      return res.json(DBVersion);
    } catch (err) {
      console.log('error get db by name', err);
      jsonRes(res, handleK8sError(err));
    }
  } else {
    return jsonRes(res, {
      code: 405,
      message: 'Method not allowed'
    });
  }
}
