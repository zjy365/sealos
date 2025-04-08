import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';
import Icon from '../Icon';
import Image from 'next/image';
import style from './index.module.css';
import { useRouter } from 'next/router';

const data = [
  {
    title: 'Affine',
    content:
      'A collaborative workspace integrating documents, whiteboards, and databases for seamless team productivity.',
    icon: <Icon w={'48px'} h={'48px'} name="affine"></Icon>,
    image: '/images/Affine.png',
    url: 'affine'
  },
  {
    title: 'Dify',
    content:
      'A no-code/low-code platform for building and deploying AI-powered applications like chatbots and automations.',
    icon: <Icon color={'white'} w={'48px'} h={'48px'} name="dify"></Icon>,
    image: '/images/Dify.png',
    url: 'dify'
  },
  {
    title: 'WordPress',
    content:
      'A versatile open-source CMS powering websites and blogs with customizable themes, plugins, and scalability.',
    icon: <Icon w={'48px'} h={'48px'} name="wordPress"></Icon>,
    image: '/images/WordPress.png',
    url: 'wordpress'
  }
];

const bgcolor = [
  'linear-gradient(95.29deg, #242492 0%, #524FCF 100%)',
  'linear-gradient(98.82deg, #123CC0 0%, #5A7BE6 74.64%)',
  'linear-gradient(98.82deg, #09BAD6 0%, #20C19E 74.64%)'
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
              {/* <Box w={'48px'} h={'48px'} bg={'white'} borderRadius={'50%'}></Box> */}
              {item.icon}
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
            <Image
              className={style.left}
              src={item.image}
              alt=""
              style={{
                position: 'absolute',
                transition: 'all 0.5s',
                left: activeIndex === index ? '332px' : '160px',
                top: '33px',
                borderRadius: '16px'
              }}
              width={352}
              height={220}
            ></Image>
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
