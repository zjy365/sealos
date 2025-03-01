import { useMemo } from 'react';
import { CurrencySymbol } from '@sealos/ui';
import { useTranslations } from 'next-intl';
import { Box, Flex, useTheme, Text, Divider } from '@chakra-ui/react';

import { useEnvStore } from '@/stores/env';
import { usePriceStore } from '@/stores/price';

import MyIcon from './Icon';

export const colorMap = {
  cpu: '#33BABB',
  memory: '#36ADEF',
  nodeports: '#8172D8'
};

const PriceBox = ({
  components = []
}: {
  components: {
    cpu: number;
    memory: number;
    nodeports: number;
    gpu?: {
      type: string;
      amount: number;
    };
  }[];
}) => {
  const theme = useTheme();
  const t = useTranslations();
  const { env } = useEnvStore();

  const { sourcePrice } = usePriceStore();

  const priceList: {
    label: string;
    icon: string;
    value: string;
  }[] = useMemo(() => {
    let cp = 0;
    let mp = 0;
    let pp = 0;
    let tp = 0;
    let gp = 0;

    components.forEach(({ cpu, memory, nodeports, gpu }) => {
      cp = (sourcePrice.cpu * cpu * 24) / 1000;
      mp = (sourcePrice.memory * memory * 24) / 1024;
      pp = sourcePrice.nodeports * nodeports * 24;

      gp = (() => {
        if (!gpu || !gpu.amount) return 0;
        const item = sourcePrice?.gpu?.find((item) => item.type === gpu.type);
        if (!item) return 0;
        return +(item.price * gpu.amount * 24);
      })();

      tp = cp + mp + pp + gp;
    });

    return [
      {
        label: 'cpu',
        icon: 'cpu',
        value: cp.toFixed(2)
      },
      { label: 'memory', icon: 'memory', value: mp.toFixed(2) },
      {
        label: 'port',
        icon: 'port',
        value: pp.toFixed(2)
      },
      ...(sourcePrice?.gpu ? [{ label: 'GPU', icon: 'gpu', value: gp.toFixed(2) }] : []),
      { label: 'total_price', icon: '', value: tp.toFixed(2) }
    ];
  }, [components, sourcePrice.cpu, sourcePrice.memory, sourcePrice.nodeports, sourcePrice.gpu]);

  return (
    <Box bg={'#FFF'} borderRadius={'base'} className="guide-cost" border={theme.borders.base}>
      <Flex py={3} px={'20px'} borderBottom={theme.borders.base} gap={'8px'} bg={'#FAFAFA'}>
        <Text color={'grayModern.900'} fontWeight={500}>
          {t('estimated_price')}
        </Text>
      </Flex>
      <Flex flexDirection={'column'}>
        {priceList.map((item) => (
          <Flex
            key={item?.label}
            alignItems={'center'}
            justifyContent={'space-between'}
            px={'20px'}
            py={'12px'}
            borderBottom={item.label === 'total_price' ? 'none' : theme.borders.base}
          >
            <Flex alignItems={'center'} gap={'8px'}>
              <MyIcon name={item?.icon as any} color={'white'} />
              <Box flex={'0 0 90px'}>{t(item?.label)}</Box>
            </Flex>
            <Flex
              alignItems={'center'}
              gap={'4px'}
              color={item.label === 'total_price' ? '#1C4EF5' : 'neutral.600'}
            >
              <CurrencySymbol type={env.currencySymbol} />
              {item.value}
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};

export default PriceBox;
