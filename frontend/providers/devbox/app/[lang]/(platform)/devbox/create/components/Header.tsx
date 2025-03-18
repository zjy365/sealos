import { Box, Button, Center, Flex, Text } from '@chakra-ui/react';
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
import { startDriver, quitGuideDriverObj } from '@/hooks/driver';
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

  const { guideConfigDevbox, setguideConfigDevbox } = useGuideStore();

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
      <Flex>
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
        <Box position={'relative'}>
          <Box
            p={'1px'}
            borderRadius={'8px'}
            border={!guideConfigDevbox ? '1px solid #1C4EF5' : 'none'}
          >
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

          {!guideConfigDevbox && (
            <Box
              zIndex={1000}
              position={'absolute'}
              left={'-180px'}
              bottom={'-190px'}
              width={'250px'}
              bg={'rgba(28, 46, 245, 0.9)'}
              p={'16px'}
              borderRadius={'12px'}
              color={'#fff'}
            >
              <Flex alignItems={'center'} justifyContent={'space-between'}>
                <Text fontSize={'14px'} fontWeight={600}>
                  Configure Devbox
                </Text>
                <Text fontSize={'13px'} fontWeight={500}>
                  3/8
                </Text>
              </Flex>
              <Text
                whiteSpace={'wrap'}
                mt={'8px'}
                color={'#FFFFFFCC'}
                fontSize={'14px'}
                fontWeight={400}
              >
                Select your environment settings, and adjust CPU & memory as needed
              </Text>
              <Center
                w={'86px'}
                color={'#fff'}
                fontSize={'14px'}
                fontWeight={500}
                cursor={'pointer'}
                mt={'16px'}
                borderRadius={'8px'}
                background={'rgba(255, 255, 255, 0.20)'}
                h={'32px'}
                p={'px'}
                onClick={() => {
                  startDriver(quitGuideDriverObj);
                }}
              >
                Quit Guide
              </Center>
              <Box
                position={'absolute'}
                top={'-10px'}
                right={'16px'}
                width={0}
                height={0}
                borderLeft={'8px solid transparent'}
                borderRight={'8px solid transparent'}
                borderTop={'10px solid rgba(28, 46, 245, 0.9)'}
                transform={'rotate(180deg)'}
              />
            </Box>
          )}
        </Box>
      </Flex>
    </Flex>
  );
};

export default Header;
