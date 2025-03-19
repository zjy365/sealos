import { regionList as getRegionList } from '@/api/auth';
import request from '@/services/request';
import useSessionStore from '@/stores/session';
import { ApiResp, Region } from '@/types';
import { AccessTokenPayload } from '@/types/token';
import { Box, Center, Divider, Flex, HStack, Text, useDisclosure, VStack } from '@chakra-ui/react';
import { InfoIcon, ProviderIcon } from '@sealos/ui';
import { useQuery } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { DesktopExchangeIcon, ZoneIcon } from '../icons';
import { I18nCloudProvidersKey } from '@/types/i18next';
import { CheckIcon, ChevronDown } from 'lucide-react';

export default function RegionToggle() {
  const disclosure = useDisclosure();
  const { setWorkSpaceId, session } = useSessionStore();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { data } = useQuery(['regionlist'], getRegionList, {
    cacheTime: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
  const regionList = useMemo(() => data?.data?.regionList || [], [data]);
  const token = useSessionStore((s) => s.token);
  const curRegionUid = useMemo(() => {
    try {
      return jwtDecode<AccessTokenPayload>(token).regionUid;
    } catch {
      return undefined;
    }
  }, [token]);
  const curRegion = regionList.find((r) => r.uid === curRegionUid);

  const handleCick = async (region: Region) => {
    setWorkSpaceId(session?.user?.ns_uid || '');
    const target = new URL(`https://${region.domain}/switchRegion`);
    const res = await request.get<any, ApiResp<{ token: string }>>('/api/auth/globalToken');
    const token = res?.data?.token;
    if (!token) return;
    target.searchParams.append('token', token);
    await router.replace(target);
  };

  return (
    <Box>
      {regionList?.length > 1 && (
        <HStack position={'relative'}>
          <HStack
            w={'full'}
            fontSize={'14px'}
            color={'#0A0A0A'}
            fontWeight={'500'}
            minH={'40px'}
            onClick={() => {
              disclosure.onOpen();
            }}
            cursor={'pointer'}
            userSelect={'none'}
            position={'relative'}
            gap={'8px'}
          >
            <Text cursor={'pointer'}>{curRegion?.displayName}</Text>
            <Center
              bg={disclosure.isOpen ? '#FFF' : ''}
              transform={disclosure.isOpen ? 'rotate(-90deg)' : 'rotate(0deg)'}
              borderRadius={'4px'}
              transition={'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'}
            >
              <ChevronDown size={16} color={'#525252'} />
            </Center>
          </HStack>
          {disclosure.isOpen ? (
            <Box position={'absolute'} right={0}>
              <Box
                position={'fixed'}
                inset={0}
                zIndex={'998'}
                onClick={(e) => {
                  e.stopPropagation();
                  disclosure.onClose();
                }}
              ></Box>
              <Box
                position={'absolute'}
                zIndex={999}
                top="24px"
                left={'-20px'}
                cursor={'initial'}
                borderRadius={'12px'}
                py={'8px'}
                border={'1px solid #E4E4E7'}
                background={'#FFF'}
                boxShadow={'0px 4px 12px 0px rgba(0, 0, 0, 0.08)'}
                color={'#18181B'}
                width={'240px'}
              >
                <Text px={'12px'} py={'6px'} color={'#71717A'} fontSize={'12px'} fontWeight={'500'}>
                  {t('common:region')}
                </Text>
                <VStack alignItems={'stretch'} px={'8px'}>
                  {regionList.map((region) => {
                    const cpuPrice = region?.description?.prices?.find((p) => p.name === 'CPU');
                    return (
                      <Flex
                        justifyContent={'space-between'}
                        alignItems={'center'}
                        whiteSpace={'nowrap'}
                        borderRadius={'8px'}
                        py={'10px'}
                        px={'8px'}
                        key={region.uid}
                        onClick={() => {
                          handleCick(region);
                        }}
                        cursor={'pointer'}
                        _hover={{
                          bgColor: '#F4F4F5'
                        }}
                      >
                        <Text>{region?.displayName}</Text>
                        {region.uid === curRegionUid && <CheckIcon size={16} color={'#1C4EF5'} />}

                        {/* <Divider bg={'rgba(255, 255, 255, 0.10)'} my={'12px'} /> */}
                        {/* <Box px={'16px'} fontSize={'11px'} fontWeight={'500'}>
                          <HStack color={'rgba(255, 255, 255, 0.80)'} gap={'4px'} mb={'2px'}>
                            <ProviderIcon boxSize={'12px'} />
                            <Text>{t('cloudProviders:provider')}</Text>
                          </HStack>
                          <Text color={'white'} mb={'8px'}>
                            {t(region?.description?.provider as I18nCloudProvidersKey, {
                              ns: 'cloudProviders'
                            })}
                          </Text>
                          <HStack color={'rgba(255, 255, 255, 0.80)'} gap={'4px'} mb={'2px'}>
                            <InfoIcon boxSize={'12px'} />
                            <Text>{t('common:description')}</Text>
                          </HStack>
                          <Text whiteSpace={'pre-wrap'} color={'white'} lineHeight={'20px'}>
                            {region?.description?.description?.[i18n.language as 'zh' | 'en']}
                          </Text>
                        </Box> */}
                      </Flex>
                    );
                  })}
                </VStack>
              </Box>
            </Box>
          ) : null}
        </HStack>
      )}
    </Box>
  );
}
