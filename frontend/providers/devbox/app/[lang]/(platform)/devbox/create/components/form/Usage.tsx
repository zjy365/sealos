import GpuSelector from './components/GpuSelector';
import CpuSelector from './components/CpuSelector';
import MemorySelector from './components/MemorySelector';
import { Box, Flex } from '@chakra-ui/react';
import Label from './Label';
import { useTranslations } from 'next-intl';

export default function Usage({
  countGpuInventory
}: {
  countGpuInventory: (type: string) => number;
}) {
  const t = useTranslations();
  return (
    <>
      <Box h={'30px'} mb={'15px'}>
        <Label w={100}>{t('usage')}</Label>
      </Box>
      <GpuSelector countGpuInventory={countGpuInventory} />
      <CpuSelector />
      <MemorySelector />
    </>
  );
}
