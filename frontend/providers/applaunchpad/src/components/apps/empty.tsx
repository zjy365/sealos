import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button, Box, Center, Flex, Text, Image } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { startDriver, applistDriverObj } from '@/hooks/driver';
import { useGuideStore } from '@/store/guide';

const Empty = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const { listCompleted } = useGuideStore();
  useEffect(() => {
    if (!listCompleted) {
      startDriver(applistDriverObj());
    }
  }, [listCompleted]);

  return (
    <Box>
      <Flex h={'96px'} alignItems={'center'} px={'44px'}>
        <Box fontSize={'xl'} color={'grayModern.900'} fontWeight={'bold'}>
          {t('Applications')}
        </Box>
        <Box flex={1}></Box>
        <Button
          className="create-app-btn"
          position={'relative'}
          h={'40px'}
          minW={'106px'}
          flex={'0 0 auto'}
          onClick={() => router.push('/app/edit')}
        >
          {t('Create Application')}
        </Button>
      </Flex>
      <Center
        border={'1px dashed #5688FF'}
        mx={'48px'}
        height={'380px'}
        mt={'12px'}
        overflow={'hidden'}
        position={'relative'}
        borderRadius={'16px'}
      >
        <Image
          width={'775px'}
          height={'775px'}
          objectFit={'contain'}
          src="/launchpad-empty.png"
          alt="empty"
        />
        <Box position={'absolute'} bottom={'20px'} left={'50%'} transform={'translateX(-50%)'}>
          <Text fontSize={'18px'} fontWeight={600} textAlign={'center'}>
            Deploy your first app
          </Text>
          <Text color={'#4D4D4D'} fontSize={'14px'} fontWeight={400} textAlign={'center'}>
            Click here to deploy an application from docker image in just a few steps
          </Text>
        </Box>
      </Center>
    </Box>
  );
};

export default Empty;
