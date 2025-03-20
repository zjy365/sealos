/* eslint-disable jsx-a11y/alt-text */
import useAppStore from '@/stores/app';
import { Box, Flex, Image, Text } from '@chakra-ui/react';
import clsx from 'clsx';
import React, { useRef, useState } from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import styles from './index.module.scss';
import { useTranslation } from 'next-i18next';
import { useConfigStore } from '@/stores/config';
import { Minus, Square, SquareSquare, X } from 'lucide-react';
import { MaximizeIcon, MinimizeIcon } from '@/components/icons';

export default function AppWindow(props: {
  style?: React.CSSProperties;
  pid: number;
  children: any;
}) {
  const { pid } = props;
  const {
    closeAppById,
    updateOpenedAppInfo,
    setToHighestLayerById,
    currentApp,
    currentAppPid,
    findAppInfoById,
    maxZIndex
  } = useAppStore();
  const logo = useConfigStore().layoutConfig?.logo;
  const { t, i18n } = useTranslation();
  const wnapp = findAppInfoById(pid);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragDom = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  if (!wnapp) return null;

  const handleDragBoundary: DraggableEventHandler = (e, position) => {
    const { x, y } = position;
    const desktopHeight = document.getElementById('desktop')?.clientHeight;
    if (!desktopHeight) {
      setPosition({ x: 0, y: 0 });
      return;
    }
    const appHeaderHeight = dragDom.current?.querySelector('.windowHeader')?.clientHeight || 30;
    const appHeaderWidth = dragDom.current?.querySelector('.windowHeader')?.clientWidth || 3000;

    if (currentApp()?.size === 'maxmin') {
      let upperBoundary = -desktopHeight * 0.1;
      let lowerBoundary = desktopHeight * 0.9 - appHeaderHeight;
      setPosition({
        x:
          x < 0
            ? x < -0.9 * appHeaderWidth // (0.8width + width/0.70*0.15)
              ? 0
              : x
            : x > 0.9 * appHeaderWidth
            ? 0
            : x,
        y: y < upperBoundary ? upperBoundary : y > lowerBoundary ? 0 : y
      });
    } else {
      setPosition({
        x: x < 0 ? (x < -0.8 * appHeaderWidth ? 0 : x) : x > 0.8 * appHeaderWidth ? 0 : x,
        y: y < 0 ? 0 : y > desktopHeight - appHeaderHeight ? 0 : y
      });
    }
  };

  return (
    <Draggable
      onStart={() => {
        setDragging(true);
      }}
      onDrag={(e, position) => {
        setPosition(position);
      }}
      onStop={(e, position) => {
        handleDragBoundary(e, position);
        setDragging(false);
      }}
      handle=".windowHeader"
      position={position}
    >
      <Box
        ref={dragDom}
        className={clsx(styles.windowContainer, dragging ? styles.notrans : '')}
        data-size={wnapp?.size}
        data-hide={!wnapp?.isShow}
        id={wnapp?.icon + 'App'}
        style={{
          zIndex: wnapp?.zIndex
        }}
        borderRadius="16px"
        border="1px solid #B0CBFF"
        bg="#FFF"
        boxShadow="0px 4px 6px 0px rgba(0, 0, 0, 0.24)"
        backdropFilter="blur(100px)"
      >
        {/* app window header */}
        <Flex
          cursor={'pointer'}
          h="40px"
          justifyContent={'center'}
          borderBottom={'1px solid #E4E4E7'}
          background={'#FFF'}
          className={'windowHeader'}
          borderRadius={'16px 16px 0 0'}
          onClick={() => {
            setToHighestLayerById(pid);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            updateOpenedAppInfo({
              ...wnapp,
              size: wnapp?.size === 'maxmin' ? 'maximize' : 'maxmin',
              cacheSize: wnapp?.size === 'maxmin' ? 'maximize' : 'maxmin'
            });
            setPosition({ x: 0, y: 0 });
          }}
          position={'relative'}
        >
          <Flex alignItems={'center'} fontSize={'12px'} fontWeight={400}>
            <Image
              src={wnapp?.icon}
              fallbackSrc={logo}
              alt={wnapp?.name}
              width={'20px'}
              height={'20px'}
            />

            <Box ml="8px" fontSize={'12px'} fontWeight={400}>
              {wnapp?.i18n?.[i18n?.language]?.name
                ? wnapp.i18n?.[i18n?.language]?.name
                : wnapp?.name}
            </Box>
            {wnapp?.menuData &&
              wnapp?.menuData?.length > 0 &&
              wnapp?.menuData?.map((item) => (
                <Text
                  key={item.name}
                  color={'#24282C'}
                  ml="16px"
                  onClick={() => {
                    typeof item?.link === 'string' && window.open(item?.link);
                  }}
                >
                  {item.name}
                </Text>
              ))}
          </Flex>
          <Flex position={'absolute'} right={'0'}>
            <Box
              width={'54px'}
              height={'40px'}
              borderLeft={'1px solid #E4E4E7'}
              borderBottom={'1px solid #E4E4E7'}
              className={styles.uicon}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                updateOpenedAppInfo({
                  ...wnapp,
                  size: 'minimize',
                  cacheSize: wnapp.size
                });
              }}
            >
              <Minus size={16} color={'#525252'} />
            </Box>
            <Box
              width={'54px'}
              height={'40px'}
              borderLeft={'1px solid #E4E4E7'}
              borderRight={'1px solid #E4E4E7'}
              borderBottom={'1px solid #E4E4E7'}
              className={styles.uicon}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setPosition({ x: 0, y: 0 });
                updateOpenedAppInfo({
                  ...wnapp,
                  size: wnapp?.size === 'maxmin' ? 'maximize' : 'maxmin',
                  cacheSize: wnapp?.size === 'maxmin' ? 'maximize' : 'maxmin'
                });
              }}
            >
              {wnapp.size === 'maximize' ? (
                <MinimizeIcon color={'#525252'} width={'16px'} height={'16px'} />
              ) : (
                <MaximizeIcon color={'#525252'} width={'16px'} height={'16px'} />
              )}
            </Box>
            <Box
              width={'54px'}
              height={'40px'}
              borderBottom={'1px solid #E4E4E7'}
              className={clsx(styles.uicon)}
              data-type={'close'}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                updateOpenedAppInfo({
                  ...wnapp,
                  isShow: false
                });
                closeAppById(currentAppPid);
              }}
            >
              <X size={16} color={'#525252'} />
            </Box>
          </Flex>
        </Flex>
        {/* app switch mask */}
        <div
          className={styles.appMask}
          onClick={() => {
            setToHighestLayerById(pid);
          }}
          style={{ pointerEvents: wnapp.zIndex !== maxZIndex ? 'unset' : 'none' }}
        ></div>
        {/* app window content */}
        <Flex flexGrow={1} overflow={'hidden'} borderRadius={'0 0 16px 16px'} position={'relative'}>
          {/* Drag necessary to improve fluency */}
          {dragging && (
            <Box
              position={'absolute'}
              w="100%"
              h="100%"
              background={'transparent'}
              zIndex={8888}
            ></Box>
          )}
          {props.children}
        </Flex>
      </Box>
    </Draggable>
  );
}
