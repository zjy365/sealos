import GPUItem from '@/components/GPUItem';
import MyIcon from '@/components/Icon';
import { MOCK_APP_DETAIL } from '@/mock/apps';
import { useUserStore } from '@/store/user';
import type { AppDetailType } from '@/types/app';
import { printMemory, useCopyData } from '@/utils/tools';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Divider,
  Flex,
  Tag,
  Text,
  useTheme
} from '@chakra-ui/react';
import { MyTooltip } from '@sealos/ui';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import React, { useMemo, useState } from 'react';
import { sealosApp } from 'sealos-desktop-sdk/app';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

const ConfigMapDetailModal = dynamic(() => import('./ConfigMapDetailModal'));

// 初始化 dayjs 插件
dayjs.extend(relativeTime);
dayjs.extend(duration);

const AppBaseInfo = ({ app = MOCK_APP_DETAIL }: { app: AppDetailType }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { copyData } = useCopyData();
  const { userSourcePrice } = useUserStore();
  const [detailConfigMap, setDetailConfigMap] = useState<{
    mountPath: string;
    value: string;
  }>();

  const appInfoTable = useMemo<
    {
      name: string;
      iconName: string;
      items: {
        label: string;
        value?: string;
        copy?: string;
        render?: React.ReactNode;
      }[];
    }[]
  >(
    () => [
      {
        name: 'Basic',
        iconName: 'formInfo',
        items: [
          { label: 'Creation Time', value: app.createTime },
          {
            label: `${t('Image Name')} ${app.secret.use ? '(Private)' : ''}`,
            value: app.imageName
          },
          { label: 'Limit CPU', value: `${app.cpu / 1000} Core` },
          {
            label: 'Limit Memory',
            value: printMemory(app.memory)
          },
          ...(userSourcePrice?.gpu
            ? [
                {
                  label: 'GPU',
                  render: <GPUItem gpu={app.gpu} />
                }
              ]
            : [])
        ]
      },
      {
        name: 'Deployment Mode',
        iconName: 'deployMode',
        items: app.hpa.use
          ? [
              {
                label: `${app.hpa.target} ${t('target_value')}`,
                value: `${app.hpa.value}${app.hpa.target === 'gpu' ? '' : '%'}`
              },
              {
                label: 'Number of Instances',
                value: `${app.hpa.minReplicas} ~ ${app.hpa.maxReplicas}`
              }
            ]
          : [{ label: `Number of Instances`, value: `${app.replicas}` }]
      }
    ],
    [app]
  );

  const appTags = useMemo(
    () => [
      ...(app.networks.find((item) => item.openPublicDomain) ? ['Public Access'] : []),
      ...(app.hpa.use ? ['Auto scaling'] : ['Fixed instance']),
      ...(app.storeList.length > 0 ? ['Stateful'] : ['Stateless'])
    ],
    [app]
  );

  const persistentVolumes = useMemo(() => {
    return app.volumes
      .filter((item) => 'persistentVolumeClaim' in item)
      .reduce(
        (
          acc: {
            path: string;
            name: string;
          }[],
          volume
        ) => {
          const mount = app.volumeMounts.find((m) => m.name === volume.name);
          if (mount) {
            acc.push({
              path: mount.mountPath,
              name: volume.name
            });
          }
          return acc;
        },
        []
      );
  }, [app.volumes, app.volumeMounts]);

  // 计算从创建时间到现在的时间差
  const timeSinceCreation = useMemo(() => {
    if (!app.createTime) return '-';

    const createdAt = dayjs(app.createTime);
    const now = dayjs();
    const diffInHours = now.diff(createdAt, 'hour');

    if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  }, [app.createTime]);

  return (
    <Box
      position={'relative'}
      px={'24px'}
      py={'20px'}
      borderRadius={'16px'}
      border={'1px solid #E4E4E7'}
      bg={'#FFF'}
      boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.05)'}
    >
      <Box>
        <Flex
          alignItems={'center'}
          color={'#18181B'}
          fontSize={'20px'}
          fontWeight={'bold'}
          height={'36px'}
          mb={'16px'}
        >
          {t('cc:basic')}
        </Flex>
        <Box>
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap="12px" mb="12px">
            <Box>
              <Box display="grid" gridTemplateColumns="144px 1fr" mb={4}>
                <Text color={'#525252'}>Image</Text>
                <Text color={'#18181B'}>{app.imageName}</Text>
              </Box>
              <Box display="grid" gridTemplateColumns="144px 1fr">
                <Text color={'#525252'}>Created at</Text>
                <Text color={'#18181B'}>{app.createTime}</Text>
              </Box>
            </Box>
            <Box>
              <Box display="grid" gridTemplateColumns="144px 1fr" mb={'12px'}>
                <Text color={'#525252'}>Source</Text>
                {app.source.hasSource ? (
                  <Box fontSize={'12px'}>
                    <Flex
                      flexWrap={'wrap'}
                      cursor={'pointer'}
                      onClick={() => {
                        if (!app?.source?.sourceName) return;
                        if (app.source.sourceType === 'app_store') {
                          sealosApp.runEvents('openDesktopApp', {
                            appKey: 'system-template',
                            pathname: '/instance',
                            query: { instanceName: app.source.sourceName }
                          });
                        }
                        if (app.source.sourceType === 'sealaf') {
                          sealosApp.runEvents('openDesktopApp', {
                            appKey: 'system-sealaf',
                            pathname: '/',
                            query: { instanceName: app.source.sourceName }
                          });
                        }
                      }}
                    >
                      <Flex alignItems={'center'}>
                        <Text color={'#18181B'}>{t(app.source?.sourceType)}</Text>
                        <Divider
                          orientation="vertical"
                          h={'12px'}
                          mx={'8px'}
                          borderColor={'grayModern.300'}
                        />
                        <Box color={'#525252'}>{t('Manage all resources')}</Box>
                        <MyIcon name="upperRight" width={'14px'} color={'#525252'} />
                      </Flex>
                    </Flex>
                  </Box>
                ) : (
                  <Text flex="1">/</Text>
                )}
              </Box>
              <Box display="grid" gridTemplateColumns="144px 1fr">
                <Text color={'#525252'}>Start Time</Text>
                <Text>{timeSinceCreation}</Text>
              </Box>
            </Box>
          </Box>
          <Divider my={'16px'} />
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap="12px">
            <Box>
              <Box display="grid" gridTemplateColumns="144px 1fr" mb={'12px'}>
                <Text color={'#525252'}>CPU Limit</Text>
                <Text>{`${app.cpu / 1000} Core`}</Text>
              </Box>
              {app.hpa.use ? (
                <Box display="grid" gridTemplateColumns="144px 1fr">
                  <Text color={'#525252'}>
                    {`${app.hpa.target.toLocaleUpperCase()} ${t('target_value')}`}
                  </Text>
                  <Text>{`${app.hpa.value}${app.hpa.target === 'gpu' ? '' : '%'}`}</Text>
                </Box>
              ) : (
                <Box display="grid" gridTemplateColumns="144px 1fr">
                  <Text color={'#525252'}>Replica Count</Text>
                  <Text>{app.replicas}</Text>
                </Box>
              )}
            </Box>
            <Box>
              <Box display="grid" gridTemplateColumns="144px 1fr" mb={'12px'}>
                <Text color={'#525252'}>Memory Limit</Text>
                <Text>{printMemory(app.memory)}</Text>
              </Box>
              {app.hpa.use && (
                <Box display="grid" gridTemplateColumns="144px 1fr">
                  <Text color={'#525252'}>Replica Count</Text>
                  <Text>
                    {app.hpa.use ? `${app.hpa.minReplicas} ~ ${app.hpa.maxReplicas}` : app.replicas}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      {detailConfigMap && (
        <ConfigMapDetailModal {...detailConfigMap} onClose={() => setDetailConfigMap(undefined)} />
      )}
    </Box>
  );
};

export default React.memo(AppBaseInfo);
