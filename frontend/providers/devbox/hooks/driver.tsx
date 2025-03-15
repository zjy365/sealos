import { useGuideStore } from '@/stores/guide';
import { Flex, Text, Box, Center, Image } from '@chakra-ui/react';
import { driver } from '@sealos/driver';
import { Config } from '@sealos/driver/src/config';

let currentDriver: any = null;

export function startDriver(config: Config, openDesktopApp?: any) {
  if (currentDriver) {
    currentDriver.destroy();
    currentDriver = null;
  }

  const driverObj = driver(config);

  currentDriver = driverObj;

  driverObj.drive();
  driverObj.refresh();

  return driverObj;
}

export const createAppDriverObj = (openDesktopApp?: any): Config => ({
  showProgress: true,
  allowClose: false,
  allowClickMaskNextStep: false,
  isShowButtons: false,
  allowKeyboardControl: false,
  disableActiveInteraction: false,
  overlayColor: 'transparent',

  steps: [
    {
      element: '.list-create-app-button',
      popover: {
        side: 'left',
        align: 'start',
        borderRadius: '12px 12px 12px 12px',
        PopoverBody: (
          <Box
            width={'250px'}
            bg={'rgba(28, 46, 245, 0.9)'}
            p={'12px'}
            borderRadius={'12px'}
            color={'#fff'}
          >
            <Flex alignItems={'center'} justifyContent={'space-between'}>
              <Text color={'#fff'} fontSize={'14px'} fontWeight={600}>
                Create Devbox
              </Text>
              <Text color={'grayModern.900'} fontSize={'13px'} fontWeight={500}>
                2/8
              </Text>
            </Flex>
            <Text mt={'8px'} color={'#FFFFFFCC'} fontSize={'14px'} fontWeight={400}>
              Create a new devbox from templates or scratch
            </Text>
            <Center
              color={'#fff'}
              fontSize={'14px'}
              fontWeight={500}
              cursor={'pointer'}
              mt={'16px'}
              borderRadius={'8px'}
              background={'rgba(255, 255, 255, 0.20)'}
              w={'fit-content'}
              h={'32px'}
              p={'8px'}
              onClick={() => {
                startDriver(quitGuideDriverObj);
              }}
            >
              Quit Guide
            </Center>
          </Box>
        )
      }
    }
  ],
  onHighlightStarted: (element) => {
    const el = element as any;
    if (el) {
      //       保存原始样式以便稍后恢复
      el._originalBorderRadius = el.style.borderRadius;
      el._originalBorder = el.style.border;
      // 应用新的边框样式
      el.style.borderRadius = '8px';
      el.style.border = '1.5px solid #1C4EF5'; // 使用蓝色 #1C4EF5

      el.addEventListener(
        'click',
        () => {
          if (currentDriver) {
            currentDriver.destroy();
            currentDriver = null;
          }
        },
        { once: true }
      );
    }
  },
  onDeselected: (element?: Element) => {
    if (element) {
      const el = element as any;
      el.style.borderRadius = el._originalBorderRadius || '';
      el.style.border = el._originalBorder || '';
    }
  },
  onDestroyed: () => {
    useGuideStore.getState().setCreateCompleted(true);
    currentDriver = null;
  }
});

export const guideDriverObj2 = (openDesktopApp?: any): Config => ({
  showProgress: true,
  allowClose: false,
  allowClickMaskNextStep: false,
  isShowButtons: false,
  allowKeyboardControl: false,
  disableActiveInteraction: false,
  overlayColor: 'transparent',

  steps: [
    {
      element: '.guide-app-button',
      popover: {
        side: 'left',
        align: 'start',
        borderRadius: '12px 12px 12px 12px',
        PopoverBody: (
          <Box
            width={'250px'}
            bg={'rgba(28, 46, 245, 0.9)'}
            p={'12px'}
            borderRadius={'12px'}
            color={'#fff'}
          >
            <Flex alignItems={'center'} justifyContent={'space-between'}>
              <Text color={'#fff'} fontSize={'14px'} fontWeight={600}>
                Configure Devbox
              </Text>
              <Text color={'grayModern.900'} fontSize={'13px'} fontWeight={500}>
                3/8
              </Text>
            </Flex>
            <Text mt={'8px'} color={'#FFFFFFCC'} fontSize={'14px'} fontWeight={400}>
              Select your environment settings, and adjust CPU & memory as needed
            </Text>
            <Center
              color={'#fff'}
              fontSize={'14px'}
              fontWeight={500}
              cursor={'pointer'}
              mt={'16px'}
              borderRadius={'8px'}
              background={'rgba(255, 255, 255, 0.20)'}
              w={'fit-content'}
              h={'32px'}
              p={'8px'}
              onClick={() => {
                startDriver(quitGuideDriverObj);
              }}
            >
              Quit Guide
            </Center>
          </Box>
        )
      }
    }
  ],
  onHighlightStarted: (element) => {
    const el = element as any;
    if (el) {
      // 保存原始样式以便稍后恢复
      el._originalBorderRadius = el.style.borderRadius;
      el._originalBorder = el.style.border;
      // 应用新的边框样式
      el.style.borderRadius = '8px';
      el.style.border = '1.5px solid #1C4EF5'; // 使用蓝色 #1C4EF5

      el.addEventListener(
        'click',
        () => {
          if (currentDriver) {
            currentDriver.destroy();
            currentDriver = null;
          }
        },
        { once: true }
      );
    }
  },
  onDeselected: (element?: Element) => {
    if (element) {
      const el = element as any;
      el.style.borderRadius = el._originalBorderRadius || '';
      el.style.border = el._originalBorder || '';
    }
  },
  onDestroyed: () => {}
});

export const guideIDEDriverObj = (openDesktopApp?: any): Config => ({
  showProgress: true,
  allowClose: false,
  allowClickMaskNextStep: false,
  isShowButtons: false,
  allowKeyboardControl: false,
  disableActiveInteraction: false,
  overlayColor: 'transparent',

  steps: [
    {
      element: '.guide-ide',
      popover: {
        side: 'left',
        align: 'start',
        borderRadius: '12px 12px 12px 12px',
        PopoverBody: (
          <Box
            width={'250px'}
            bg={'rgba(28, 46, 245, 0.9)'}
            p={'12px'}
            borderRadius={'12px'}
            color={'#fff'}
          >
            <Flex alignItems={'center'} justifyContent={'space-between'}>
              <Text color={'#fff'} fontSize={'14px'} fontWeight={600}>
                Code in IDE
              </Text>
              <Text color={'grayModern.900'} fontSize={'13px'} fontWeight={500}>
                4/8
              </Text>
            </Flex>
            <Text mt={'8px'} color={'#FFFFFFCC'} fontSize={'14px'} fontWeight={400}>
              Choose your preferred IDE and start coding
            </Text>
            <Center
              color={'#fff'}
              fontSize={'14px'}
              fontWeight={500}
              cursor={'pointer'}
              mt={'16px'}
              borderRadius={'8px'}
              background={'rgba(255, 255, 255, 0.20)'}
              w={'fit-content'}
              h={'32px'}
              p={'8px'}
              onClick={() => {
                startDriver(quitGuideDriverObj);
              }}
            >
              Quit Guide
            </Center>
          </Box>
        )
      }
    }
  ],
  onHighlightStarted: (element) => {
    const el = element as any;
    if (el) {
      //       保存原始样式以便稍后恢复
      el._originalBorderRadius = el.style.borderRadius;
      el._originalBorder = el.style.border;
      // 应用新的边框样式
      el.style.borderRadius = '8px';
      el.style.border = '1.5px solid #1C4EF5'; // 使用蓝色 #1C4EF5

      el.addEventListener(
        'click',
        () => {
          if (currentDriver) {
            currentDriver.destroy();
            currentDriver = null;
          }
        },
        { once: true }
      );
    }
  },
  onDeselected: (element?: Element) => {
    if (element) {
      const el = element as any;
      el.style.borderRadius = el._originalBorderRadius || '';
      el.style.border = el._originalBorder || '';
    }
  },
  onDestroyed: () => {
    useGuideStore.getState().setIdeCompleted(true);
  }
});

export const listDriverObj = (openDesktopApp?: any): Config => ({
  showProgress: true,
  allowClose: false,
  allowClickMaskNextStep: false,
  isShowButtons: false,
  allowKeyboardControl: false,
  disableActiveInteraction: false,
  overlayColor: 'transparent',

  steps: [
    {
      element: '#guide-list',
      popover: {
        side: 'bottom',
        align: 'start',
        borderRadius: '12px 12px 12px 12px',

        PopoverBody: (
          <Box
            width={'250px'}
            bg={'rgba(28, 46, 245, 0.9)'}
            p={'12px'}
            borderRadius={'12px'}
            color={'#fff'}
          >
            <Flex alignItems={'center'} justifyContent={'space-between'}>
              <Text color={'#fff'} fontSize={'14px'} fontWeight={600}>
                Manage and deploy
              </Text>
              <Text color={'grayModern.900'} fontSize={'13px'} fontWeight={500}>
                5/8
              </Text>
            </Flex>
            <Text mt={'8px'} color={'#FFFFFFCC'} fontSize={'14px'} fontWeight={400}>
              View details and launch the application to production environment
            </Text>
            <Center
              color={'#fff'}
              fontSize={'14px'}
              fontWeight={500}
              cursor={'pointer'}
              mt={'16px'}
              borderRadius={'8px'}
              background={'rgba(255, 255, 255, 0.20)'}
              w={'fit-content'}
              h={'32px'}
              p={'8px'}
              onClick={() => {
                startDriver(quitGuideDriverObj);
              }}
            >
              Quit Guide
            </Center>
          </Box>
        )
      }
    }
  ],
  onHighlightStarted: (element) => {
    const el = element as any;
    if (el) {
      // 保存原始样式以便稍后恢复

      el._originalBorderRadius = el.style.borderRadius;
      el._originalBorder = el.style.border;
      // 应用新的边框样式
      el.style.borderRadius = '8px';
      el.style.border = '1.5px solid #1C4EF5'; // 使用蓝色 #1C4EF5

      el.addEventListener(
        'click',
        () => {
          if (currentDriver) {
            currentDriver.destroy();
            currentDriver = null;
          }
        },
        { once: true }
      );
    }
  },
  onDeselected: (element?: Element) => {
    if (element) {
      const el = element as any;
      el.style.borderRadius = el._originalBorderRadius || '';
      el.style.border = el._originalBorder || '';
    }
  },
  onDestroyed: () => {}
});

export const releaseDriverObj = (openDesktopApp?: any): Config => ({
  showProgress: true,
  allowClose: false,
  allowClickMaskNextStep: false,
  isShowButtons: false,
  allowKeyboardControl: false,
  disableActiveInteraction: false,
  overlayColor: 'transparent',

  steps: [
    {
      element: '.guide-release-button',
      popover: {
        side: 'left',
        align: 'start',
        borderRadius: '12px 12px 12px 12px',
        PopoverBody: (
          <Box
            width={'250px'}
            bg={'rgba(28, 46, 245, 0.9)'}
            p={'12px'}
            borderRadius={'12px'}
            color={'#fff'}
          >
            <Flex alignItems={'center'} justifyContent={'space-between'}>
              <Text color={'#fff'} fontSize={'14px'} fontWeight={600}>
                Manage and deploy
              </Text>
              <Text color={'grayModern.900'} fontSize={'13px'} fontWeight={500}>
                6/8
              </Text>
            </Flex>
            <Text mt={'8px'} color={'#FFFFFFCC'} fontSize={'14px'} fontWeight={400}>
              Click &apos;Release&apos; to prepare your application for deployment
            </Text>
            <Center
              color={'#fff'}
              fontSize={'14px'}
              fontWeight={500}
              cursor={'pointer'}
              mt={'16px'}
              borderRadius={'8px'}
              background={'rgba(255, 255, 255, 0.20)'}
              w={'fit-content'}
              h={'32px'}
              p={'8px'}
              onClick={() => {
                startDriver(quitGuideDriverObj);
              }}
            >
              Quit Guide
            </Center>
          </Box>
        )
      }
    }
  ],
  onHighlightStarted: (element) => {
    const el = element as any;
    if (el) {
      // 保存原始样式以便稍后恢复
      el._originalBorderRadius = el.style.borderRadius;
      el._originalBorder = el.style.border;
      // 应用新的边框样式
      el.style.borderRadius = '8px';
      el.style.border = '1.5px solid #1C4EF5'; // 使用蓝色 #1C4EF5

      el.addEventListener(
        'click',
        (e: any) => {
          if (currentDriver) {
            currentDriver.destroy();
            currentDriver = null;
          }
        },
        { once: true }
      );
    }
  },
  onDeselected: (element?: Element) => {
    if (element) {
      const el = element as any;
      el.style.borderRadius = el._originalBorderRadius || '';
      el.style.border = el._originalBorder || '';
    }
  },
  onDestroyed: () => {
    useGuideStore.getState().setReleaseCompleted(true);
  }
});

export const releaseVersionDriverObj = (openDesktopApp?: any): Config => ({
  showProgress: true,
  allowClose: false,
  allowClickMaskNextStep: true,
  isShowButtons: false,
  allowKeyboardControl: false,
  disableActiveInteraction: false,
  overlayColor: 'transparent',

  steps: [
    {
      element: '#release-button',
      popover: {
        side: 'top',
        align: 'start',
        borderRadius: '12px 12px 12px 12px',
        PopoverBody: (
          <Box
            width={'250px'}
            bg={'rgba(28, 46, 245, 0.9)'}
            p={'12px'}
            borderRadius={'12px'}
            color={'#fff'}
          >
            <Flex alignItems={'center'} justifyContent={'space-between'}>
              <Text color={'#fff'} fontSize={'14px'} fontWeight={600}>
                Manage and deploy
              </Text>
              <Text color={'grayModern.900'} fontSize={'13px'} fontWeight={500}>
                7/8
              </Text>
            </Flex>
            <Text mt={'8px'} color={'#FFFFFFCC'} fontSize={'14px'} fontWeight={400}>
              Click &quot;Release&quot; to deploy your application
            </Text>
            <Center
              color={'#fff'}
              fontSize={'14px'}
              fontWeight={500}
              cursor={'pointer'}
              mt={'16px'}
              borderRadius={'8px'}
              background={'rgba(255, 255, 255, 0.20)'}
              w={'fit-content'}
              h={'32px'}
              p={'8px'}
              onClick={() => {
                startDriver(quitGuideDriverObj);
              }}
            >
              Quit Guide
            </Center>
          </Box>
        )
      }
    }
  ],
  onHighlightStarted: (element) => {
    const el = element as any;
    if (el) {
      // 保存原始样式以便稍后恢复
      el._originalBorderRadius = el.style.borderRadius;
      el._originalBorder = el.style.border;
      // 应用新的边框样式
      el.style.borderRadius = '8px';
      el.style.border = '1.5px solid #1C4EF5'; // 使用蓝色 #1C4EF5

      el.addEventListener(
        'click',
        (e: any) => {
          if (currentDriver) {
            currentDriver.destroy();
            currentDriver = null;
          }
        },
        { once: true }
      );
    }
  },
  onDeselected: (element?: Element) => {
    if (element) {
      const el = element as any;
      el.style.borderRadius = el._originalBorderRadius || '';
      el.style.border = el._originalBorder || '';
    }
  },
  onDestroyed: () => {
    useGuideStore.getState().setReleaseVersionCompleted(true);
  }
});

export const deployDriverObj = (openDesktopApp?: any): Config => ({
  showProgress: true,
  allowClose: false,
  allowClickMaskNextStep: true,
  isShowButtons: false,
  allowKeyboardControl: false,
  disableActiveInteraction: false,
  overlayColor: 'transparent',

  steps: [
    {
      element: '#guide-online-button',
      popover: {
        side: 'top',
        align: 'start',
        borderRadius: '12px 12px 12px 12px',
        PopoverBody: (
          <Box
            width={'250px'}
            bg={'rgba(28, 46, 245, 0.9)'}
            p={'12px'}
            borderRadius={'12px'}
            color={'#fff'}
          >
            <Flex alignItems={'center'} justifyContent={'space-between'}>
              <Text color={'#fff'} fontSize={'14px'} fontWeight={600}>
                Manage and deploy
              </Text>
              <Text color={'grayModern.900'} fontSize={'13px'} fontWeight={500}>
                8/8
              </Text>
            </Flex>
            <Text mt={'8px'} color={'#FFFFFFCC'} fontSize={'14px'} fontWeight={400}>
              Click &quot;Deploy&quot; to launch the application to production
            </Text>
            <Center
              color={'#fff'}
              fontSize={'14px'}
              fontWeight={500}
              cursor={'pointer'}
              mt={'16px'}
              borderRadius={'8px'}
              background={'rgba(255, 255, 255, 0.20)'}
              w={'fit-content'}
              h={'32px'}
              p={'8px'}
              onClick={() => {
                startDriver(quitGuideDriverObj);
              }}
            >
              Quit Guide
            </Center>
          </Box>
        )
      }
    }
  ],
  onHighlightStarted: (element) => {
    const el = element as any;
    if (el) {
      // 保存原始样式以便稍后恢复
      el._originalBorderRadius = el.style.borderRadius;
      el._originalBorder = el.style.border;
      // 应用新的边框样式
      el.style.borderRadius = '8px';
      el.style.border = '1.5px solid #1C4EF5'; // 使用蓝色 #1C4EF5

      el.addEventListener(
        'click',
        (e: any) => {
          if (currentDriver) {
            currentDriver.destroy();
            currentDriver = null;
          }
        },
        { once: true }
      );
    }
  },
  onDeselected: (element?: Element) => {
    if (element) {
      const el = element as any;
      el.style.borderRadius = el._originalBorderRadius || '';
      el.style.border = el._originalBorder || '';
    }
  },
  onDestroyed: () => {
    startDriver(quitGuideDriverObj);
  }
});

export const quitGuideDriverObj: Config = {
  showProgress: false,
  allowClose: false,
  allowClickMaskNextStep: true,
  isShowButtons: false,
  allowKeyboardControl: false,
  disableActiveInteraction: true,
  overlayColor: 'transparent',

  steps: [
    {
      popover: {
        side: 'bottom',
        align: 'end',
        PopoverBody: (
          <Box
            color={'black'}
            borderRadius={'20px'}
            bg={'#FFF'}
            boxShadow={
              '0px 16px 48px -5px rgba(0, 0, 0, 0.12), 0px 8px 12px -5px rgba(0, 0, 0, 0.08)'
            }
            p={'4px'}
            w={'460px'}
          >
            <Box w={'100%'} border={'1px solid #B0CBFF'} borderRadius={'16px'}>
              <Box px={'24px'}>
                <Text mt={'32px'} color={'#000'} fontSize={'20px'} fontWeight={600}>
                  We’re still here!
                </Text>
                <Text mt={'8px'} color={'#404040'} fontSize={'14px'} fontWeight={400}>
                  You can always find your way back to this guide in the top navigation bar. Happy
                  exploring!
                </Text>
                <Image mt={'20px'} src={'/guide-image.png'} alt="guide" />
              </Box>

              <Center
                cursor={'pointer'}
                mt={'20px'}
                borderTop={'1px solid #E4E4E7'}
                py={'20px'}
                px={'24px'}
                onClick={() => {
                  if (currentDriver) {
                    currentDriver.destroy();
                    currentDriver = null;
                  }
                }}
              >
                Got it
              </Center>
            </Box>
          </Box>
        )
      }
    }
  ],
  onHighlightStarted: (element) => {
    const el = element as any;
    if (el) {
      // 保存原始样式以便稍后恢复
      el._originalBorderRadius = el.style.borderRadius;
      el._originalBorder = el.style.border;
      // 应用新的边框样式
      el.style.borderRadius = '8px';
      el.style.border = '1.5px solid #1C4EF5'; // 使用蓝色 #1C4EF5
    }
  },
  onDeselected: (element?: Element) => {
    if (element) {
      const el = element as any;
      el.style.borderRadius = el._originalBorderRadius || '';
      el.style.border = el._originalBorder || '';
    }
  },
  onDestroyed: () => {
    console.log('onDestroyed quitGuideDriverObj');
    useGuideStore.getState().resetGuideState(true);
  }
};
