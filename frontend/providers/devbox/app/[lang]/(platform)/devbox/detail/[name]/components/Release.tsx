'use client';

import { customAlphabet } from 'nanoid';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { sealosApp } from 'sealos-desktop-sdk/app';
import { SealosMenu, useMessage } from '@sealos/ui';
import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Flex, Img, MenuButton, Text, useDisclosure } from '@chakra-ui/react';

import MyIcon from '@/components/Icon';
import MyTable from '@/components/MyTable';
import DevboxStatusTag from '@/components/DevboxStatusTag';
import ReleaseModal from '@/components/modals/ReleaseModal';
import AppSelectModal from '@/components/modals/AppSelectModal';
import EditVersionDesModal from '@/components/modals/EditVersionDesModal';

import { useEnvStore } from '@/stores/env';
import { AppListItemType } from '@/types/app';
import { useConfirm } from '@/hooks/useConfirm';
import { useLoading } from '@/hooks/useLoading';
import { useDevboxStore } from '@/stores/devbox';
import { parseTemplateConfig } from '@/utils/tools';
import { DevboxVersionListItemType } from '@/types/devbox';
import { devboxIdKey, DevboxReleaseStatusEnum } from '@/constants/devbox';
import { delDevboxVersionByName, getAppsByDevboxId } from '@/api/devbox';

import { getTemplateConfig, listPrivateTemplateRepository } from '@/api/template';

import TemplateDrawer from './TemplateDrawer';
import { useGuideStore } from '@/stores/guide';
import { startDriver, startGuide6, startguideRelease } from '@/hooks/driver';
import { AppEditType } from '@/types/launchpad';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 6);

const Version = () => {
  const t = useTranslations();
  const { message: toast } = useMessage();
  const { Loading, setIsLoading } = useLoading();
  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure();

  const { env } = useEnvStore();
  const { devboxDetail: devbox, devboxVersionList, setDevboxVersionList } = useDevboxStore();

  const [initialized, setInitialized] = useState(false);
  const [onOpenRelease, setOnOpenRelease] = useState(false);
  const [onOpenSelectApp, setOnOpenSelectApp] = useState(false);
  const [apps, setApps] = useState<AppListItemType[]>([]);
  const [deployData, setDeployData] = useState<any>(null);
  const [currentVersion, setCurrentVersion] = useState<DevboxVersionListItemType | null>(null);
  const [updateTemplateRepo, setUpdateTemplateRepo] = useState<
    | null
    | Awaited<ReturnType<typeof listPrivateTemplateRepository>>['templateRepositoryList'][number]
  >(null);
  const templateDrawerHandler = useDisclosure();
  const { openConfirm, ConfirmChild } = useConfirm({
    content: 'delete_version_confirm_info'
  });
  const { refetch } = useQuery(
    ['initDevboxVersionList'],
    () => setDevboxVersionList(devbox!.name, devbox!.id),
    {
      refetchInterval:
        devboxVersionList.length > 0 &&
        !templateDrawerHandler.isOpen &&
        devboxVersionList[0].status.value === DevboxReleaseStatusEnum.Pending
          ? 3000
          : false,
      onSettled() {
        setInitialized(true);
      },
      enabled: !!devbox
    }
  );

  const listPrivateTemplateRepositoryQuery = useQuery(
    ['template-repository-list', 'template-repository-private'],
    () => {
      return listPrivateTemplateRepository({
        page: 1,
        pageSize: 100
      });
    }
  );

  const templateRepositoryList =
    listPrivateTemplateRepositoryQuery.data?.templateRepositoryList || [];

  const handleDeploy = useCallback(
    async (version: DevboxVersionListItemType) => {
      if (!devbox) return;
      const result = await getTemplateConfig(devbox.templateUid);
      const config = parseTemplateConfig(result.template.config);
      const releaseArgs = config.releaseArgs.join(' ');
      const releaseCommand = config.releaseCommand.join(' ');
      const { cpu, memory, networks, name } = devbox;
      const newNetworks = networks.map((network) => {
        return {
          port: network.port,
          appProtocol: network.protocol,
          protocol: 'TCP',
          openPublicDomain: network.openPublicDomain,
          domain: env.ingressDomain
        };
      });
      const imageName = `${env.registryAddr}/${env.namespace}/${devbox.name}:${version.tag}`;

      const transformData = {
        appName: `${name}-release-${nanoid()}`,
        cpu: cpu,
        memory: memory,
        imageName: imageName,
        networks:
          newNetworks.length > 0
            ? newNetworks
            : [
                {
                  port: 80,
                  protocol: 'TCP',
                  appProtocol: 'HTTP',
                  openPublicDomain: false,
                  domain: env.ingressDomain
                }
              ],
        runCMD: releaseCommand,
        cmdParam: releaseArgs,
        labels: {
          [devboxIdKey]: devbox.id
        }
      };

      setDeployData(transformData);
      const apps = await getAppsByDevboxId(devbox.id);

      // when: there is no app,create a new app
      if (apps.length === 0) {
        const tempFormDataStr = encodeURIComponent(JSON.stringify(transformData));
        sealosApp.runEvents('openDesktopApp', {
          appKey: 'system-applaunchpad',
          pathname: '/redirect',
          query: { formData: tempFormDataStr },
          messageData: {
            type: 'InternalAppCall',
            formData: tempFormDataStr
          }
        });
      }

      // when: there have apps,show the app select modal
      if (apps.length >= 1) {
        setApps(apps);
        setOnOpenSelectApp(true);
      }
    },
    [devbox, env.ingressDomain, env.namespace, env.registryAddr]
  );
  const handleDelDevboxVersion = useCallback(
    async (versionName: string) => {
      try {
        setIsLoading(true);
        await delDevboxVersionByName(versionName);
        toast({
          title: t('delete_successful'),
          status: 'success'
        });
        let retryCount = 0;
        const maxRetries = 3;
        const retryInterval = 3000;

        const retry = async () => {
          if (retryCount < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryInterval));
            await refetch();
            retryCount++;
          }
        };
        retry();
      } catch (error: any) {
        toast({
          title: typeof error === 'string' ? error : error.message || t('delete_failed'),
          status: 'error'
        });
        console.error(error);
      }
      setIsLoading(false);
    },
    [setIsLoading, toast, t, refetch]
  );

  const columns: {
    title: string;
    dataIndex?: keyof DevboxVersionListItemType;
    key: string;
    width?: string;
    minWidth?: string;
    render?: (item: DevboxVersionListItemType, index: number) => JSX.Element;
  }[] = [
    {
      title: t('name'),
      key: 'tag',
      render: (item: DevboxVersionListItemType) => (
        <Box color={'grayModern.900'} pl={'12px'}>
          {item.tag}
        </Box>
      )
    },
    {
      title: t('status'),
      key: 'status',
      render: (item: DevboxVersionListItemType) => (
        <DevboxStatusTag status={item.status} h={'27px'} />
      )
    },
    {
      title: t('create_time'),
      dataIndex: 'createTime',
      key: 'createTime',
      render: (item: DevboxVersionListItemType) => (
        <Text color={'grayModern.600'}>{item.createTime}</Text>
      )
    },
    {
      title: t('version_description'),
      key: 'description',
      render: (item: DevboxVersionListItemType) => (
        <Flex color={'grayModern.600'} role="group" w={'100%'}>
          {item.description}
          <MyIcon
            name="pencil"
            w={'16px'}
            ml={1}
            cursor={'pointer'}
            color={'white'}
            display={'none'}
            _groupHover={{
              display: 'inline-block'
            }}
            onClick={() => {
              setCurrentVersion(item);
              onOpenEdit();
            }}
          />
        </Flex>
      )
    },
    {
      title: '',
      key: 'control',
      render: (item: DevboxVersionListItemType, index: number) => (
        <Flex alignItems={'center'}>
          <Button
            id={index === 0 ? 'guide-online-button' : ''}
            height={'27px'}
            size={'sm'}
            h="32px"
            mr={5}
            borderWidth={1}
            boxShadow={'none'}
            fontSize={'base'}
            bg={'white'}
            _hover={{
              bg: 'grayModern.150'
            }}
            rightIcon={<MyIcon name="arrowRightUp" />}
            color={'grayModern.900'}
            isDisabled={item.status.value !== DevboxReleaseStatusEnum.Success}
            onClick={() => handleDeploy(item)}
          >
            {t('deploy')}
          </Button>
          <SealosMenu
            width={100}
            Button={
              <MenuButton
                as={Button}
                bg={'white'}
                width={'20px'}
                height={'20px'}
                p={0}
                borderWidth={1}
                boxShadow={'none'}
                boxSize={'32px'}
                data-group
                _hover={{
                  bg: 'grayModern.150'
                }}
                isDisabled={item?.status?.value !== 'Success'}
              >
                <MyIcon
                  name={'more'}
                  w={'16px'}
                  h={'16px'}
                  color={'grayModern.900'}
                  _groupHover={{
                    color: 'brightBlue.600'
                  }}
                  fill={'currentcolor'}
                />
              </MenuButton>
            }
            menuList={[
              {
                child: (
                  <>
                    <MyIcon name={'template'} w={'16px'} color={'white'} />
                    <Box ml={2}>{t('convert_to_runtime')}</Box>
                  </>
                ),
                menuItemStyle: {
                  _hover: {
                    bg: 'rgba(17, 24, 36, 0.05)'
                  }
                },
                onClick: () => {
                  setCurrentVersion(item);
                  templateDrawerHandler.onOpen();
                }
              },
              {
                child: (
                  <>
                    <MyIcon name={'delete'} w={'16px'} color={'#737373'} />
                    <Box ml={2}>{t('delete')}</Box>
                  </>
                ),
                menuItemStyle: {
                  _hover: {
                    color: 'red.600',
                    '& > svg': {
                      color: 'red.600'
                    },
                    bg: 'rgba(17, 24, 36, 0.05)'
                  }
                },
                onClick: () => openConfirm(() => handleDelDevboxVersion(item.name))()
              }
            ]}
          />
        </Flex>
      )
    }
  ];

  const { guide6, guide7, guideRelease, currentGuideApp } = useGuideStore();

  useEffect(() => {
    if (!guide6) {
      startDriver(startGuide6());
    }
  }, [guide6]);

  useEffect(() => {
    if (!guideRelease && guide6 && guide7 && devboxVersionList.length > 0) {
      // 创建一个函数来检查元素
      const checkAndStartGuide = () => {
        const onlineButton = document.getElementById('guide-online-button');

        if (onlineButton) {
          console.log('Online button found, starting guide');
          startDriver(startguideRelease());
          return true;
        }
        return false;
      };

      // 先检查一次
      if (checkAndStartGuide()) return;

      // 如果没找到，设置观察器
      const observer = new MutationObserver((mutations, obs) => {
        if (checkAndStartGuide()) {
          // 如果找到并启动了引导，停止观察
          obs.disconnect();
        }
      });

      // 开始观察 DOM 变化
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // 清理函数
      return () => {
        observer.disconnect();
      };
    }
  }, [guideRelease, guide6, guide7, devboxVersionList]);

  return (
    <Box
      borderWidth={1}
      borderRadius="lg"
      pl={6}
      pt={4}
      pr={6}
      bg={'white'}
      position={'relative'}
      minH={'300px'}
    >
      <Flex alignItems="center" justifyContent={'space-between'} mb={5}>
        <Flex alignItems={'center'}>
          <Text fontSize="medium" fontWeight={'bold'} color={'grayModern.900'}>
            {t('version_history')}
          </Text>
        </Flex>
        <Button
          className="guide-release-button"
          onClick={() => setOnOpenRelease(true)}
          bg={'white'}
          color={'grayModern.900'}
          borderWidth={1}
          mr={1}
          leftIcon={<MyIcon name="version" color={'white'} />}
          _hover={{
            color: 'brightBlue.600'
          }}
          boxShadow={'none'}
        >
          {t('release_version')}
        </Button>
      </Flex>
      <Loading loading={!initialized} fixed={false} />

      <MyTable
        columns={columns}
        data={devboxVersionList}
        needRadius
        gridTemplateColumns={'105px 105px 144px minmax(0, 1fr) 160px'}
      />
      {devboxVersionList.length === 0 && initialized && (
        <Flex
          w={'full'}
          flex={1}
          py={'24px'}
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Img src={'/images/empty/release-empty.png'} alt="empty" width={50} height={50} />
          <Text fontSize={'18px'} fontWeight={'600'} color={'grayModern.900'} mt={'12px'}>
            {t('no_release')}
          </Text>
          <Box pb={8} w={300} textAlign={'center'}>
            {t('no_release_desc')}
          </Box>
        </Flex>
      )}
      {!!currentVersion && (
        <EditVersionDesModal
          version={currentVersion}
          onSuccess={refetch}
          isOpen={isOpenEdit}
          onClose={onCloseEdit}
        />
      )}
      {!!onOpenRelease && !!devbox && (
        <ReleaseModal
          isOpen={!!onOpenRelease && !!devbox}
          onSuccess={refetch}
          onClose={() => {
            setOnOpenRelease(false);
          }}
          devbox={{ ...devbox, sshPort: devbox.sshPort || 0 }}
        />
      )}
      {!!onOpenSelectApp && (
        <AppSelectModal
          apps={apps}
          devboxName={devbox?.name || ''}
          deployData={deployData}
          onSuccess={() => setOnOpenSelectApp(false)}
          onClose={() => setOnOpenSelectApp(false)}
        />
      )}
      <ConfirmChild />
      <TemplateDrawer
        isOpen={templateDrawerHandler.isOpen}
        onClose={templateDrawerHandler.onClose}
        devboxReleaseName={currentVersion?.name || ''}
        templateRepositoryList={templateRepositoryList}
      />
    </Box>
  );
};

export default Version;
