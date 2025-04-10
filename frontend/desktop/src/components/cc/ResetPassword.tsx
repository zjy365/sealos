import {
  Box,
  Flex,
  Heading,
  Stack,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  useColorModeValue
} from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { ClawCloudIcon } from '../icons';

export default function ResetPassword() {
  const { t } = useTranslation();
  const bg = useColorModeValue('white', 'gray.700');

  return (
    <Flex minH="100vh" align="center" justify="center" bg={bg} w={'50%'} direction={'column'}>
      <ClawCloudIcon w={'163px'} h={'22px'} position={'absolute'} top={'20px'} left={'20px'} />
      <Stack spacing={8} mx="auto" maxW="lg" px={4} h={'60%'}>
        <Box rounded="lg" p={8} w={'480px'}>
          <Heading mb={4}>{t('cc:lost_password_reset')}</Heading>
          <Text color={'gray.500'} fontWeight={400} mb={6}>
            {t('cc:lost_password_reset_description')}
          </Text>
          <Stack spacing={4}>
            {/* Email Address */}
            <FormControl>
              <FormLabel>{t('cc:email')}</FormLabel>
              <Input type="email" height={'40px'} bg={'white'} width={'full'} placeholder="Email" />
            </FormControl>

            <Flex justifyContent={'space-between'} mt={4}>
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
              <Button bg={'black'} color="white">
                {t('cc:submit')}
              </Button>
            </Flex>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
