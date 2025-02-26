import useAppStore from '@/stores/app';
import { useConfigStore } from '@/stores/config';
import { TApp } from '@/types';
import { Box, Center, Flex, Image, Input } from '@chakra-ui/react';
import { SearchIcon } from '@sealos/ui';
import { useTranslation } from 'next-i18next';
import { useRef, useState } from 'react';
import { blurBackgroundStyles } from './index';

export default function SearchBox() {
  const { t, i18n } = useTranslation();
  const logo = useConfigStore().layoutConfig?.logo;
  const { installedApps: apps, runningInfo, openApp, setToHighestLayerById } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getAppNames = (app: TApp) => {
    const names = [app.name];
    if (app.i18n) {
      Object.values(app.i18n).forEach((i18nData) => {
        if (i18nData.name) {
          names.push(i18nData.name);
        }
      });
    }
    return names;
  };

  // Filter apps based on search term
  const filteredApps = apps.filter((app) => {
    const appNames = getAppNames(app);
    return appNames.some((name) => name?.toLowerCase().includes(searchTerm?.toLowerCase()));
  });

  return (
    <Box
      width={'320px'}
      height={'40px'}
      onClick={() => {
        inputRef.current?.focus();
      }}
      cursor={'pointer'}
      position={'relative'}
      mx={'auto'}
      zIndex={2}
    >
      <Flex
        height={'full'}
        alignItems={'center'}
        color={'white'}
        bg={'rgba(0, 0, 0, 0.05)'}
        border={'1px solid'}
        borderColor={'rgba(0, 0, 0, 0.04)'}
        borderRadius={'8px'}
        {...(searchTerm !== '' && {
          borderColor: '#A3A3A3',
          background: 'rgba(255, 255, 255, 0.40)'
        })}
        _hover={{
          borderColor: '#A3A3A3',
          background: 'rgba(255, 255, 255, 0.40)'
        }}
      >
        <SearchIcon ml={'16px'} width={'16px'} height={'16px'} color={'#666666'} />
        <Input
          color={'#4D4D4D'}
          pl={'6px'}
          mr={'16px'}
          ref={inputRef}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          w={'full'}
          outline={'none'}
          type="text"
          placeholder={t('common:search_apps') || 'Search Apps'}
          bg={'transparent'}
          outlineOffset={''}
          border={'none'}
          _placeholder={{ color: '#4D4D4D' }}
          boxShadow={'none'}
          _hover={{
            bg: 'transparent'
          }}
          _focus={{
            bg: 'transparent',
            color: '#4D4D4D',
            border: 'none',
            boxShadow: 'none'
          }}
        />
      </Flex>
      {searchTerm !== '' && (
        <Flex
          flexDirection={'column'}
          position={'absolute'}
          top={'100%'}
          width={'100%'}
          mt={2}
          p={'8px'}
          color={'#18181B'}
          borderRadius={'12px'}
          border={'1px solid #E4E4E7'}
          bg={'#FFF'}
          boxShadow={'0px 4px 12px 0px rgba(0, 0, 0, 0.08)'}
        >
          {filteredApps.length > 0 ? (
            filteredApps.map((app) => (
              <Flex
                key={app.key}
                p={'7px 13px'}
                cursor="pointer"
                _hover={{ bg: '#F4F4F5' }}
                alignItems={'center'}
                onClick={() => {
                  openApp(app);
                  setSearchTerm('');
                }}
                display={'flex'}
                gap={'10px'}
                fontSize={'12px'}
                fontWeight={500}
                borderRadius={'8px'}
              >
                <Image
                  width="28px"
                  height="28px"
                  src={app?.icon}
                  fallbackSrc={logo || '/logo.svg'}
                  draggable={false}
                  alt="app logo"
                />

                {app?.i18n?.[i18n?.language]?.name ? app?.i18n?.[i18n?.language]?.name : app?.name}
              </Flex>
            ))
          ) : (
            <Flex
              p={'7px 13px'}
              fontSize={'12px'}
              fontWeight={500}
              color={'rgba(255, 255, 255, 0.90)'}
            >
              {t('common:no_apps_found') || 'No Apps Found'}
            </Flex>
          )}
        </Flex>
      )}
    </Box>
  );
}
