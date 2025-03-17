import { Flex, Text, Box } from '@chakra-ui/react';
import { type ReactNode } from 'react';
import MyIcon from '../Icon';

export default function Alert({
  type,
  text,
  children,
  ...props
}: { type: 'warn' | 'error'; text: 'string'; children?: ReactNode } & any) {
  return (
    <Flex
      {...props}
      borderRadius={'xl'}
      border={'1px solid'}
      borderColor={type === 'warn' ? '#FB923C' : '#DC2626'}
      color={type === 'warn' ? '#FB923C' : '#DC2626'}
      shadow={'0px 1px 2px 0px #0000000D'}
      bg={type === 'warn' ? '#FFF7ED' : '#FEF2F2'}
      alignItems={'center'}
      justifyContent={'space-between'}
      h={'56px'}
    >
      <Flex p={'18px 16px'} gap={'12px'} alignItems={'center'}>
        <MyIcon
          color={type === 'warn' ? '#FB923C' : '#DC2626'}
          name="warningInfo"
          h={'20px'}
          w={'20px'}
        ></MyIcon>
        <Text fontSize={'14px'} fontWeight={'20px'}>
          {text}
        </Text>
      </Flex>
      <Box h={'full'} p={'10px'}>
        {children}
      </Box>
    </Flex>
  );
}
