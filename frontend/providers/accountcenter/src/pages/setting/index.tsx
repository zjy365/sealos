import { useState } from 'react';
import { serviceSideProps } from '@/utils/i18n';
import Layout from '@/components/Layout';
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Text,
  Flex,
  Box,
  Divider,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Grid,
  GridItem,
  Image
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { sealosApp } from 'sealos-desktop-sdk/app';
import upperFirst from '@/utils/upperFirst';
import DeleteAccount from './components/deleteAccount';
import { getUserInfo, updateUserInfo } from '@/api/user';
import { TUserInfoReponse } from '@/schema/user';
import useToastAPIResult, { useAPIErrorMessage } from '@/hooks/useToastAPIResult';
import Alert from '@/components/Alert';

function AccountSettings() {
  const [initialized, setInitialized] = useState(false);
  const { toastAPIError, toastSuccess, getAPIErrorMessage } = useToastAPIResult();
  const { data, error } = useQuery(['userInfo'], getUserInfo, {
    onSettled() {
      setInitialized(true);
    }
  });
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty }
  } = useForm<TUserInfoReponse['user']>({
    mode: 'onChange',
    values: data?.user
  });
  const labels = {
    firstName: t('AccountFirstName'),
    lastName: t('AccountLastName'),
    email: t('Email')
  };
  const onSubmit = handleSubmit(async (formData) => {
    const requestData = {
      ...formData,
      email: undefined
    };
    return updateUserInfo(requestData).then(
      () => {
        toastSuccess(t('UpdateSuccess'));
      },
      (e) => {
        toastAPIError(e);
      }
    );
  });
  const renderThirdPartyAccount = (
    nameKey: string,
    { email, bound }: { email?: string; bound: boolean }
  ) => {
    const platform = t(nameKey as any);
    const handleClick = () => {
      return sealosApp.runEvents(`bind${upperFirst(nameKey)}`);
    };
    return (
      <Flex bg="#F9F9F9" borderRadius="12px" p="12px 16px 12px 12px" alignItems="center">
        <Image flexGrow={0} src={`/images/${nameKey}.svg`} w="36px" h="36px" alt={nameKey} />
        <Box flexGrow={1} px="10px">
          <Text fontWeight={500} fontSize="14px" lineHeight="20px" color="#18181B">
            {platform}
          </Text>
          <Text mt="4px" fontSize="12px" color="##71717A" lineHeight={1}>
            {bound ? email : ''}
          </Text>
        </Box>
        <Button
          borderRadius="8px"
          colorScheme="blackAlpha"
          variant="outline"
          onClick={handleClick}
          isDisabled={bound}
          w="130px"
        >
          {t(bound ? 'Connected' : 'ConnectAccount', { platform })}
        </Button>
      </Flex>
    );
  };
  const renderMain = () => {
    if (error) {
      return <Alert type="error" text={getAPIErrorMessage(error)} />;
    }
    return (
      <>
        <Card variant="outline">
          <CardHeader>{t('AccountInfomation')}</CardHeader>
          <CardBody>
            <Flex align="center" justifyContent="space-between">
              <Box>
                <Text fontSize="16px" lineHeight="24px" mb="1px" color="#18181B">
                  {t('AccountAvatar')}
                </Text>
                {/* no upload api */}
                {/* <Text fontSize="14px" lineHeight="20px" color="#71717A">
                  {t('AccountAvatarHint')}
                </Text> */}
              </Box>
              <Box w="64px" h="64px">
                <Avatar size="full" src={data?.user?.avatarUri || '/images/default-avatar.svg'} />
              </Box>
            </Flex>
            <Divider orientation="horizontal" my="20px" />
            <form onSubmit={onSubmit}>
              <Grid templateColumns="1fr 1fr" rowGap="16px" columnGap="12px">
                <GridItem>
                  <FormControl isInvalid={Boolean(errors.firstname)}>
                    <FormLabel>{labels.firstName}</FormLabel>
                    <Input
                      {...register('firstname', {
                        required: t('FormRequiredMessage', {
                          label: labels.firstName
                        })
                      })}
                      w="100%"
                    />
                    <FormErrorMessage>{errors?.firstname?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isInvalid={Boolean(errors.lastname)}>
                    <FormLabel>{labels.lastName}</FormLabel>
                    <Input
                      {...register('lastname', {
                        required: t('FormRequiredMessage', {
                          label: labels.lastName
                        })
                      })}
                      w="100%"
                    />
                    <FormErrorMessage>{errors.lastname?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isInvalid={Boolean(errors.email)}>
                    <FormLabel>{labels.email}</FormLabel>
                    <Input {...register('email')} disabled type="email" w="100%" />
                    <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>
              <Box mt="16px">
                <Button type="submit" isLoading={isSubmitting} isDisabled={!isValid || !isDirty}>
                  {t('UpdateInfo')}
                </Button>
              </Box>
            </form>
          </CardBody>
        </Card>
        <Card variant="outline">
          <CardHeader>{t('ConnectedAccounts')}</CardHeader>
          <CardBody>
            <Flex direction="column" rowGap="8px">
              {renderThirdPartyAccount('github', {
                email: '',
                bound: Boolean(data?.bindings.github)
              })}
              {renderThirdPartyAccount('google', {
                email: '',
                bound: Boolean(data?.bindings.google)
              })}
            </Flex>
          </CardBody>
        </Card>
        <DeleteAccount userName={`${data?.user.firstname || ''} ${data?.user.lastname || ''}`} />
      </>
    );
  };
  return (
    <Layout>
      <Flex
        filter={initialized ? undefined : 'blur(3px)'}
        transition="filter .3s"
        direction="column"
        rowGap="16px"
        pointerEvents={initialized ? undefined : 'none'}
      >
        {renderMain()}
      </Flex>
    </Layout>
  );
}

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content))
    }
  };
}

export default AccountSettings;
