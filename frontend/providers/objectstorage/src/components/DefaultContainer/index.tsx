import { Text, Stack, StackProps, Button, Box, Center, Flex } from '@chakra-ui/react';
import MyIcon from '@/components/Icon';
import CreateBucketModal from '@/components/common/modal/CreateBucketModal';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
export default function DefaultContainer({ ...styles }: StackProps) {
  const { t } = useTranslation('bucket');
  return (
    <Stack position={'relative'} gap={'0'} align={'center'} {...styles}>
      <Flex width={'750px'} height={'380px'} justifyContent={'center'} alignItems={'flex-end'}>
        <Center position={'absolute'} top={0}>
          <Image src={'/images/emptyBucket.png'} alt="" width={750} height={380} />
        </Center>
        <Flex flexDirection={'column'} alignItems={'center'}>
          <Text fontSize={'18px'} lineHeight={'28px'} fontWeight={600}>
            {t('noBucketTitle')}
          </Text>
          <Text mb="32px" color={'grayModern.600'} fontSize={'14px'}>
            {t('noBucketDesc')}
          </Text>
          <CreateBucketModal px={'13.5px'} py={'10px'} mb={'32px'} buttonType={'max'} />
        </Flex>
      </Flex>
    </Stack>
  );
}
