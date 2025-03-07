import Image from 'next/image';
import { Box, Flex, Text } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';

const Empty = () => {
  const t = useTranslations();
  return (
    <Flex w={'full'} flex={1} flexDirection="column" alignItems="center" justifyContent="center">
      <Image src={'/images/empty/devbox-list-empty.png'} alt="empty" width={500} height={200} />
      <Text fontSize={'18px'} fontWeight={'600'} color={'grayModern.900'}>
        {t('create_devbox_first')}
      </Text>
      <Box py={8} w={300} textAlign={'center'}>
        {t('devbox_empty')}
      </Box>
    </Flex>
  );
};

export default Empty;
