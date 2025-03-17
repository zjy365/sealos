import { useEffect, useMemo, useState } from 'react';
import { useMessage } from '@sealos/ui';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { useController, useFormContext } from 'react-hook-form';
import { Input, Flex, Img, Text, Box, FlexProps } from '@chakra-ui/react';

import { nanoid } from '@/utils/tools';
import { useEnvStore } from '@/stores/env';
import { listTemplate } from '@/api/template';
import { useDevboxStore } from '@/stores/devbox';
import { DevboxEditTypeV2 } from '@/types/devbox';

import MySelect from '@/components/MySelect';

export default function TemplateRepositoryItem({
  item,
  isEdit,
  ...props
}: {
  item: { uid: string; iconId: string; name: string };
  isEdit: boolean;
} & FlexProps) {
  const t = useTranslations();
  const { message: toast } = useMessage();
  const { getValues, setValue, watch, control } = useFormContext<DevboxEditTypeV2>();

  const { env } = useEnvStore();
  const { startedTemplate, setStartedTemplate } = useDevboxStore();
  const [currentVersion, setcurrentVersion] = useState('');
  const templateListQuery = useQuery(['templateList', item.uid], () => listTemplate(item.uid), {
    enabled: !!item.uid,
    staleTime: 60000,
    cacheTime: 60000
  });

  const templateList = templateListQuery.data?.templateList || [];

  const menuList = templateList.map((v) => ({ label: v.name, value: v.uid }));

  const { field } = useController({
    control,
    name: 'templateUid',
    rules: {
      required: t('This runtime field is required')
    }
  });

  const isThisTemplateRepository = watch('templateRepositoryUid') === item.uid;

  const afterUpdateTemplate = (uid: string) => {
    const template = templateList.find((v) => v.uid === uid)!;
    setValue('templateConfig', template.config as string);
    setValue('image', template.image);
  };

  const resetNetwork = () => {
    const devboxName = getValues('name');
    const config = getValues('templateConfig');
    const parsedConfig = JSON.parse(config as string) as {
      appPorts?: { port: number; name: string; protocol: string }[];
    };

    setValue(
      'networks',
      (parsedConfig.appPorts || []).map(
        ({ port }) =>
          ({
            networkName: `${devboxName}-${nanoid()}`,
            portName: nanoid(),
            port: port,
            protocol: 'HTTP',
            openPublicDomain: true,
            publicDomain: `${nanoid()}.${env.ingressDomain}`,
            customDomain: ''
          } as const)
      )
    );
  };

  const curTemplateRepository = watch('templateRepositoryUid');

  useEffect(() => {
    if (
      !templateListQuery.isSuccess ||
      !templateList.length ||
      !templateListQuery.isFetched ||
      !isThisTemplateRepository
    )
      // 只有当被选中的模板库的表单项目才应用逻辑
      return;

    const curTemplate = templateList.find((t) => t.uid === watch('templateUid'));
    const isExist = !!curTemplate;

    if (!isExist) {
      const defaultTemplate = templateList[0]; // 如果当前选中的模板库不存在，就用默认模板更新
      setValue('templateUid', defaultTemplate.uid);
      afterUpdateTemplate(defaultTemplate.uid);
      resetNetwork();
    }
  }, [
    templateListQuery.isSuccess,
    templateList,
    templateListQuery.isFetched,
    isThisTemplateRepository // 只有当前模板库被选中时，才执行更新逻辑
  ]);

  const actualValue = useMemo(() => {
    // need to keep value when switch other template
    // if (isThisTemplateRepository) {
    const valueExists = menuList.some((item) => item.value === currentVersion);
    return valueExists ? currentVersion : menuList[0]?.value || '';
    // } else {
    //   return menuList[0]?.value || '';
    // }
    // return menuList[0]?.value || '';
  }, [isThisTemplateRepository, field.value, menuList, currentVersion]);
  return (
    <Flex
      direction={'column'}
      key={item.uid}
      height={'90px'}
      borderRadius={'6px'}
      cursor={'pointer'}
      color={'grayModern.900'}
      opacity={isEdit ? 0.5 : 1}
      {...(watch('templateRepositoryUid') === item.uid
        ? {
            bg: '#F5F7FF',
            borderColor: '#1C4EF5',
            borderWidth: '1px'
          }
        : {
            bg: '#FAFAFA',
            borderColor: 'grayModern.200',
            _hover: {
              borderColor: '#85ccff'
            }
          })}
      {...props}
    >
      <Flex
        alignItems={'center'}
        borderBottomWidth={'1px'}
        borderColor={'grayModern.200'}
        justifyContent={'space-between'}
        px={'12px'}
        py={'8px'}
        onClick={() => {
          if (isEdit) return;
          const devboxName = getValues('name');
          if (!devboxName) {
            toast({
              title: t('Please enter the devbox name first'),
              status: 'warning'
            });
            return;
          }
          setValue('gpu.type', '');
          if (startedTemplate && startedTemplate.uid !== item.uid) {
            setStartedTemplate(undefined);
          }
          setValue('templateRepositoryUid', item.uid);
        }}
      >
        <Text textAlign={'center'} noOfLines={1} fontSize={'16px'}>
          {item.name}
        </Text>
        <Img
          width={'40px'}
          height={'40px'}
          alt={item.uid}
          src={`/images/${item.iconId || 'custom'}.svg`}
        />
      </Flex>
      <Box>
        {isEdit ? (
          <Input
            opacity={0.5}
            width={'full'}
            defaultValue={templateList.find((t) => t.uid === field.value)?.name}
            disabled
          />
        ) : (
          <MySelect
            width={'full'}
            height={'30px'}
            borderRadius={'0px 0px 6px 6px'}
            borderWidth={'0px'}
            boxShadow={'none'}
            {...(watch('templateRepositoryUid') === item.uid && {
              bg: '#F5F7FF'
            })}
            _hover={{
              bg: '#F5F7FF'
            }}
            _active={{
              bg: '#F5F7FF'
            }}
            placeholder={`${t('runtime')} ${t('version')}`}
            isDisabled={!templateListQuery.isSuccess || !isThisTemplateRepository}
            value={actualValue}
            list={menuList}
            name={field.name}
            onchange={(val) => {
              // if (isEdit) return
              const devboxName = getValues('name');
              if (!devboxName) {
                toast({
                  title: t('Please enter the devbox name first'),
                  status: 'warning'
                });
                return;
              }

              if (!isThisTemplateRepository) return;

              const oldTemplateUid = getValues('templateUid');
              // keep the data
              setcurrentVersion(val);
              field.onChange(val);
              afterUpdateTemplate(val);
              if (oldTemplateUid !== val) resetNetwork();
            }}
          />
        )}
      </Box>
    </Flex>
  );
}
