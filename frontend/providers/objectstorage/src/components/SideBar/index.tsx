import {
  Text,
  Flex,
  Stack,
  FlexProps,
  Tooltip,
  ColorProps,
  StackProps,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Center,
  StackDivider
} from '@chakra-ui/react';
import RefreshIcon from '@/components/Icons/RefreshIcon';
import BucketIcon from '@/components/Icons/BucketIcon';
import MoreIcon from '@/components/Icons/MoreIcon';
import { Children, ReactNode, useEffect, useMemo, useState } from 'react';
import ParamterModal from '@/components/common/modal/ParamterModal';
import CreateBucketModal from '@/components/common/modal/CreateBucketModal';
import EditIcon from '../Icons/EditIcon';
import { QueryKey, TBucket, bucketConfigQueryParam } from '@/consts';
import AuthorityTips from '../common/AuthorityTip';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getQuota, listBucket } from '@/api/bucket';
import { useRouter } from 'next/router';
import { useOssStore } from '@/store/ossStore';
import { useToast } from '@/hooks/useToast';
import { formatBytes } from '@/utils/tools';
import { useTranslation } from 'next-i18next';
import DeleteBucketModal from '../common/modal/DeleteBucketModal';
import useSessionStore from '@/store/session';
import MoreMenu from '../common/MoreMenu';
import ArrowDownSLineIcon from '../Icons/ArrowDownSLineIcon';
import { Authority } from '@/consts';

function BucketListItem({
  isSelected,
  bucket,
  ...props
}: FlexProps & { isSelected: boolean; bucket: TBucket }) {
  return (
    <Flex
      alignItems={'center'}
      bgColor={isSelected ? '#9699B41A' : ''}
      fontWeight={'500'}
      py="2px"
      px="16px"
      borderRadius={'8px'}
      cursor={'pointer'}
      {...props}
      justifyContent={'space-between'}
    >
      <Flex gap={'6px'} align={'center'}>
        {/* <BucketIcon w="16px" h="16px" color={'brightBlue.600'} /> */}
        <Text fontSize={'14px'} lineHeight={'100%'} color={'#18181B'}>
          {bucket.name}
        </Text>
      </Flex>
      <Flex align={'center'} gap="2px">
        {/* <AuthorityTips authority={bucket.policy} /> */}
        <MoreMenu bucket={bucket} />
      </Flex>
    </Flex>
  );
}
function QuotaProgress({
  children,
  text,
  used,
  limit,
  progressColor,
  ...styles
}: {
  children: ReactNode;
  name: string;
  progressColor: ColorProps['color'];
  text: ReactNode;
  used: number;
  limit: number;
} & FlexProps) {
  return (
    <Tooltip
      bg={'white'}
      hasArrow={true}
      placement="top-end"
      label={text}
      arrowShadowColor={' rgba(0,0,0,0.1)'}
      arrowSize={12}
      offset={[0, 15]}
      px={4}
      py={2}
      borderRadius={'8px'}
    >
      <Flex
        justify={'space-between'}
        align={'center'}
        mb="20px"
        fontSize={'12px'}
        textTransform={'capitalize'}
        {...styles}
      >
        {children}
        <Flex w="160px" h="7px" bg="grayModern.200" borderRadius={'4px'} overflow={'hidden'}>
          <Flex
            borderRadius={'4px'}
            w={Math.floor((used * 100) / limit) + '%'}
            bgColor={progressColor}
          />
        </Flex>
      </Flex>
    </Tooltip>
  );
}
function BucketOverview({ ...styles }: StackProps) {
  const session = useSessionStore((s) => s.session);
  const quotaQuery = useQuery({
    queryKey: [QueryKey.bucketInfo, session],
    queryFn: getQuota
  });
  const { t } = useTranslation('common');
  const limit = quotaQuery.data?.quota.total || 0;
  const used = quotaQuery.data?.quota.used || 0;
  const count = quotaQuery.data?.quota.count || 0;
  return (
    <Stack
      bg={'#EFF6FF'}
      borderRadius={'8px'}
      py={'16px'}
      px={'12px'}
      fontSize={'12px'}
      {...styles}
      color={'#18181B'}
    >
      <Text>{`${t('totalObjects')}: ${count}`}</Text>
      <Text>{`${t('totalSpace')}: ${formatBytes(used).toString()} / ${formatBytes(
        limit
      ).toString()}`}</Text>
      {/* {!quotaQuery.isLoading && ( 
        <QuotaProgress
          name={'storage'}
          limit={limit}
          used={used}
          progressColor={'#8172D899'}
          justifyContent={'space-between'}
          text={
            <Stack color={'grayModern.900'} w="80px">
              <Text>
                {t('total')}: {formatBytes(limit).toString()}
              </Text>
              <Text>
                {t('used')}: {formatBytes(used).toString()}
              </Text>
              <Text>
                {t('remaining')}: {formatBytes(limit - used).toString()}
              </Text>
            </Stack>
          }
        >
          <Text>{t('totalSpace')}:</Text>
        </QuotaProgress>
      )} */}
    </Stack>
  );
}

function BucketCategory({ category, children }: { category: Authority; children?: ReactNode }) {
  const { t } = useTranslation('bucket');
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Flex direction={'column'} gap={'4px'}>
      <Flex
        alignItems={'center'}
        fontWeight={'500'}
        py="6px"
        px="8px"
        cursor={'pointer'}
        gap={'4px'}
        color={'#71717A'}
        onClick={() => setIsOpen(!isOpen)}
      >
        <ArrowDownSLineIcon
          transition={'all 0.1s'}
          transform={isOpen ? '' : 'rotate(-90deg)'}
          w={'14px'}
          h={'16px'}
        ></ArrowDownSLineIcon>
        <Text fontSize={'12px'} lineHeight={'16px'}>
          {category.replace(/^\S/, (s) => s.toUpperCase())}
        </Text>
      </Flex>
      {isOpen && children}
    </Flex>
  );
}

export default function SideBar() {
  const s3client = useOssStore((s) => s.client);
  const session = useSessionStore((s) => s.session);
  const { t } = useTranslation('bucket');
  const listBucketQuery = useQuery({
    queryKey: [QueryKey.bucketList, session],
    queryFn: listBucket,
    select(data) {
      return data;
    },
    refetchInterval(data, query) {
      if (data?.list.some((bucket) => !bucket.isComplete)) return 5000;
      else return false;
    },
    enabled: !!s3client
  });
  const bucketList = listBucketQuery.data?.list || [];
  const currentBucket = useOssStore((s) => s.currentBucket);
  const switchBucket = useOssStore((s) => s.switchBucket);
  useEffect(() => {
    if (bucketList.length > 0) {
      if (!currentBucket) switchBucket(bucketList[0]);
      else {
        const syncBucket = bucketList.find((bucket) => bucket.crName === currentBucket.crName);
        if (syncBucket) switchBucket(syncBucket);
        else switchBucket(bucketList[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucketList]);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return (
    <Stack w={'260px'} p="20px" overflow={'auto'} borderRight={'1px solid #E4E4E7'}>
      {/* <Flex align={'center'} px="4px" justifyContent={'space-between'}>
        <Text color={'grayModern.900'} fontSize={'16px'} fontWeight={'500'}>
          {t('bucketList')}
        </Text>
        <Flex color={'brightBlue.500'}>
          <IconButton
            icon={<RefreshIcon boxSize="18px" />}
            p="5px"
            aria-label={'refresh bucket'}
            variant={'white-bg-icon'}
            onClick={async () => {
              await queryClient.invalidateQueries([QueryKey.bucketList]);
              await queryClient.invalidateQueries([QueryKey.bucketInfo]);
              toast({
                status: 'success',
                title: 'refresh successfully'
              });
            }}
          ></IconButton>
          <CreateBucketModal buttonType="min" />
        </Flex>
      </Flex> */}
      {bucketList.length > 0 ? (
        <>
          <Stack h="" flex={'1'} overflow={'auto'} minH={'80px'}>
            <Stack spacing={'8px'} divider={<StackDivider borderColor="#F4F4F5" />}>
              {[Authority.private, Authority.readonly, Authority.readwrite].map((policy) => (
                <BucketCategory key={policy} category={policy}>
                  {bucketList.map(
                    (bucket) =>
                      bucket.policy === policy && (
                        <BucketListItem
                          bucket={bucket}
                          key={bucket.name}
                          isSelected={bucket.name === currentBucket?.name}
                          onClick={() => {
                            bucket.name && switchBucket(bucket);
                          }}
                        />
                      )
                  )}
                </BucketCategory>
              ))}
            </Stack>
          </Stack>
          <BucketOverview />
          {/* <ParamterModal /> */}
        </>
      ) : (
        <Center p={'40px'} flex="1">
          <Text textAlign={'center'} fontSize={'12px'} color="grayModern.500">
            {t('noBucket')}
          </Text>
        </Center>
      )}
    </Stack>
  );
}
