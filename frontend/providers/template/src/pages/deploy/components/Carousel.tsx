import { Box, BoxProps, Flex, FlexProps } from '@chakra-ui/react';
import React, { useCallback, useEffect } from 'react';
import Icon from '@/components/Icon';
import Image from 'next/image';
import { throttle } from 'lodash';

const pictureWidth = 568 + 20;

const Carousel = ({
  data = [],
  ...props
}: { data: string[] } & FlexProps & { [key: string]: any }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const scrollTo = (index: number) => {
    setActiveIndex(index);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: index * pictureWidth, behavior: 'smooth' });
    }
  };
  // eslint-disable-next-line
  const handleScroll = useCallback(
    throttle(() => {
      setActiveIndex(Math.floor(scrollRef.current!.scrollLeft / pictureWidth));
    }, 100),
    []
  );

  useEffect(() => {
    const currentScrollRef = scrollRef.current;
    if (currentScrollRef) {
      currentScrollRef.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (currentScrollRef) {
        currentScrollRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  return (
    <Box gap={'20px'} {...props} px={'40px'} py={'32px'} bg={'#F3F4F7'} flexGrow={1}>
      <Flex position={'relative'} w="100%" justifyContent="center">
        <Icon
          cursor={'pointer'}
          onClick={() => {
            scrollTo(Math.max(activeIndex - 1, 0));
          }}
          transform={'translateY(-50%)'}
          top={'50%'}
          left={'-18px'}
          w={'8px'}
          h={'36px'}
          position={'absolute'}
          color={'transparent'}
          name="polygon"
        ></Icon>
        <Box ref={scrollRef} overflow={'scroll'}>
          <Flex w={'fit-content'} gap={'20px'}>
            {data?.map((item, index) => (
              <Box
                overflow={'hidden'}
                h={'319px'}
                w={'568px'}
                position={'relative'}
                borderRadius={'16px'}
                key={index}
                background={'blue'}
              >
                <Image src={item} alt="" width={568} height={319}></Image>
              </Box>
            ))}
          </Flex>
        </Box>
        <Icon
          cursor={'pointer'}
          onClick={() => {
            scrollTo(Math.min(activeIndex + 1, data.length - 1));
          }}
          transform={'translateY(-50%) rotate(180deg)'}
          top={'50%'}
          right={'-18px'}
          w={'8px'}
          h={'36px'}
          position={'absolute'}
          color={'transparent'}
          name="polygon"
        ></Icon>
      </Flex>
      <Flex mt={'24px'} gap={'15px'} justifyContent="center">
        {data?.map((item, index) => (
          <Box
            transition={'all 0.5s'}
            onClick={() => scrollTo(index)}
            key={index}
            w="8px"
            h="8px"
            borderRadius="50%"
            background={activeIndex === index ? 'rgba(0,0,0,40%)' : 'rgba(0,0,0,15%)'}
          ></Box>
        ))}
      </Flex>
    </Box>
  );
};

export default Carousel;
