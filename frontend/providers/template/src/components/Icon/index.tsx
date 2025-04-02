import React from 'react';
import type { IconProps } from '@chakra-ui/react';
import { Icon, others } from '@chakra-ui/react';

const map = {
  more: require('./icons/more.svg').default,
  store: require('./icons/store.svg').default,
  configMap: require('./icons/configMap.svg').default,
  podList: require('./icons/podList.svg').default,
  arrowLeft: require('./icons/arrowLeft.svg').default,
  plus: require('./icons/plus.svg').default,
  delete: require('./icons/delete.svg').default,
  statusicon: require('./icons/statusicon.svg').default,
  restart: require('./icons/restart.svg').default,
  start: require('./icons/start.svg').default,
  pause: require('./icons/pause.svg').default,
  detail: require('./icons/detail.svg').default,
  logo: require('./icons/logo.svg').default,
  change: require('./icons/change.svg').default,
  deployMode: require('./icons/deployMode.svg').default,
  formInfo: require('./icons/formInfo.svg').default,
  network: require('./icons/network.svg').default,
  settings: require('./icons/settings.svg').default,
  edit: require('./icons/edit.svg').default,
  copy: require('./icons/copy.svg').default,
  continue: require('./icons/continue.svg').default,
  appType: require('./icons/appType.svg').default,
  listen: require('./icons/listen.svg').default,
  noEvents: require('./icons/noEvents.svg').default,
  warning: require('./icons/warning.svg').default,
  analyze: require('./icons/analyze.svg').default,
  terminal: require('./icons/terminal.svg').default,
  log: require('./icons/log.svg').default,
  jump: require('./icons/jump.svg').default,
  markdown: require('./icons/markdown.svg').default,
  empty: require('./icons/empty.svg').default,
  dev: require('./icons/dev.svg').default,
  gift: require('./icons/gift.svg').default,
  eyeShow: require('./icons/eyeShow.svg').default,
  tool: require('./icons/tool.svg').default,
  help: require('./icons/help.svg').default,
  polygon: require('./icons/polygon.svg').default,
  usersround: require('./icons/usersround.svg').default,
  arrowLeftLine: require('./icons/arrowLeftLine.svg').default,
  affine: require('./icons/affine.svg').default,
  dify: require('./icons/dify.svg').default,
  wordPress: require('./icons/wordPress.svg').default,
  allapps: require('./icons/allapps.svg').default,
  cronJob: require('./icons/cronJob.svg').default,
  database: require('./icons/database.svg').default,
  devbox: require('./icons/devbox.svg').default,
  kubepanel: require('./icons/kubepanel.svg').default,
  launchpad: require('./icons/launchpad.svg').default,
  oss: require('./icons/oss.svg').default,
  others: require('./icons/others.svg').default,
  dot: require('./icons/dot.svg').default,
  noapp: require('./icons/noapp.svg').default
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
