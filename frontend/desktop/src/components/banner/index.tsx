import useAppStore from '@/stores/app';
import { Box, Center, Flex, Icon, Image, Text, useMediaQuery } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export default function SaleBanner() {
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const { openApp, installedApps } = useAppStore();
  const [isMobileSize] = useMediaQuery('(max-width: 780px)');

  useEffect(() => {
    // Get the last display timestamp from localStorage
    const lastDisplayTimestamp = localStorage.getItem('bannerLastDisplay');
    const today = new Date().toLocaleDateString();

    // Check if the banner has not been displayed today
    if (!lastDisplayTimestamp || lastDisplayTimestamp !== today) {
      setIsBannerVisible(true);
      // Store the current date in localStorage
      localStorage.setItem('bannerLastDisplay', today);
    }
  }, []);

  const closeBanner = () => {
    setIsBannerVisible(false);
  };

  const goDetailFeishu = () => {
    window.open(`https://forum.laf.run/d/1207`, '_blank');
  };

  return (
    <>
      <Center
        w="100%"
        position={'fixed'}
        background="linear-gradient(90deg, #DFF2FF 0%, #D9EBFF 35.83%, #D5E5FC 101.17%);"
        backdropFilter={'blur(187px)'}
        height={'48px'}
        zIndex={1}
        px="18px"
        gap={isMobileSize ? '0px' : '12px'}
      >
        <Text color={'#13091C'} fontSize={isMobileSize ? '12px' : '16px'} fontWeight={600}>
          🎉 Sealos 开春福利大放送！充值优惠限时开启，多充多送还有精美周边！
        </Text>
        <Center
          position={'relative'}
          w="104px"
          h="32px"
          borderRadius={'8px'}
          background={'#FFF'}
          cursor={'pointer'}
          onClick={goDetailFeishu}
        >
          <Text fontSize={isMobileSize ? '12px' : '14px'} fontWeight={500} color={'#000'} mr="12px">
            活动详情
          </Text>
          <Image
            position={'absolute'}
            right={'-8px'}
            bottom={'-6px'}
            alt="logo"
            width={'36px'}
            height={'36px'}
            src="/icons/draw.svg"
          />
        </Center>
      </Center>
      {isBannerVisible && (
        <Box
          position={'fixed'}
          left={0}
          top={0}
          w="100vw"
          h="100vh"
          background="rgba(0, 0, 0, 0.48)"
          zIndex={99}
        ></Box>
      )}
      {isBannerVisible && (
        <Flex
          position={'fixed'}
          maxW={'80%'}
          w="590px"
          pb="58px"
          borderRadius={'16px'}
          background={'#F4F7FB'}
          boxShadow={'0px 8px 29px 0px rgba(187, 196, 206, 0.25)'}
          top={'50%'}
          left={'50%'}
          zIndex={999}
          transform={'translate(-50%, -50%)'}
          flexDirection={'column'}
        >
          <Center
            gap="8px"
            h="64px"
            position={'relative'}
            borderRadius={'16px 16px 0px 0px'}
            background={'linear-gradient(90deg, #C5E6FF 0%, #C8DCFB 102.16%)'}
          >
            <Image
              alt="logo"
              width={isMobileSize ? '28px' : '42px'}
              height={'42px'}
              src="/images/sealos.svg"
            />
            <Text color={'#32323A'} fontWeight={'700'} fontSize={isMobileSize ? '18px' : '20px'}>
              Sealos
            </Text>
            <Icon
              cursor={'pointer'}
              right={'20px'}
              position={'absolute'}
              ml="auto"
              xmlns="http://www.w3.org/2000/svg"
              width={isMobileSize ? '28px' : '32px'}
              height="33px"
              viewBox="0 0 32 33"
              fill="none"
              onClick={closeBanner}
            >
              <path
                d="M16.3536 18.1531L16.0001 17.7995L15.6465 18.1531L9.11318 24.6864C8.97166 24.8279 8.79211 24.9066 8.5334 24.9066C8.27469 24.9066 8.09513 24.8279 7.95362 24.6864C7.8121 24.5449 7.7334 24.3653 7.7334 24.1066C7.7334 23.8479 7.8121 23.6684 7.95362 23.5268L14.487 16.9935L14.8405 16.64L14.487 16.2864L7.95362 9.75307C7.8121 9.61156 7.7334 9.43201 7.7334 9.17329C7.7334 8.91458 7.8121 8.73502 7.95362 8.59351C8.09513 8.452 8.27468 8.37329 8.5334 8.37329C8.79211 8.37329 8.97166 8.452 9.11318 8.59351L15.6465 15.1268L16.0001 15.4804L16.3536 15.1268L22.887 8.59351C23.0285 8.452 23.208 8.37329 23.4667 8.37329C23.7254 8.37329 23.905 8.452 24.0465 8.59351C24.188 8.73503 24.2667 8.91458 24.2667 9.17329C24.2667 9.432 24.188 9.61156 24.0465 9.75307L17.5132 16.2864L17.1596 16.64L17.5132 16.9935L24.0465 23.5268C24.188 23.6684 24.2667 23.8479 24.2667 24.1066C24.2667 24.3653 24.188 24.5449 24.0465 24.6864C23.905 24.8279 23.7254 24.9066 23.4667 24.9066C23.208 24.9066 23.0285 24.8279 22.887 24.6864L16.3536 18.1531Z"
                fill="#24282C"
                stroke="#24282C"
              />
            </Icon>
          </Center>
          <Flex flexDirection={'column'} alignItems={'center'} px={isMobileSize ? '32px' : '117px'}>
            <Text
              mt={isMobileSize ? '42px' : '76px'}
              color="#13091C"
              fontSize={isMobileSize ? '18px' : '28px'}
              fontWeight="600"
            >
              🎉 Sealos 开春福利大放送！
            </Text>
            <Text
              mt="30px"
              color={'#262A32'}
              fontSize={isMobileSize ? '14px' : '18px'}
              fontWeight={600}
            >
              充值优惠限时开启
            </Text>
            <Text color={'#262A32'} fontSize={isMobileSize ? '14px' : '18px'} fontWeight={600}>
              多充多送还有精美周边！
            </Text>
            <Flex
              alignItems={'center'}
              justifyContent={'center'}
              borderRadius={'64px'}
              background={'#111824'}
              w="100%"
              p={isMobileSize ? '8px' : '12px 16px'}
              onClick={() => {
                closeBanner();
                const costcenter = installedApps.find((t) => t.key === 'system-costcenter');
                if (!costcenter) return;
                openApp(costcenter, {
                  query: {
                    openRecharge: 'true'
                  }
                });
              }}
              mt="40px"
              cursor={'pointer'}
            >
              <Text color={'#FEFEFE'} fontSize={isMobileSize ? '12px' : '16px'} fontWeight={600}>
                立即参加
              </Text>
            </Flex>
            <Flex
              cursor={'pointer'}
              alignItems={'center'}
              justifyContent={'center'}
              borderRadius={'64px'}
              background={'#E8EBF0'}
              w="100%"
              p={isMobileSize ? '8px' : '12px 16px'}
              onClick={() => {
                closeBanner();
                goDetailFeishu();
              }}
              mt="20px"
            >
              <Text color={'#111824'} fontSize={isMobileSize ? '12px' : '16px'} fontWeight={600}>
                活动详情
              </Text>
            </Flex>
          </Flex>
        </Flex>
      )}
    </>
  );
}
