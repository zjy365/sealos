import MyIcon from '@/components/Icon';
import { MOCK_APP_DETAIL } from '@/mock/apps';
import type { AppDetailType } from '@/types/app';
import { useCopyData } from '@/utils/tools';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Text,
  useTheme
} from '@chakra-ui/react';
import { MyTooltip } from '@sealos/ui';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import styles from '@/components/app/detail/index/index.module.scss';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';

const ConfigMapDetailModal = dynamic(() => import('./ConfigMapDetailModal'));

const AdvancedInfo = ({ app = MOCK_APP_DETAIL }: { app: AppDetailType }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { copyData } = useCopyData();
  const [detailConfigMap, setDetailConfigMap] = useState<{
    mountPath: string;
    value: string;
  }>();
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  return (
    <Box px={'32px'}>
      <Box
        px={'24px'}
        py={'20px'}
        borderRadius={'16px'}
        border={'1px solid #E4E4E7'}
        bg={'#FFF'}
        boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.05)'}
      >
        <Flex justifyContent={'space-between'}>
          <Text fontSize={'20px'} fontWeight={'bold'} color={'#18181B'}>
            {t('Command')}
          </Text>
          <Button variant={'outline'} onClick={() => router.push(`/app/edit?name=${app.appName}`)}>
            {t('Add')}
          </Button>
        </Flex>
        <Flex color={'#737373'} fontSize={'14px'} mt={'20px'} gap={'12px'}>
          {[
            { label: 'Command', value: app.runCMD || 'Not Configured' },
            { label: 'Parameters', value: app.cmdParam || 'Not Configured' }
          ].map((item) => (
            <Flex key={item.label} flex={1}>
              {t(item.label)}
            </Flex>
          ))}
        </Flex>
        <Flex color={'#18181B'} fontSize={'14px'} mt={'20px'} gap={'12px'}>
          {[
            { label: 'Command', value: app.runCMD || 'Not Configured' },
            { label: 'Parameters', value: app.cmdParam || 'Not Configured' }
          ].map((item) => (
            <Flex
              key={item.label}
              flex={1}
              borderRadius={'8px'}
              border={'1px solid #E4E4E7'}
              background={'#FAFAFA'}
              p={'8px 12px'}
            >
              {item.value}
            </Flex>
          ))}
        </Flex>
      </Box>

      <Box
        mt={'16px'}
        px={'24px'}
        py={'20px'}
        borderRadius={'16px'}
        border={'1px solid #E4E4E7'}
        bg={'#FFF'}
        boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.05)'}
      >
        <Flex justifyContent={'space-between'}>
          <Text fontSize={'20px'} fontWeight={'bold'} color={'#18181B'}>
            {t('Environment Variables')}
          </Text>
          <Button variant={'outline'} onClick={() => router.push(`/app/edit?name=${app.appName}`)}>
            {t('Manage')}
          </Button>
        </Flex>
        <Box mt={'20px'}>
          {app.envs?.length > 0 ? (
            <Flex flexDirection={'column'} gap={'8px'}>
              {app.envs.map((env, index) => {
                const valText = env.value ? env.value : env.valueFrom ? 'value from | ***' : '';
                return (
                  <Flex key={env.key} gap={'12px'}>
                    <Box
                      flex={1}
                      maxW={'40%'}
                      overflowWrap={'break-word'}
                      borderRadius={'8px'}
                      border={'1px solid #E4E4E7'}
                      background={'#FAFAFA'}
                      p={'8px 12px'}
                    >
                      {env.key}
                    </Box>
                    <Center>
                      <ArrowRight color="#71717A" size={20} />
                    </Center>
                    <MyTooltip label={valText}>
                      <Box
                        flex={1}
                        borderRadius={'8px'}
                        border={'1px solid #E4E4E7'}
                        background={'#FAFAFA'}
                        p={'8px 12px'}
                        className={styles.textEllipsis}
                        style={{
                          userSelect: 'auto',
                          cursor: 'pointer'
                        }}
                        onClick={() => copyData(valText)}
                      >
                        {valText}
                      </Box>
                    </MyTooltip>
                  </Flex>
                );
              })}
            </Flex>
          ) : (
            <Center
              w={'100%'}
              h={'32px'}
              color={'grayModern.600'}
              fontSize={'12px'}
              borderRadius={'4px'}
            >
              <Box>{t('no_data_available')}</Box>
            </Center>
          )}
        </Box>
      </Box>

      <Flex mt={'16px'} gap={'16px'}>
        <Box
          flex={1}
          px={'24px'}
          py={'20px'}
          borderRadius={'16px'}
          border={'1px solid #E4E4E7'}
          bg={'#FFF'}
          boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.05)'}
        >
          <Flex justifyContent={'space-between'}>
            <Text fontSize={'20px'} fontWeight={'bold'} color={'#18181B'}>
              {t('Configuration File')}
            </Text>
            <Button
              variant={'outline'}
              onClick={() => router.push(`/app/edit?name=${app.appName}`)}
            >
              {t('Add')}
            </Button>
          </Flex>
          <Box mt={'16px'}>
            {app.configMapList?.length > 0 ? (
              <Box borderRadius={'md'} overflow={'hidden'} bg={'#FFF'} border={theme.borders.base}>
                {app.configMapList.map((item) => (
                  <Flex
                    key={item.mountPath}
                    alignItems={'center'}
                    px={'14px'}
                    py={'8px'}
                    cursor={'pointer'}
                    _notLast={{
                      borderBottom: theme.borders.base
                    }}
                  >
                    <MyIcon name={'configMap'} width={'24px'} height={'24px'} />
                    <Box ml={4} flex={'1 0 0'} w={'0px'}>
                      <Box fontWeight={'bold'} color={'grayModern.900'}>
                        {item.mountPath}
                      </Box>
                      <Box className={styles.textEllipsis} color={'grayModern.600'} fontSize={'sm'}>
                        {item.value}
                      </Box>
                    </Box>
                  </Flex>
                ))}
              </Box>
            ) : (
              <Center
                w={'100%'}
                h={'32px'}
                color={'grayModern.600'}
                fontSize={'12px'}
                borderRadius={'4px'}
              >
                <Box>{t('no_data_available')}</Box>
              </Center>
            )}
          </Box>
        </Box>
        <Box
          flex={1}
          px={'24px'}
          py={'20px'}
          borderRadius={'16px'}
          border={'1px solid #E4E4E7'}
          bg={'#FFF'}
          boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.05)'}
        >
          <Flex justifyContent={'space-between'}>
            <Text fontSize={'20px'} fontWeight={'bold'} color={'#18181B'}>
              {t('Storage')}
            </Text>
            <Button
              variant={'outline'}
              onClick={() => router.push(`/app/edit?name=${app.appName}`)}
            >
              {t('Add')}
            </Button>
          </Flex>
          <Box mt={'16px'}>
            {app.storeList?.length > 0 ? (
              <Box borderRadius={'md'} overflow={'hidden'} bg={'#FFF'} border={theme.borders.base}>
                {app.storeList.map((item) => (
                  <Flex
                    key={item.path}
                    alignItems={'center'}
                    px={'14px'}
                    py={'8px'}
                    _notLast={{
                      borderBottom: theme.borders.base
                    }}
                  >
                    <MyIcon name={'store'} width={'24px'} height={'24px'} />
                    <Box ml={4} flex={'1 0 0'} w={'0px'}>
                      <Box color={'grayModern.900'} fontWeight={'bold'}>
                        {item.path}
                      </Box>
                      <Box className={styles.textEllipsis} color={'grayModern.600'} fontSize={'sm'}>
                        {item.value} Gi
                      </Box>
                    </Box>
                  </Flex>
                ))}
              </Box>
            ) : (
              <Center
                w={'100%'}
                h={'32px'}
                color={'grayModern.600'}
                fontSize={'12px'}
                borderRadius={'4px'}
              >
                <Box>{t('no_data_available')}</Box>
              </Center>
            )}
          </Box>
        </Box>
      </Flex>

      {detailConfigMap && (
        <ConfigMapDetailModal {...detailConfigMap} onClose={() => setDetailConfigMap(undefined)} />
      )}
    </Box>
  );
};

export default React.memo(AdvancedInfo);
