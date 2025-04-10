'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Box, Grid, useTheme } from '@chakra-ui/react';

import { useRouter } from '@/i18n';
import { obj2Query } from '@/utils/tools';
import { useDevboxStore } from '@/stores/devbox';
import type { DevboxEditTypeV2 } from '@/types/devbox';

import Usage from './Usage';
import Runtime from './Runtime';
import DevboxName from './DevboxName';
import NetworkConfiguration from './Network';

import Tabs from '@/components/Tabs';
import PriceBox from '@/components/PriceBox';

const Form = ({
  pxVal,
  isEdit,
  countGpuInventory
}: {
  pxVal: number;
  isEdit: boolean;
  countGpuInventory: (type: string) => number;
}) => {
  const theme = useTheme();
  const router = useRouter();
  const t = useTranslations();
  const { watch } = useFormContext<DevboxEditTypeV2>();

  const { devboxList } = useDevboxStore();

  const boxStyles = {
    border: theme.borders.base,
    borderRadius: 'lg',
    mb: 4,
    p: 6,
    bg: 'white'
  };

  return (
    <Grid
      height={'100%'}
      templateColumns={'220px 1fr'}
      gridGap={5}
      alignItems={'start'}
      pl={`${pxVal}px`}
    >
      {/* left sidebar */}
      <Box>
        {/* <Tabs
          list={[
            { id: 'form', label: t('config_form') },
            { id: 'yaml', label: t('yaml_file') }
          ]}
          activeId={'form'}
          onChange={() =>
            router.replace(
              `/devbox/create?${obj2Query({
                type: 'yaml'
              })}`
            )
          }
        /> */}
        <Box overflow={'hidden'}>
          <PriceBox
            components={[
              {
                cpu: watch('cpu'),
                memory: watch('memory'),
                nodeports: devboxList.length
              }
            ]}
          />
        </Box>
      </Box>
      {/* right content */}
      <Box
        id={'form-container'}
        pr={`${pxVal}px`}
        height={'100%'}
        position={'relative'}
        overflowY={'scroll'}
      >
        {/* Devbox Name */}
        <Box {...boxStyles}>
          <DevboxName isEdit={isEdit} />
        </Box>
        {/* Runtime */}
        <Box {...boxStyles}>
          <Runtime isEdit={isEdit} />
        </Box>
        {/* Usage */}
        <Box {...boxStyles}>
          <Usage countGpuInventory={countGpuInventory} />
        </Box>
        {/* network */}
        <NetworkConfiguration isEdit={isEdit} id={'network'} {...boxStyles} />
      </Box>
    </Grid>
  );
};

export default Form;
