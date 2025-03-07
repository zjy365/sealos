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
    <Flex h={'96px'} alignItems={'center'}>
      <Box color={'grayModern.900'} fontWeight={'600'} fontSize={'24px'}>
        Devbox
      </Box>
      <Flex
        alignItems="center"
        justifyContent="center"
        height="18px"
        borderRadius="6px"
        gap="4px"
        ml={'auto'}
        cursor="pointer"
      >
        <Text
          fontFamily="PingFang SC"
          fontSize="12px"
          fontWeight="500"
          lineHeight="16px"
          letterSpacing="0.5px"
          color="#1C4EF5"
          onClick={() => {
            openTemplateModal({
              templateState: TemplateState.publicTemplate,
              lastRoute
            });
          }}
        >
          {t('scan_templates')}
        </Text>
        <Button
          minW={'156px'}
          h={'40px'}
          ml={4}
          mr={0}
          variant={'solid'}
          borderRadius={'8px'}
          leftIcon={<MyIcon name={'plus'} w={'20px'} fill={'#ffffff'} />}
          onClick={() => router.push('/devbox/create')}
        >
          {t('create_devbox')}
        </Button>
      </Flex>
    </Flex>
  );
}
