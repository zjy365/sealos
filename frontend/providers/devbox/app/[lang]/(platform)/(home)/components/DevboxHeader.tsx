import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Button, Center, Flex, Text, useTheme } from '@chakra-ui/react';

import MyIcon from '@/components/Icon';
import { useRouter } from '@/i18n';
import { TemplateState } from '@/constants/template';
import { useTemplateStore } from '@/stores/template';
import { useGuideStore } from '@/stores/guide';
import { startDriver, startGuide2 } from '@/hooks/driver';

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

  const { guide2 } = useGuideStore();
  useEffect(() => {
    if (!guide2 && listLength === 0) {
      startDriver(startGuide2());
    }
  }, [guide2, listLength]);

  return (
    <Flex h={'96px'} alignItems={'center'}>
      <Box color={'grayModern.900'} fontWeight={'600'} fontSize={'24px'}>
        Devbox
      </Box>

      <Button
        className="list-create-app-button"
        minW={'156px'}
        h={'40px'}
        minH={'40px'}
        ml={'auto'}
        mr={0}
        variant={'solid'}
        borderRadius={'8px'}
        leftIcon={<MyIcon name={'plus'} w={'20px'} fill={'#ffffff'} />}
        onClick={() => router.push('/devbox/create')}
      >
        {t('create_devbox')}
      </Button>
    </Flex>
  );
}
