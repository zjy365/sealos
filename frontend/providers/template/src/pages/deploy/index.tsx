import { getTemplateSource, postDeployApp } from '@/api/app';
import { getPlatformEnv } from '@/api/platform';
import { editModeMap } from '@/constants/editApp';
import { useConfirm } from '@/hooks/useConfirm';
import { useLoading } from '@/hooks/useLoading';
import { useCachedStore } from '@/store/cached';
import { useGlobalStore } from '@/store/global';
import { useSearchStore } from '@/store/search';
import type { QueryType, YamlItemType } from '@/types';
import { ApplicationType, TemplateSourceType } from '@/types/app';
import { serviceSideProps } from '@/utils/i18n';
import { generateYamlList, parseTemplateString } from '@/utils/json-yaml';
import { compareFirstLanguages, deepSearch, useCopyData } from '@/utils/tools';
import {
  Box,
  Flex,
  Icon,
  Text,
  Divider,
  Grid,
  Center,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Form from './components/Form';
import ReadMe from './components/ReadMe';
import { getTemplateInputDefaultValues, getTemplateValues } from '@/utils/template';
import { getResourceUsage } from '@/utils/usage';
import Head from 'next/head';
import { useMessage, Track } from '@sealos/ui';
import Carousel from './components/Carousel';
import MyIcon from '@/components/Icon';
import { formatNum } from '@/utils/tools';
import { HtmlIcon } from '@/components/icons';
import Image from 'next/image';
import { useUserStore } from '@/store/user';

const ErrorModal = dynamic(() => import('./components/ErrorModal'));
const Header = dynamic(() => import('./components/Header'), { ssr: false });

export default function EditApp({
  appName,
  metaData,
  brandName,
  readmeContent,
  readUrl,
  images
}: {
  appName?: string;
  metaData: {
    title: string;
    keywords: string;
    description: string;
  };
  brandName?: string;
  readmeContent: string;
  readUrl: string;
  images: string[];
}) {
  const { t, i18n } = useTranslation();
  const { message: toast } = useMessage();
  const router = useRouter();
  const { copyData } = useCopyData();
  const { templateName } = router.query as QueryType;
  const { Loading, setIsLoading } = useLoading();
  const { title, applyBtnText, applyMessage, applySuccess, applyError } = editModeMap(false);
  const [templateSource, setTemplateSource] = useState<TemplateSourceType>();
  const [yamlList, setYamlList] = useState<YamlItemType[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const { screenWidth } = useGlobalStore();
  const { setCached, cached, insideCloud, deleteCached, setInsideCloud } = useCachedStore();
  const { setAppType } = useSearchStore();
  const { userSourcePrice, checkQuotaAllow, loadUserQuota } = useUserStore();
  useEffect(() => {
    loadUserQuota();
    // eslint-disable-next-line
  }, []);

  const detailName = useMemo(
    () => templateSource?.source?.defaults?.app_name?.value || '',
    [templateSource]
  );

  const usage = useMemo(() => {
    const usage = getResourceUsage(yamlList?.map((item) => item.value) || []);
    return usage;
  }, [yamlList]);

  const { data: platformEnvs } = useQuery(['getPlatformEnvs'], () => getPlatformEnv(), {
    retry: 3
  });

  const { openConfirm, ConfirmChild } = useConfirm({
    content: insideCloud ? 'Confirm Deploy Application?' : 'Heading to ClawCloud soon'
  });

  const { openConfirm: openConfirm2, ConfirmChild: ConfirmChild2 } = useConfirm({
    content: 'Do you want to jump to the app details page'
  });

  const pxVal = useMemo(() => {
    const val = Math.floor((screenWidth - 1050) / 2);
    if (val < 20) {
      return 20;
    }
    return val;
  }, [screenWidth]);

  const generateYamlData = useCallback(
    (templateSource: TemplateSourceType, inputs: Record<string, string>): YamlItemType[] => {
      if (!templateSource) return [];
      const app_name = templateSource?.source?.defaults?.app_name?.value;
      const { defaults, defaultInputs } = getTemplateValues(templateSource);
      const data = {
        ...platformEnvs,
        ...templateSource?.source,
        inputs: {
          ...defaultInputs,
          ...inputs
        },
        defaults: defaults
      };
      const generateStr = parseTemplateString(templateSource.appYaml, data);
      return generateYamlList(generateStr, app_name);
    },
    [platformEnvs]
  );

  const debouncedFnRef = useRef<any>(null);
  useEffect(() => {
    debouncedFnRef.current = debounce((inputValues: Record<string, string>) => {
      try {
        if (!templateSource) return;
        const list = generateYamlData(templateSource, inputValues);
        setYamlList(list);
      } catch (error) {
        console.log(error);
      }
    }, 500);
    return () => {
      debouncedFnRef.current = null;
    };
  }, [templateSource, generateYamlData]);

  const formOnchangeDebounce = useCallback((inputs: Record<string, string>) => {
    if (debouncedFnRef.current) {
      debouncedFnRef.current(inputs);
    }
  }, []);

  const getCachedValue = ():
    | {
        cachedKey: string;
        [key: string]: any;
      }
    | undefined => {
    if (!cached) return undefined;
    const cachedValue = JSON.parse(cached);
    return cachedValue?.cachedKey === templateName ? cachedValue : undefined;
  };

  // form
  const formHook = useForm({
    defaultValues: getTemplateInputDefaultValues(templateSource),
    values: getCachedValue()
  });

  // watch form change, compute new yaml
  useEffect(() => {
    const subscription = formHook.watch((data: Record<string, string>) => {
      data && formOnchangeDebounce(data);
    });
    return () => subscription.unsubscribe();
  }, [formHook, formOnchangeDebounce]);

  const submitSuccess = async () => {
    const quoteCheckRes = checkQuotaAllow({
      cpu: usage.cpu.max,
      memory: usage.memory.max,
      storage: usage.storage.max
    });

    if (quoteCheckRes) {
      return toast({
        status: 'warning',
        title: t(quoteCheckRes),
        duration: 5000,
        isClosable: true
      });
    }
    setIsLoading(true);

    try {
      if (!insideCloud) {
        handleOutside();
      } else {
        await handleInside();
      }
    } catch (error) {
      setErrorMessage(JSON.stringify(error));
    }
    setIsLoading(false);
  };

  const handleOutside = () => {
    setCached(JSON.stringify({ ...formHook.getValues(), cachedKey: templateName }));

    const params = new URLSearchParams();
    ['k', 's', 'bd_vid'].forEach((param) => {
      const value = router.query[param];
      if (typeof value === 'string') {
        params.append(param, value);
      }
    });

    const queryString = params.toString();

    const baseUrl = `https://${platformEnvs?.DESKTOP_DOMAIN}/`;
    const encodedTemplateQuery = encodeURIComponent(
      `?templateName=${templateName}&sealos_inside=true`
    );
    const templateQuery = `openapp=system-template${encodedTemplateQuery}`;
    const href = `${baseUrl}${
      queryString ? `?${queryString}&${templateQuery}` : `?${templateQuery}`
    }`;

    window.open(href, '_self');
  };

  const handleInside = async () => {
    const yamls = yamlList.map((item) => item.value);
    await postDeployApp(yamls, 'create');

    toast({
      title: t(applySuccess),
      status: 'success'
    });

    deleteCached();
    setAppType(ApplicationType.MyApp);
    router.push({
      pathname: '/instance',
      query: { instanceName: detailName }
    });
  };

  const submitError = async () => {
    await formHook.trigger();
    toast({
      title: deepSearch(formHook.formState.errors),
      status: 'error',
      position: 'top',
      duration: 3000,
      isClosable: true
    });
  };

  const parseTemplate = (res: TemplateSourceType) => {
    try {
      setTemplateSource(res);
      const inputs = getCachedValue() ? JSON.parse(cached) : getTemplateInputDefaultValues(res);
      const list = generateYamlData(res, inputs);
      setYamlList(list);
    } catch (err) {
      console.log(err, 'getTemplateData');
      toast({
        title: deepSearch(err),
        status: 'error',
        position: 'top',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const { data } = useQuery(
    ['getTemplateSource', templateName],
    () => getTemplateSource(templateName),
    {
      onSuccess(data) {
        parseTemplate(data);
      },
      onError(err) {
        toast({
          title: deepSearch(err),
          status: 'error',
          position: 'top',
          duration: 3000,
          isClosable: true
        });
      }
    }
  );

  const shareLink = useMemo(
    () => ({
      link: `https://template.run.claw.cloud/?openapp=system-fastdeploy%3FtemplateName%3D${data?.templateYaml?.metadata?.name}`,
      html: `<a href="https://template.run.claw.cloud/?openapp=system-fastdeploy%3FtemplateName%3D${data?.templateYaml?.metadata?.name}"><img src="https://raw.githubusercontent.com/ClawCloud/Run-Template/refs/heads/main/Run-on-ClawCloud.svg" alt="Run on ClawCloud"/></a>`,
      markdown: `[![](https://raw.githubusercontent.com/ClawCloud/Run-Template/refs/heads/main/Run-on-ClawCloud.svg)](https://template.run.claw.cloud/?openapp=system-fastdeploy%3FtemplateName%3D${data?.templateYaml?.metadata?.name})`
    }),
    [data?.templateYaml?.metadata?.name]
  );

  const copyTemplateLink = () => {
    const str = `https://${platformEnvs?.DESKTOP_DOMAIN}/?openapp=system-template%3FtemplateName%3D${appName}`;
    copyData(str);
  };

  useEffect(() => {
    setInsideCloud(!(window.top === window));

    if (!templateName) {
      toast({
        title: t('TemplateNameError'),
        status: 'error',
        position: 'top',
        duration: 3000,
        isClosable: true
      });
    }
  }, [setInsideCloud, t, templateName, toast]);

  return (
    <Box
      flexDirection={'column'}
      height={'100%'}
      position={'relative'}
      borderRadius={'12px'}
      background={'linear-gradient(180deg, #FFF 0%, rgba(255, 255, 255, 0.70) 100%)'}
    >
      <Head>
        <title>{`${metaData.title}-${brandName}`}</title>
        <meta name="description" content={metaData.description} />
      </Head>
      {/* <Flex
        zIndex={99}
        position={'sticky'}
        top={0}
        left={0}
        w={'100%'}
        h={'50px'}
        borderBottom={'1px solid #EAEBF0'}
        justifyContent={'start'}
        alignItems={'center'}
        backgroundColor={'rgba(255, 255, 255)'}
        backdropBlur={'100px'}
      >
        <Flex
          alignItems={'center'}
          fontWeight={500}
          fontSize={16}
          color={'#7B838B'}
          cursor={'pointer'}
        >
          <Flex
            alignItems={'center'}
            css={{
              ':hover': {
                fill: '#219BF4',
                color: '#219BF4',
                '> svg': {
                  fill: '#219BF4'
                }
              }
            }}
          >
            <Icon
              ml={'19px'}
              viewBox="0 0 15 15"
              fill={'#24282C'}
              w={'15px'}
              h="15px"
              onClick={() => router.push('/')}
            >
              <path d="M9.1875 13.1875L3.92187 7.9375C3.85937 7.875 3.81521 7.80729 3.78937 7.73438C3.76312 7.66146 3.75 7.58333 3.75 7.5C3.75 7.41667 3.76312 7.33854 3.78937 7.26562C3.81521 7.19271 3.85937 7.125 3.92187 7.0625L9.1875 1.79687C9.33333 1.65104 9.51562 1.57812 9.73438 1.57812C9.95312 1.57812 10.1406 1.65625 10.2969 1.8125C10.4531 1.96875 10.5312 2.15104 10.5312 2.35938C10.5312 2.56771 10.4531 2.75 10.2969 2.90625L5.70312 7.5L10.2969 12.0938C10.4427 12.2396 10.5156 12.4192 10.5156 12.6325C10.5156 12.8463 10.4375 13.0312 10.2812 13.1875C10.125 13.3438 9.94271 13.4219 9.73438 13.4219C9.52604 13.4219 9.34375 13.3438 9.1875 13.1875Z" />
            </Icon>
            <Text ml="4px" onClick={() => router.push('/')}>
              {t('Application List')}
            </Text>
          </Flex>
          <Text px="6px">/</Text>
          <Text
            onClick={copyTemplateLink}
            _hover={{ fill: '#219BF4', color: '#219BF4' }}
            color={router.pathname === '/deploy' ? '#262A32' : '#7B838B'}
          >
            {data?.templateYaml?.metadata?.name}
          </Text>
        </Flex>
      </Flex> */}
      <Flex flexDirection={'column'} alignItems={'center'} minWidth={'780px'}>
        <Flex
          flexDirection={'column'}
          width={'100%'}
          flexGrow={1}
          backgroundColor={'rgba(255, 255, 255, 0.90)'}
        >
          <Header
            px={'42px'}
            showReturn={true}
            cloudDomain={platformEnvs?.DESKTOP_DOMAIN || ''}
            templateDetail={data?.templateYaml!}
            appName={appName || ''}
            title={title}
            yamlList={yamlList}
            applyBtnText={insideCloud ? applyBtnText : 'Deploy on ClawCloud'}
            applyCb={() => formHook.handleSubmit(openConfirm(submitSuccess), submitError)()}
            borderBottom={'1px solid #EAEBF0'}
          />
          <Flex w="100%" flexDirection="column">
            {/* <QuotaBox /> */}
            {!!templateSource?.source?.inputs?.length ? (
              <Form
                w={'1268px'}
                fontWeight={500}
                mx={'auto'}
                formHook={formHook}
                pxVal={pxVal}
                formSource={templateSource!}
                platformEnvs={platformEnvs!}
              />
            ) : null}
            <Divider />
            {images.length !== 0 ? (
              <Carousel
                // data={images.length ? images : ['/1','/2','/3','/4','/1','/2','/3','/4']}
                data={images}
              />
            ) : null}
            {/* <Yaml yamlList={yamlList} pxVal={pxVal}></Yaml> */}
            <Flex p={'32px 42px'} flexDirection={'row'} gap={'60px'} justifyContent={'center'}>
              <Flex w={'320px'} pt={'40px'} gap={'16px'} flexDirection={'column'}>
                <Text color={'#71717A'} fontSize={'12px'} fontWeight={500}>
                  {t('templateDetails')}
                </Text>
                <Flex flexDirection={'column'} gap={'12px'}>
                  <Grid
                    templateColumns={'16px 92px 1fr'}
                    alignItems={'center'}
                    gap={'12px'}
                    fontSize={'14px'}
                  >
                    <MyIcon w={'16px'} h={'16px'} name="activity" fill={'none'} />
                    <Text color={'#71717A'}>{t('running')}</Text>
                    <Text color={'#18181B'}>
                      {data?.templateYaml?.spec.deployCount
                        ? formatNum(data?.templateYaml?.spec.deployCount)
                        : 0}
                    </Text>
                  </Grid>
                  <Grid
                    templateColumns={'16px 92px 1fr'}
                    alignItems={'center'}
                    gap={'12px'}
                    fontSize={'14px'}
                  >
                    <MyIcon w={'16px'} h={'16px'} name="usersround" fill={'none'} />
                    <Text color={'#71717A'}>{t('publisher')}</Text>
                    <Text color={'#18181B'}>{data?.templateYaml?.spec.author}</Text>
                  </Grid>
                  <Grid
                    templateColumns={'16px 92px 1fr'}
                    alignItems={'center'}
                    gap={'12px'}
                    fontSize={'14px'}
                  >
                    <MyIcon w={'16px'} h={'16px'} name="calendar" fill={'none'} />
                    <Text color={'#71717A'}>{t('created')}</Text>
                    <Text color={'#18181B'}>
                      {data?.templateYaml?.spec.date
                        ? new Date(data.templateYaml.spec.date).toLocaleDateString()
                        : 'N/A'}
                    </Text>
                  </Grid>
                  <Grid
                    templateColumns={'16px 92px 1fr'}
                    alignItems={'center'}
                    gap={'12px'}
                    fontSize={'14px'}
                  >
                    <MyIcon w={'16px'} h={'16px'} name="userCog" fill={'none'} />
                    <Text color={'#71717A'}>{t('developer')}</Text>
                    <Text color={'#18181B'}>
                      {data?.templateYaml?.spec.gitRepo.split('/').at(-2)}
                    </Text>
                  </Grid>
                  <Grid
                    templateColumns={'16px 92px 1fr'}
                    alignItems={'center'}
                    gap={'12px'}
                    fontSize={'14px'}
                  >
                    <MyIcon w={'16px'} h={'16px'} name="link" fill={'none'} />
                    <Text color={'#71717A'}>{t('githubRepo')}</Text>
                    <Flex
                      cursor={'pointer'}
                      alignItems={'center'}
                      gap={'4px'}
                      onClick={() => window.open(data?.templateYaml?.spec.gitRepo, '_blank')}
                    >
                      <Text color={'#18181B'}>{t('view')}</Text>
                      <MyIcon w={'16px'} h={'16px'} name="outLink" fill={'none'} />
                    </Flex>
                  </Grid>
                </Flex>
                {/* <Divider />
                <Text color={'#71717A'} fontSize={'12px'} fontWeight={500}>{t('templateContent')}</Text>
                <Flex flexDirection={'column'} gap={'12px'}>
                  {
                    data?.templateYaml?.metadata?.annotations?.map((item: any) => (
                      <Flex key={item.originImageName} gap={'12px'} alignItems={'center'}>
                        <Center w={'44px'} h={'44px'} borderRadius={'8px'} backgroundColor={'#FAFAFA'}>
                          <MyIcon w={'16px'} h={'16px'} name='container' fill={'none'} />
                        </Center>
                        <Flex flexDirection={'column'}>
                          <Text fontSize={'14px'} color={'#18181B'} lineHeight={'20px'}>{item.originImageName}</Text>
                          <Text fontSize={'12px'} color={'#71717A'}>{123}</Text>
                        </Flex>
                      </Flex>
                    ))
                  }
                </Flex> */}
                <Divider />
                <Popover placement="bottom-start">
                  <PopoverTrigger>
                    <Flex alignItems={'center'} gap={'4px'} cursor={'pointer'}>
                      <Text color={'#71717A'} fontSize={'14px'} fontWeight={500}>
                        {t('shareTemplate')}
                      </Text>
                      <MyIcon w={'16px'} h={'16px'} name="share" fill={'none'} />
                    </Flex>
                  </PopoverTrigger>
                  <PopoverContent w={'240px'} autoFocus={false}>
                    <PopoverBody p={'16px'} gap={'12px'} display={'flex'} flexDirection={'column'}>
                      <Flex
                        gap={'12px'}
                        alignItems={'center'}
                        cursor={'pointer'}
                        onClick={() => copyData(shareLink.link)}
                      >
                        <Center
                          w={'36px'}
                          h={'36px'}
                          borderRadius={'6px'}
                          border={'1px solid #E4E4E7'}
                        >
                          <MyIcon w={'16px'} h={'16px'} name="link" fill={'none'} />
                        </Center>
                        <Text color={'#18181B'} fontSize={'14px'}>
                          {t('shareTemplate')}
                        </Text>
                      </Flex>
                      <Divider />
                      <Text color={'#71717A'} fontSize={'12px'} fontWeight={500}>
                        {t('clickDeploy')}
                      </Text>
                      <Flex
                        gap={'12px'}
                        alignItems={'center'}
                        cursor={'pointer'}
                        onClick={() => copyData(shareLink.html)}
                      >
                        <Center
                          w={'36px'}
                          h={'36px'}
                          borderRadius={'6px'}
                          border={'1px solid #E4E4E7'}
                        >
                          <HtmlIcon w={'16px'} h={'16px'} fill={'none'} color={'#737373'} />
                        </Center>
                        <Text color={'#18181B'} fontSize={'14px'}>
                          {t('htmlSnippet')}
                        </Text>
                      </Flex>
                      <Flex
                        gap={'12px'}
                        alignItems={'center'}
                        cursor={'pointer'}
                        onClick={() => copyData(shareLink.markdown)}
                      >
                        <Center
                          w={'36px'}
                          h={'36px'}
                          borderRadius={'6px'}
                          border={'1px solid #E4E4E7'}
                        >
                          <MyIcon
                            w={'16px'}
                            h={'16px'}
                            name="markdown"
                            fill={'none'}
                            color={'#737373'}
                          />
                        </Center>
                        <Text color={'#18181B'} fontSize={'14px'}>
                          {t('markdownSnippet')}
                        </Text>
                      </Flex>
                      <Divider />
                      <Text color={'#71717A'} fontSize={'12px'} fontWeight={500}>
                        {t('buttonAppearance')}
                      </Text>
                      <Image src={'/images/buttonAppearance.png'} alt="" width={208} height={135} />
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </Flex>
              <Box w={'804px'} border={'1px solid #E4E4E7'} borderRadius={'16px'} p={'24px'}>
                {readmeContent ? (
                  <ReadMe
                    py={'0px'}
                    px={'0px'}
                    key={readUrl}
                    readUrl={readUrl}
                    readmeContent={readmeContent}
                  />
                ) : null}
              </Box>
            </Flex>
            <Flex p={'80px 120px'} bg={'#F6F7F9'} flexDirection={'column'}>
              <Text fontWeight={600} fontSize={'24px'} lineHeight={'32px'}>
                {t('submitTemplate')}
              </Text>
              <Text fontSize={'14px'} w={'560px'} lineHeight={'20px'} mt={'12px'} mb={'24px'}>
                {t('submitTemplateDesc')}
              </Text>
              <Track.Click eventName={Track.events.appstoreAppsSubmit}>
                <Button
                  w={'fit-content'}
                  onClick={() => {
                    window.open('https://github.com/ClawCloud/Run-Template', '_blank');
                  }}
                >
                  {t('develop.Submit Template')}
                </Button>
              </Track.Click>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <ConfirmChild />
      <ConfirmChild2 />
      <Loading />
      {!!errorMessage && (
        <ErrorModal title={applyError} content={errorMessage} onClose={() => setErrorMessage('')} />
      )}
    </Box>
  );
}

export async function getServerSideProps(content: any) {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME;
  const forcedLanguage = process.env.FORCED_LANGUAGE;
  const local =
    forcedLanguage ||
    content?.req?.cookies?.NEXT_LOCALE ||
    compareFirstLanguages(content?.req?.headers?.['accept-language'] || 'en');

  content?.res.setHeader(
    'Set-Cookie',
    `NEXT_LOCALE=${local}; Max-Age=2592000; Secure; SameSite=None`
  );

  const appName = content?.query?.templateName || '';

  const baseurl = `http://${process.env.HOSTNAME || 'localhost'}:${process.env.PORT || 3000}`;

  let metaData = {
    title: `${appName}-ClawCloud`,
    keywords: '',
    description: ''
  };
  let readmeContent = '';
  let readUrl = '';
  let images: string[] = [];
  try {
    const templateSource: { data: TemplateSourceType } = await (
      await fetch(`${baseurl}/api/getTemplateSource?templateName=${appName}`)
    ).json();
    const templateDetail = templateSource?.data.templateYaml;

    metaData = {
      title: templateDetail?.spec?.title,
      keywords: templateDetail?.spec?.description,
      description: templateDetail?.spec?.description
    };
    images = templateDetail?.spec?.images ?? [];

    const readme = templateDetail?.spec?.i18n?.[local]?.readme ?? templateDetail?.spec?.readme;
    readUrl = readme;
    readmeContent = await (await fetch(readme)).text();
  } catch (error) {}

  return {
    props: {
      appName,
      metaData,
      brandName,
      readmeContent,
      readUrl,
      images,
      ...(await serviceSideProps(content))
    }
  };
}
