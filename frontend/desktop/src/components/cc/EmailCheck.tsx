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
  useColorModeValue,
  Link
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { zodResolver } from '@hookform/resolvers/zod';

import { ClawCloudIcon } from '../icons';
import { useSignupStore } from '@/stores/signup';
import { IPersonalInfo, personalInfoSchema } from '@/schema/ccSvc';
import { ccEmailSignUp, initRegionToken } from '@/api/auth';
import useSessionStore from '@/stores/session';

export default function EmailCheckComponent() {
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { signupData, clearSignupData, personalData } = useSignupStore();
  const { setToken } = useSessionStore();
  useEffect(() => {
    if (!signupData) {
      router.push('/signin');
    }
  }, [signupData, router]);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);
  useEffect(() => {
    onSubmit(true);
  }, []);
  const onSubmit = useCallback(
    async (force = false) => {
      if ((!canResend || isLoading) && !force) return;
      setIsLoading(true);

      try {
        if (!signupData || !personalData) {
          throw new Error('No signup data found');
        }

        // FIXME: language and country not sure
        const result = await ccEmailSignUp({
          email: signupData.email,
          password: signupData.password,
          firstName: personalData.firstName,
          lastName: personalData.lastName,
          language: 'en',
          confirmPassword: signupData.password,
          country: 'US'
        });
        if (result.code !== 200) {
          throw Error(result.message);
        }
        // Start countdown
        setCanResend(false);
        setCountdown(60);
      } catch (error) {
        console.error('Failed to send verification email:', error);
        toast({
          title: t('cc:sign_up_failed'),
          description: (error as Error)?.message || t('cc:unknown_error'),
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top'
        });
      } finally {
        setIsLoading(false);
      }
    },
    [canResend, isLoading]
  );

  const handleBack = () => {
    router.back();
  };
  const bg = useColorModeValue('white', 'gray.700');

  if (!signupData) {
    return null;
  }
  return (
    <Flex minH="100vh" align="center" justify="center" bg={bg} w={'50%'} direction={'column'}>
      <ClawCloudIcon w={'163px'} h={'22px'} position={'absolute'} top={'20px'} left={'20px'} />
      <Stack spacing={8} mx="auto" maxW="lg" px={4} h={'60%'}>
        <Flex rounded="lg" p={8} w={'480px'} gap={'32px'} flexDirection={'column'}>
          <Box>
            <MailCheck size={'32px'} color="#2778FD"></MailCheck>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            p={0}
            gap="8px"
            flex="none"
            alignSelf="stretch"
            flexGrow={0}
          >
            {/* Check your email */}
            <Text
              fontWeight="600"
              fontSize="24px"
              lineHeight="31px"
              color="#000000"
              flex="none"
              order={0}
              alignSelf="stretch"
              flexGrow={0}
            >
              Check your email
            </Text>

            {/* Div container */}
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              p={0}
              gap="16px"
              flex="none"
              alignSelf="stretch"
              flexGrow={0}
            >
              {/* Get started (hidden) */}
              <Text
                display="none"
                fontWeight="700"
                fontSize="30px"
                lineHeight="36px"
                color="#09090B"
                flex="none"
                order={0}
                alignSelf="stretch"
                flexGrow={0}
              >
                Get started
              </Text>

              {/* Nested Frame */}
              <Box
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
                p={0}
                gap="16px"
                flex="none"
                order={1}
                alignSelf="stretch"
                flexGrow={0}
              >
                {/* Verification message */}
                <Text
                  fontWeight="400"
                  fontSize="14px"
                  lineHeight="20px"
                  color="#18181B"
                  flex="none"
                  order={0}
                  alignSelf="stretch"
                  flexGrow={0}
                >
                  We sent a verification email to {signupData.email}. Click the magic link to verify
                  your account.
                </Text>

                {/* Didn't get it section */}
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-start"
                  p={0}
                  gap="4px"
                  flex="none"
                  order={1}
                  alignSelf="stretch"
                  flexGrow={0}
                >
                  <Text
                    w="352px"
                    h="20px"
                    fontWeight="700"
                    fontSize="14px"
                    lineHeight="20px"
                    color="#18181B"
                    flex="none"
                    order={0}
                    alignSelf="stretch"
                    flexGrow={0}
                  >
                    {"Didn't get it?"}
                  </Text>

                  {canResend ? (
                    <Text
                      as="a"
                      fontWeight="400"
                      fontSize="14px"
                      lineHeight="20px"
                      color="#1C4EF5"
                      flex="none"
                      order={1}
                      alignSelf="stretch"
                      flexGrow={0}
                      cursor="pointer"
                      onClick={() => {
                        // Handle resend logic
                        onSubmit();
                      }}
                      _hover={{ textDecoration: 'underline' }}
                    >
                      Request a new link
                    </Text>
                  ) : (
                    <Text
                      fontWeight="400"
                      fontSize="14px"
                      lineHeight="20px"
                      color="#18181B"
                      flex="none"
                      order={1}
                      alignSelf="stretch"
                      flexGrow={0}
                    >
                      You can request a new link in {countdown} seconds.
                    </Text>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
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
          </Flex>
        </Flex>
      </Stack>
    </Flex>
  );
}
