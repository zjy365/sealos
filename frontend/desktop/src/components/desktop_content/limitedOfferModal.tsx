import { Box, Flex, Center, Button, Text } from '@chakra-ui/react';
import { X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export const LimitedOfferModal = ({ onUpgrade }: { onUpgrade: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 处理限时优惠弹窗显示逻辑
  useEffect(() => {
    const hasClosedOffer = localStorage.getItem('limitedOfferClosed');
    if (!hasClosedOffer) {
      setIsOpen(true);
    }
  }, []);

  // 处理关闭弹窗
  const handleClose = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem('limitedOfferClosed', 'true');
  }, []);

  if (!isOpen) return null;

  return (
    <Box position="fixed" bottom="16px" right="16px" zIndex="9999">
      <Box
        bg="white"
        borderRadius="12px"
        p="20px"
        w="356px"
        border={'1px solid #A6C4FF'}
        position="relative"
        boxShadow="0px 10px 15px -3px rgba(0, 0, 0, 0.10), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)"
      >
        <Box position="absolute" top="16px" right="16px" cursor={'pointer'} onClick={handleClose}>
          <X size={20} color="#A6C4FF" />
        </Box>
        {/* 星星图标和标题 */}
        <Flex align="center" mb="16px">
          <Center
            bg="linear-gradient(270deg, rgba(28, 78, 245, 0.20) 3.93%, rgba(111, 89, 245, 0.20) 80.66%)"
            borderRadius="4px"
            w="24px"
            h="24px"
            mr="12px"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M4.76116 8.09995C4.70759 7.89231 4.59937 7.70282 4.44774 7.55119C4.29611 7.39956 4.10662 7.29133 3.89898 7.23777L0.218079 6.28859C0.15528 6.27077 0.100008 6.23294 0.060651 6.18086C0.021294 6.12878 0 6.06528 0 6C0 5.93472 0.021294 5.87122 0.060651 5.81914C0.100008 5.76705 0.15528 5.72923 0.218079 5.71141L3.89898 4.76163C4.10655 4.70812 4.29599 4.59998 4.44761 4.44846C4.59923 4.29694 4.7075 4.10758 4.76116 3.90005L5.71034 0.219144C5.72798 0.156097 5.76576 0.100552 5.81792 0.0609847C5.87009 0.0214174 5.93376 0 5.99923 0C6.0647 0 6.12837 0.0214174 6.18053 0.0609847C6.23269 0.100552 6.27048 0.156097 6.28812 0.219144L7.23669 3.90005C7.29026 4.10769 7.39849 4.29718 7.55012 4.44881C7.70174 4.60044 7.89124 4.70867 8.09887 4.76223L11.7798 5.71081C11.8431 5.72827 11.8989 5.76601 11.9387 5.81825C11.9785 5.87049 12 5.93434 12 6C12 6.06566 11.9785 6.12951 11.9387 6.18175C11.8989 6.23399 11.8431 6.27173 11.7798 6.28919L8.09887 7.23777C7.89124 7.29133 7.70174 7.39956 7.55012 7.55119C7.39849 7.70282 7.29026 7.89231 7.23669 8.09995L6.28752 11.7809C6.26988 11.8439 6.23209 11.8994 6.17993 11.939C6.12777 11.9786 6.0641 12 5.99863 12C5.93316 12 5.86949 11.9786 5.81733 11.939C5.76516 11.8994 5.72738 11.8439 5.70973 11.7809L4.76116 8.09995Z"
                fill="url(#paint0_linear_827_55721)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_827_55721"
                  x1="11.5346"
                  y1="10.814"
                  x2="2.25007"
                  y2="10.7362"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#1C4EF5" />
                  <stop offset="1" stopColor="#6F59F5" />
                </linearGradient>
              </defs>
            </svg>
          </Center>
          <Text fontSize="16px" fontWeight="600" color="#18181B">
            Limited-time recurring offer
          </Text>
        </Flex>

        <Text
          fontSize="14px"
          fontWeight="400"
          color="#18181B"
          mt={'8px'}
          mb="12px"
          lineHeight="1.5"
        >
          Get 50% off on annual Hobby & Pro plans! Upgrade now to unlock advanced features at half
          the price.
        </Text>

        {/* 升级按钮 */}
        <Button
          bg="linear-gradient(270deg, #1C4EF5 3.93%, #6F59F5 80.66%)"
          color="white"
          width="fit-content"
          borderRadius="8px"
          fontWeight="500"
          fontSize="14px"
          py="8px"
          _hover={{
            transform: 'translateY(-1px)'
          }}
          _active={{
            transform: 'translateY(0)'
          }}
          onClick={() => {
            onUpgrade();
            console.log('升级按钮被点击');
            handleClose();
          }}
        >
          Upgrade now
        </Button>
      </Box>
    </Box>
  );
};
