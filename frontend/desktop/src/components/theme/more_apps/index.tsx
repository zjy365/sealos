import { Box, Flex, Grid, GridItem, Text, Image } from '@chakra-ui/react';
import { useContext, MouseEvent, useState } from 'react';
import { MoreAppsContext } from '@/pages/index';
import useAppStore from '@/stores/app';
import { TApp } from '@/types';
import Iconfont from '@/components/iconfont';
import styles from './index.module.scss';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

export default function Index() {
  const { t, i18n } = useTranslation();
  const moreAppsContent = useContext(MoreAppsContext);
  const { installedApps: apps, openApp } = useAppStore();
  const itemsPerPage = 30; // Number of apps per page
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedApps = apps?.slice(startIndex, endIndex);
  const totalPages = Math.ceil((apps?.length || 0) / itemsPerPage);

  const handleDoubleClick = (e: MouseEvent<HTMLDivElement>, item: TApp) => {
    e.preventDefault();
    if (item?.name) {
      openApp(item);
    }
  };

  return (
    <Box
      data-show={moreAppsContent?.showMoreApps}
      className={clsx(styles.container)}
      onClick={() => {
        moreAppsContent?.setShowMoreApps(false);
      }}
      backgroundImage={'url(/theme/images/knorr-bremse-bg.png)'}
      backgroundRepeat={'no-repeat'}
      backgroundSize={'cover'}
    >
      <Flex justifyContent={'center'}>
        <Text fontWeight={500} fontSize={'24px'} color={'#00457E'} lineHeight={'140%'}>
          {t('More Apps')}
        </Text>
      </Flex>
      <Flex alignItems={'center'}>
        <Flex
          alignItems={'center'}
          justifyContent={'center'}
          w="60px"
          h="60px"
          borderRadius={'50%'}
          cursor={'pointer'}
          _hover={{
            background: 'rgba(255, 255, 255, 0.3)'
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (currentPage <= 1) return;
            setCurrentPage((state) => state - 1);
          }}
        >
          <Iconfont
            iconName="icon-more-right"
            width={24}
            height={24}
            color={currentPage === 1 ? '#00457E' : '#FFFFFF'}
          ></Iconfont>
        </Flex>
        <Grid
          className={styles.appsContainer}
          mt="68px"
          maxW={'868px'}
          mx="auto"
          templateRows={'repeat(2, 100px)'}
          templateColumns={'repeat(5, 72px)'}
        >
          {paginatedApps &&
            paginatedApps.map((item: TApp, index: number) => (
              <GridItem
                w="72px"
                h="100px"
                key={index}
                userSelect="none"
                cursor={'pointer'}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDoubleClick(e, item);
                }}
              >
                <Box
                  w="72px"
                  h="72px"
                  p={'15px'}
                  border={'1px solid #00457E'}
                  backgroundColor={'#00457E'}
                >
                  <Image
                    width="100%"
                    height="100%"
                    src={item?.icon}
                    fallbackSrc="/images/sealos.svg"
                    alt="user avator"
                    filter={
                      item.key.startsWith('system')
                        ? 'invert(100%) sepia(100%) saturate(1%) hue-rotate(182deg) brightness(108%) contrast(101%)'
                        : ''
                    }
                  />
                </Box>
                <Text
                  textAlign={'center'}
                  mt="8px"
                  color={'#396c90'}
                  fontSize={'13px'}
                  lineHeight={'16px'}
                >
                  {item?.i18n?.[i18n?.language]?.name
                    ? item?.i18n?.[i18n?.language]?.name
                    : t(item?.name)}
                </Text>
              </GridItem>
            ))}
        </Grid>
        <Flex
          alignItems={'center'}
          justifyContent={'center'}
          w="60px"
          h="60px"
          borderRadius={'50%'}
          _hover={{
            background: 'rgba(255, 255, 255, 0.3)'
          }}
          cursor={'pointer'}
          onClick={(e) => {
            e.stopPropagation();
            if (currentPage >= totalPages) return;
            setCurrentPage((state) => state + 1);
          }}
        >
          <Iconfont
            iconName="icon-more-left"
            width={24}
            height={24}
            color={currentPage === totalPages ? '#00457E' : '#FFFFFF'}
          ></Iconfont>
        </Flex>
      </Flex>
      <Flex
        justifyContent={'center'}
        position={'absolute'}
        bottom={'48px'}
        left={'50%'}
        transform={' translateX(-50%)'}
      >
        <Text color={'#003f71'}>{currentPage}</Text>
        <Text color={'#396c90'}>&nbsp;/&nbsp;{totalPages}</Text>
      </Flex>
    </Box>
  );
}
