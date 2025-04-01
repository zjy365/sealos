import { Authority } from '@/consts';
import { BackgroundProps, ColorProps, Flex } from '@chakra-ui/react';

export default function AuthorityTips({ authority }: { authority: Authority }) {
  const style: Record<Authority, ColorProps & BackgroundProps> = {
    [Authority.readonly]: {
      color: '#18181B',
      bgColor: '#F5F3FF'
    },
    [Authority.private]: {
      color: '#18181B',
      bgColor: '#ECFDF5'
    },
    [Authority.readwrite]: {
      color: '#18181B',
      bgColor: '#EFF6FF'
    }
  };
  return (
    <Flex
      px="12px"
      py="6px"
      borderRadius={'100px'}
      {...style[authority]}
      textTransform={'capitalize'}
      fontSize={'12px'}
      fontWeight={500}
    >
      {authority}
    </Flex>
  );
}
