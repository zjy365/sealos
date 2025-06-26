import GpuSelector from './components/GpuSelector';
import CpuSelector from './components/CpuSelector';
import MemorySelector from './components/MemorySelector';
import { Box, Button, Flex, getToken, Text } from '@chakra-ui/react';
import Label from './Label';
import { useTranslations } from 'next-intl';
import { useForm, useFormContext } from 'react-hook-form';
import { useMemo } from 'react';
import { LockIcon, LockKeyholeIcon } from 'lucide-react';
import { sealosApp } from 'sealos-desktop-sdk/app';
import { getUserSession } from '@/utils/user';
import { useUserStore } from '@/stores/user';
import { DevboxEditTypeV2 } from '@/types/devbox';

export default function Usage({
  countGpuInventory
}: {
  countGpuInventory: (type: string) => number;
}) {
  const t = useTranslations();
  const { watch, getValues } = useFormContext<DevboxEditTypeV2>();
  const { userQuota, checkQuotaAllow } = useUserStore();

  const cpuVal = watch('cpu');
  const memoryVal = watch('memory');
  const planName = getUserSession()?.user?.subscription?.subscriptionPlan?.name || 'Free';

  const portInfos = watch('networks');
  const exceedLimit = useMemo(() => {
    const nodeports = portInfos.filter((info) => !!info.port).length + 1;
    const result = checkQuotaAllow({
      ...getValues(),
      nodeports
    });
    return !!result;
  }, [cpuVal, memoryVal, portInfos]);

  return (
    <>
      <Box mb={'15px'}>
        <Label w={100}>{t('usage')}</Label>
        <Text color={'#71717A'} py={'8px'}>
          {`Max Available Resources for ${planName} plan: ${
            userQuota.find((q) => q.type === 'cpu')?.limit || 0
          } vCPU, ${userQuota.find((q) => q.type === 'memory')?.limit || 0} GB RAM`}
        </Text>
      </Box>
      <GpuSelector countGpuInventory={countGpuInventory} />
      <CpuSelector />
      <MemorySelector mb={'24px'} />
      {exceedLimit && (
        <Flex
          justifyContent="space-between"
          alignItems="center"
          padding="12px"
          mt={'64px'}
          gap="12px"
          width="full"
          bgGradient="linear(270.48deg, rgba(39, 120, 253, 0.1) 3.93%, rgba(39, 120, 253, 0.1) 18.25%, rgba(135, 161, 255, 0.1) 80.66%)"
          borderRadius="8px"
        >
          <Flex gap={'8px'} align={'center'}>
            <LockKeyholeIcon size={'16px'} color="#3E6FF4"></LockKeyholeIcon>
            <Text bgClip={'text'} bgGradient={'linear-gradient(180deg, #3E6FF4 0%, #0E4BF1 100%)'}>
              Upgrade your plan to unlock higher usage capacity
            </Text>
          </Flex>
          <Button
            variant={'unstyled'}
            onClick={() => {
              sealosApp.runEvents('openDesktopApp', {
                appKey: 'system-account-center',
                pathname: '/',
                query: {
                  scene: 'upgrade'
                }
              });
            }}
            bgGradient="linear(to-b, #3E6FF4 0%, #0E4BF1 100%)"
            bgClip="text"
          >
            Upgrade Now
          </Button>
        </Flex>
      )}
    </>
  );
}
