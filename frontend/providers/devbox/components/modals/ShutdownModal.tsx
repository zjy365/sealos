import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup
} from '@chakra-ui/react';
import { useMessage } from '@sealos/ui';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { shutdownDevbox } from '@/api/devbox';
import { DevboxDetailTypeV2, DevboxListItemTypeV2, ShutdownModeType } from '@/types/devbox';
import MyIcon from '../Icon';
import { YamlKindEnum } from '@/constants/devbox';
import { updateDevbox } from '@/api/devbox';

const ReleaseModal = ({
  onSuccess,
  onClose,
  devbox
}: {
  onSuccess: () => void;
  onClose: () => void;
  devbox: DevboxListItemTypeV2 | DevboxDetailTypeV2;
}) => {
  const t = useTranslations();
  const { message: toast } = useMessage();
  const [loading, setLoading] = useState(false);
  const [shutdownMode, setShutdownMode] = useState<ShutdownModeType>('Stopped');

  const handleShutdown = useCallback(async () => {
    try {
      setLoading(true);
      const shutdownPromise = shutdownDevbox({ devboxName: devbox.name, shutdownMode });
      const updatePromise = updateDevbox({
        patch: [{
          type: 'delete',
          kind: YamlKindEnum.DevBoxSchedule,
          name: `${devbox.name}-schedule-pause`
        }],
        devboxName: devbox.name
      });
      await Promise.all([shutdownPromise, updatePromise]);
      toast({
        title: t('pause_success'),
        status: 'success'
      });
    } catch (error: any) {
      toast({
        title: typeof error === 'string' ? error : error.message || t('pause_error'),
        status: 'error'
      });
      console.error(error);
    }
    onSuccess();
    setLoading(false);
  }, [onSuccess, setLoading, t, toast, devbox.name, shutdownMode]);

  return (
    <Box>
      <Modal isOpen onClose={onClose} lockFocusAcrossFrames={false}>
        <ModalOverlay />
        <ModalContent minW={'500px'} mt={'100px'} minH={'300px'} top={'50px'}>
          <ModalHeader>
            <Flex alignItems={'center'} gap={'10px'} ml={'14px'} fontSize={'16px'}>
              {t('choose_shutdown_mode')}
            </Flex>
          </ModalHeader>
          <ModalCloseButton top={'10px'} right={'10px'} />
          <ModalBody pb={4}>
            <RadioGroup
              onChange={(value) => setShutdownMode(value as ShutdownModeType)}
              value={shutdownMode}
            >
              {/* normal mode */}
              <Box
                onClick={() => setShutdownMode('Stopped')}
                p={'12px'}
                borderRadius={'7px'}
                borderWidth={1}
                borderColor={shutdownMode === 'Stopped' ? 'brightBlue.500' : 'gray.300'}
                boxShadow={
                  shutdownMode === 'Stopped' ? '0px 0px 0px 2.4px rgba(33, 155, 244, 0.15)' : 'none'
                }
                mb={'16px'}
              >
                <Radio value="Stopped">
                  <Box fontSize={'14px'} fontWeight={500} color={'grayModern.900'}>
                    {t('normal_shutdown_mode')}
                  </Box>
                </Radio>
                <Box fontSize={'12px'} fontWeight={400} color={'grayModern.600'} pl={'20px'}>
                  <Flex alignItems={'start'} gap={'6px'} mb={'2px'}>
                    <MyIcon
                      name="ellipseFull"
                      color={'grayModern.300'}
                      w={'6px'}
                      h={'6px'}
                      mt={'6px'}
                    />
                    <Box>
                      {t.rich('normal_shutdown_mode_desc', {
                        yellow: (chunks) => (
                          <Box as={'span'} color={'yellow.500'} fontWeight={500}>
                            {chunks}
                          </Box>
                        )
                      })}
                    </Box>
                  </Flex>
                  <Flex alignItems={'start'} gap={'6px'}>
                    <MyIcon
                      name="ellipseFull"
                      color={'grayModern.300'}
                      w={'6px'}
                      h={'6px'}
                      mt={'6px'}
                    />
                    <Box>
                      {t.rich('normal_shutdown_mode_desc_2', {
                        yellow: (chunks) => (
                          <Box as={'span'} color={'yellow.500'} fontWeight={500}>
                            {chunks}
                          </Box>
                        )
                      })}
                    </Box>
                  </Flex>
                </Box>
              </Box>

              {/* cold mode */}
              <Box
                onClick={() => setShutdownMode('Shutdown')}
                p={'12px'}
                borderRadius={'7px'}
                borderWidth={1}
                borderColor={shutdownMode === 'Shutdown' ? 'brightBlue.500' : 'gray.300'}
                boxShadow={
                  shutdownMode === 'Shutdown'
                    ? '0px 0px 0px 2.4px rgba(33, 155, 244, 0.15)'
                    : 'none'
                }
              >
                <Radio value="Shutdown">
                  <Box fontSize={'14px'} fontWeight={500} color={'grayModern.900'}>
                    {t('cold_shutdown_mode')}
                  </Box>
                </Radio>
                <Box fontSize={'12px'} fontWeight={400} color={'grayModern.600'} pl={'20px'}>
                  <Flex alignItems={'start'} gap={'6px'} mb={'2px'}>
                    <MyIcon
                      name="ellipseFull"
                      color={'grayModern.300'}
                      w={'6px'}
                      h={'6px'}
                      mt={'6px'}
                    />
                    <Box>
                      {t.rich('cold_shutdown_mode_desc', {
                        yellow: (chunks) => (
                          <Box as={'span'} color={'yellow.500'} fontWeight={500}>
                            {chunks}
                          </Box>
                        )
                      })}
                    </Box>
                  </Flex>
                  <Flex alignItems={'start'} gap={'6px'}>
                    <MyIcon
                      name="ellipseFull"
                      color={'grayModern.300'}
                      w={'6px'}
                      h={'6px'}
                      mt={'6px'}
                    />
                    <Box>
                      {t.rich('cold_shutdown_mode_desc_2', {
                        yellow: (chunks) => (
                          <Box as={'span'} color={'yellow.500'} fontWeight={500}>
                            {chunks}
                          </Box>
                        )
                      })}
                    </Box>
                  </Flex>
                </Box>
              </Box>
              <Box p={4} bg={'red.100'} borderRadius={'7px'} mt={4} fontSize={'14px'} color={'grayModern.900'}>
                {t('shutdown_schedule_tip')}
              </Box>
            </RadioGroup>
          </ModalBody>
          <ModalFooter>
            <Button
              mt={'10px'}
              variant={'solid'}
              onClick={handleShutdown}
              width={'fit-content'}
              isLoading={loading}
            >
              {t('confirm_shutdown')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ReleaseModal;
