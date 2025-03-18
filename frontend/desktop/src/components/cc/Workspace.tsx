import { MySelect } from '@sealos/ui';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Heading,
  Text,
  Button,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Flex,
  useColorModeValue
} from '@chakra-ui/react';
import { ClawCloudIcon } from '../icons';
import { useState } from 'react';
import { Region } from '@/types';
import { Mutation, useMutation, useQuery } from '@tanstack/react-query';
import { regionList as getRegionList, initRegionToken } from '@/api/auth';
import { sessionConfig } from '@/utils/sessionConfig';
import { useRouter } from 'next/router';
import { useCustomToast } from '@/hooks/useCustomToast';
import { useConfigStore } from '@/stores/config';
import useSessionStore from '@/stores/session';
import { useInitWorkspaceStore } from '@/stores/initWorkspace';
import { SwitchRegionType } from '@/constants/account';

export default function Workspace() {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useCustomToast();
  const bg = useColorModeValue('white', 'gray.700');
  const { workspaceName, setWorkspaceName, setSelectedRegionUid, selectedRegionUid, setInitGuide } =
    useInitWorkspaceStore();
  // const [workspaceName, setWorkspaceName] = useState('');
  // const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [regionList, setRegionList] = useState<Region[]>([]);
  const { cloudConfig } = useConfigStore();
  const { token } = useSessionStore();
  useQuery({
    queryKey: ['regionList'],
    queryFn: getRegionList,
    onSuccess: (data) => {
      setRegionList(data?.data?.regionList || []);
    }
  });
  const mutation = useMutation({
    mutationFn(data: { regionUid: string; workspaceName: string }) {
      return initRegionToken(data);
    },
    onSuccess: (data) => {
      setInitGuide(true);
    }
  });
  const handleStartDeploying = async () => {
    try {
      if (!selectedRegionUid || !workspaceName || mutation.isLoading) {
        toast({
          status: 'error',
          title: t('cc:please_select_region_and_workspace_name')
        });
        return;
      }
      console.log(
        'inii',
        selectedRegionUid,
        cloudConfig?.regionUID,
        token,
        workspaceName,
        cloudConfig
      );
      if (selectedRegionUid !== cloudConfig?.regionUID) {
        const region = regionList.find((r) => r.uid === selectedRegionUid);
        if (!region) return;
        const target = new URL(`https://${region.domain}/switchRegion`);
        if (!token) throw Error('No token found');
        target.searchParams.append('token', token);
        target.searchParams.append('workspaceName', encodeURIComponent(workspaceName));
        target.searchParams.append('switchRegionType', SwitchRegionType.INIT);
        await router.replace(target);
        return;
      }
      const initRegionTokenResult = await mutation.mutateAsync({
        regionUid: selectedRegionUid,
        workspaceName: workspaceName
      });
      if (!initRegionTokenResult.data) {
        throw new Error('No result data');
      }
      await sessionConfig(initRegionTokenResult.data);
      await router.replace('/');
    } catch (error) {
      console.error(error);
      toast({
        status: 'error',
        //@ts-ignore
        title: t('cc:workspace_deploy_failed')
      });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg={bg} w={'50%'} direction={'column'}>
      <ClawCloudIcon w={'134px'} h={'24px'} position={'absolute'} top={'20px'} left={'20px'} />
      <Stack spacing={8} mx="auto" maxW="lg" px={4} h={'60%'}>
        <Box rounded="lg" p={8} w={'480px'}>
          <Heading mb={4}>{t('cc:workspace_welcome')}</Heading>
          <Heading mb={4}>{t('cc:workspace_create')}</Heading>

          <Text color={'gray.500'} fontWeight={400} mb={6}>
            {t('cc:worspace_heading_description')}
          </Text>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>{t('cc:choose_a_region')}</FormLabel>
              <MySelect
                height={'40px'}
                bg={'white'}
                width={'full'}
                placeholder="Select Your Region"
                list={regionList.map((region) => ({
                  label: region.displayName,
                  value: region.uid
                }))}
                value={selectedRegionUid}
                onchange={(value: string) => {
                  setSelectedRegionUid(value);
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>{t('cc:create_workspace')}</FormLabel>
              <Input
                type="text"
                height={'40px'}
                bg={'white'}
                width={'full'}
                placeholder="Enter Workspace Name"
                value={workspaceName}
                onChange={(e) => {
                  setWorkspaceName(e.target.value.trim());
                }}
              />
            </FormControl>
            <Text>{t('cc:you_may_invite_memebers_later')}</Text>
            <Button
              bg={'black'}
              color="white"
              mt={4}
              rightIcon={<ArrowRight />}
              w={'full'}
              isLoading={mutation.status === 'loading'}
              onClick={() => handleStartDeploying()}
            >
              {t('cc:start_deploying')}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
