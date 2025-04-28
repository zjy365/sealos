import { useSystemConfigStore } from '@/store/config';
import { useSearchStore } from '@/store/search';
import { Flex, Text, Box } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LeftArrowIcon } from '@sealos/ui';
import { throttle, debounce } from 'lodash';

export default function SideBar() {
  const { t } = useTranslation();
  const { appType, setAppType } = useSearchStore();
  const router = useRouter();
  const { sideBarMenu } = useSystemConfigStore();
  const scroll = useRef<HTMLDivElement>(null);
  const [isScroll, setIsScroll] = useState<boolean>(false);
  const [isLeft, setIsLeft] = useState<boolean>(true);
  const [isRight, setIsRight] = useState<boolean>(false);

  // eslint-disable-next-line
  const resize = useCallback(
    debounce(() => {
      if (scroll.current) {
        setIsScroll(scroll.current.scrollWidth > scroll.current.clientWidth);
      }
    }, 100),
    []
  );
  // eslint-disable-next-line
  const scrollEvent = useCallback(
    throttle(() => {
      if (scroll.current) {
        setIsLeft(scroll.current.scrollLeft <= 10);
        setIsRight(
          scroll.current.scrollLeft >= scroll.current.scrollWidth - scroll.current.clientWidth - 10
        );
      }
    }, 100),
    []
  );

  useEffect(() => {
    // const resize = () => {
    //   if (scroll.current) {
    //     setIsScroll(scroll.current.scrollWidth > scroll.current.clientWidth);
    //   }
    // };
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [resize]);
  useEffect(() => {
    if (scroll.current) {
      setIsScroll(scroll.current.scrollWidth > scroll.current.clientWidth);
    }
  }, [scroll, sideBarMenu.length]);
  useEffect(() => {
    // const scrollEvent = () => {
    //   if (scroll.current) {
    //     setIsLeft(scroll.current.scrollLeft <= 10);
    //     setIsRight(
    //       scroll.current.scrollLeft >= scroll.current.scrollWidth - scroll.current.clientWidth - 10
    //     );
    //   }
    // };
    const currentScroll = scroll.current;
    if (currentScroll) {
      currentScroll.addEventListener('scroll', scrollEvent);
    }
    return () => {
      currentScroll?.removeEventListener('scroll', scrollEvent);
    };
  }, [scroll, scrollEvent]);

  return (
    <Flex
      ref={scroll}
      mt={'6px'}
      alignItems={'center'}
      position={'relative'}
      ml={'60px'}
      flex={1}
      overflow={'auto'}
    >
      {isScroll && !isLeft && (
        <Flex
          position={'sticky'}
          key={'left'}
          alignItems={'center'}
          justifyContent={'center'}
          cursor={'pointer'}
          left={'0'}
          mr={'9px'}
          onClick={() => {
            if (scroll.current) {
              scroll.current.scrollTo({
                left: 0,
                behavior: 'smooth'
              });
              // setIsLeft(true);
              // setIsRight(false);
            }
          }}
        >
          <LeftArrowIcon
            width={'36px'}
            borderRadius={'full'}
            height={'36px'}
            p={'7px'}
            border={'1px solid #E4E4E7'}
          />
          <Box
            position={'absolute'}
            left={'0'}
            top={'0'}
            width={'97px'}
            height={'100%'}
            zIndex={-1}
            background={'linear-gradient(90deg, #FFFFFF 33%, rgba(255, 255, 255, 0) 100%)'}
          ></Box>
        </Flex>
      )}
      <Flex flex={1} justifyContent={'flex-end'} alignItems={'center'}>
        {sideBarMenu &&
          sideBarMenu.map((item) => {
            return (
              <Flex
                borderRadius={'full'}
                // background={item.type === appType ? 'rgba(150, 153, 180, 0.15)' : ''}
                backgroundImage={
                  item.type === appType
                    ? 'linear-gradient(#ffffff 0%, #ffffff 100%),linear-gradient(270.48deg, #2778FD 3.93%, #2778FD 18.25%, #829DFE 80.66%)'
                    : ''
                }
                border={'1.5px solid transparent'}
                backgroundClip={'padding-box,border-box'}
                _hover={{
                  background: '#0000000D'
                }}
                key={item.id}
                p="11px 16px"
                h="36px"
                w={'fit-content'}
                alignItems={'center'}
                cursor={'pointer'}
                id={item.id}
                onClick={() => {
                  router.replace('/');
                  setAppType(item.type);
                }}
              >
                <Text whiteSpace={'nowrap'} color={'#525252'} fontSize={'14px'} fontWeight={500}>
                  {t(item.value, { defaultValue: item.value })}
                </Text>
              </Flex>
            );
          })}
      </Flex>
      {isScroll && !isRight && (
        <Flex
          position={'sticky'}
          key={'right'}
          alignItems={'center'}
          justifyContent={'center'}
          cursor={'pointer'}
          right={'0'}
          ml={'9px'}
          onClick={() => {
            if (scroll.current) {
              scroll.current.scrollTo({
                left: scroll.current.scrollWidth + 100,
                behavior: 'smooth'
              });
              // setIsRight(true);
              // setIsLeft(false);
            }
            setTimeout(() => {
              if (scroll.current) {
                scroll.current.scrollTo({
                  left: scroll.current.scrollWidth + 100,
                  behavior: 'smooth'
                });
              }
            }, 200);
          }}
        >
          <LeftArrowIcon
            transform={'rotate(180deg)'}
            width={'36px'}
            borderRadius={'full'}
            height={'36px'}
            p={'7px'}
            border={'1px solid #E4E4E7'}
          />
          <Box
            position={'absolute'}
            right={'0'}
            top={'0'}
            width={'97px'}
            height={'100%'}
            zIndex={-1}
            background={'linear-gradient(-90deg, #FFFFFF 33%, rgba(255, 255, 255, 0) 100%)'}
          ></Box>
        </Flex>
      )}
    </Flex>
  );
}
