import {
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  DrawerHeader,
  Flex,
  Text,
  Button,
  Stepper,
  Step,
  StepIndicator,
  StepNumber,
  StepStatus,
  StepSeparator,
  Circle,
  Tabs,
  TabList,
  Divider
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs as MyTabs } from '@sealos/ui';

import Tab from '@/components/Tab';
import MyIcon from '@/components/Icon';
import ScriptCode from '@/components/ScriptCode';
import {
  macosAndLinuxScriptsTemplate,
  sshConfig,
  sshConnectCommand,
  windowsScriptsTemplate
} from '@/constants/scripts';
import { JetBrainsGuideData } from '@/components/IDEButton';
import { downLoadBlob, useCopyData } from '@/utils/tools';

const systemList = ['Windows', 'Mac', 'Linux'];

enum stepEnum {
  OneClick = 'one-click',
  StepByStep = 'step-by-step'
}

const SshConnectDrawer = ({
  isOpen,
  onClose,
  onOpen,
  jetbrainsGuideData
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  jetbrainsGuideData: JetBrainsGuideData;
}) => {
  const t = useTranslations();
  const { copyData } = useCopyData();

  const [activeTab, setActiveTab] = useState(0);
  const [activeStep, setActiveStep] = useState(stepEnum.OneClick);

  useEffect(() => {
    const detectPlatform = () => {
      if (window.navigator.platform) {
        const platform = window.navigator.platform.toLowerCase();
        console.log('platform', platform);
        if (platform.includes('windows')) return 0;
        if (platform.includes('mac')) return 1;
        if (platform.includes('linux')) return 2;
      }

      const userAgent = window.navigator.userAgent.toLowerCase();
      console.log('userAgent', userAgent);
      if (userAgent.includes('win')) return 0;
      if (userAgent.includes('mac')) return 1;
      if (userAgent.includes('linux')) return 2;

      return 0;
    };

    setActiveTab(detectPlatform());
  }, []);

  const script = useMemo(() => {
    if (activeTab === 0) {
      return {
        platform: 'Windows',
        script: windowsScriptsTemplate(
          jetbrainsGuideData.privateKey,
          jetbrainsGuideData.configHost,
          jetbrainsGuideData.host,
          jetbrainsGuideData.port,
          jetbrainsGuideData.userName
        )
      };
    } else if (activeTab === 1) {
      return {
        platform: 'Mac',
        script: macosAndLinuxScriptsTemplate(
          jetbrainsGuideData.privateKey,
          jetbrainsGuideData.configHost,
          jetbrainsGuideData.host,
          jetbrainsGuideData.port,
          jetbrainsGuideData.userName
        )
      };
    } else {
      return {
        platform: 'Linux',
        script: macosAndLinuxScriptsTemplate(
          jetbrainsGuideData.privateKey,
          jetbrainsGuideData.configHost,
          jetbrainsGuideData.host,
          jetbrainsGuideData.port,
          jetbrainsGuideData.userName
        )
      };
    }
  }, [activeTab, jetbrainsGuideData]);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" closeOnOverlayClick>
      <DrawerOverlay />
      <DrawerContent
        maxWidth={'500px'}
        overflow={'hidden'}
        minH={'785px'}
        my={'32px'}
        mr={'32px'}
        borderRadius={'16px'}
        position={'relative'}
      >
        <DrawerHeader pl={6}>{t('jetbrains_guide_config_ssh')}</DrawerHeader>
        <DrawerBody
          pb={6}
          px={0}
          borderTopWidth={1}
          bg={'#F8F8F9'}
          sx={{
            '&::-webkit-scrollbar': {
              display: 'none'
            }
          }}
        >
          <Tabs
            onChange={(index) => setActiveTab(index)}
            my={4}
            colorScheme={'blackAlpha'}
            defaultIndex={activeTab}
          >
            <TabList>
              {systemList.map((item) => (
                <Tab key={item}>{item}</Tab>
              ))}
            </TabList>
          </Tabs>

          <MyTabs
            my={8}
            mx={4}
            w={'300px'}
            borderWidth={0}
            bg={'#ECECED'}
            fontWeight={400}
            list={[
              { id: stepEnum.OneClick, label: t('jetbrains_guide_one_click_setup') },
              { id: stepEnum.StepByStep, label: t('jetbrains_guide_step_by_step') }
            ]}
            activeId={activeStep}
            onChange={(step) => setActiveStep(step as stepEnum)}
          />
          {/* one-click */}
          {activeStep === stepEnum.OneClick && (
            <Box w={'100%'} px={4}>
              <Stepper orientation="vertical" index={-1} mt={3} gap={0}>
                {/* 1 */}
                <Box w={'100%'}>
                  <Step>
                    <StepIndicator backgroundColor={'#E5E5E5'} borderColor={'#E5E5E5'}>
                      <StepStatus incomplete={<StepNumber />} />
                    </StepIndicator>
                    <Flex
                      flexDirection={'column'}
                      gap={6}
                      mt={1}
                      ml={2}
                      mb={5}
                      maxW={'calc(100% - 48px)'}
                    >
                      {/* Run Script */}
                      <Box>
                        <Text fontSize={'14px'} color={'grayModern.900'} fontWeight={'600'}>
                          {t('jetbrains_guide_run_script')}
                        </Text>
                      </Box>
                      <Flex
                        borderRadius={'8px'}
                        p={2}
                        gap={2}
                        h={'96px'}
                        boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.05)'}
                        borderWidth={1}
                        bg={'white'}
                        borderColor={'grayModern.200'}
                        flexDirection={'column'}
                        alignItems={'center'}
                        justifyContent={'center'}
                        _hover={{
                          bg: 'grayModern.50'
                        }}
                        cursor={'pointer'}
                        onClick={() => {
                          if (script.platform === 'Windows') {
                            downLoadBlob(
                              script.script,
                              'text/plain',
                              `ssh-config-${jetbrainsGuideData.devboxName}.ps1`
                            );
                          } else {
                            downLoadBlob(
                              script.script,
                              'text/plain',
                              `ssh-config-${jetbrainsGuideData.devboxName}.sh`
                            );
                          }
                        }}
                      >
                        <MyIcon name="download" color={'white'} w={'24px'} h={'24px'} />
                        <Text fontSize={'14px'} color={'grayModern.900'} fontWeight={'500'}>
                          {t('jetbrains_guide_click_to_download')}
                        </Text>
                      </Flex>
                      <Box
                        fontSize={'14px'}
                        color={'grayModern.900'}
                        fontWeight={400}
                        lineHeight={'20px'}
                      >
                        {script.platform === 'Windows'
                          ? t.rich('jetbrains_guide_one_click_setup_desc_windows', {
                              blue: (chunks) => (
                                <Text
                                  fontWeight={'bold'}
                                  display={'inline-block'}
                                  color={'brightBlue.600'}
                                >
                                  {chunks}
                                </Text>
                              )
                            })
                          : t.rich('jetbrains_guide_one_click_setup_desc', {
                              blue: (chunks) => (
                                <Text
                                  fontWeight={'bold'}
                                  display={'inline-block'}
                                  color={'brightBlue.600'}
                                >
                                  {chunks}
                                </Text>
                              )
                            })}
                      </Box>
                      <Box
                        fontSize={'14px'}
                        color={'grayModern.900'}
                        fontWeight={400}
                        lineHeight={'20px'}
                      >
                        {t.rich('jetbrains_guide_one_click_setup_desc_2', {
                          lightColor: (chunks) => (
                            <Text color={'grayModern.600'} display={'inline-block'}>
                              {chunks}
                            </Text>
                          )
                        })}
                      </Box>
                      <ScriptCode platform={script.platform} script={script.script} />
                    </Flex>
                    <StepSeparator />
                  </Step>
                </Box>
                {/* 2 */}
                <Box w={'100%'}>
                  <Step>
                    <StepIndicator backgroundColor={'#E5E5E5'} borderColor={'#E5E5E5'}>
                      <StepStatus incomplete={<StepNumber />} />
                    </StepIndicator>
                    <Flex mt={1} ml={2} mb={5} flexDirection={'column'} gap={6} flex={1}>
                      <Box>
                        <Text fontSize={'14px'} color={'grayModern.900'} fontWeight={'600'}>
                          {t('jetbrains_guide_verify_connection')}
                        </Text>
                      </Box>
                      <ScriptCode
                        oneLine={true}
                        defaultOpen={true}
                        platform={script.platform}
                        script={sshConnectCommand(jetbrainsGuideData.configHost)}
                      />
                      <Box fontSize={'14px'}>{t('jetbrains_guide_command')}</Box>
                    </Flex>
                    <StepSeparator />
                  </Step>
                </Box>
              </Stepper>
              <Divider my={4} />
              <Box position={'relative'} w={'100%'} h={'30px'} mt={8}>
                <Button
                  w={'100px'}
                  bg={'white'}
                  ml={'20px'}
                  borderWidth={1}
                  borderRadius={'6px'}
                  color={'grayModern.900'}
                  size={'sm'}
                  px={1}
                  borderColor={'grayModern.200'}
                  _hover={{
                    bg: 'grayModern.50'
                  }}
                  boxShadow={'none'}
                  onClick={() => onClose()}
                  h={'36px'}
                >
                  {t('cancel')}
                </Button>
              </Box>
            </Box>
          )}
          {/* step-by-step */}
          {activeStep === stepEnum.StepByStep && (
            <Box w={'100%'} px={4}>
              <Stepper orientation="vertical" index={-1} mt={3} gap={0} position={'relative'}>
                {/* 1 */}
                <Box w={'100%'}>
                  <Step>
                    <StepIndicator backgroundColor={'#E5E5E5'} borderColor={'#E5E5E5'}>
                      <StepStatus incomplete={<StepNumber />} />
                    </StepIndicator>
                    <Box mt={1} ml={2} mb={5} flex={1}>
                      <Box fontSize={'14px'} mb={3}>
                        {t.rich('jetbrains_guide_download_private_key', {
                          blue: (chunks) => (
                            <Text
                              fontWeight={'bold'}
                              display={'inline-block'}
                              color={'brightBlue.600'}
                            >
                              {chunks}
                            </Text>
                          )
                        })}
                      </Box>
                      <Button
                        leftIcon={<MyIcon name="download" w={'16px'} color={'white'} />}
                        bg={'white'}
                        color={'grayModern.600'}
                        borderRadius={'5px'}
                        borderWidth={1}
                        py={4}
                        size={'sm'}
                        _hover={{
                          color: 'brightBlue.600',
                          '& svg': {
                            color: 'brightBlue.600'
                          }
                        }}
                        onClick={() => {
                          downLoadBlob(
                            jetbrainsGuideData.privateKey,
                            'application/octet-stream',
                            `${jetbrainsGuideData.configHost}`
                          );
                        }}
                      >
                        {t('download_private_key')}
                      </Button>
                    </Box>
                    <StepSeparator />
                  </Step>
                </Box>
                {/* 2 */}
                <Box w={'100%'}>
                  <Step>
                    <StepIndicator backgroundColor={'#E5E5E5'} borderColor={'#E5E5E5'}>
                      <StepStatus incomplete={<StepNumber />} />
                    </StepIndicator>
                    <Flex mt={1} ml={2} mb={5} flex={1} h={'40px'}>
                      <Box fontSize={'14px'}>
                        {t.rich('jetbrains_guide_move_to_path', {
                          blue: (chunks) => (
                            <Text
                              fontWeight={'bold'}
                              display={'inline-block'}
                              color={'brightBlue.600'}
                            >
                              {chunks}
                            </Text>
                          )
                        })}
                      </Box>
                      <Box
                        color={'grayModern.900'}
                        _hover={{
                          color: 'brightBlue.600',
                          '& svg': {
                            color: 'brightBlue.600'
                          }
                        }}
                        cursor={'pointer'}
                        ml={2}
                        position={'absolute'}
                        left={'40'}
                        top={'7'}
                      >
                        <MyIcon
                          name="copy"
                          color={'grayModern.500'}
                          w={'16px'}
                          onClick={() => copyData('~/.ssh/sealos')}
                        />
                      </Box>
                    </Flex>
                    <StepSeparator />
                  </Step>
                </Box>
                {/* 3 */}
                <Box w={'100%'}>
                  <Step>
                    <StepIndicator backgroundColor={'#E5E5E5'} borderColor={'#E5E5E5'}>
                      <StepStatus incomplete={<StepNumber />} />
                    </StepIndicator>
                    <Flex mt={1} ml={2} mb={5} flexDirection={'column'} gap={4} flex={1} w={'80%'}>
                      <Box fontSize={'14px'}>
                        {t.rich('jetbrains_guide_modified_file', {
                          blue: (chunks) => (
                            <Text fontWeight={'bold'} color={'brightBlue.600'} display={'inline'}>
                              {chunks}
                            </Text>
                          )
                        })}
                      </Box>
                      <ScriptCode
                        platform={script.platform}
                        defaultOpen
                        script={sshConfig(
                          jetbrainsGuideData.configHost,
                          jetbrainsGuideData.host,
                          jetbrainsGuideData.port,
                          jetbrainsGuideData.userName
                        )}
                      />
                    </Flex>
                    <StepSeparator />
                  </Step>
                </Box>
                {/* 4 */}
                <Box w={'100%'}>
                  <Step>
                    <StepIndicator backgroundColor={'#E5E5E5'} borderColor={'#E5E5E5'}>
                      <StepStatus incomplete={<StepNumber />} />
                    </StepIndicator>
                    <Flex mt={1} ml={2} mb={5} flexDirection={'column'} gap={4} flex={1}>
                      <Box fontSize={'14px'}>{t('jetbrains_guide_command')}</Box>
                      <ScriptCode
                        oneLine
                        defaultOpen
                        platform={script.platform}
                        script={sshConnectCommand(jetbrainsGuideData.configHost)}
                      />
                    </Flex>
                    <StepSeparator />
                  </Step>
                </Box>
              </Stepper>
              <Divider my={4} />
              <Box position={'relative'} w={'100%'} h={'30px'} mt={8}>
                <Button
                  w={'100px'}
                  bg={'white'}
                  ml={'20px'}
                  borderWidth={1}
                  borderRadius={'6px'}
                  color={'grayModern.900'}
                  size={'sm'}
                  px={1}
                  borderColor={'grayModern.200'}
                  _hover={{
                    bg: 'grayModern.50'
                  }}
                  boxShadow={'none'}
                  onClick={() => onClose()}
                  h={'36px'}
                >
                  {t('cancel')}
                </Button>
              </Box>
            </Box>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default SshConnectDrawer;
