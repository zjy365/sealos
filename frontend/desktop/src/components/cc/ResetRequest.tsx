import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { Box, Flex, Heading, Text, Button, Stack, useColorModeValue } from '@chakra-ui/react';

import { CheckMarkIcon, ClawCloudIcon } from '../icons';

export default function ResetRequest() {
  const { t } = useTranslation();
  const bg = useColorModeValue('white', 'gray.700');

  return (
    <Flex minH="100vh" align="center" justify="center" bg={bg} w={'50%'} direction={'column'}>
      <ClawCloudIcon w={'160px'} h={'24px'} position={'absolute'} top={'20px'} left={'20px'} />
      <Stack spacing={8} mx="auto" maxW="lg" px={4} h={'60%'}>
        <Box rounded="lg" p={8} w={'480px'}>
          <Flex height={'100px'} width={'full'} justifyContent={'center'} alignItems={'center'}>
            <CheckMarkIcon />
          </Flex>
          <Heading mb={4}>{t('cc:password_reset_requested')}</Heading>
          <Text color={'gray.500'} fontWeight={400} mb={6}>
            {t('cc:password_reset_requested_description')}
          </Text>
          <Button
            bg={'white'}
            color={'black'}
            borderWidth={1}
            borderColor={'grayModern.200'}
            _hover={{ bg: 'grayModern.50' }}
            leftIcon={<ArrowLeft />}
          >
            {t('cc:back')}
          </Button>
        </Box>
      </Stack>
    </Flex>
  );
}
