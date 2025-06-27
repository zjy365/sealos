import { useCachedStore } from '@/store/cached';
import { useSearchStore } from '@/store/search';
import { getLangStore, setLangStore } from '@/utils/cookieUtils';
import {
  Box,
  Center,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Text
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import SideBar from './sidebar';
import { ApplicationType } from '@/types/app';
import MyIcon from '../Icon';
import { Track } from '@sealos/ui';

export default function AppMenu() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { setSearchValue, setAppType } = useSearchStore();
  const { insideCloud } = useCachedStore();

  const changeI18n = () => {
    const lastLang = getLangStore();
    const newLang = lastLang === 'en' ? 'zh' : 'en';
    if (i18n?.changeLanguage) {
      i18n.changeLanguage(newLang);
      setLangStore(newLang);
    }
  };

  return (
    <Flex
      zIndex={10}
      position={'sticky'}
      top={'-68px'}
      left={'0px'}
      flexDirection={'column'}
      borderBottom="1px solid #E4E4E7"
      background={'white'}
    >
      {(router.route === '/app' || router.route === '/') && (
        <Flex px="40px" position={'relative'} alignItems={'center'}>
          {
            insideCloud ? (
              <Flex justifyContent={'space-between'} w="100%" alignItems={'center'}>
                <Flex cursor={'default'} h="88px" alignItems={'center'} gap={'24px'}>
                  <Text
                    fontSize={'24px'}
                    fontWeight={600}
                    lineHeight={'32px'}
                    onClick={() => {
                      router.replace('/');
                      setAppType(ApplicationType.All);
                    }}
                    color={router.route === '/' ? '' : '#A3A3A3'}
                    _hover={{
                      color: '#2778FD'
                    }}
                  >
                    {t('SideBar.Explore')}
                  </Text>
                  <Text
                    fontSize={'24px'}
                    fontWeight={600}
                    lineHeight={'32px'}
                    onClick={() => {
                      router.replace('/app');
                      setAppType(ApplicationType.MyApp);
                    }}
                    color={router.route === '/app' ? '' : '#A3A3A3'}
                    _hover={{
                      color: '#2778FD'
                    }}
                  >
                    {t('SideBar.My App')}
                  </Text>
                </Flex>
                {router.route === '/app' ? (
                  <Center
                    cursor={'pointer'}
                    h="40px"
                    px={'19px'}
                    border={'1px solid #E4E4E7'}
                    borderRadius={'8px'}
                    bottom={'28px'}
                    onClick={() => router.push('/develop')}
                    _hover={{
                      background: '#F4F4F5'
                    }}
                  >
                    <MyIcon name="tool" fill={'transparent'} />
                    <Text ml="8px" color={'#18181B'} fontWeight={500} fontSize={'14px'}>
                      {t('develop.Debugging Template')}
                    </Text>
                  </Center>
                ) : null}
                {router.route === '/' ? (
                  <Track.Click eventName={Track.events.appstoreSubmit}>
                    <Center
                      cursor={'pointer'}
                      h="40px"
                      px={'19px'}
                      borderRadius={'8px'}
                      color={'#1C4EF5'}
                      bottom={'28px'}
                      onClick={() => {
                        window.open('https://github.com/ClawCloud/Run-Template', '_blank');
                      }}
                    >
                      <MyIcon name="fileText" fill={'transparent'} />
                      <Text ml="8px" fontWeight={500} fontSize={'14px'}>
                        {t('develop.Submit Template')}
                      </Text>
                    </Center>
                  </Track.Click>
                ) : null}
              </Flex>
            ) : null
            // <Center
            //   bg="rgba(150, 153, 180, 0.15)"
            //   mb={'16px'}
            //   color={'#485058'}
            //   w="28px"
            //   h="28px"
            //   borderRadius={'50%'}
            //   bottom={'28px'}
            //   right={'16px'}
            //   fontSize={'12px'}
            //   fontWeight={500}
            //   cursor={'pointer'}
            //   onClick={(e) => {
            //     e.stopPropagation();
            //     changeI18n();
            //   }}
            // >
            //   {i18n?.language === 'en' ? 'En' : '中'}
            // </Center>
          }
        </Flex>
      )}
      {router.route === '/' && (
        <Flex mb={'20px'} px="40px" position={'relative'}>
          <InputGroup w={'420px'}>
            <InputLeftElement
              w={'40px'}
              h={'40px'}
              top={'50%'}
              transform={'translateY(-50%)'}
              pointerEvents="none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="17"
                viewBox="0 0 16 17"
                fill="none"
              >
                <path
                  d="M14.4733 14.2786L12 11.8252C12.9601 10.6282 13.425 9.10876 13.2992 7.57942C13.1734 6.05009 12.4664 4.62708 11.3237 3.60299C10.1809 2.57889 8.6892 2.03156 7.15528 2.07354C5.62136 2.11551 4.16181 2.7436 3.07676 3.82865C1.99171 4.9137 1.36362 6.37325 1.32164 7.90717C1.27967 9.44109 1.827 10.9328 2.85109 12.0756C3.87519 13.2183 5.2982 13.9253 6.82753 14.0511C8.35686 14.1769 9.87627 13.712 11.0733 12.7519L13.5267 15.2052C13.5886 15.2677 13.6624 15.3173 13.7436 15.3512C13.8249 15.385 13.912 15.4024 14 15.4024C14.088 15.4024 14.1751 15.385 14.2564 15.3512C14.3376 15.3173 14.4114 15.2677 14.4733 15.2052C14.5935 15.0809 14.6607 14.9148 14.6607 14.7419C14.6607 14.569 14.5935 14.4029 14.4733 14.2786ZM7.33333 12.7519C6.41035 12.7519 5.5081 12.4782 4.74067 11.9654C3.97324 11.4526 3.3751 10.7238 3.02189 9.87108C2.66868 9.01836 2.57627 8.08005 2.75633 7.1748C2.9364 6.26956 3.38085 5.43804 4.0335 4.78539C4.68614 4.13275 5.51766 3.68829 6.42291 3.50822C7.32815 3.32816 8.26646 3.42058 9.11919 3.77378C9.97191 4.12699 10.7007 4.72513 11.2135 5.49256C11.7263 6.25999 12 7.16224 12 8.08522C12 9.3229 11.5083 10.5099 10.6332 11.3851C9.75799 12.2602 8.57101 12.7519 7.33333 12.7519Z"
                  fill="#5A646E"
                />
              </svg>
            </InputLeftElement>
            <Input
              bg={'rgba(150, 153, 180, 0.10)'}
              border={'1px solid transparent'}
              w={'420px'}
              borderRadius={'full'}
              pl={'36px'}
              placeholder={t('Search templates') || 'Search templates'}
              onChange={(e) => {
                setSearchValue(e.target.value);
              }}
              _focus={{
                boxShadow: 'none',
                border: '1.5px solid #219BF4',
                background: '#FFF'
              }}
              h={'48px'}
            />
          </InputGroup>
          <SideBar />
        </Flex>
      )}
    </Flex>
  );
}
