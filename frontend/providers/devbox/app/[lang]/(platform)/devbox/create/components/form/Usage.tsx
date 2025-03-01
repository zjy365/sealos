import GpuSelector from './components/GpuSelector';
import CpuSelector from './components/CpuSelector';
import MemorySelector from './components/MemorySelector';

export default function Usage({
  countGpuInventory
}: {
  countGpuInventory: (type: string) => number;
}) {
  return (
    <>
      <GpuSelector countGpuInventory={countGpuInventory} />
      <CpuSelector />
      <MemorySelector />
    </>
  );
}
