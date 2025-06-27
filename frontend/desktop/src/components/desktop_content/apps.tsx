import useAppStore from '@/stores/app';
import { useConfigStore } from '@/stores/config';
import { TApp } from '@/types';
import { Box, Button, Flex, Grid, HStack, Image, Text, useBreakpointValue } from '@chakra-ui/react';
import { throttle } from 'lodash';
import { useTranslation } from 'next-i18next';
import { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '../icons';
import { blurBackgroundStyles } from './index';
import { validateNumber } from '@/utils/tools';

export default function Apps() {
  const { t, i18n } = useTranslation();
  const { installedApps: renderApps, openApp } = useAppStore();
  const logo = useConfigStore().layoutConfig?.logo || '/logo.svg';

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // grid value
  const gridMX = 0;
  const gridMT = 48;
  const gridColumnGap = 72;
  const gridRowGap = 36;
  const appWidth = 120;
  const appHeight = 136;
  const pageButton = 12;

  const handleDoubleClick = (e: MouseEvent<HTMLDivElement>, item: TApp) => {
    e.preventDefault();
    if (item?.name) {
      openApp(item);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateMaxAppsPerPage = useCallback(
    throttle(() => {
      const appsContainer = document.getElementById('apps-container');
      if (appsContainer) {
        const gridWidth = appsContainer.offsetWidth - gridMX * 2 - pageButton * 2;
        const gridHeight = appsContainer.offsetHeight - gridMT;

        // 使用实际的 gridColumnGap 和 gridRowGap 进行计算
        const maxAppsInRow = Math.floor((gridWidth + gridColumnGap) / (appWidth + gridColumnGap));
        const maxAppsInColumn = Math.floor((gridHeight + gridRowGap) / (appHeight + gridRowGap));

        const maxApps = maxAppsInRow * maxAppsInColumn;

        setPage(1);
        setPageSize(maxApps);
      }
    }, 100),
    [gridMX, gridColumnGap, gridRowGap]
  );

  useEffect(() => {
    calculateMaxAppsPerPage();
    window.addEventListener('resize', calculateMaxAppsPerPage);
    return () => {
      window.removeEventListener('resize', calculateMaxAppsPerPage);
    };
  }, [calculateMaxAppsPerPage, gridMX, gridColumnGap, gridRowGap]);

  const paginatedApps = useMemo(
    () =>
      renderApps
        .filter((app) => app.key !== 'system-account-center' && app.key !== 'system-workorder')
        .slice((page - 1) * pageSize, page * pageSize),
    [renderApps, page, pageSize]
  );

  const totalPages = useMemo(() => {
    const renderAppsLength = renderApps.length;
    const validRenderAppsLength = validateNumber(renderAppsLength) ? renderAppsLength : 1;
    const validPageSize = validateNumber(pageSize) ? pageSize : 1;

    return Math.ceil(validRenderAppsLength / validPageSize) || 1;
  }, [renderApps.length, pageSize]);

  return (
    <Flex flexDirection={'column'} flex={1} height={'0'} position={'relative'} zIndex={1}>
      <Flex width={'full'} height={'full'} id="apps-container" overflow={'auto'}>
        {totalPages !== 1 && (
          <Button
            minW={'12px'}
            flexGrow={0}
            alignSelf={'center'}
            variant={'unstyled'}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            opacity={page === 1 ? '0.3' : '0.7'}
            color={'rgba(0, 0, 0, 0.90)'}
          >
            <ArrowLeftIcon />
          </Button>
        )}
        <Grid
          overflow={'hidden'}
          flex={1}
          mt={`${gridMT}px`}
          mx={`${gridMX}px`}
          columnGap={`${gridColumnGap}px`}
          rowGap={`${gridRowGap}px`}
          templateColumns={`repeat(auto-fill, minmax(${appWidth}px, 1fr))`}
          templateRows={`repeat(auto-fit, ${appHeight}px)`}
          className="apps-container"
        >
          {paginatedApps &&
            paginatedApps.map((item: TApp, index) => {
              return (
                <Flex
                  flexDirection={'column'}
                  alignItems={'center'}
                  w="100%"
                  h="136px"
                  key={index}
                  userSelect="none"
                  cursor={'pointer'}
                  onClick={(e) => handleDoubleClick(e, item)}
                  className={item.key}
                >
                  <Box mt={'10px'} w="72px" h="72px" borderRadius={'full'}>
                    <Image
                      width="100%"
                      height="100%"
                      src={item?.icon}
                      fallbackSrc={logo}
                      draggable={false}
                      borderRadius={'full'}
                      boxShadow={'0px 0.6px 2.6px 0px rgba(0, 0, 0, 0.30)'}
                      alt="app logo"
                    />
                  </Box>
                  <Text
                    mt="12px"
                    color={'rgba(0, 0, 0, 0.90)'}
                    fontSize={'14px'}
                    fontWeight={'bold'}
                    textAlign={'center'}
                    lineHeight={'16px'}
                  >
                    {item?.i18n?.[i18n?.language]?.name
                      ? item?.i18n?.[i18n?.language]?.name
                      : item?.name}
                  </Text>
                </Flex>
              );
            })}
        </Grid>
        {totalPages !== 1 && (
          <Button
            minW={'12px'}
            flexGrow={0}
            alignSelf={'center'}
            variant={'unstyled'}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            opacity={page === totalPages ? '0.3' : '0.7'}
            color={'rgba(0, 0, 0, 0.90)'}
          >
            <ArrowRightIcon />
          </Button>
        )}
      </Flex>
      <HStack justifyContent="center">
        {Array.from({ length: totalPages }, (_, index) => (
          <Box
            key={index}
            w="6px"
            h="6px"
            borderRadius="50%"
            bg={index + 1 === page ? 'rgba(255, 255, 255, 0.80)' : 'rgba(255, 255, 255, 0.30)'}
          />
        ))}
      </HStack>
    </Flex>
  );
}
