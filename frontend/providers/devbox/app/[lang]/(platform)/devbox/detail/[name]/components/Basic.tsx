import { useMessage } from '@sealos/ui';
import { useTranslations } from 'next-intl';
import React, { useCallback, useState } from 'react';
import { Box, Text, Flex, Tooltip, Button, Grid, Divider, useDisclosure } from '@chakra-ui/react';

import { useEnvStore } from '@/stores/env';
import { usePriceStore } from '@/stores/price';
import { useDevboxStore } from '@/stores/devbox';
import { getTemplateConfig } from '@/api/template';
import { getSSHConnectionInfo } from '@/api/devbox';
import { downLoadBlob, parseTemplateConfig } from '@/utils/tools';

import MyIcon from '@/components/Icon';
import GPUItem from '@/components/GPUItem';
import { JetBrainsGuideData } from '@/components/IDEButton';
import SshConnectDrawer from './SSHConnectDrawer';

const BasicInfo = () => {
  const t = useTranslations();
  const { message: toast } = useMessage();
  const {
    isOpen: isOpenSSHConnect,
    onOpen: onOpenSSHConnect,
    onClose: onCloseSSHConnect
  } = useDisclosure();

  const { env } = useEnvStore();
  const { devboxDetail } = useDevboxStore();
  const { sourcePrice, setSourcePrice } = usePriceStore();

  const [sshConfigData, setSshConfigData] = useState<JetBrainsGuideData | null>(null);

  const handleOneClickConfig = useCallback(async () => {
    const { base64PrivateKey, userName, token } = await getSSHConnectionInfo({
      devboxName: devboxDetail?.name as string
    });

    const result = await getTemplateConfig(devboxDetail?.templateUid as string);
    const config = parseTemplateConfig(result.template.config);
    console.log('config', config);

    const sshPrivateKey = Buffer.from(base64PrivateKey, 'base64').toString('utf-8');

    if (!devboxDetail?.sshPort) return;

    setSshConfigData({
      devboxName: devboxDetail?.name,
      runtimeType: devboxDetail?.templateRepositoryName,
      privateKey: sshPrivateKey,
      userName,
      token,
      workingDir: config.workingDir,
      host: env.sealosDomain,
      port: devboxDetail?.sshPort.toString(),
      configHost: `${env.sealosDomain}_${env.namespace}_${devboxDetail?.name}`
    });

    onOpenSSHConnect();
  }, [
    devboxDetail?.name,
    devboxDetail?.templateUid,
    devboxDetail?.sshPort,
    devboxDetail?.templateRepositoryName,
    env.sealosDomain,
    env.namespace
  ]);

  const handleCopySSHCommand = useCallback(() => {
    const sshCommand = `ssh -i yourPrivateKeyPath ${devboxDetail?.sshConfig?.sshUser}@${env.sealosDomain} -p ${devboxDetail?.sshPort}`;
    navigator.clipboard.writeText(sshCommand).then(() => {
      toast({
        title: t('copy_success'),
        status: 'success',
        duration: 2000,
        isClosable: true
      });
    });
  }, [devboxDetail?.sshConfig?.sshUser, devboxDetail?.sshPort, env.sealosDomain, toast, t]);

  return (
    <Flex borderRadius="lg" bg={'white'} p={4} flexDirection={'column'} h={'100%'}>
      <Flex mb={3} mt={2} px={4}>
        <Box color={'grayModern.900'} fontSize={'medium'} fontWeight={'bold'}>
          {t('basic_info')}
        </Box>
      </Flex>
      <Grid p={4} borderRadius={'lg'} gap={4} templateColumns={'1fr 1fr'}>
        {/* name */}
        <Flex>
          <Text mr={2} width={'40%'} fontSize={'12px'} color={'grayModern.500'}>
            {t('name')}
          </Text>
          <Flex width={'60%'} color={'grayModern.900'}>
            <Text fontSize={'12px'}>{devboxDetail?.name}</Text>
          </Flex>
        </Flex>
        {/* status */}
        <Flex>
          <Text mr={2} width={'40%'} fontSize={'12px'} color={'grayModern.500'}>
            {t('status')}
          </Text>
          <Flex width={'60%'} color={'grayModern.900'}>
            <Text fontSize={'12px'}>{devboxDetail?.status?.label}</Text>
          </Flex>
        </Flex>
        {/* Image */}
        <Flex>
          <Text mr={2} width={'40%'} fontSize={'12px'} color={'grayModern.500'}>
            {t('image_info')}
          </Text>
          <Flex width={'60%'} color={'grayModern.900'}>
            <Text
              fontSize={'12px'}
              w={'full'}
            >{`${env.registryAddr}/${env.namespace}/${devboxDetail?.name}`}</Text>
          </Flex>
        </Flex>
        {/* Runtime */}
        <Flex>
          <Text mr={2} width={'40%'} fontSize={'12px'} color={'grayModern.500'}>
            {t('start_runtime')}
          </Text>
          <Flex width={'60%'} color={'grayModern.900'}>
            <Text fontSize={'12px'} w={'full'} textOverflow={'ellipsis'}>
              {
                // getRuntimeDetailLabel(devboxDetail?., devboxDetail?.runtimeVersion)
                `${devboxDetail?.templateRepositoryName}-${devboxDetail?.templateName}`
              }
            </Text>
          </Flex>
        </Flex>
        {/* Create At  */}
        <Flex>
          <Text mr={2} width={'40%'} fontSize={'12px'} color={'grayModern.500'}>
            {t('create_time')}
          </Text>
          <Flex width={'60%'} color={'grayModern.900'}>
            <Text fontSize={'12px'}>{devboxDetail?.createTime}</Text>
          </Flex>
        </Flex>
        {/* Start Time */}
        <Flex>
          <Text mr={2} width={'40%'} fontSize={'12px'} color={'grayModern.500'}>
            {t('start_time')}
          </Text>
          <Flex width={'60%'} color={'grayModern.900'}>
            <Text fontSize={'12px'}>{devboxDetail?.upTime}</Text>
          </Flex>
        </Flex>
      </Grid>
      <Divider />
      <Grid p={4} borderRadius={'lg'} gap={4} templateColumns={'1fr 1fr'}>
        {/* CPU Limit */}
        <Flex>
          <Text mr={2} width={'40%'} fontSize={'12px'} color={'grayModern.500'}>
            CPU Limit
          </Text>
          <Flex width={'60%'} color={'grayModern.900'}>
            <Text fontSize={'12px'}>{(devboxDetail?.cpu || 0) / 1000} Core</Text>
          </Flex>
        </Flex>
        {/* Memory Limit */}
        <Flex>
          <Text mr={2} width={'40%'} fontSize={'12px'} color={'grayModern.500'}>
            Memory Limit
          </Text>
          <Flex width={'60%'} color={'grayModern.900'}>
            <Text fontSize={'12px'}>{(devboxDetail?.memory || 0) / 1024} G</Text>
          </Flex>
        </Flex>
        {/* GPU */}
        {sourcePrice?.gpu && (
          <Flex>
            <Text mr={2} width={'40%'} fontSize={'12px'} color={'grayModern.500'}>
              GPU
            </Text>
            <Flex width={'60%'} color={'grayModern.900'}>
              <GPUItem gpu={devboxDetail?.gpu} />
            </Flex>
          </Flex>
        )}
      </Grid>
      <Divider />
      {/* ssh Connection */}
      <Flex p={4} borderRadius={'lg'} gap={4} flexDirection={'column'}>
        <Flex>
          <Text mr={2} width={'40%'} fontSize={'12px'} color={'grayModern.500'}>
            {t('ssh_connect_info')}
          </Text>
          <Flex width={'60%'} color={'grayModern.900'}>
            <Tooltip
              label={t('copy')}
              hasArrow
              bg={'#FFFFFF'}
              color={'grayModern.900'}
              width={'45px'}
              height={'30px'}
              fontSize={'12px'}
              fontWeight={400}
              py={2}
              borderRadius={'md'}
            >
              <Text
                cursor="pointer"
                fontSize={'12px'}
                _hover={{ color: 'blue.500' }}
                onClick={handleCopySSHCommand}
                w={'full'}
              >
                {`ssh -i yourPrivateKeyPath ${devboxDetail?.sshConfig?.sshUser}@${env.sealosDomain} -p ${devboxDetail?.sshPort}`}
              </Text>
            </Tooltip>
          </Flex>
        </Flex>
      </Flex>
      <Flex px={4} alignItems={'center'} justify={'start'} gap={4}>
        <Button
          h={'30px'}
          leftIcon={<MyIcon name="download" w={'16px'} color={'white'} />}
          boxShadow={'none'}
          bg={'white'}
          color={'grayModern.900'}
          border={'1px solid'}
          fontWeight={'normal'}
          borderColor={'grayModern.200'}
          _hover={{
            color: 'brightBlue.600'
          }}
          onClick={() =>
            downLoadBlob(
              devboxDetail?.sshConfig?.sshPrivateKey as string,
              'application/octet-stream',
              `${devboxDetail?.name}`
            )
          }
        >
          {t('private_key')}
        </Button>
        <Button
          h={'30px'}
          leftIcon={<MyIcon name="attention" w={'16px'} color={'white'} />}
          boxShadow={'none'}
          bg={'white'}
          fontWeight={'normal'}
          color={'grayModern.900'}
          border={'1px solid'}
          borderColor={'grayModern.200'}
          _hover={{
            color: 'brightBlue.600'
          }}
          onClick={() => handleOneClickConfig()}
        >
          {t('one_click_config')}
        </Button>
      </Flex>
      {sshConfigData && (
        <SshConnectDrawer
          isOpen={isOpenSSHConnect}
          onOpen={onOpenSSHConnect}
          onClose={onCloseSSHConnect}
          jetbrainsGuideData={sshConfigData}
        />
      )}
    </Flex>
  );
};

export default BasicInfo;
