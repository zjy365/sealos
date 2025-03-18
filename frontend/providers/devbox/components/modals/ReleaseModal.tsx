import {
  Box,
  Button,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  VStack
} from '@chakra-ui/react';
import { useMessage } from '@sealos/ui';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useEnvStore } from '@/stores/env';
import { versionSchema } from '@/utils/vaildate';
import { DevboxListItemTypeV2 } from '@/types/devbox';
import { pauseDevbox, releaseDevbox, startDevbox } from '@/api/devbox';
import { TagCheckbox } from '@/app/[lang]/(platform)/template/TagCheckbox';
import { startDriver, startGuide7 } from '@/hooks/driver';
import { useGuideStore } from '@/stores/guide';

const ReleaseModal = ({
  onClose,
  onSuccess,
  devbox,
  isOpen
}: {
  devbox: Omit<DevboxListItemTypeV2, 'template'>;
  onClose: () => void;
  onSuccess: () => void;
  isOpen: boolean;
}) => {
  const t = useTranslations();
  const { message: toast } = useMessage();

  const { env } = useEnvStore();

  const [tag, setTag] = useState('1.0.0');
  const [loading, setLoading] = useState(false);
  const [tagError, setTagError] = useState(false);
  const [releaseDes, setReleaseDes] = useState('');
  const [enableRestartMachine, setEnableRestartMachine] = useState(true);

  const handleSubmit = () => {
    if (!tag) {
      setTagError(true);
    } else if (versionSchema.safeParse(tag).success === false) {
      toast({
        title: t('tag_format_error'),
        status: 'error'
      });
    } else {
      setTagError(false);
      handleReleaseDevbox(enableRestartMachine);
    }
  };

  const handleReleaseDevbox = useCallback(
    async (enableRestartMachine: boolean) => {
      try {
        setLoading(true);
        // 1.pause devbox
        if (devbox.status.value === 'Running') {
          await pauseDevbox({ devboxName: devbox.name });
          // wait 3s
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
        // 2.release devbox
        await releaseDevbox({
          devboxName: devbox.name,
          tag,
          releaseDes,
          devboxUid: devbox.id
        });
        // 3.start devbox
        if (enableRestartMachine) {
          await startDevbox({ devboxName: devbox.name });
        }
        toast({
          title: t('submit_release_successful'),
          status: 'success'
        });
        onSuccess();
        onClose();
      } catch (error: any) {
        toast({
          title: typeof error === 'string' ? error : error.message || t('submit_release_failed'),
          status: 'error'
        });
        console.error(error);
      }
      setLoading(false);
    },
    [devbox.status.value, devbox.name, devbox.id, tag, releaseDes, toast, t, onSuccess, onClose]
  );

  const { guideRelease } = useGuideStore();
  useEffect(() => {
    if (!guideRelease && isOpen) {
      // 创建一个函数来检查元素
      const checkAndStartGuide = () => {
        const releaseButton = document.getElementById('release-button');

        if (releaseButton) {
          console.log('Release button found, starting guide');
          startDriver(startGuide7());
          return true;
        }
        return false;
      };

      // 先检查一次
      if (checkAndStartGuide()) return;

      // 如果没找到，设置观察器
      const observer = new MutationObserver((mutations, obs) => {
        if (checkAndStartGuide()) {
          // 如果找到并启动了引导，停止观察
          obs.disconnect();
        }
      });

      // 开始观察 DOM 变化
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // 清理函数
      return () => {
        observer.disconnect();
      };
    }
  }, [guideRelease, isOpen]);

  return (
    <Box>
      <Modal isOpen={isOpen} onClose={onClose} lockFocusAcrossFrames={false}>
        <ModalOverlay />
        <ModalContent minW={'450px'} mt={'100px'} minH={'300px'} my={'auto'}>
          <ModalHeader
            bgColor={'white'}
            px={'24px'}
            pt={'24px'}
            border={'none'}
            pb={0}
            fontSize={'20px'}
          >
            {t('release_version')}
          </ModalHeader>
          <ModalCloseButton
            top={'16px'}
            right={'16px'}
            boxSize={'16px'}
            _hover={{
              bgColor: 'none'
            }}
            _focus={{
              bgColor: 'none'
            }}
          />
          <ModalBody px="24px" gap={'16px'} py={'16px'} display={'flex'} flexDirection={'column'}>
            <VStack
              width={'full'}
              gap={'8px'}
              alignItems={'flex-start'}
              bg={'#EFF6FF'}
              p={'16px'}
              borderRadius={'md'}
            >
              <Box color="#18181B">{t('release_confirm_info')}</Box>
              <Divider />
              <TagCheckbox
                isChecked={enableRestartMachine}
                spacing={4}
                onChange={(e) => setEnableRestartMachine(e.target.checked)}
                p={'2'}
                borderRadius={'md'}
              >
                {t('pause_devbox_info')}
              </TagCheckbox>
            </VStack>
            <VStack width={'full'} gap={'8px'} alignItems={'flex-start'}>
              <Box w={'110px'} color="#18181B" fontWeight={500}>
                {t('image_name')}
              </Box>
              <Input
                height={'40px'}
                width={'full'}
                bgColor={'white'}
                _placeholder={{ color: 'rgba(113, 113, 122, 1)' }}
                border="1px solid var(--base-input, #E4E4E7)"
                defaultValue={`${env.registryAddr}/${env.namespace}/${devbox.name}`}
                isReadOnly
              />
            </VStack>
            <VStack width={'full'} gap={'8px'} alignItems={'flex-start'}>
              <Box w={'100px'} color="#18181B" fontWeight={500}>
                {t('version_number')}
              </Box>
              <Input
                placeholder={t('enter_version_number')}
                value={tag}
                height={'40px'}
                w={'full'}
                onChange={(e) => setTag(e.target.value)}
                bgColor={'white'}
                _placeholder={{ color: 'rgba(113, 113, 122, 1)' }}
                border="1px solid var(--base-input, #E4E4E7)"
                borderColor={tagError ? 'red.500' : undefined}
              />

              {tagError && (
                <Box color="red.500" fontSize="sm">
                  {t('tag_required')}
                </Box>
              )}
            </VStack>
            <VStack width={'full'} gap={'8px'} alignItems={'flex-start'}>
              <Box w={'100px'} color="#18181B" fontWeight={500}>
                {t('version_description')}
              </Box>
              <Textarea
                value={releaseDes}
                minH={'150px'}
                bgColor={'white'}
                _placeholder={{ color: 'rgba(113, 113, 122, 1)' }}
                border="1px solid var(--base-input, #E4E4E7)"
                onChange={(e) => setReleaseDes(e.target.value)}
                placeholder={t('enter_version_description')}
              />
            </VStack>
            {/* </Flex> */}
          </ModalBody>
          <ModalFooter px={'24px'} pb={'24px'}>
            <Button
              id="release-button"
              variant={'solid'}
              onClick={handleSubmit}
              mr={'auto'}
              ml="0"
              px={'10px'}
              py={'16px'}
              width={'80px'}
              isLoading={loading}
            >
              {t('release')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ReleaseModal;
