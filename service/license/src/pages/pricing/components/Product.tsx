import { getSystemEnv } from '@/api/system';
import BillingMeter from '@/components/billing-meter';
import RechargeComponent from '@/components/recharge';
import { company, contect, defaulClustertForm, freeClusterForm } from '@/constant/product';
import { useConfirm } from '@/hooks/useConfirm';
import usePaymentDataStore from '@/stores/payment';
import useRouteParamsStore from '@/stores/routeParams';
import useSessionStore from '@/stores/session';
import { ClusterFormType, ClusterType, TPayMethod, WechatPaymentData } from '@/types';
import { calculatePrice } from '@/utils/tools';
import { Button, Flex, Text, useDisclosure, useToast } from '@chakra-ui/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import ServicePackage from './ServicePackage';

export default function Product() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { openConfirm, ConfirmChild } = useConfirm();
  const toast = useToast({ position: 'top', duration: 2000 });
  // 整个流程跑通需要状态管理, 0 初始态， 1 创建支付单， 2 支付中, 3 支付成功
  const [complete, setComplete] = useState<0 | 1 | 2 | 3>(0);
  const [payType, setPayType] = useState<TPayMethod>('wechat');
  const [clusterType, setClusterType] = useState<ClusterType>(ClusterType.ScaledStandard);
  const [orderID, setOrderID] = useState('');
  const [wechatData, setWechatData] = useState<WechatPaymentData>();
  const { data: platformEnv } = useQuery(['getPlatformEnv'], getSystemEnv);
  const [remainingSeconds, setRemainingSeconds] = useState(1); // 初始值为2秒
  const { data: routeParams, setRouteParams, clearRouteParams } = useRouteParamsStore();
  const { isUserLogin } = useSessionStore();
  // Used to detect missing WeChat payment results
  const { paymentData, setPaymentData, deletePaymentData, isExpired } = usePaymentDataStore();
  const [price, setPrice] = useState(0);
  const rechargeRef = useRef<{ onOpen: () => void; isOpen: boolean }>();

  const formHook = useForm<ClusterFormType>({
    defaultValues: defaulClustertForm
  });

  formHook.watch((data) => {
    if (!data) return;
    const price = calculatePrice(data as ClusterFormType, freeClusterForm);
    setPrice(price);
  });

  useEffect(() => {
    const price = calculatePrice(defaulClustertForm, freeClusterForm);
    setPrice(price);
  }, []);

  const handleProductByType = (type: ClusterType) => {
    setClusterType(type);
    if (type === ClusterType.ScaledStandard) {
      rechargeRef.current?.onOpen();
      return;
    }

    if (type === ClusterType.Contact) {
      window.open(
        'https://fael3z0zfze.feishu.cn/share/base/form/shrcnesSfEK65JZaAf2W6Fwz6Ad',
        '_blank'
      );
    }
  };

  // const paymentMutation = useMutation(
  //   (amount: string) =>
  //     createPayment({
  //       amount: amount,
  //       payMethod: payType,
  //       currency: 'CNY',
  //       stripeSuccessCallBackUrl: '/pricing?stripeState=success',
  //       stripeErrorCallBackUrl: '/pricing?stripeState=error'
  //     }),
  //   {
  //     async onSuccess(data) {
  //       if (payType === 'stripe' && platformEnv && data?.sessionID) {
  //         const stripe = await loadStripe(platformEnv?.stripePub);
  //         stripe?.redirectToCheckout({
  //           sessionId: data.sessionID
  //         });
  //       }
  //       if (payType === 'wechat' && data?.tradeNO && data?.codeURL) {
  //         setOrderID(data.orderID);
  //         setWechatData({ tradeNO: data?.tradeNO, codeURL: data?.codeURL });
  //         setComplete(2);
  //         setPaymentData(data.orderID);
  //       }
  //     },
  //     onError(err: any) {
  //       toast({
  //         status: 'error',
  //         title: err?.message || '',
  //         isClosable: true,
  //         position: 'top'
  //       });
  //       setComplete(0);
  //     }
  //   }
  // );

  // // Create a standard cluster
  // const clusterMutation = useMutation((payload: CreateClusterParams) => createCluster(payload), {
  //   onSuccess(data) {
  //     console.log(data, 'clusterMutation');
  //     setComplete(3);
  //     queryClient.invalidateQueries(['getClusterList']);
  //     deletePaymentData();
  //   },
  //   onError(err: any) {
  //     toast({
  //       status: 'error',
  //       title: err?.message || '',
  //       isClosable: true,
  //       position: 'top'
  //     });
  //     setComplete(0);
  //   }
  // });

  // // Purchase Enterprise Edition Cluster
  // useQuery(['getPaymentResult', orderID], () => handlePaymentResult({ orderID }), {
  //   refetchInterval: complete === 2 ? 3 * 1000 : false,
  //   enabled: complete === 2 && !!orderID,
  //   cacheTime: 0,
  //   staleTime: 0,
  //   onSuccess(data) {
  //     if (data.status === PaymentStatus.PaymentSuccess) {
  //       clusterMutation.mutate({ orderID: data.orderID, type: ClusterType.ScaledStandard });
  //       uploadConvertData([90])
  //         .then((res) => {
  //           console.log(res);
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //         });
  //     }
  //   },
  //   onError(err: any) {
  //     toast({
  //       status: 'error',
  //       title: err?.message || '',
  //       isClosable: true,
  //       position: 'top'
  //     });
  //     setComplete(0);
  //   }
  // });

  // // handle success
  // useEffect(() => {
  //   if (complete === 3) {
  //     onOpen();
  //     const timer = setInterval(() => {
  //       if (remainingSeconds > 0) {
  //         setRemainingSeconds(remainingSeconds - 1);
  //       } else {
  //         clearInterval(timer);
  //         router.push('/cluster');
  //       }
  //     }, 1000);

  //     return () => {
  //       clearInterval(timer);
  //     };
  //   }
  // }, [complete, onOpen, remainingSeconds, router]);

  // // handle Jump link
  // useEffect(() => {
  //   const { clusterType, external } = routeParams;
  //   console.log(clusterType, external, 'pricing');
  //   if (clusterType && external) {
  //     handleProductByType(routeParams.clusterType as ClusterType);
  //     clearRouteParams();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <>
      <Flex
        flex={1}
        backgroundColor="#f2f5f7"
        overflowY={'scroll'}
        flexWrap={'wrap'}
        h="100%"
        pt="30px"
        pb="15px"
        justifyContent={'center'}
        gap={'36px'}
        px="24px"
      >
        <ServicePackage items={company}>
          <Text color="#0884DD" fontSize="18px" fontWeight="600">
            标准版
          </Text>
          <Text mt="24px" color={'#24282C'} fontSize={'24px'} fontWeight={600}>
            适合开发者测试， POC demo，企业生产环境
          </Text>
          <Button
            w="100%"
            mt="28px"
            bgColor={'#AFDEF9'}
            fontSize={'14px'}
            color={'#24282C'}
            fontWeight={500}
            onClick={() => handleProductByType(ClusterType.ScaledStandard)}
          >
            获取
          </Button>
        </ServicePackage>
        <ServicePackage items={contect}>
          <Text color="#00A9A6" fontSize="18px" fontWeight="600">
            定制版
          </Text>
          <Text mt="24px" color={'#24282C'} fontSize={'24px'} fontWeight={600} w="200px">
            适合大规模集群与大型企业客户
          </Text>
          <Button
            w="100%"
            mt="32px"
            bgColor={'#F4F6F8'}
            fontSize={'16px'}
            color={'#24282C'}
            fontWeight={600}
            onClick={() => handleProductByType(ClusterType.Contact)}
          >
            联系我们
          </Button>
        </ServicePackage>
        <BillingMeter formHook={formHook} price={price} />
      </Flex>
      <RechargeComponent ref={rechargeRef} isLicensePay={false} key={'cluster'} />
      <ConfirmChild />
    </>
  );
}
