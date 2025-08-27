import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';
import Icon from '../Icon';
import Image from 'next/image';
import style from './index.module.css';
import { useRouter } from 'next/router';

const data = [
  {
    title: 'n8n',
    content:
      'A workflow automation platform that gives technical teams the flexibility of code with the speed of no-code.',
    icon: <Image src="/images/n8n-logo.png" alt="n8n" width={48} height={48} />,
    image: '/images/n8n-bg.png',
    url: 'n8n'
  },
  {
    title: 'OpenList',
    content:
      'A community-driven fork of AList — built to defend open source against trust-based attacks.',
    icon: <Image src="/images/openlist-logo.png" alt="openlist" width={48} height={48} />,
    image: '/images/openlist-bg.png',
    url: 'openlist'
  },
  {
    title: 'WordPress',
    content:
      'A versatile open-source CMS powering websites and blogs with customizable themes, plugins, and scalability.',
    icon: <Image src="/images/wordpress-logo.png" alt="wordpress" width={48} height={48} />,
    image: '/images/WordPress.png',
    url: 'wordpress'
  }
];

const bgcolor = [
  'linear-gradient(97deg, #621EEC 0%, #845CD6 59.76%)',
  'linear-gradient(97deg, #0BB8D3 0%, #5ADDE2 59.76%)',
  'linear-gradient(97deg, #476FEB 0%, #6C80DA 59.76%)'
];

const breakpoints = {
  base: '0px',
  lg: '1024px'
};

export default function Carousel({}: {}) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const router = useRouter();
  const goDeploy = (name: string) => {
    if (!name) return;
    router.push({
      pathname: '/deploy',
      query: {
        templateName: name
      }
    });
  };
  return (
    <Box mb={'32px'}>
      <Flex position={'relative'} gap={'16px'} w="100%" h="220px" justifyContent="center">
        <Icon
          cursor={'pointer'}
          onClick={() => {
            setActiveIndex(Math.max(activeIndex - 1, 0));
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
        {data.map((item, index) => (
          <Box
            cursor={'pointer'}
            display={{ lg: 'block', base: activeIndex === index ? 'block' : 'none' }}
            overflow={'hidden'}
            position={'relative'}
            color={'white'}
            p={'32px 28px'}
            transition={'all 0.5s'}
            onClick={() => {
              if (activeIndex !== index) {
                setActiveIndex(index);
              } else {
                goDeploy(item.url);
              }
            }}
            borderRadius={'16px'}
            w={{ lg: activeIndex === index ? '720px' : '296px', base: '944px' }}
            key={index}
            background={bgcolor[index]}
          >
            <Box w={'297px'}>
              <Box w={'48px'} h={'48px'} bg={'white'} borderRadius={'12px'} overflow={'hidden'}>
                {item.icon}
              </Box>
              <Text mt={'16px'} mb={'8px'} fontSize={'18px'} fontWeight={600} lineHeight={'28px'}>
                {item.title}
              </Text>
              <Text
                transition={'all 0.5s'}
                opacity={activeIndex === index ? '1' : '0'}
                fontSize={'12px'}
                fontWeight={400}
                lineHeight={'20px'}
              >
                {item.content}
              </Text>
            </Box>
            <Box
              position="absolute"
              left={activeIndex === index ? '332px' : '160px'}
              top="33px"
              width="352px"
              height="220px"
              borderRadius="16px"
              overflow="hidden"
              transition="all 0.5s"
            >
              <Image
                className={style.left}
                src={item.image}
                alt=""
                fill
                style={{
                  objectFit: 'cover'
                }}
              />
            </Box>
          </Box>
        ))}
        <Icon
          cursor={'pointer'}
          onClick={() => {
            setActiveIndex(Math.min(activeIndex + 1, data.length - 1));
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
      <Flex mt={'16px'} gap={'15px'} justifyContent="center">
        {data.map((item, index) => (
          <Box
            transition={'all 0.5s'}
            onClick={() => setActiveIndex(index)}
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
}
