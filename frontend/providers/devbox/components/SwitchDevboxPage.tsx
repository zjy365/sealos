import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, ButtonProps, Flex, FlexProps, Text } from '@chakra-ui/react';

export default function SwitchPage({
  totalPage,
  totalItem,
  pageSize,
  currentPage,
  setCurrentPage,
  isPreviousData,
  ...props
}: {
  currentPage: number;
  totalPage: number;
  totalItem: number;
  pageSize: number;
  isPreviousData?: boolean;
  setCurrentPage: (idx: number) => void;
} & FlexProps) {
  const t = useTranslations();
  const switchStyle: ButtonProps = {
    variant: 'unstyled',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minW: '0',
    boxSize: '32px',
    flexGrow: '0'
    // _disabled: {
    //   borderRadius: 'full',
    //   background: 'grayModern.150',
    //   cursor: 'not-allowed',
    //   minW: '0'
    // }
  };
  const instance = useMemo(
    () => new Array(totalPage).fill(0).map((_, index) => index + 1),
    [totalPage]
  );
  return (
    <Flex
      w={'full'}
      px={'24px'}
      pb={2}
      align={'center'}
      fontSize="14px"
      justifyContent={'space-between'}
      {...props}
    >
      <Flex>
        <Text fontSize="14px" color={'neutral.600'}>
          {t('total_page_items')}&nbsp;
        </Text>
        <Flex mr="25px" color={'neutral.900'} fontWeight={'bold'}>
          {totalItem}
        </Flex>
      </Flex>
      <Flex gap={'8px'}>
        <Button
          {...switchStyle}
          variant={'unstyled'}
          isDisabled={currentPage === 1}
          color={currentPage === 1 ? 'neutral.400' : 'black'}
          p="0"
          minW="0"
          boxSize="32px"
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage(currentPage - 1);
          }}
        >
          <ChevronLeft size={'18px'} />
          {/* <MyIcon name="prePage" boxSize={'12px'} fill={'currentcolor'} /> */}
          {/* <RightArrowIcon boxSize={'6px'} transform={'rotate(180deg)'} fill={'currentcolor'} /> */}
        </Button>
        {instance.map((val, index) => (
          <Button
            variant={'unstyled'}
            key={val}
            p="0"
            minW="0"
            background="white"
            fontWeight={'normal'}
            color={'#0A0A0A'}
            borderRadius="full"
            boxSize="32px"
            {...(currentPage === index + 1 && {
              bg: '#F4F4F5',
              color: 'black'
            })}
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(index + 1);
            }}
          >
            {index + 1}
          </Button>
        ))}
        <Button
          {...switchStyle}
          variant={'unstyled'}
          isDisabled={currentPage === totalPage}
          boxSize="32px"
          p="0"
          color={currentPage === totalPage ? 'neutral.400' : 'black'}
          minW="0"
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage(currentPage + 1);
          }}
        >
          <ChevronRight size={'18px'} />
          {/* <MyIcon
            name="prePage"
            boxSize={'12px'}
            fill={'currentcolor'}
            transform={'rotate(180deg)'}
          /> */}
        </Button>
      </Flex>
    </Flex>
  );
}
