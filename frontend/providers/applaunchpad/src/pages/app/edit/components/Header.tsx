import MyIcon from '@/components/Icon';
import { useGlobalStore } from '@/store/global';
import { useGuideStore } from '@/store/guide';
import type { YamlItemType } from '@/types/index';
import { downLoadBold } from '@/utils/tools';
import { Box, Button, Flex, Text, Center } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { startDriver } from '@/hooks/driver';
import { quitGuideDriverObj } from '@/hooks/driver';

const Header = ({
  appName,
  title,
  yamlList,
  applyCb,
  applyBtnText
}: {
  appName: string;
  title: string;
  yamlList: YamlItemType[];
  applyCb: () => void;
  applyBtnText: string;
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { lastRoute } = useGlobalStore();

  const handleExportYaml = useCallback(async () => {
    const exportYamlString = yamlList.map((i) => i.value).join('---\n');
    if (!exportYamlString) return;
    downLoadBold(
      exportYamlString,
      'application/yaml',
      appName ? `${appName}.yaml` : `yaml${dayjs().format('YYYYMMDDHHmmss')}.yaml`
    );
  }, [appName, yamlList]);

  const { createCompleted } = useGuideStore();

  return (
    <Flex w={'100%'} px={10} h={'96px'} alignItems={'center'} borderBottom={'1px solid #E4E4E7'}>
      <Flex
        alignItems={'center'}
        cursor={'pointer'}
        gap={'6px'}
        onClick={() => {
          router.replace(lastRoute);
        }}
      >
        <MyIcon name="arrowLeft" w={'24px'} />
        <Box fontWeight={'bold'} color={'grayModern.900'} fontSize={'2xl'}>
          {t(title)}
        </Box>
      </Flex>
      <Box flex={1}></Box>
      <Button
        style={{
          borderRadius: '8px'
        }}
        h={'40px'}
        mr={'14px'}
        minW={'120px'}
        variant={'outline'}
        onClick={handleExportYaml}
      >
        {t('Export')} Yaml
      </Button>
      <Box position={'relative'}>
        <Box
          p={'1px'}
          borderRadius={'8px'}
          border={!createCompleted ? '1px solid #1C4EF5' : 'none'}
        >
          <Button
            className="driver-deploy-button"
            minW={'120px'}
            h={'40px'}
            onClick={applyCb}
            style={{
              borderRadius: '8px',
              position: 'relative'
            }}
            _focusVisible={{ boxShadow: '' }}
          >
            {t(applyBtnText)}
          </Button>
        </Box>

        {!createCompleted && (
          <Box
            zIndex={1000}
            position={'absolute'}
            left={'-180px'}
            bottom={'-170px'}
            width={'250px'}
            bg={'rgba(28, 46, 245, 0.9)'}
            p={'16px'}
            borderRadius={'12px'}
            color={'#fff'}
          >
            <Flex alignItems={'center'} justifyContent={'space-between'}>
              <Text fontSize={'14px'} fontWeight={600}>
                Configure Launchpad
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
              Define image settings, and adjust CPU & memory as needed
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
