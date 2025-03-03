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
  Divider
} from '@chakra-ui/react';
import { FC } from 'react';
import { useMessage } from '@sealos/ui';
import { useTranslations } from 'next-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import { usePathname } from '@/i18n';
import { TemplateState } from '@/constants/template';
import { useTemplateStore } from '@/stores/template';
import MyFormLabel from '@/components/MyFormControl';
import { createTemplateRepository } from '@/api/template';
import { templateNameSchema, versionSchema } from '@/utils/vaildate';

import TemplateRepositoryDescriptionField from '@/app/[lang]/(platform)/template/updateTemplate/components/TemplateRepositoryDescriptionField';
import TemplateRepositoryIsPublicField from '@/app/[lang]/(platform)/template/updateTemplate/components/TemplateRepositoryIsPublicField';
import TemplateRepositoryNameField from '@/app/[lang]/(platform)/template/updateTemplate/components/TemplateRepositoryNameField';
import TemplateRepositoryTagField from '@/app/[lang]/(platform)/template/updateTemplate/components/TemplateRepositoryTagField';
const tagSchema = z.object({
  value: z.string()
});

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  devboxReleaseName: string;
}
const CreateTemplateModal: FC<CreateTemplateModalProps> = ({
  isOpen,
  onClose,
  // onSubmit
  devboxReleaseName
}) => {
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

  type FormData = z.infer<typeof formSchema>;
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
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = methods;
  const { openTemplateModal, config } = useTemplateStore();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createTemplateRepository
    // return await createTemplate(data)
  });
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

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent
        maxWidth={'500px'}
        overflow={'hidden'}
        minH={'785px'}
        my={'32px'}
        mr={'32px'}
        borderRadius={'16px'}
        position={'relative'}
      >
        <DrawerHeader>{t('create_template')}</DrawerHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmitHandler)}>
            <DrawerBody
              h={'full'}
              borderTopWidth={1}
              bg={'#F8F8F9'}
              py={'6'}
              sx={{
                '&::-webkit-scrollbar': {
                  display: 'none'
                }
              }}
            >
              <VStack spacing={6} align="stretch">
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
                        size="sm"
                        width={'full'}
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
            </DrawerBody>
            <DrawerFooter borderTopWidth={1} bg={'#F8F8F9'} py={'12'}>
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
      </DrawerContent>
    </Drawer>
  );
};

export default CreateTemplateModal;
