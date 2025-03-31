import React, { useCallback, useEffect } from 'react';
import { Box, Flex, Button, Text, Center } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import MyIcon from '@/components/Icon';
import JSZip from 'jszip';
import type { YamlItemType } from '@/types/index';
import { downLoadBold } from '@/utils/tools';
import dayjs from 'dayjs';
import { useGlobalStore } from '@/store/global';
import { useTranslation } from 'next-i18next';
import { I18nCommonKey } from '@/types/i18next';
import { startDriver, quitGuideDriverObj } from '@/hooks/driver';
import { useGuideStore } from '@/store/guide';

const Header = ({
  dbName,
  title,
  yamlList,
  applyCb,
  applyBtnText
}: {
  dbName: string;
  title: I18nCommonKey;
  yamlList: YamlItemType[];
  applyCb: () => void;
  applyBtnText: I18nCommonKey;
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { lastRoute } = useGlobalStore();

  const handleExportYaml = useCallback(async () => {
    const zip = new JSZip();
    yamlList.forEach((item) => {
      zip.file(item.filename, item.value);
    });
    const res = await zip.generateAsync({ type: 'blob' });
    downLoadBold(
      res,
      'application/zip',
      dbName ? `${dbName}.zip` : `yaml${dayjs().format('YYYYMMDDHHmmss')}.zip`
    );
  }, [dbName, yamlList]);

  const { createCompleted } = useGuideStore();

  return (
    <Flex w={'100%'} px={10} h={'86px'} alignItems={'center'}>
      <Flex alignItems={'center'} cursor={'pointer'} onClick={() => router.replace(lastRoute)}>
        <MyIcon name="arrowLeft" width={'24px'} height={'24px'} />
        <Box fontWeight={'bold'} color={'grayModern.900'} fontSize={'2xl'}>
          {t(title)}
        </Box>
      </Flex>
      <Box flex={1}></Box>
      {/* <Button h={'40px'} flex={'0 0 114px'} mr={5} variant={'outline'} onClick={handleExportYaml}>
        {t('Export')} Yaml
      </Button> */}

      <Box position={'relative'}>
        <Box
          p={'1px'}
          borderRadius={'8px'}
          border={!createCompleted ? '1px solid #1C4EF5' : 'none'}
        >
          <Button
            id="create-db-button"
            flex={'0 0 114px'}
            h={'40px'}
            variant={'solid'}
            onClick={applyCb}
          >
            {t(applyBtnText)}
          </Button>
        </Box>
        {!createCompleted && (
          <Box
            zIndex={1000}
            position={'absolute'}
            left={'-190px'}
            bottom={'-165px'}
            width={'250px'}
            bg={'rgba(28, 46, 245, 0.9)'}
            p={'16px'}
            borderRadius={'12px'}
            color={'#fff'}
          >
            <Flex alignItems={'center'} justifyContent={'space-between'}>
              <Text fontSize={'14px'} fontWeight={600}>
                Deploy a New Database
              </Text>
              <Text fontSize={'13px'} fontWeight={500}>
                3/4
              </Text>
            </Flex>
            <Text
              textAlign={'start'}
              whiteSpace={'wrap'}
              mt={'8px'}
              color={'#FFFFFFCC'}
              fontSize={'14px'}
              fontWeight={400}
            >
              Choose a database type, and adjust CPU & memory as needed
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
  );
};

export default Header;
