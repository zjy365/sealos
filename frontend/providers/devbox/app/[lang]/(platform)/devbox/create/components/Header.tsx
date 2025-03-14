import { Box, Button, Flex } from '@chakra-ui/react';
import dayjs from 'dayjs';
import JSZip from 'jszip';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect } from 'react';

import MyIcon from '@/components/Icon';
import { useRouter } from '@/i18n';
import { useGlobalStore } from '@/stores/global';
import { useTemplateStore } from '@/stores/template';
import type { YamlItemType } from '@/types/index';
import { downLoadBlob } from '@/utils/tools';
import { startDriver, guideDriverObj2 } from '@/hooks/driver';
import { useGuideStore } from '@/stores/guide';

const Header = ({
  title,
  yamlList,
  applyCb,
  applyBtnText
}: {
  yamlList: YamlItemType[];
  applyCb: () => void;
  title: string;
  applyBtnText: string;
}) => {
  const router = useRouter();
  const { lastRoute } = useGlobalStore();
  const t = useTranslations();
  const { config } = useTemplateStore();
  const handleExportYaml = useCallback(async () => {
    const zip = new JSZip();
    yamlList.forEach((item) => {
      zip.file(item.filename, item.value);
    });
    const res = await zip.generateAsync({ type: 'blob' });
    downLoadBlob(res, 'application/zip', `yaml${dayjs().format('YYYYMMDDHHmmss')}.zip`);
  }, [yamlList]);

  const { createDevboxCompleted } = useGuideStore();
  useEffect(() => {
    if (!createDevboxCompleted) {
      startDriver(guideDriverObj2());
    }
  }, [createDevboxCompleted]);

  return (
    <Flex w={'100%'} px={5} h={'86px'} alignItems={'center'} borderBottomWidth={'1px'}>
      <Flex
        alignItems={'center'}
        gap={2}
        cursor={'pointer'}
        onClick={() => {
          if (config.lastRoute) {
            router.replace(lastRoute);
          } else {
            router.replace(lastRoute);
          }
        }}
      >
        <MyIcon name="arrowLeft" color={'white'} width={'24px'} height={'24px'} />
        <Box fontWeight={'semibold'} color={'grayModern.900'} fontSize={'2xl'}>
          {t(title)}
        </Box>
      </Flex>
      <Box flex={1}></Box>
      <Box className="guide-app-button">
        <Button
          h={'40px'}
          flex={'0 0 114px'}
          mr={5}
          p={'8px 16px'}
          variant={'outline'}
          onClick={handleExportYaml}
          boxShadow={'none'}
          color={'grayModern.900'}
        >
          {t('export_yaml')}
        </Button>
        <Button
          w={'114px'}
          flex={'0 0 114px'}
          h={'40px'}
          variant={'solid'}
          onClick={applyCb}
          className="guide-app-button"
        >
          {t(applyBtnText)}
        </Button>
      </Box>
    </Flex>
  );
};

export default Header;
