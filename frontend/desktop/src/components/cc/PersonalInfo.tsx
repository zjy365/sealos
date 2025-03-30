import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  useColorModeValue
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { zodResolver } from '@hookform/resolvers/zod';

import { ClawCloudIcon } from '../icons';
import { useSignupStore } from '@/stores/signup';
import { IPersonalInfo, personalInfoSchema } from '@/schema/ccSvc';
import { ccEmailSignUp, initRegionToken } from '@/api/auth';
import useSessionStore from '@/stores/session';

export default function PersonalInfoComponent() {
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { signupData, clearSignupData, setPersonalData, personalData } = useSignupStore();
  const { setToken } = useSessionStore();
  useEffect(() => {
    if (!signupData) {
      router.push('/signin');
    }
  }, [signupData, router]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<IPersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: personalData?.firstName || '',
      lastName: personalData?.lastName || ''
    }
  });

  const onSubmit = async (data: IPersonalInfo) => {
    try {
      setIsLoading(true);

      if (!signupData) {
        throw new Error('No signup data found');
      }
      setPersonalData({
        firstName: data.firstName,
        lastName: data.lastName
      });
      // FIXME: language and country not sure
      // const result = await ccEmailSignUp({
      //   email: signupData.email,
      //   password: signupData.password,
      //   firstName: data.firstName,
      //   lastName: data.lastName,
      //   language: 'en',
      //   confirmPassword: signupData.password,
      //   country: 'US'
      // });

      // if (result.code !== 200) {
      //   throw new Error('No result data');
      // }
      // const token = result.data?.token;
      // setToken(token);
      // clearSignupData();
      // toast({
      //   title: t('cc:sign_up_success'),
      //   status: 'success',
      //   duration: 3000,
      //   isClosable: true,
      //   position: 'top'
      // });

      router.push('/emailCheck');
    } catch (error) {
      console.error('Update personal info error:', error);
      toast({
        title: t('cc:sign_up_failed'),
        description: error instanceof Error ? error.message : t('cc:unknown_error'),
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };
  const bg = useColorModeValue('white', 'gray.700');

  if (!signupData) {
    return null;
  }
  return (
    <Flex minH="100vh" align="center" justify="center" bg={bg} w={'50%'} direction={'column'}>
      <ClawCloudIcon w={'160px'} h={'24px'} position={'absolute'} top={'20px'} left={'20px'} />
      <Stack spacing={8} mx="auto" maxW="lg" px={4} h={'60%'}>
        <Box rounded="lg" p={8} w={'480px'}>
          <Heading mb={4}>{t('cc:personal_information')}</Heading>
          <Text color={'gray.500'} fontWeight={400} mb={6}>
            {t('cc:personal_information_description')}
          </Text>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <FormControl isInvalid={!!errors.firstName}>
                <FormLabel>{t('cc:first_name')}</FormLabel>
                <Input
                  type="text"
                  height={'40px'}
                  bg={'white'}
                  width={'full'}
                  placeholder="First Name"
                  {...register('firstName')}
                />
                <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.lastName}>
                <FormLabel>{t('cc:last_name')}</FormLabel>
                <Input
                  type="text"
                  height={'40px'}
                  bg={'white'}
                  width={'full'}
                  placeholder="Last Name"
                  {...register('lastName')}
                />
                <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
              </FormControl>
              <Checkbox
                sx={{
                  '.chakra-checkbox__control': {
                    borderRadius: '4px',
                    borderWidth: '1px',
                    borderColor: 'gray.900',
                    _checked: {
                      bg: 'gray.900',
                      color: 'white'
                    },
                    _hover: {
                      borderColor: 'gray.900'
                    }
                  },
                  '.chakra-checkbox__label': {
                    fontSize: 'md',
                    color: 'gray.900',
                    fontWeight: 'medium'
                  }
                }}
              >
                {t('cc:join_our_mailing_list')}
              </Checkbox>
              <Flex justifyContent={'space-between'} mt={4}>
                <Button
                  bg={'white'}
                  color={'black'}
                  borderWidth={1}
                  borderColor={'grayModern.200'}
                  _hover={{ bg: 'grayModern.50' }}
                  leftIcon={<ArrowLeft />}
                  onClick={handleBack}
                  type="button"
                >
                  {t('cc:back')}
                </Button>
                <Button bg={'black'} color="white" type="submit" isLoading={isLoading}>
                  {t('cc:register')}
                </Button>
              </Flex>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}
