import { restartPodByName } from '@/api/app';
import MyIcon from '@/components/Icon';
import { MyTooltip } from '@sealos/ui';
import PodLineChart from '@/components/PodLineChart';
import { PodStatusEnum } from '@/constants/app';
import { useConfirm } from '@/hooks/useConfirm';
import { useLoading } from '@/hooks/useLoading';
import { useToast } from '@/hooks/useToast';
import type { PodDetailType } from '@/types/app';
import { QuestionOutlineIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Text,
  Center,
  Flex,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import React, { useCallback, useState } from 'react';
import { sealosApp } from 'sealos-desktop-sdk/app';
import { MOCK_APP_DETAIL } from '@/mock/apps';
import { useAppStore } from '@/store/app';
import { Terminal } from 'lucide-react';

const LogsModal = dynamic(() => import('./LogsModal'));
const DetailModel = dynamic(() => import('./PodDetailModal'));
const PodFileModal = dynamic(() => import('./PodFileModal'));

const Pods = ({ pods = [], appName }: { pods: PodDetailType[]; appName: string }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [logsPodIndex, setLogsPodIndex] = useState<number>();
  const [detailPodIndex, setDetailPodIndex] = useState<number>();
  const [detailFilePodIndex, setDetailFilePodIndex] = useState<number>();

  const closeFn = useCallback(() => setLogsPodIndex(undefined), [setLogsPodIndex]);

  const { Loading } = useLoading();
  const { openConfirm: openConfirmRestart, ConfirmChild: RestartConfirmChild } = useConfirm({
    content: 'Please confirm to restart the Pod?'
  });
  const { appDetail = MOCK_APP_DETAIL, appDetailPods } = useAppStore();
  const { isOpen: isOpenPodFile, onOpen: onOpenPodFile, onClose: onClosePodFile } = useDisclosure();

  const handleRestartPod = useCallback(
    async (podName: string) => {
      try {
        await restartPodByName(podName);
        toast({
          title: `${t('Restart')}  ${podName} ${t('success')}`,
          status: 'success'
        });
      } catch (err) {
        toast({
          title: `${t('Restart')}  ${podName} 出现异常`,
          status: 'warning'
        });
        console.log(err);
      }
    },
    [t, toast]
  );

  const columns: {
    title: string;
    dataIndex?: keyof PodDetailType;
    key: string;
    render?: (item: PodDetailType, i: number) => JSX.Element | string;
  }[] = [
    {
      title: 'Pod Name',
      key: 'podName',
      render: (_: PodDetailType, i: number) => (
        <Box
          fontSize={'12px'}
          color={'grayModern.900'}
          fontWeight={500}
          width={'85px'}
          overflow={'hidden'}
          textOverflow={'ellipsis'}
          whiteSpace={'nowrap'}
        >
          {_?.podName}
        </Box>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (item: PodDetailType) => (
        <Center color={'#000000'} gap={'4px'}>
          <Center borderRadius={'full'} bg={item.status.color} w={'6px'} h={'6px'}></Center>
          <Text textTransform={'capitalize'}>{item.status.label}</Text>
          {!!item.status.reason && (
            <MyTooltip
              label={`Reason: ${item.status.reason}${
                item.status.message ? `\nMessage: ${item.status.message}` : ''
              }`}
              whiteSpace={'pre-wrap'}
              wordBreak={'break-all'}
              maxW={'300px'}
            >
              <QuestionOutlineIcon ml={1} />
            </MyTooltip>
          )}
        </Center>
      )
    },
    {
      title: 'Restarts Num',
      key: 'restarts',
      render: (item: PodDetailType) => (
        <Flex alignItems={'center'} fontSize={'12px'} color={'grayModern.900'} fontWeight={500}>
          {item.restarts}
          {!!item.containerStatus.reason && (
            <Flex alignItems={'center'} color={item.containerStatus?.color}>
              (<Text>{item.containerStatus?.reason}</Text>)
            </Flex>
          )}
        </Flex>
      )
    },
    {
      title: 'Age',
      key: 'age',
      render: (item: PodDetailType) => (
        <Box fontSize={'12px'} color={'grayModern.900'} fontWeight={500}>
          {item.age}
        </Box>
      )
    },
    {
      title: 'Cpu',
      key: 'cpu',
      render: (item: PodDetailType) => (
        <Box h={'45px'} w={'120px'} position={'relative'}>
          <Box h={'45px'} w={'120px'} position={'absolute'}>
            <PodLineChart type="blue" data={item.usedCpu} />
            <Box
              color={'#0077A9'}
              fontSize={'sm'}
              fontWeight={'bold'}
              position={'absolute'}
              right={'4px'}
              bottom={'0px'}
              pointerEvents={'none'}
              textShadow="1px 1px 0 #FFF, -1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF"
            >
              {item?.usedCpu?.yData[item?.usedCpu?.yData?.length - 1]}%
            </Box>
          </Box>
        </Box>
      )
    },
    {
      title: 'Memory',
      key: 'memory',
      render: (item: PodDetailType) => (
        <Box h={'45px'} w={'120px'} position={'relative'}>
          <Box h={'45px'} w={'120px'} position={'absolute'}>
            <PodLineChart type="purple" data={item.usedMemory} />
            <Text
              color={'#6F5DD7'}
              fontSize={'sm'}
              fontWeight={'bold'}
              position={'absolute'}
              right={'4px'}
              bottom={'0px'}
              pointerEvents={'none'}
              textShadow="1px 1px 0 #FFF, -1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF"
            >
              {item?.usedMemory?.yData[item?.usedMemory?.yData?.length - 1]}%
            </Text>
          </Box>
        </Box>
      )
    },
    {
      title: 'Operation',
      key: 'control',
      render: (item: PodDetailType, i: number) => (
        <Flex alignItems={'center'} className="driver-detail-operate">
          <Button
            px={'12px'}
            color={'#18181B'}
            borderRadius={'6px'}
            variant={'outline'}
            onClick={(e) => {
              e.stopPropagation();
              setLogsPodIndex(i);
            }}
          >
            {t('logs')}
          </Button>
          <Button
            mx={'10px'}
            px={'12px'}
            color={'#18181B'}
            borderRadius={'6px'}
            variant={'outline'}
            onClick={(e) => {
              e.stopPropagation();
              openConfirmRestart(() => handleRestartPod(item.podName))();
            }}
          >
            {t('Restart')}
          </Button>
          <Button
            w={'36px'}
            height={'36px'}
            px={'12px'}
            color={'#18181B'}
            borderRadius={'6px'}
            variant={'outline'}
            onClick={(e) => {
              e.stopPropagation();
              const defaultCommand = `kubectl exec -it ${item.podName} -c ${appName} -- sh -c "clear; (bash || ash || sh)"`;
              sealosApp.runEvents('openDesktopApp', {
                appKey: 'system-terminal',
                query: {
                  defaultCommand
                },
                messageData: { type: 'new terminal', command: defaultCommand }
              });
            }}
          >
            <Terminal size={'16px'} color="#737373" />
          </Button>

          {appDetail.storeList?.length > 0 && (
            <MyTooltip offset={[0, 10]} label={t('File Management')}>
              <Button
                variant={'square'}
                onClick={() => {
                  setDetailFilePodIndex(i);
                  onOpenPodFile();
                }}
              >
                <MyIcon name={'file'} w="18px" h="18px" fill={'#485264'} />
              </Button>
            </MyTooltip>
          )}
        </Flex>
      )
    }
  ];

  return (
    <Box
      mt={'16px'}
      h={'100%'}
      py={'20px'}
      px={'24px'}
      position={'relative'}
      borderRadius={'16px'}
      border={'1px solid #E4E4E7'}
      bg={'#FFF'}
      boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.05)'}
    >
      <Flex alignItems={'center'}>
        <Text fontSize={'20px'} fontWeight={500} color={'grayModern.900'}>
          {t('Pods List')}
        </Text>
        <Text ml={'8px'} color={'grayModern.600'}>
          ({pods.length})
        </Text>
      </Flex>

      <TableContainer mt={'16px'} overflow={'auto'}>
        <Table variant={'simple'} backgroundColor={'white'}>
          <Thead backgroundColor={'grayModern.50'}>
            <Tr>
              {columns.map((item) => (
                <Th
                  py={4}
                  key={item.key}
                  border={'none'}
                  fontSize={'12px'}
                  fontWeight={'500'}
                  color={'#71717A'}
                  _first={{
                    borderLeftRadius: '8px'
                  }}
                  _last={{
                    borderRightRadius: '8px'
                  }}
                >
                  {t(item.title)}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {pods.map((app, i) => (
              <Tr key={app.podName} onClick={() => setDetailPodIndex(i)} cursor={'pointer'}>
                {columns.map((col) => (
                  <Td key={col.key} border={'none'}>
                    {col.render
                      ? col.render(app, i)
                      : col.dataIndex
                      ? `${app[col.dataIndex]}`
                      : '-'}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {logsPodIndex !== undefined && (
        <LogsModal
          appName={appName}
          podName={pods[logsPodIndex]?.podName || ''}
          pods={pods
            .filter((pod) => pod.status.value === PodStatusEnum.running)
            .map((item, i) => ({
              alias: item.podName,
              podName: item.podName
            }))}
          podAlias={pods[logsPodIndex]?.podName || ''}
          setLogsPodName={(name: string) =>
            setLogsPodIndex(pods.findIndex((item) => item.podName === name))
          }
          closeFn={closeFn}
        />
      )}
      {detailPodIndex !== undefined && (
        <DetailModel
          pod={pods[detailPodIndex]}
          podAlias={pods[detailPodIndex]?.podName || ''}
          pods={pods.map((item, i) => ({
            alias: item.podName,
            podName: item.podName
          }))}
          setPodDetail={(e: string) =>
            setDetailPodIndex(pods.findIndex((item) => item.podName === e))
          }
          closeFn={() => setDetailPodIndex(undefined)}
        />
      )}

      {isOpenPodFile && appDetail.storeList?.length > 0 && detailFilePodIndex !== undefined && (
        <PodFileModal
          isOpen={isOpenPodFile}
          onClose={onClosePodFile}
          pod={pods[detailFilePodIndex]}
          podAlias={pods[detailFilePodIndex]?.podName || ''}
          pods={pods.map((item, i) => ({
            alias: item.podName,
            podName: item.podName
          }))}
          setPodDetail={(e: string) =>
            setDetailFilePodIndex(pods.findIndex((item) => item.podName === e))
          }
        />
      )}
      <RestartConfirmChild />
    </Box>
  );
};

export default React.memo(Pods);
