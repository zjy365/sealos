import React from 'react';
import type { IconProps } from '@chakra-ui/react';
import { Icon, others } from '@chakra-ui/react';

const map = {
  emptyBucket: require('./icons/emptyBucket.svg').default,
  loader: require('./icons/loader.svg').default
};

const MyIcon = ({
  name,
  w = 'auto',
  h = 'auto',
  ...props
}: { name: keyof typeof map } & IconProps) => {
  return map[name] ? (
    <Icon as={map[name]} verticalAlign={'text-top'} fill={'currentColor'} w={w} h={h} {...props} />
  ) : null;
};
export type IconType = keyof typeof map;

export default MyIcon;
