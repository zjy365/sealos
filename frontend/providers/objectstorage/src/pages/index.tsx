import { Flex, Text } from '@chakra-ui/react';
import Layout from '@/layout';
import SideBar from '@/components/SideBar';
import DefaultContainer from '@/components/DefaultContainer';
import BucketContainer from '@/components/BucketContainer';
import { QueryClient, dehydrate, useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryKey } from '@/consts';
import { listBucket } from '@/api/bucket';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useSessionStore from '@/store/session';
import ParamterModal from '@/components/common/modal/ParamterModal';
import CreateBucketModal from '@/components/common/modal/CreateBucketModal';
import { Button } from '@chakra-ui/react';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from 'next-i18next';

export default function Home() {
  const session = useSessionStore((s) => s.session);
  const _bucketList = useQuery([QueryKey.bucketList, session], listBucket, {});
  const bucketList = _bucketList.data?.list || [];
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  return (
    <Layout>
      <Flex
        h={'88px'}
        borderBottom={'1px solid #E4E4E7'}
        alignItems={'center'}
        justifyContent={'space-between'}
        px={'40px'}
        color={'#0A0A0A'}
      >
        <Text fontWeight={600} fontSize={'24px'} lineHeight={'32px'}>
          {t('objectStorage')}
        </Text>
        {bucketList.length === 0 ? null : (
          <Flex gap={'12px'}>
            <Button
              w={'120px'}
              p="5px"
              aria-label={'refresh bucket'}
              variant={'outline'}
              fontWeight={500}
              color={'#18181B'}
              onClick={async () => {
                await queryClient.invalidateQueries([QueryKey.bucketList]);
                await queryClient.invalidateQueries([QueryKey.bucketInfo]);
                toast({
                  status: 'success',
                  title: 'refresh successfully'
                });
              }}
            >
              {t('refresh')}
            </Button>
            <ParamterModal />
            <CreateBucketModal w={'120px'} buttonType="max" />
          </Flex>
        )}
      </Flex>
      <Flex flex={1}>
        <SideBar />
        <Flex
          flex={1}
          align={'center'}
          justifyContent={'center'}
          bg={'whiteAlpha.700'}
          overflowY={'auto'}
        >
          {bucketList.length === 0 ? <DefaultContainer /> : <BucketContainer />}
        </Flex>
      </Flex>
    </Layout>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  const queryClient = new QueryClient();
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'file', 'tools', 'bucket'], null, [
        'zh',
        'en'
      ])),
      dehydratedState: dehydrate(queryClient) // Will be passed to the page component as props
    }
  };
}
