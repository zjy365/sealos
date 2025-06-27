'use client';

import { useRouter } from '@/i18n';
import {
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
  Button,
  useDisclosure
} from '@chakra-ui/react';
import { useMessage, Track } from '@sealos/ui';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Form from './components/form';
import Header from './components/Header';
import Yaml from './components/Yaml';

import type { YamlItemType } from '@/types';
import type { DevboxEditType, DevboxEditTypeV2, DevboxKindsType } from '@/types/devbox';

import { useConfirm } from '@/hooks/useConfirm';
import { useScheduleModal } from '@/hooks/useScheduleModal';
import { useLoading } from '@/hooks/useLoading';

import { useDevboxStore } from '@/stores/devbox';
import { useEnvStore } from '@/stores/env';
import { useGlobalStore } from '@/stores/global';
import { useIDEStore } from '@/stores/ide';
import { useUserStore } from '@/stores/user';
import { usePriceStore } from '@/stores/price';

import { createDevbox, updateDevbox } from '@/api/devbox';
import { defaultDevboxEditValueV2, editModeMap } from '@/constants/devbox';
import { useTemplateStore } from '@/stores/template';
import { generateYamlList } from '@/utils/json2Yaml';
import { patchYamlList, getScheduleTime } from '@/utils/tools';
import { debounce } from 'lodash';
import { useGuideStore } from '@/stores/guide';
import { sealosApp } from 'sealos-desktop-sdk/app';
import { getUserSession } from '@/utils/user';

const ErrorModal = dynamic(() => import('@/components/modals/ErrorModal'));
const DevboxCreatePage = () => {
  const { env } = useEnvStore();
  const generateDefaultYamlList = () => generateYamlList(defaultDevboxEditValueV2, env);
  const router = useRouter();
  const t = useTranslations();
  const { Loading, setIsLoading } = useLoading();

  const searchParams = useSearchParams();
  const { message: toast } = useMessage();
  const { addDevboxIDE } = useIDEStore();
  const { sourcePrice, setSourcePrice } = usePriceStore();
  const { checkQuotaAllow } = useUserStore();
  const { setDevboxDetail, devboxList } = useDevboxStore();
  const { setCurrentGuideApp, setguideConfigDevbox } = useGuideStore();

  const crOldYamls = useRef<DevboxKindsType[]>([]);
  const formOldYamls = useRef<YamlItemType[]>([]);
  const oldDevboxEditData = useRef<DevboxEditTypeV2>();

  const [errorMessage, setErrorMessage] = useState('');
  const [yamlList, setYamlList] = useState<YamlItemType[]>([]);

  const tabType = searchParams.get('type') || 'form';
  const devboxName = searchParams.get('name') || '';

  // NOTE: need to explain why this is needed
  // fix a bug: searchParams will disappear when go into this page
  const [captureDevboxName, setCaptureDevboxName] = useState('');
  const { updateTemplateModalConfig, config: templateConfig } = useTemplateStore();
  useEffect(() => {
    const name = searchParams.get('name');
    if (name) {
      setCaptureDevboxName(name);
      router.replace(`/devbox/create?name=${captureDevboxName}`, undefined);
    }
  }, [searchParams, router, captureDevboxName]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isEdit = useMemo(() => !!devboxName, []);

  const { title, applyBtnText, applyMessage, applySuccess, applyError } = editModeMap(isEdit);

  const { openConfirm: openScheduleConfirm, ConfirmModal: ScheduleModal } = useScheduleModal({
    title: 'createDevbox'
  });
  const { openConfirm: openUpdateConfirm, ConfirmChild: UpdateConfirmChild } = useConfirm({
    content: applyMessage
  });
  const openConfirm = devboxName ? openUpdateConfirm : openScheduleConfirm;
  const ConfirmModal = devboxName ? <UpdateConfirmChild /> : ScheduleModal;

  // compute container width
  const { screenWidth, lastRoute } = useGlobalStore();

  const pxVal = useMemo(() => {
    const val = Math.floor((screenWidth - 1050) / 2);
    if (val < 20) {
      return 20;
    }
    return val;
  }, [screenWidth]);

  const formHook = useForm<DevboxEditTypeV2>({
    defaultValues: defaultDevboxEditValueV2
  });

  // updateyamlList every time yamlList change
  const debouncedUpdateYaml = useMemo(
    () =>
      debounce((data: DevboxEditTypeV2, env) => {
        try {
          const newYamlList = generateYamlList(data, env);
          setYamlList(newYamlList);
        } catch (error) {
          console.error('Failed to generate yaml:', error);
        }
      }, 300),
    []
  );

  const countGpuInventory = useCallback(
    (type?: string) => {
      const inventory = sourcePrice?.gpu?.find((item) => item.type === type)?.inventory || 0;

      return inventory;
    },
    [sourcePrice?.gpu]
  );

  // 监听表单变化
  useEffect(() => {
    const subscription = formHook.watch((value) => {
      if (value) {
        debouncedUpdateYaml(value as DevboxEditTypeV2, env);
      }
    });
    return () => {
      subscription.unsubscribe();
      debouncedUpdateYaml.cancel();
    };
  }, [formHook, debouncedUpdateYaml, env]);

  const { refetch: refetchPrice } = useQuery(['init-price'], setSourcePrice, {
    enabled: !!sourcePrice?.gpu,
    refetchInterval: 6000
  });

  // get user quota
  const { userQuota, loadUserQuota } = useUserStore();
  useQuery(['getUserQuota'], loadUserQuota);

  console.log(userQuota, 'userQuota');

  useQuery(
    ['initDevboxCreateData'],
    () => {
      if (!devboxName) {
        setYamlList(generateDefaultYamlList());
        return null;
      }
      setIsLoading(true);
      return setDevboxDetail(devboxName, env.sealosDomain);
    },
    {
      onSuccess(res) {
        if (!res) {
          return;
        }
        oldDevboxEditData.current = res;
        formOldYamls.current = generateYamlList(res, env);
        crOldYamls.current = generateYamlList(res, env) as DevboxKindsType[];
        formHook.reset(res);
      },
      onError(err) {
        toast({
          title: String(err),
          status: 'error'
        });
      },
      onSettled() {
        setIsLoading(false);
      }
    }
  );
  const submitSuccess = async (formData: DevboxEditTypeV2, pauseTime?: number) => {
    setIsLoading(true);
    try {
      // gpu inventory check
      if (formData.gpu?.type) {
        const inventory = countGpuInventory(formData.gpu?.type);
        if (formData.gpu?.amount > inventory) {
          return toast({
            status: 'warning',
            title: t('Gpu under inventory Tip', {
              gputype: formData.gpu.type
            })
          });
        }
      }
      // quote check
      const quoteCheckRes = checkQuotaAllow(
        { ...formData, nodeports: devboxList.length + 1 } as DevboxEditTypeV2 & {
          nodeports: number;
        },
        {
          ...oldDevboxEditData.current,
          nodeports: devboxList.length
        } as DevboxEditType & {
          nodeports: number;
        }
      );
      if (quoteCheckRes) {
        setIsLoading(false);
        onOpen();
        return;
      }
      // update
      if (isEdit) {
        const yamlList = generateYamlList(formData, env);
        setYamlList(yamlList);
        const parsedNewYamlList = yamlList.map((item) => item.value);
        const parsedOldYamlList = formOldYamls.current.map((item) => item.value);
        const areYamlListsEqual =
          new Set(parsedNewYamlList).size === new Set(parsedOldYamlList).size &&
          [...new Set(parsedNewYamlList)].every((item) => new Set(parsedOldYamlList).has(item));
        if (areYamlListsEqual) {
          setIsLoading(false);
          return toast({
            status: 'info',
            title: t('No changes detected'),
            duration: 5000,
            isClosable: true
          });
        }
        if (!parsedNewYamlList) {
          // prevent empty yamlList
          return setErrorMessage(t('submit_form_error'));
        }
        const patch = patchYamlList({
          parsedOldYamlList: parsedOldYamlList,
          parsedNewYamlList: parsedNewYamlList,
          originalYamlList: crOldYamls.current
        });
        await updateDevbox({
          patch,
          devboxName: formData.name
        });
      } else {
        if (pauseTime && pauseTime > 0) {
          await createDevbox({
            devboxForm: formData,
            schedulePause: { time: getScheduleTime(pauseTime), type: 'Stopped' }
          });
        } else {
          await createDevbox({
            devboxForm: formData,
            schedulePause: { time: '', type: 'Stopped' }
          });
        }
      }
      addDevboxIDE('vscode', formData.name);
      toast({
        title: t(applySuccess),
        status: 'success'
      });
      updateTemplateModalConfig({
        ...templateConfig,
        lastRoute
      });
      if (sourcePrice?.gpu) {
        refetchPrice();
      }
      setguideConfigDevbox(true);
      setCurrentGuideApp(formData.name);
      router.push(lastRoute);
    } catch (error) {
      console.log('error', error);
      if (error instanceof String && error.includes('402')) {
        setErrorMessage(t('outstanding_tips'));
      } else setErrorMessage(JSON.stringify(error));
    }
    setIsLoading(false);
  };

  const submitError = useCallback(() => {
    // deep search message
    const deepSearch = (obj: any): string => {
      if (!obj || typeof obj !== 'object') {
        return t('submit_form_error');
      }
      if (!!obj.message) {
        return obj.message;
      }
      return deepSearch(Object.values(obj)[0]);
    };
    toast({
      title: deepSearch(formHook.formState.errors),
      status: 'error',
      position: 'top',
      duration: 3000,
      isClosable: true
    });
  }, [formHook.formState.errors, toast, t]);

  const { isOpen, onClose, onOpen } = useDisclosure({
    defaultIsOpen: false
  });

  const planName = getUserSession()?.user?.subscription?.subscriptionPlan?.name || 'Free';

  const quotaText = useMemo(() => {
    const getQuotaLimit = (type: string) => userQuota.find((q) => q.type === type)?.limit;

    const quotaItems = [
      { value: getQuotaLimit('cpu') || 0, unit: 'vCPU' },
      { value: getQuotaLimit('memory') || 0, unit: 'GB RAM' },
      ...(getQuotaLimit('storage') !== undefined && getQuotaLimit('storage')! > 0
        ? [{ value: getQuotaLimit('storage')!, unit: 'GB storage' }]
        : []),
      ...(getQuotaLimit('nodeports') !== undefined && getQuotaLimit('nodeports')! > 0
        ? [{ value: getQuotaLimit('nodeports')!, unit: 'nodeport' }]
        : []),
      ...(getQuotaLimit('pods') !== undefined && getQuotaLimit('pods')! > 0
        ? [{ value: getQuotaLimit('pods')!, unit: 'pods' }]
        : [])
    ];

    const quotaString = quotaItems.map((item) => `${item.value} ${item.unit}`).join(', ');

    return `Your current ${planName} plan includes up to ${quotaString}. To deploy by your configuration, please upgrade your plan.`;
  }, [userQuota, planName]);

  return (
    <>
      <FormProvider {...formHook}>
        <Flex
          flexDirection={'column'}
          alignItems={'center'}
          h={'100vh'}
          minWidth={'1024px'}
          backgroundColor={'white'}
        >
          <Header
            yamlList={yamlList}
            title={title}
            applyBtnText={applyBtnText}
            applyCb={() => {
              if (isEdit) {
                formHook.handleSubmit(
                  (data) => openConfirm(() => submitSuccess(data))(),
                  submitError
                )();
              } else {
                formHook.handleSubmit(
                  (data) => openConfirm((pauseTime: number) => submitSuccess(data, pauseTime))(),
                  submitError
                )();
              }
            }}
          />
          <Box flex={'1 0 0'} h={0} w={'100%'} pb={4} pt={'32px'}>
            {tabType === 'form' ? (
              <Form pxVal={pxVal} isEdit={isEdit} countGpuInventory={countGpuInventory} />
            ) : (
              <Yaml yamlList={yamlList} pxVal={pxVal} />
            )}
          </Box>
        </Flex>
      </FormProvider>
      {ConfirmModal}
      <Loading />

      {!!errorMessage && (
        <ErrorModal title={applyError} content={errorMessage} onClose={() => setErrorMessage('')} />
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          maxW="450px"
          p="4px"
          bgColor={'rgb(241, 241, 241)'}
          borderRadius="18px"
          boxShadow="0px 4px 6px -2px #0000000D;0px 10px 15px -3px #0000001A;"
          outline={'transparent solid 2px'}
        >
          <ModalBody
            bgColor={'white'}
            borderRadius="16px"
            border="1px solid var(--base-border, #E4E4E7)"
            p="24px"
            boxShadow="0px 4px 6px -2px #0000000D;0px 10px 15px -3px #0000001A;"
          >
            <Text fontSize="24px" fontWeight="600" mb={'16px'}>
              Resource Limit Exceeded
            </Text>
            <Text py={'16px'}>{quotaText}</Text>
            <Flex gap="12px" mt={'16px'}>
              <Track.Click eventName={Track.events.devboxDeployUpgrade}>
                <Button
                  w={'120px'}
                  h="40px"
                  variant={'solid'}
                  onClick={() => {
                    sealosApp.runEvents('openDesktopApp', {
                      appKey: 'system-account-center',
                      pathname: '/',
                      query: {
                        scene: 'upgrade'
                      }
                    });
                    onClose();
                  }}
                >
                  Upgrade
                </Button>
              </Track.Click>
              <Button
                w={'120px'}
                h="40px"
                variant={'outline'}
                onClick={() => {
                  onClose();
                }}
              >
                Cancel
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DevboxCreatePage;
