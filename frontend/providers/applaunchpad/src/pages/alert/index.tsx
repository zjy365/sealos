import React, { useEffect, useState } from 'react';
import { getAppAlertInfo, saveCpu,getCpu } from '@/api/app';
import MyIcon from '@/components/Icon';
import {
  Box,
  Button,
  Center,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
  FormControl,
  Input,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import styles from './index.module.scss'
import { getParamValue } from '@/utils/tools';
const Label = ({
  children,
  w = 120,
  ...props
}: {
  children: string;
  w?: number | 'auto';
  [key: string]: any;
}) => (
  <Box
    flex={`0 0 ${w === 'auto' ? 'auto' : `${w}px`}`}
    color={'grayModern.900'}
    fontWeight={'bold'}
    userSelect={'none'}
    {...props}
  >
    {children}
  </Box>
);
const AlertManagement = () => {
  const [alertDataList, setAlertDataList] = useState([]);
  const [currentAlert, setCurrentAlert] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [createLoading,setCreateLoading] = useState(false)
  const [state, setState] = useState({
    cpu: '',
    memory: ''
  })
  const { isOpen: isOpen2, onOpen: onOpen2, onClose: onClose2 } = useDisclosure();

  const columns = [
    { title: '命名空间', field: 'namespace' },
    { title: '应用名称', field: 'appName' },
    { title: '容器名称', field: 'podName' },
    { title: '告警状态', field: 'alertStatus' },
    {
      title: '告警信息', field: 'alertMessage', render(r: any) {
        return <a title={r.alertMessage} className={styles.textEllipsis3}>{r.alertMessage}</a>
      }
    },
    { title: '操作' },
  ];

  useEffect(() => {
    fetchAlertData();
  }, []);

  const fetchAlertData = async () => {
    const resp = await getAppAlertInfo(); // Replace with actual API for fetching alert data
    if (resp) {
      setAlertDataList(resp);
    }
  };

  const router = useRouter();

  const onViewDetails = (alert: any) => {
    const showMenu = getParamValue('showMenu')
    const { namespace, appName } = alert;
    // navigate(`/app/detail?namespace=${namespace}&&name=${appName}`);
    if(showMenu){
      router.push(`/app/detail?namespace=${namespace}&&name=${appName}&showMenu=true`);
    }else{
      router.push(`/app/detail?namespace=${namespace}&&name=${appName}`);
    }
    
  };

  const handleConfirm = async () => {
    try {
      const res = await saveCpu({ ...state })
      setCreateLoading(false)
      toast({
        status: 'success',
        title: '创建成功'
      })
      onClose2()
    } catch (error: any) {
      setCreateLoading(false)
      toast({
        status: 'error',
        title: error.message
      });
    }
  }

  return (
    <Box backgroundColor={'grayModern.100'} px={'32px'} pb={5} minH={'100%'}>
      <Flex h={'88px'} alignItems={'center'} justifyContent={'space-between'}>
        <Flex alignItems={'center'} flex={1}>
          <Center
            w="46px"
            h={'46px'}
            mr={4}
            backgroundColor={'#FEFEFE'}
            borderRadius={'md'}
          >
            <MyIcon name="logo" w={'24px'} h={'24px'} />
          </Center>
          <Box fontSize={'xl'} flex={1} style={{ justifyContent: 'space-between', display: 'flex' }} color={'grayModern.900'} fontWeight={'bold'}>
            告警信息管理
            <Button onClick={async () => {
              onOpen2()
              const _state = await getCpu()
              setState(_state)
            }}>告警设置</Button>
          </Box>
        </Flex>
      </Flex>

      <TableContainer>
        <Table variant="simple" backgroundColor={'white'} color={'black'}>
          <Thead>
            <Tr>
              {columns.map((column, index) => (
                <Th key={index}>{column.title}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {alertDataList.map((row, rowIndex) => (
              <Tr key={rowIndex}>
                {columns.map((column, colIndex) =>
                  column.title === '操作' ? (
                    <Td key={`${rowIndex}-${colIndex}`}>
                      <Button size="sm" onClick={() => onViewDetails(row)}>
                        查看详情
                      </Button>
                    </Td>
                  ) : (
                    <Td
                      key={`${rowIndex}-${colIndex}`}
                      style={
                        column.title === '告警信息'
                          ? {
                            maxWidth: '200px', // 限制宽度
                            whiteSpace: 'pre-wrap', // 保留换行符并自动换行
                            wordBreak: 'break-word', // 长单词自动换行
                          }
                          : {}
                      }
                    >
                      {column.render ? column.render(row) : row[column.field as keyof typeof row]}
                    </Td>
                  )
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>告警详情</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p>命名空间: {currentAlert?.namespace}</p>
            <p>容器名称: {currentAlert?.podName}</p>
            <p>应用名称: {currentAlert?.appName}</p>
            <p>告警状态: {currentAlert?.alertStatus}</p>
            <p>告警信息: {currentAlert?.alertMessage}</p>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpen2} onClose={onClose2} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>告警设置</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={7} w={'100%'}>
              <Flex alignItems={'center'}>
                <Label>{"cpu"}</Label>
                <Input
                  autoFocus={true}
                  value={state.cpu}
                  style={{ borderColor: '#02A7F0', width: '70%' }}
                  onChange={e => {
                    setState({
                      ...state,
                      cpu: e.target.value
                    })
                  }}
                />
              </Flex>
            </FormControl>
            <FormControl mb={7} w={'100%'}>
              <Flex alignItems={'center'}>
                <Label>{"内存"}</Label>
                <Input
                  autoFocus={true}
                  style={{ borderColor: '#02A7F0', width: '70%' }}
                  value={state.memory}
                  onChange={e => {
                    setState({
                      ...state,
                      memory: e.target.value
                    })
                  }}
                />
              </Flex>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} isLoading={createLoading} onClick={handleConfirm}>
              确认
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AlertManagement;