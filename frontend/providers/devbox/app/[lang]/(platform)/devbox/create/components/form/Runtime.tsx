import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Box, Flex, Grid, VStack } from '@chakra-ui/react';

import useDriver from '@/hooks/useDriver';
import { useDevboxStore } from '@/stores/devbox';
import { DevboxEditTypeV2 } from '@/types/devbox';
import { TemplateRepository } from '@/types/template';
import { TemplateRepositoryKind } from '@/prisma/generated/client';
import { getTemplateRepository, listOfficialTemplateRepository } from '@/api/template';

import Label from './Label';
import TemplateRepositoryListNav from './components/RuntimeNav';
import TemplateRepositoryItem from './components/RuntimeItem';

interface RuntimeProps {
  isEdit: boolean;
}

export default function Runtime({ isEdit }: RuntimeProps) {
  const { startedTemplate, setStartedTemplate } = useDevboxStore();
  const { setValue, getValues, watch } = useFormContext<DevboxEditTypeV2>();
  const t = useTranslations();
  const [currentCategory, setCurrentCategory] = useState<TemplateRepositoryKind>('LANGUAGE');
  const { handleUserGuide } = useDriver();
  const searchParams = useSearchParams();
  const templateRepositoryQuery = useQuery(
    ['list-official-template-repository'],
    listOfficialTemplateRepository,
    {
      onSuccess(res) {
        console.log('res', res);
        handleUserGuide();
      },
      staleTime: Infinity,
      cacheTime: 1000 * 60 * 30
    }
  );
  const curTemplateRepositoryUid = watch('templateRepositoryUid');
  const curTemplateRepositoryDetail = useQuery(
    ['get-template-repository', curTemplateRepositoryUid],
    () => {
      return getTemplateRepository(curTemplateRepositoryUid);
    },
    {
      enabled: !!isEdit && !!curTemplateRepositoryUid
    }
  );

  const templateData = useMemo(
    () => templateRepositoryQuery.data?.templateRepositoryList || [],
    [templateRepositoryQuery.data]
  );

  const categorizedData = useMemo(() => {
    return templateData.reduce(
      (acc, item) => {
        acc[item.kind] = [...(acc[item.kind] || []), item];
        return acc;
      },
      {
        LANGUAGE: [],
        FRAMEWORK: [],
        OS: [],
        CUSTOM: []
      } as Record<TemplateRepositoryKind, TemplateRepository[]>
    );
  }, [templateData]);

  useEffect(() => {
    if (!startedTemplate || isEdit) {
      return;
    }
    const templateUid = startedTemplate.uid;
    if (
      templateData.findIndex((item) => {
        return item.uid === templateUid;
      }) > -1
    ) {
      setStartedTemplate(undefined);
    }
    setValue('templateRepositoryUid', templateUid);
  }, [startedTemplate, isEdit]);

  useEffect(() => {
    if (startedTemplate || isEdit) {
      return;
    }
    if (
      !(
        templateRepositoryQuery.isSuccess &&
        templateData.length > 0 &&
        templateRepositoryQuery.isFetched
      )
    )
      return;
    const curTemplateRepositoryUid = getValues('templateRepositoryUid');
    const curTemplateRepository = templateData.find((item) => {
      return item.uid === curTemplateRepositoryUid;
    });
    if (!curTemplateRepository) {
      const runtime = searchParams.get('runtime');
      if (!runtime) {
        setValue('templateRepositoryUid', templateData[0].uid);
        return;
      } else {
        const runtimeTemplate = templateData.find((item) => item.iconId === runtime);
        if (runtimeTemplate) {
          setValue('templateRepositoryUid', runtimeTemplate.uid);
        } else {
          setValue('templateRepositoryUid', templateData[0].uid);
        }
      }
    }
  }, [
    templateRepositoryQuery.isSuccess,
    startedTemplate,
    templateData,
    templateRepositoryQuery.isFetched,
    isEdit
  ]);

  useEffect(() => {
    if (
      !isEdit ||
      !templateRepositoryQuery.isSuccess ||
      !templateData ||
      !curTemplateRepositoryDetail.isSuccess ||
      !curTemplateRepositoryDetail.data
    ) {
      return;
    }
    const templateRepository = curTemplateRepositoryDetail.data.templateRepository;
    // setStartedTemplate(templateRepository)
    setValue('templateRepositoryUid', templateRepository.uid);
    if (
      templateData.findIndex((item) => {
        return item.uid === templateRepository.uid;
      }) === -1
    ) {
      setStartedTemplate(templateRepository);
    }
  }, [
    curTemplateRepositoryDetail.isSuccess,
    curTemplateRepositoryDetail.data,
    curTemplateRepositoryDetail.isFetched,
    isEdit,
    templateData,
    templateRepositoryQuery.isSuccess
  ]);

  const categoryMap = {
    LANGUAGE: {
      label: t('language'),
      key: 'LANGUAGE',
      isVisible: categorizedData['LANGUAGE'].length !== 0
    },
    FRAMEWORK: {
      label: t('framework'),
      key: 'FRAMEWORK',
      isVisible: categorizedData['FRAMEWORK'].length !== 0
    },
    OS: {
      label: t('os'),
      key: 'OS',
      isVisible: categorizedData['OS'].length !== 0
    }
  } as Record<
    TemplateRepositoryKind,
    {
      label: string;
      key: TemplateRepositoryKind;
      isVisible: boolean;
    }
  >;

  return (
    <VStack alignItems={'center'} mb={7} gap={'24px'}>
      <Flex className="guide-runtimes" gap={'24px'} flexDir={'column'} w={'full'}>
        <Flex w="full" justify={'space-between'}>
          <Label w={100} alignSelf={'flex-start'}>
            {t('runtime_environment')}
          </Label>
          <TemplateRepositoryListNav />
        </Flex>

        {!!startedTemplate && (
          <Flex gap={'10px'} px={'14px'} width={'full'}>
            <Box width={'85px'}>{t('current')}</Box>
            <Flex flexWrap={'wrap'} gap={'12px'} flex={1}>
              <TemplateRepositoryItem
                item={{
                  uid: startedTemplate.uid,
                  iconId: startedTemplate.iconId || '',
                  name: startedTemplate.name
                }}
                isEdit={isEdit}
              />
            </Flex>
          </Flex>
        )}

        <Flex gap={'3'} justifyContent={'space-between'}>
          {Object.values(categoryMap)
            .filter((item) => item.isVisible)
            .map((item) => (
              <Box
                key={item.key}
                w={'full'}
                borderWidth={'1px'}
                borderColor={currentCategory === item.key ? '#1C4EF5' : 'gray.200'}
                borderRadius={'lg'}
                p={'12px 16px'}
                fontSize={'12px'}
                fontWeight={currentCategory === item.key ? '500' : '400'}
                cursor={'pointer'}
                bg={currentCategory === item.key ? '#F5F7FF' : 'white'}
                onClick={() => {
                  setCurrentCategory(item.key);
                  if (categorizedData[item.key]?.length > 0) {
                    const firstTemplate = categorizedData[item.key][0];
                    setValue('templateRepositoryUid', firstTemplate.uid);
                  }
                }}
              >
                {item.label}
              </Box>
            ))}
        </Flex>
      </Flex>
      {categoryMap[currentCategory].isVisible && (
        <Grid gridTemplateColumns={'repeat(4, minmax(168px, 1fr))'} gap={'12px'}>
          {categorizedData[currentCategory]?.map((item) => (
            <TemplateRepositoryItem key={item.uid} item={item} isEdit={isEdit} />
          ))}
        </Grid>
      )}
    </VStack>
  );
}
