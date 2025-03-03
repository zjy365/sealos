import { useRouter } from 'next/router';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { Box, Flex, Heading, Text, Button, useColorModeValue, Stack } from '@chakra-ui/react';

import { CheckMarkIcon, ClawCloudIcon } from '../icons';

export default function UnlockCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const bg = useColorModeValue('white', 'gray.700');
  return (
    <Flex minH="100vh" align="center" justify="center" bg={bg} w={'50%'} direction={'column'}>
      <ClawCloudIcon w={'134px'} h={'24px'} position={'absolute'} top={'20px'} left={'20px'} />
      <Stack spacing={8} mx="auto" maxW="lg" px={4} h={'60%'}>
        <Box rounded="lg" p={8} w={'480px'}>
          <Flex height={'100px'} width={'full'} justifyContent={'center'} alignItems={'center'}>
            <CheckMarkIcon />
          </Flex>
          <Heading mb={4}>{t('cc:unlocked_credit')}</Heading>
          <Text color={'gray.500'} fontWeight={400} mb={6}>
            {t('cc:unlocked_credit_description')}
          </Text>

          <Button
            bg={'black'}
            color="white"
            mt={4}
            rightIcon={<ArrowRight />}
            w={'full'}
            onClick={() => router.push('/workspace')}
          >
            {t('cc:get_started')}
          </Button>
        </Box>
      </Stack>
    </Flex>
  );
}
