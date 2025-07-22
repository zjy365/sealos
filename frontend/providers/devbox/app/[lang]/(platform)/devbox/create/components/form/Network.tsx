import {
  Box,
  BoxProps,
  Button,
  ButtonProps,
  Flex,
  IconButton,
  Input,
  Switch,
  useTheme,
  Text,
  Divider
} from '@chakra-ui/react';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MySelect, useMessage } from '@sealos/ui';
import { useFieldArray, useFormContext } from 'react-hook-form';

import MyIcon from '@/components/Icon';
import { nanoid } from '@/utils/tools';
import { useEnvStore } from '@/stores/env';
import { ProtocolList } from '@/constants/devbox';
import { DevboxEditTypeV2 } from '@/types/devbox';

import Label from './Label';

export type CustomAccessModalParams = {
  publicDomain: string;
  customDomain: string;
};

const CustomAccessModal = dynamic(() => import('@/components/modals/CustomAccessModal'));

const AppendNetworksButton = (props: ButtonProps) => {
  const t = useTranslations();
  return (
    <Button
      boxShadow={'none'}
      w={'110px'}
      h={'40px'}
      variant={'outline'}
      fontWeight={'normal'}
      color={'grayModern.900'}
      leftIcon={<MyIcon name="plus" w={'18px'} fill={'#485264'} />}
      {...props}
    >
      {t('Add Port')}
    </Button>
  );
};
export default function NetworkConfiguration({ isEdit, ...props }: BoxProps & { isEdit: boolean }) {
  const { register, getValues, control } = useFormContext<DevboxEditTypeV2>();
  const theme = useTheme();
  const [customAccessModalData, setCustomAccessModalData] = useState<CustomAccessModalParams>();
  const { env } = useEnvStore();
  const {
    fields: networks,
    update: updateNetworks,
    append: _appendNetworks,
    remove: removeNetworks
  } = useFieldArray({
    control,
    name: 'networks'
  });
  const t = useTranslations();
  const { message: toast } = useMessage();
  const appendNetworks = () => {
    _appendNetworks({
      networkName: '',
      portName: nanoid(),
      port: 8080,
      protocol: 'HTTP',
      openPublicDomain: false,
      publicDomain: '',
      customDomain: ''
    });
  };
  return (
    <>
      <Box id={'baseInfo'} {...props}>
        <Flex h={'40px'} alignItems={'center'} w={'full'} mb={'8px'}>
          <Label w={180}>{t('network_settings')}</Label>
          {/* <Box
            fontSize={'12px'}
            color={'#2563EB'}
            fontWeight={'500'}
            borderRadius={'100px'}
            bg="#EFF6FF"
            py={'5px'}
            px={'10px'}
            w={'95px'}
            h={'28px'}
          >
            $0.008/each
          </Box> */}
        </Flex>
        <Text fontSize={'14px'} color={'#71717A'}>
          {t('SSH Port Tips')}
        </Text>
        <Box pt={'24px'} userSelect={'none'}>
          <Box>
            <Flex
              className="guide-network-configuration"
              alignItems={'flex-start'}
              _notFirst={{ pt: 6 }}
            >
              <Box>
                <Box
                  mb={'10px'}
                  h={'20px'}
                  fontSize={'base'}
                  color={'grayModern.900'}
                  fontWeight={'bold'}
                >
                  {t('SSH Port')}
                </Box>
                <Input
                  h={'40px'}
                  type={'number'}
                  w={'110px'}
                  bg={'white'}
                  value={22}
                  readOnly
                  isDisabled
                />
              </Box>
              <Box mx={7}>
                <Box
                  mb={'8px'}
                  h={'20px'}
                  fontSize={'base'}
                  color={'grayModern.900'}
                  fontWeight={'bold'}
                >
                  {t('SSH Connection')}
                </Box>
                <Flex alignItems={'center'} h={'40px'}>
                  <Switch
                    className="driver-deploy-network-switch"
                    size={'lg'}
                    isChecked={true}
                    isDisabled
                    readOnly
                  />
                  <Text fontSize={'14px'} ml={2} color={'#71717A'}>
                    {t('enabled')}
                  </Text>
                </Flex>
              </Box>
              <Box flex={'1 0 0'}>
                <Box mb={'8px'} h={'20px'}></Box>
                <Flex alignItems={'center'} h={'40px'}>
                  <MySelect
                    width={'100px'}
                    height={'40px'}
                    bg={'white'}
                    borderTopRightRadius={0}
                    boxShadow={'none'}
                    borderBottomRightRadius={0}
                    color={'black'}
                    value={'ssh://'}
                    // border={theme.borders.base}
                    isDisabled
                    list={ProtocolList}
                  />
                  <Flex
                    bg={'white'}
                    maxW={'350px'}
                    flex={'1 0 0'}
                    alignItems={'center'}
                    h={'40px'}
                    px={2}
                    border={theme.borders.base}
                    borderLeft={0}
                    borderTopRightRadius={'md'}
                    borderBottomRightRadius={'md'}
                  >
                    <Box
                      flex={1}
                      userSelect={'all'}
                      className="textEllipsis"
                      color={'#71717A'}
                      p={'0 8px'}
                      isTruncated
                    >
                      {`devbox.${env.ingressDomain}`}
                    </Box>
                  </Flex>
                </Flex>
              </Box>
              <Box ml={'12px'}>
                <Box mb={'8px'} h={'20px'}></Box>
                <IconButton
                  height={'40px'}
                  width={'40px'}
                  boxShadow={'none'}
                  aria-label={'button'}
                  variant={''}
                  isDisabled
                  bg={'#FFF'}
                  _hover={{
                    color: 'red.600',
                    bg: 'rgba(17, 24, 36, 0.05)'
                  }}
                  icon={<Trash2 size={16} color={'#737373'} />}
                />
              </Box>
            </Flex>
            <Divider my={'16px'} />
          </Box>
          {networks.length === 0 && <AppendNetworksButton onClick={() => appendNetworks()} />}
          {networks.map((network, i) => (
            <Box key={network.id}>
              <Flex
                className="guide-network-configuration"
                alignItems={'flex-start'}
                _notFirst={{ pt: 6 }}
              >
                <Box>
                  <Box
                    mb={'10px'}
                    h={'20px'}
                    fontSize={'base'}
                    color={'grayModern.900'}
                    fontWeight={'bold'}
                  >
                    {t('Container Port')}
                  </Box>
                  <Input
                    h={'40px'}
                    type={'number'}
                    w={'110px'}
                    bg={'white'}
                    {...register(`networks.${i}.port`, {
                      valueAsNumber: true,
                      min: {
                        value: 1,
                        message: t('The minimum exposed port is 1')
                      },
                      max: {
                        value: 65535,
                        message: t('The maximum number of exposed ports is 65535')
                      },
                      validate: {
                        repeatPort: (value) => {
                          const ports = getValues('networks').map((network, index) => ({
                            port: network.port,
                            index
                          }));
                          // 排除当前正在编辑的端口
                          const isDuplicate = ports.some(
                            (item) => item.port === value && item.index !== i
                          );
                          return !isDuplicate || t('The port number cannot be repeated');
                        }
                      }
                    })}
                  />
                </Box>
                <Box mx={7}>
                  <Box
                    mb={'8px'}
                    h={'20px'}
                    fontSize={'base'}
                    color={'grayModern.900'}
                    fontWeight={'bold'}
                  >
                    {t('Open Public Access')}
                  </Box>
                  <Flex alignItems={'center'} h={'40px'}>
                    <Switch
                      className="driver-deploy-network-switch"
                      size={'lg'}
                      id={`openPublicDomain-${i}`}
                      isChecked={!!network.openPublicDomain}
                      onChange={(e) => {
                        const devboxName = getValues('name');
                        if (!devboxName) {
                          toast({
                            title: t('Please enter the devbox name first'),
                            status: 'warning'
                          });
                          return;
                        }
                        updateNetworks(i, {
                          ...getValues('networks')[i],
                          networkName: network.networkName || `${devboxName}-${nanoid()}`,
                          protocol: network.protocol || 'HTTP',
                          openPublicDomain: e.target.checked,
                          publicDomain: network.publicDomain || `${nanoid()}.${env.ingressDomain}`
                        });
                      }}
                    />
                    {network.openPublicDomain ? (
                      <Text fontSize={'14px'} ml={2}>
                        {t('enabled')}
                      </Text>
                    ) : (
                      <Text fontSize={'14px'} ml={2} color={'#71717A'}>
                        {t('disabled')}
                      </Text>
                    )}
                  </Flex>
                </Box>
                {network.openPublicDomain && (
                  <>
                    <Box flex={'1 0 0'}>
                      <Box mb={'8px'} h={'20px'}></Box>
                      <Flex alignItems={'center'} h={'40px'}>
                        <MySelect
                          width={'100px'}
                          height={'40px'}
                          bg={'white'}
                          borderTopRightRadius={0}
                          boxShadow={'none'}
                          borderBottomRightRadius={0}
                          color={'black'}
                          value={network.protocol}
                          // border={theme.borders.base}
                          list={ProtocolList}
                          onchange={(val: any) => {
                            updateNetworks(i, {
                              ...getValues('networks')[i],
                              protocol: val
                            });
                          }}
                        />
                        <Flex
                          bg={'white'}
                          maxW={'350px'}
                          flex={'1 0 0'}
                          alignItems={'center'}
                          h={'40px'}
                          px={2}
                          border={theme.borders.base}
                          borderLeft={0}
                          borderTopRightRadius={'md'}
                          borderBottomRightRadius={'md'}
                        >
                          <Box
                            flex={1}
                            userSelect={'all'}
                            className="textEllipsis"
                            color={'#71717A'}
                            p={'0 8px'}
                            isTruncated
                          >
                            {network.customDomain ? network.customDomain : network.publicDomain!}
                          </Box>
                          <Box
                            fontSize={'14px'}
                            color={'#224EF5'}
                            cursor={'pointer'}
                            whiteSpace={'nowrap'}
                            onClick={() =>
                              setCustomAccessModalData({
                                publicDomain: network.publicDomain!,
                                customDomain: network.customDomain!
                              })
                            }
                          >
                            {t('Custom Domain')}
                          </Box>
                        </Flex>
                      </Flex>
                    </Box>
                  </>
                )}
                {networks.length >= 1 && (
                  <Box ml={'12px'}>
                    <Box mb={'8px'} h={'20px'}></Box>
                    <IconButton
                      height={'40px'}
                      width={'40px'}
                      boxShadow={'none'}
                      aria-label={'button'}
                      variant={'ghost'}
                      bg={'#FFF'}
                      _hover={{
                        color: 'red.600',
                        bg: 'rgba(17, 24, 36, 0.05)'
                      }}
                      icon={<Trash2 size={16} color={'#737373'} />}
                      onClick={() => removeNetworks(i)}
                    />
                  </Box>
                )}
              </Flex>
              <Divider my={'16px'} />
              {i === networks.length - 1 && networks.length < 5 && (
                <Box mt={3}>
                  <AppendNetworksButton onClick={() => appendNetworks()} />
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
      {!!customAccessModalData && (
        <CustomAccessModal
          {...customAccessModalData}
          onClose={() => setCustomAccessModalData(undefined)}
          onSuccess={(e) => {
            const i = networks.findIndex(
              (item) => item.publicDomain === customAccessModalData.publicDomain
            );
            if (i === -1) return;
            updateNetworks(i, {
              ...networks[i],
              customDomain: e
            });
            setCustomAccessModalData(undefined);
          }}
        />
      )}
    </>
  );
}
