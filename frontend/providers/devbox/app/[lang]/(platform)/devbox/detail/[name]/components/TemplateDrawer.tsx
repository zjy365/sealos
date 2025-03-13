import { z } from 'zod';
import {
  Button,
  ButtonGroup,
  Flex,
  Input,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  VStack,
  Box,
  Divider,
  Img
} from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import { useMessage } from '@sealos/ui';
import { useTranslations } from 'next-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { Tag } from '@/prisma/generated/client';

import { usePathname } from '@/i18n';
import { TemplateState } from '@/constants/template';
import { useTemplateStore } from '@/stores/template';
import MyFormLabel from '@/components/MyFormControl';
import { createTemplateRepository, updateTemplate } from '@/api/template';
import { templateNameSchema, versionSchema } from '@/utils/vaildate';

import TemplateRepositoryDescriptionField from '@/app/[lang]/(platform)/template/updateTemplate/components/TemplateRepositoryDescriptionField';
import TemplateRepositoryIsPublicField from '@/app/[lang]/(platform)/template/updateTemplate/components/TemplateRepositoryIsPublicField';
import TemplateRepositoryNameField from '@/app/[lang]/(platform)/template/updateTemplate/components/TemplateRepositoryNameField';
import TemplateRepositoryTagField from '@/app/[lang]/(platform)/template/updateTemplate/components/TemplateRepositoryTagField';
import MySelect from '@/components/MySelect';

const tagSchema = z.object({
  value: z.string()
});

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  devboxReleaseName: string;
  templateRepositoryList: {
    uid: string;
    name: string;
    description: string | null;
    iconId: string | null;
    templates: {
      uid: string;
      name: string;
    }[];
    isPublic: boolean;
    templateRepositoryTags: {
      tag: Tag;
    }[];
  }[];
}
const TemplateModal: FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  devboxReleaseName,
  templateRepositoryList
}) => {
  const [activeTab, setActiveTab] = useState<'update' | 'create'>('update');
  const [updateTemplateRepoUid, setUpdateTemplateRepoUid] = useState<string>(
    templateRepositoryList && templateRepositoryList.length > 0
      ? templateRepositoryList[0].uid || ''
      : ''
  );

  const t = useTranslations();
  const formSchema = z.object({
    name: z.string().min(1, t('input_template_name_placeholder')).pipe(templateNameSchema),
    version: z.string().min(1, t('input_template_version_placeholder')).pipe(versionSchema),
    isPublic: z.boolean().default(false),
    agreeTerms: z.boolean().refine((val) => val === true, t('privacy_and_security_agreement_tips')),
    tags: z
      .array(tagSchema)
      .min(1, t('select_at_least_1_tag'))
      .max(3, t('select_lest_than_3_tags')),
    description: z.string()
  });
  const updateFormSchema = z.object({
    name: z.string().min(1, t('input_template_name_placeholder')),
    version: z.string().min(1, t('input_template_version_placeholder')).pipe(versionSchema),
    tags: z
      .array(tagSchema)
      .min(1, t('select_at_least_1_tag'))
      .max(3, t('select_lest_than_3_tags')),
    description: z.string()
  });

  type FormData = z.infer<typeof formSchema>;
  type UpdateFormData = z.infer<typeof updateFormSchema>;
  type Tag = z.infer<typeof tagSchema>;
  const methods = useForm<FormData>({
    defaultValues: {
      name: '',
      version: '',
      isPublic: false,
      agreeTerms: false,
      tags: [],
      description: ''
    },
    mode: 'onSubmit'
  });

  const updateMethods = useForm<UpdateFormData>({
    defaultValues: {
      name: '',
      version: '',
      // agreeTerms: false,
      tags: [],
      description: ''
    }
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = methods;
  const {
    control: updateControl,
    handleSubmit: updateHandleSubmit,
    formState: { isSubmitting: updateIsSubmitting },
    reset: updateReset
  } = updateMethods;

  const { openTemplateModal, config } = useTemplateStore();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createTemplateRepository
  });
  const updateMutation = useMutation(updateTemplate, {
    onSuccess() {
      queryClient.invalidateQueries(['template-repository-list']);
      queryClient.invalidateQueries(['template-repository-detail']);
    }
  });

  useEffect(() => {
    if (updateTemplateRepoUid && isOpen) {
      const updateTemplateRepo = templateRepositoryList.find(
        (item) => item.uid === updateTemplateRepoUid
      );
      if (!updateTemplateRepo) return;
      updateMethods.setValue(
        'tags',
        updateTemplateRepo?.templateRepositoryTags.map(({ tag }) => ({
          value: tag.uid
        }))
      );
      updateMethods.setValue('version', updateTemplateRepo?.templates[0]?.name || '');
      updateMethods.setValue('name', updateTemplateRepo?.name || '');
      updateMethods.setValue('description', updateTemplateRepo?.description || '');
    }
  }, [updateTemplateRepoUid, isOpen, templateRepositoryList]);

  const { message: toast } = useMessage();
  const lastRoute = usePathname();
  const onSubmitHandler: SubmitHandler<FormData> = async (_data) => {
    try {
      const result = formSchema.safeParse(_data);
      if (!result.success) {
        // const title = result.error.errors[0]
        const error = result.error.errors[0];
        if (error.path[0] === 'name' && error.code === 'invalid_string') {
          toast({
            title: t('invalide_template_name'),
            status: 'error'
          });
          return;
        }
        if (error.path[0] === 'version' && error.code === 'invalid_string') {
          toast({
            title: t('invalide_template_version'),
            status: 'error'
          });
          return;
        }
        const title = error.message;
        toast({
          title,
          status: 'error'
        });
        return;
      }
      const data = result.data;
      await mutation.mutateAsync({
        templateRepositoryName: data.name,
        version: data.version,
        isPublic: data.isPublic,
        description: data.description,
        tagUidList: data.tags.map((tag) => tag.value),
        devboxReleaseName
      });
      queryClient.invalidateQueries(['template-repository-list']);
      queryClient.invalidateQueries(['template-repository-detail']);
      reset();
      onClose();
      openTemplateModal({
        templateState: TemplateState.privateTemplate,
        lastRoute
      });
      toast({
        title: t('create_template_success'),
        status: 'success'
      });
    } catch (error) {
      if (error == '409:templateRepository name already exists') {
        return toast({
          title: t('template_repository_name_already_exists'),
          status: 'error'
        });
      }
      toast({
        title: error as string,
        status: 'error'
      });
    }
  };
  const onUpdateSubmitHandler: SubmitHandler<UpdateFormData> = async (_data) => {
    try {
      const result = updateFormSchema.safeParse(_data);
      if (!result.success) {
        const error = result.error.errors[0];
        if (error.path[0] === 'version' && error.code === 'invalid_string') {
          toast({
            title: t('invalide_template_version'),
            status: 'error'
          });
          return;
        }
        toast({
          title: error.message,
          status: 'error'
        });
        return;
      }
      const data = result.data;
      await updateMutation.mutateAsync({
        templateRepositoryUid: updateTemplateRepoUid || '',
        version: data.version,
        devboxReleaseName,
        description: data.description,
        tagUidList: data.tags.map(({ value }) => value)
      });

      queryClient.invalidateQueries(['template-repository-list']);
      updateReset();
      onClose();
      toast({
        title: t('update_template_success'),
        status: 'success'
      });
    } catch (error) {
      toast({
        title: error as string,
        status: 'error'
      });
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent
        maxWidth={'500px'}
        overflowY={'auto'}
        my={'16px'}
        mr={'16px'}
        borderRadius={'16px'}
        position={'relative'}
        maxH={'calc(100vh - 32px)'}
        display={'flex'}
        flexDirection={'column'}
      >
        <DrawerHeader>{t('convert_to_template')}</DrawerHeader>
        <DrawerBody borderTopWidth={1} bg={'#F8F8F9'} pb={'12'} flex={1} overflowY={'auto'}>
          <Box display={'flex'} py={'16px'}>
            <Button
              h={'44px'}
              w={'50%'}
              color={'grayModern.900'}
              fontWeight={'500'}
              borderColor={'grayModern.200'}
              borderLeftRadius={'8px'}
              borderRightRadius={'0px'}
              borderWidth={'1px'}
              bg={'white'}
              boxShadow={'none'}
              _hover={{
                bg: 'grayModern.50'
              }}
              disabled={!templateRepositoryList || templateRepositoryList.length === 0}
              onClick={() => setActiveTab('update')}
              {...(activeTab === 'update' && {
                bg: '#1C4EF50D',
                borderColor: '#1C4EF5',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)'
              })}
            >
              {t('update_current')}
            </Button>
            <Button
              h={'44px'}
              w={'50%'}
              color={'grayModern.900'}
              fontWeight={'500'}
              borderLeftRadius={'0px'}
              borderRightRadius={'8px'}
              borderWidth={'1px'}
              boxShadow={'none'}
              bg={'white'}
              _hover={{
                bg: 'grayModern.50'
              }}
              onClick={() => setActiveTab('create')}
              {...(activeTab === 'create' && {
                bg: '#1C4EF50D',
                borderColor: '#1C4EF5',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)'
              })}
            >
              {t('create_new')}
            </Button>
          </Box>
          <Divider mb={'16px'} />
          {activeTab === 'update' && (
            <FormProvider {...updateMethods}>
              <form
                onSubmit={updateHandleSubmit(onUpdateSubmitHandler)}
                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                <VStack spacing={6} align="stretch" flex={1}>
                  {activeTab === 'update' && (
                    <Flex align={'start'} direction={'column'} gap={4}>
                      <MyFormLabel m="0" fontSize="14px">
                        {t('choose_the_image_to_update')}
                      </MyFormLabel>
                      <MySelect
                        placeholder={t('choose_a_image_to_update')}
                        bg="white"
                        borderColor="grayModern.200"
                        h={'40px'}
                        list={
                          templateRepositoryList?.map((item) => ({
                            label: item.name,
                            value: item.uid,
                            icon: (
                              <Img
                                src={`/images/${item.iconId}.svg`}
                                width={'20px'}
                                height={'20px'}
                              />
                            )
                          })) || []
                        }
                        w={'full'}
                        boxShadow={'none'}
                        boxStyle={{ width: '100%' }}
                        value={updateTemplateRepoUid}
                        onchange={(value) => setUpdateTemplateRepoUid(value)}
                      />
                    </Flex>
                  )}

                  {/* name */}
                  {/* <TemplateRepositoryNameField /> */}

                  {/* version */}
                  <Flex align={'start'} direction={'column'} gap={4}>
                    <MyFormLabel width="108px" m="0" fontSize="14px">
                      {t('version')}
                    </MyFormLabel>
                    <Controller
                      name="version"
                      control={updateControl}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t('input_template_version_placeholder')}
                          bg="white"
                          borderColor="grayModern.200"
                          width={'full'}
                          h={'40px'}
                        />
                      )}
                    />
                  </Flex>

                  {/* Tags */}
                  <TemplateRepositoryTagField />

                  {/* Description */}
                  <TemplateRepositoryDescriptionField />
                </VStack>
                <DrawerFooter borderTopWidth={1} bg={'#F8F8F9'} my={'12'} p={0} py={'24px'}>
                  <ButtonGroup spacing="12px" justifyContent="flex-start" w={'100%'}>
                    <Button
                      type="submit"
                      variant={'solid'}
                      px={'29.5px'}
                      py={'8px'}
                      isLoading={updateIsSubmitting}
                    >
                      {t('template_update')}
                    </Button>
                    <Button
                      variant={'outline'}
                      px={'29.5px'}
                      py={'8px'}
                      onClick={onClose}
                      _hover={{
                        bg: 'grayModern.50'
                      }}
                    >
                      {t('cancel')}
                    </Button>
                  </ButtonGroup>
                </DrawerFooter>
              </form>
            </FormProvider>
          )}
          {activeTab === 'create' && (
            <FormProvider {...methods}>
              <form
                onSubmit={handleSubmit(onSubmitHandler)}
                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                <VStack spacing={6} align="stretch" flex={1}>
                  {/* name */}
                  <TemplateRepositoryNameField />

                  {/* version */}
                  <Flex align={'start'} direction={'column'} gap={4}>
                    <MyFormLabel width="108px" m="0" fontSize="14px">
                      {t('version')}
                    </MyFormLabel>
                    <Controller
                      name="version"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t('input_template_version_placeholder')}
                          bg="white"
                          borderColor="grayModern.200"
                          width={'full'}
                          h={'40px'}
                        />
                      )}
                    />
                  </Flex>

                  {/* Tags */}
                  <TemplateRepositoryTagField />

                  {/* Description */}
                  <TemplateRepositoryDescriptionField />

                  {/* Public */}
                  <TemplateRepositoryIsPublicField />
                </VStack>
                <DrawerFooter borderTopWidth={1} bg={'#F8F8F9'} my={'12'} p={0} py={'24px'}>
                  <ButtonGroup spacing="12px" justifyContent="flex-start" w={'100%'}>
                    <Button
                      type="submit"
                      variant={'solid'}
                      px={'29.5px'}
                      py={'8px'}
                      isLoading={isSubmitting}
                    >
                      {t('create')}
                    </Button>
                    <Button
                      variant={'outline'}
                      px={'29.5px'}
                      py={'8px'}
                      onClick={onClose}
                      _hover={{
                        bg: 'grayModern.50'
                      }}
                    >
                      {t('cancel')}
                    </Button>
                  </ButtonGroup>
                </DrawerFooter>
              </form>
            </FormProvider>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default TemplateModal;
