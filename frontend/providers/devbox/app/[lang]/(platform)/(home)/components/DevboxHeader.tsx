import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Button, Center, Flex, Text, useTheme } from '@chakra-ui/react';

import MyIcon from '@/components/Icon';
import { useRouter } from '@/i18n';
import { TemplateState } from '@/constants/template';
import { useTemplateStore } from '@/stores/template';

export default function DevboxHeader({ listLength }: { listLength: number }) {
  const { openTemplateModal, config, updateTemplateModalConfig } = useTemplateStore();
  const theme = useTheme();
  const router = useRouter();
  const t = useTranslations();
  const lastRoute = '/?openTemplate=publicTemplate';
  useEffect(() => {
    const refreshLastRoute = '/';
    if (config.lastRoute.includes('openTemplate')) {
      openTemplateModal({
        ...config,
        lastRoute: refreshLastRoute
      });
    } else {
      updateTemplateModalConfig({
        ...config,
        lastRoute: refreshLastRoute
      });
    }
  }, []);
  return (
    <Flex h={'90px'} alignItems={'center'}>
      <Center
        mr={'16px'}
        width={'46px'}
        bg={'#FFF'}
        height={'46px'}
        border={theme.borders.base}
        borderRadius={'md'}
      >
        <MyIcon name="logo" w={'30px'} h={'30px'} />
      </Center>
      <Box fontSize={'3xl'} color={'grayModern.900'} fontWeight={'600'}>
        Devbox
      </Box>
      <Flex
        alignItems="center"
        justifyContent="center"
        height="18px"
        borderRadius="6px"
        gap="4px"
        mr={'20px'}
        ml={'auto'}
        cursor="pointer"
        onClick={() => {
          openTemplateModal({
            templateState: TemplateState.publicTemplate,
            lastRoute
          });
        }}
      >
        <Text
          fontFamily="PingFang SC"
          fontSize="12px"
          fontWeight="500"
          lineHeight="16px"
          letterSpacing="0.5px"
          color="#1C4EF5"
        >
          {t('scan_templates')}
        </Text>
        <Button
          minW={'156px'}
          h={'40px'}
          ml={4}
          mr={0}
          variant={'solid'}
          leftIcon={<MyIcon name={'plus'} w={'20px'} fill={'#ffffff'} />}
          onClick={() => router.push('/devbox/create')}
        >
          {t('create_devbox')}
        </Button>
      </Flex>
    </Flex>
  );
}
