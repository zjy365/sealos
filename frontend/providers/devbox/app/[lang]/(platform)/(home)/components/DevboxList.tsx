import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { sealosApp } from 'sealos-desktop-sdk/app';
import { SealosMenu, useMessage } from '@sealos/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Flex, Image, MenuButton, Text } from '@chakra-ui/react';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { useRouter } from '@/i18n';
import { useGlobalStore } from '@/stores/global';
import { DevboxListItemTypeV2 } from '@/types/devbox';
import { pauseDevbox, restartDevbox, startDevbox } from '@/api/devbox';

import MyIcon from '@/components/Icon';
import IDEButton from '@/components/IDEButton';
import { BaseTable } from '@/components/ListTable';
import PodLineChart from '@/components/PodLineChart';
import SwitchPage from '@/components/SwitchDevboxPage';
import DevboxStatusTag from '@/components/DevboxStatusTag';
import ReleaseModal from '@/components/modals/ReleaseModal';
import { FilePen, IterationCw, Pause, Trash2 } from 'lucide-react';

const DelModal = dynamic(() => import('@/components/modals/DelModal'));

const DevboxList = ({
  devboxList = [],
  refetchDevboxList
}: {
  devboxList: DevboxListItemTypeV2[];
  refetchDevboxList: () => void;
}) => {
  const router = useRouter();
  const t = useTranslations();
  const { message: toast } = useMessage();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItem = DevboxList.length;
  const [total, setTotal] = useState(0);
  // TODO: Unified Loading Behavior
  const { setLoading } = useGlobalStore();
  const [onOpenRelease, setOnOpenRelease] = useState(false);
  const [delDevbox, setDelDevbox] = useState<DevboxListItemTypeV2 | null>(null);
  const showDevboxList = useMemo(() => {
    return devboxList.slice((page - 1) * pageSize, page * pageSize);
  }, [devboxList, page, pageSize]);
  const [currentDevboxListItem, setCurrentDevboxListItem] = useState<DevboxListItemTypeV2 | null>(
    null
  );
  useEffect(() => {
    // handle with page, pageSize, total
    const newTotal = Math.ceil(totalItem / pageSize);
    if (totalItem < page || total !== newTotal) {
      // 向上取整
      setTotal(Math.ceil(totalItem / pageSize));
      setPage(1);
    }
  }, [page, pageSize, total, totalItem]);
  const handleOpenRelease = (devbox: DevboxListItemTypeV2) => {
    setCurrentDevboxListItem(devbox);
    setOnOpenRelease(true);
  };
  const handlePauseDevbox = useCallback(
    async (devbox: DevboxListItemTypeV2) => {
      try {
        setLoading(true);
        await pauseDevbox({ devboxName: devbox.name });
        toast({
          title: t('pause_success'),
          status: 'success'
        });
      } catch (error: any) {
        toast({
          title: typeof error === 'string' ? error : error.message || t('pause_error'),
          status: 'error'
        });
        console.error(error);
      }
      refetchDevboxList();
      setLoading(false);
    },
    [refetchDevboxList, setLoading, t, toast]
  );
  const handleRestartDevbox = useCallback(
    async (devbox: DevboxListItemTypeV2) => {
      try {
        setLoading(true);
        await restartDevbox({ devboxName: devbox.name });
        toast({
          title: t('restart_success'),
          status: 'success'
        });
      } catch (error: any) {
        toast({
          title: typeof error === 'string' ? error : error.message || t('restart_error'),
          status: 'error'
        });
      }
      refetchDevboxList();
      setLoading(false);
    },
    [refetchDevboxList, setLoading, t, toast]
  );
  const handleStartDevbox = useCallback(
    async (devbox: DevboxListItemTypeV2) => {
      try {
        setLoading(true);
        await startDevbox({ devboxName: devbox.name });
        toast({
          title: t('start_success'),
          status: 'success'
        });
      } catch (error: any) {
        toast({
          title: typeof error === 'string' ? error : error.message || t('start_error'),
          status: 'error'
        });
        console.error(error, '==');
      }
      refetchDevboxList();
      setLoading(false);
    },
    [refetchDevboxList, setLoading, t, toast]
  );
  const handleGoToTerminal = useCallback(
    async (devbox: DevboxListItemTypeV2) => {
      const defaultCommand = `kubectl exec -it $(kubectl get po -l app.kubernetes.io/name=${devbox.name} -oname) -- sh -c "clear; (bash || ash || sh)"`;
      try {
        sealosApp.runEvents('openDesktopApp', {
          appKey: 'system-terminal',
          query: {
            defaultCommand
          },
          messageData: { type: 'new terminal', command: defaultCommand }
        });
      } catch (error: any) {
        toast({
          title: typeof error === 'string' ? error : error.message || t('jump_terminal_error'),
          status: 'error'
        });
        console.error(error);
      }
    },
    [t, toast]
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<DevboxListItemTypeV2>();
    return [
      columnHelper.accessor(
        (row) => [row.name, row.id, row.template.templateRepository.iconId] as const,
        {
          header: t('name'),
          id: 'name',
          enablePinning: true,
          cell(props) {
            const [name, id, iconId] = props.getValue();
            return (
              <Flex alignItems={'center'} gap={'6px'}>
                <Image width={'20px'} height={'20px'} alt={id} src={`/images/${iconId}.svg`} />
                <Box color={'black'} fontSize={'md'}>
                  {name}
                </Box>
              </Flex>
            );
          }
        }
      ),
      columnHelper.accessor((row) => row.status, {
        header: t('status'),
        id: 'status',
        enablePinning: true,
        cell(props) {
          return <DevboxStatusTag status={props.getValue()} h={'27px'} px={'0'} />;
        }
      }),
      columnHelper.accessor((row) => row.createTime, {
        header: t('create_time'),
        id: 'create_time',
        cell(props) {
          return <Text color={'black'}>{props.getValue()}</Text>;
        }
      }),
      columnHelper.accessor((row) => row.usedCpu, {
        id: 'cpu',
        header: t('cpu'),
        cell(props) {
          const usedCpu = props.getValue();
          return (
            <Box h={'35px'} w={['120px', '130px', '140px']}>
              <Box h={'35px'} w={['120px', '130px', '140px']} position={'relative'}>
                <PodLineChart type="blue" data={usedCpu} />
                <Text
                  color={'#0077A9'}
                  fontSize={'sm'}
                  fontWeight={'bold'}
                  position={'absolute'}
                  right={'4px'}
                  bottom={'0px'}
                  pointerEvents={'none'}
                  textShadow="1px 1px 0 #FFF, -1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF"
                >
                  {usedCpu.yData[usedCpu.yData.length - 1]}%
                </Text>
              </Box>
            </Box>
          );
        }
      }),
      columnHelper.accessor((row) => row.usedMemory, {
        id: 'storage',
        header: t('memory'),
        cell(props) {
          const usedMemory = props.getValue();
          return (
            <Box h={'35px'} w={['120px', '130px', '140px']}>
              <Box h={'35px'} w={['120px', '130px', '140px']} position={'relative'}>
                <PodLineChart type="purple" data={usedMemory} />
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
                  {usedMemory.yData[usedMemory.yData.length - 1]}%
                </Text>
              </Box>
            </Box>
          );
        }
      }),
      columnHelper.display({
        header: t('control'),
        id: 'control',
        enablePinning: true,
        cell(props) {
          const item = props.row.original;
          return (
            <Flex onClick={(e) => e.stopPropagation()}>
              <IDEButton
                devboxName={item.name}
                sshPort={item.sshPort}
                status={item.status}
                mr={'8px'}
                leftButtonProps={{
                  borderRight: '1px solid var(--base-border, #E4E4E7)',
                  boxShadow: 'none',
                  width: '110px',
                  pr: 'auto',
                  bgColor: '#F4F4F5',
                  pl: '12px'
                  // borderStartRadius: 'md'
                }}
                rightButtonProps={{
                  boxShadow: 'none',
                  bgColor: '#F4F4F5'
                  // borderEndRadius: 'md'
                }}
                runtimeType={item.template.templateRepository.iconId as string}
              />
              {/* <Button
                mr={'8px'}
                size={'sm'}
                boxSize={'32px'}
                fontSize={'base'}
                bg={'#F4F4F5'}
                color={'grayModern.900'}
                _hover={{
                  color: 'brightBlue.600'
                }}
                minW={'unset'}
                onClick={() => {
                  router.push(`/devbox/detail/${item.name}`);
                }}
              >
                <MyIcon name={'detail'} w={'16px'} />
              </Button> */}
              <SealosMenu
                width={100}
                Button={
                  <MenuButton
                    as={Button}
                    variant={'square'}
                    boxSize={'32px'}
                    bgColor={'rgba(244, 244, 245, 1)'}
                  >
                    <MyIcon name={'more'} />
                  </MenuButton>
                }
                menuList={[
                  // {
                  //   child: (
                  //     <>
                  //       <MyIcon name={'version'} w={'16px'} color={'white'} />
                  //       <Box ml={2}>{t('publish')}</Box>
                  //     </>
                  //   ),
                  //   onClick: () => handleOpenRelease(item)
                  // },
                  // {
                  //   child: (
                  //     <>
                  //       <MyIcon name={'terminal'} w={'16px'} color={'white'} />
                  //       <Box ml={2}>{t('terminal')}</Box>
                  //     </>
                  //   ),
                  //   onClick: () => handleGoToTerminal(item),
                  //   menuItemStyle: {
                  //     borderBottomLeftRadius: '0px',
                  //     borderBottomRightRadius: '0px',
                  //     borderBottom: '1px solid #F0F1F6'
                  //   }
                  // },
                  {
                    child: (
                      <>
                        <FilePen size={'16px'} />
                        <Box ml={2}>{t('update')}</Box>
                      </>
                    ),
                    onClick: () => router.push(`/devbox/create?name=${item.name}`)
                  },
                  ...(item.status.value === 'Stopped'
                    ? [
                        {
                          child: (
                            <>
                              <MyIcon name={'start'} w={'16px'} />
                              <Box ml={2}>{t('start')}</Box>
                            </>
                          ),
                          onClick: () => handleStartDevbox(item)
                        }
                      ]
                    : []),
                  // maybe Error or other status,all can restart
                  ...(item.status.value === 'Running'
                    ? [
                        {
                          child: (
                            <>
                              <Pause size={'16px'} />
                              <Box ml={2}>Pause</Box>
                            </>
                          ),
                          onClick: () => handlePauseDevbox(item)
                        }
                      ]
                    : []),

                  ...(item.status.value !== 'Stopped'
                    ? [
                        {
                          child: (
                            <>
                              <IterationCw size={'16px'} />
                              <Box ml={2}>{t('restart')}</Box>
                            </>
                          ),
                          onClick: () => handleRestartDevbox(item)
                        }
                      ]
                    : []),
                  {
                    child: (
                      <>
                        <Trash2 size={'16px'} color="#DC2626" />
                        <Box ml={2} color={'#DC2626'}>
                          {t('delete')}
                        </Box>
                      </>
                    ),
                    menuItemStyle: {
                      borderTop: 'border: 1px solid var(--base-muted, #F4F4F5)',
                      _hover: {
                        color: 'red.600',
                        bg: 'rgba(17, 24, 36, 0.05)'
                      }
                    },
                    onClick: () => setDelDevbox(item)
                  }
                ]}
              />
            </Flex>
          );
        }
      })
    ];
  }, [t]);
  const table = useReactTable({
    data: showDevboxList,
    state: {
      columnPinning: {
        right: ['control']
      }
    },
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <>
      <Box height={'full'}>
        <BaseTable
          borderTopRadius={'11px'}
          border={'0.5px solid'}
          borderColor={'#E4E4E7'}
          table={table}
        />
        <SwitchPage
          borderBottomRadius={'11px'}
          border={'0.5px solid'}
          borderColor={'#E4E4E7'}
          borderTop={'none'}
          width={'full'}
          currentPage={page}
          setCurrentPage={setPage}
          totalPage={total}
          totalItem={DevboxList.length}
          pageSize={pageSize}
        />
      </Box>
      {!!delDevbox && (
        <DelModal
          devbox={delDevbox}
          onClose={() => setDelDevbox(null)}
          onSuccess={refetchDevboxList}
          refetchDevboxList={refetchDevboxList}
        />
      )}
      {/* {!!onOpenRelease && !!currentDevboxListItem && ( */}
      {/* <ReleaseModal
        onSuccess={() => {
          router.push(`/devbox/detail/${currentDevboxListItem?.name}`);
        }}
        onClose={() => {
          setOnOpenRelease(false);
          setCurrentDevboxListItem(null);
        }}
        devbox={{
          name: 'xxx',
          status: {
            value: 'stop'
          }
        }}
      /> */}
      {/* )} */}
    </>
  );
};

export default DevboxList;
