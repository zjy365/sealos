import { useState } from 'react';
import { Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Box, Center, Flex, Grid, useTheme } from '@chakra-ui/react';

import Code from '@/components/Code';
import Tabs from '@/components/Tabs';

import { useRouter } from '@/i18n';
import { obj2Query } from '@/utils/tools';
import type { YamlItemType } from '@/types';
import { useCopyData } from '@/utils/tools';

import styles from './index.module.scss';

const Yaml = ({ yamlList = [], pxVal }: { yamlList: YamlItemType[]; pxVal: number }) => {
  const theme = useTheme();
  const router = useRouter();
  const t = useTranslations();
  const { copyData } = useCopyData();
  const searchParams = useSearchParams();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const devboxName = searchParams.get('name') as string;

  return (
    <Grid
      h={'100%'}
      templateColumns={'220px 1fr'}
      gridGap={5}
      alignItems={'start'}
      px={`${pxVal}px`}
    >
      <Box>
        <Tabs
          list={[
            { id: 'form', label: t('config_form') }
            // { id: 'yaml', label: t('yaml_file') }
          ]}
          activeId={'yaml'}
          onChange={() =>
            router.replace(
              `/devbox/create?${obj2Query({
                type: 'form',
                name: devboxName
              })}`
            )
          }
        />
        <Flex
          flexDirection={'column'}
          mt={3}
          borderRadius={'12px'}
          overflow={'hidden'}
          bg={'white'}
          px={'8px'}
          border={theme.borders.base}
        >
          {yamlList.map((file, index) => (
            <Flex
              key={file.filename}
              py={'10px'}
              px={'12px'}
              position={'relative'}
              cursor={'pointer'}
              alignItems={'center'}
              h={'44px'}
              borderRadius={'8px'}
              _hover={{
                backgroundColor: '#F4F6FE'
              }}
              {...(index === selectedIndex
                ? {
                    fontWeight: 'normal',
                    borderColor: 'grayModern.900',
                    backgroundColor: '#F4F6FE'
                  }
                : {
                    color: 'grayModern.900',
                    borderColor: 'myGray.200',
                    backgroundColor: 'transparent'
                  })}
              onClick={() => setSelectedIndex(index)}
            >
              <Box
                w={'2px'}
                h={'24px'}
                position={'absolute'}
                left={'1px'}
                bg={'#224EF5'}
                borderRadius={'12px'}
                opacity={selectedIndex === index ? 1 : 0}
              />
              <Box ml="18px">{file.filename}</Box>
            </Flex>
          ))}
        </Flex>
      </Box>
      {!!yamlList[selectedIndex] && (
        <Flex
          className={styles.codeBox}
          flexDirection={'column'}
          h={'100%'}
          overflow={'hidden'}
          border={theme.borders.base}
          borderRadius={'16px'}
          position={'relative'}
        >
          <Flex
            p={'24px'}
            bg={'white'}
            borderBottom={theme.borders.base}
            h={'56px'}
            alignItems={'center'}
          >
            <Box flex={1} fontSize={'20px'} color={'grayModern.900'} fontWeight={'bold'}>
              {yamlList[selectedIndex].filename}
            </Box>
            <Center
              cursor={'pointer'}
              color={'grayModern.600'}
              _hover={{ color: '#219BF4' }}
              onClick={() => copyData(yamlList[selectedIndex].value)}
            >
              <Copy size={'16px'} />
            </Center>
          </Flex>
          <Box flex={1} h={0} overflow={'auto'} bg={'#ffffff'} p={4}>
            <Code className={styles.code} content={yamlList[selectedIndex].value} language="yaml" />
          </Box>
        </Flex>
      )}
    </Grid>
  );
};

export default Yaml;
