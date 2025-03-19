import Sidebar from '@/components/Sidebar';
import { Flex, Box, Text, Center } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import MyIcon from '@/components/Icon';
import { useTranslation } from 'next-i18next';
import { GeistSans } from '@/fonts';

function Layout({ children }: { children?: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className={GeistSans.className}>
      <Flex
        justify={'space-between'}
        px={'120px'}
        borderY={'1px solid #EFEFEF'}
        align={'center'}
        h={'96px'}
      >
        <Flex align={'center'} gap={'12px'}>
          <Center
            w={'48px'}
            h={'48px'}
            borderRadius={'8px'}
            border={'0.86px solid #EDEDED'}
            shadow={'0px 1px 2px 0px #0000000D'}
          >
            <MyIcon name="logo" w={'28px'} h={'28px'} />
          </Center>
          <Text fontSize={'24px'} fontWeight={600} lineHeight={'32px'}>
            {t('AccountCenter')}
          </Text>
        </Flex>
      </Flex>
      <Flex
        h={'calc(100vh - 96px)'}
        justify={'center'}
        mx={'auto'}
        maxW={'1440px'}
        columnGap={'24px'}
        minW={'1280px'}
        p={'24px 12px'}
        overflow={'hidden'}
      >
        <Sidebar />
        <Box w={'886px'} h={'calc(100vh - 96px)'} overflowY={'scroll'}>
          {children}
        </Box>
      </Flex>
    </div>
  );
}

export default Layout;
