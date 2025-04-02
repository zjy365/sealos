import { bucketConfigQueryParam, TBucket } from '@/consts';
import { Text, HStack, StackProps, ButtonGroup, Button, Flex } from '@chakra-ui/react';
import { useOssStore } from '@/store/ossStore';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import EditIcon from '../Icons/EditIcon';
import DeleteBucketModal from '../common/modal/DeleteBucketModal';
import AuthorityTips from '../common/AuthorityTip';
import MoreMenu from '../common/MoreMenu';

export default function BucketHeader({ ...styles }: StackProps) {
  const bucket = useOssStore((s) => s.currentBucket);
  const router = useRouter();
  const { t } = useTranslation('common');
  if (!bucket) return <></>;
  return (
    <Flex h={'48px'} justify={'space-between'} wrap={'wrap'} w="full" {...styles}>
      <Flex h={'28px'} alignItems={'center'} gap={'10px'}>
        <AuthorityTips authority={bucket.policy} />
        <Text fontSize={'24px'} fontWeight={'500'}>
          {bucket.name}
        </Text>
        <MoreMenu bucket={bucket} />
      </Flex>
      {/* <ButtonGroup variant={'outline'} spacing={'16px'}>
        <Button
          gap="8px"
          px="24px"
          py="10px"
          onClick={() => {
            if (!bucket) return;
            const _params: bucketConfigQueryParam = {
              bucketName: bucket.crName,
              bucketPolicy: bucket.policy
            };
            const params = new URLSearchParams(_params);
            router.push('/bucketConfig?' + params.toString());
          }}
        >
          <EditIcon boxSize={'16px'} fill={'currentcolor'} />
          <Text>{t('edit')}</Text>
        </Button>
        <DeleteBucketModal bucketName={bucket.name} />
      </ButtonGroup> */}
    </Flex>
  );
}
