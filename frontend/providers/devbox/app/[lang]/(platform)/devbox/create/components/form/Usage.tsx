import GpuSelector from './components/GpuSelector';
import CpuSelector from './components/CpuSelector';
import MemorySelector from './components/MemorySelector';
import { Box, Button, Flex, getToken, Text } from '@chakra-ui/react';
import Label from './Label';
import { useTranslations } from 'next-intl';
import { useForm, useFormContext } from 'react-hook-form';
import { useMemo } from 'react';
import { LockIcon } from 'lucide-react';
import { sealosApp } from 'sealos-desktop-sdk/app';
import { getUserSession } from '@/utils/user';
import { PLAN_LIMIT } from '@/constants/account';

export default function Usage({
  countGpuInventory
}: {
  countGpuInventory: (type: string) => number;
}) {
  const t = useTranslations();
  const { watch } = useFormContext();
  const cpuVal = watch('cpu');
  const memoryVal = watch('memory');
  const planName = getUserSession()?.user.subscription.subscriptionPlan.name;
  const exceedLimit = useMemo(() => {
    const limit = PLAN_LIMIT[planName as 'Free'];
    return cpuVal >= limit.cpu * 1000 || memoryVal >= limit.memory * 1024;
  }, [planName, cpuVal, memoryVal]);
  return (
    <>
      <Box h={'40px'} mb={'15px'}>
        <Label w={100}>{t('usage')}</Label>
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
          <Flex gap={'8px'}>
            <LockIcon
              size={'16px'}
              color="linear-gradient(270.48deg, #2778FD 3.93%, #2778FD 18.25%, #829DFE 80.66%);"
            ></LockIcon>
            <Text>Upgrade your plan to unlock higher usage capacity</Text>
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
