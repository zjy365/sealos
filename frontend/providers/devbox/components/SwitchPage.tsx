import { Button, ButtonProps, Flex, FlexProps, Text } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import MyIcon from './Icon';

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
    width: '24px',
    height: '24px',
    minW: '0',
    background: 'grayModern.250',
    flexGrow: '0',
    borderRadius: 'full',
    _hover: {
      background: 'grayModern.150',
      minW: '0'
    },
    _disabled: {
      borderRadius: 'full',
      background: 'grayModern.150',
      cursor: 'not-allowed',
      minW: '0'
    }
  };
  return (
    <Flex
      w={'full'}
      py={'15px'}
      px={'24px'}
      align={'center'}
      fontSize="14px"
      justifyContent={'space-between'}
      {...props}
    >
      <Flex>
        <Text fontSize="14px" color={'neutral.600'}>
          {t('total_page_items')}:
        </Text>
        <Flex mr="25px" color={'neutral.900'}>
          {totalItem}
        </Flex>
      </Flex>
      <Flex>
        <Flex gap={'8px'}>
          <Button
            {...switchStyle}
            isDisabled={currentPage === 1}
            bg={currentPage !== 1 ? 'neutral.400' : 'black'}
            p="0"
            minW="0"
            boxSize="32px"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(currentPage - 1);
            }}
            color={currentPage === 1 ? 'grayModern.400' : 'grayModern.900'}
          >
            <MyIcon name="prePage" boxSize={'12px'} fill={'currentcolor'} />
            {/* <RightArrowIcon boxSize={'6px'} transform={'rotate(180deg)'} fill={'currentcolor'} /> */}
          </Button>
          {new Array(totalPage).fill(0).map((_, index) => (
            <Button
              key={index}
              {...switchStyle}
              isDisabled={currentPage === index + 1}
              bg={currentPage === index + 1 ? '#F4F4F5' : 'none'}
              p="0"
              boxSize="32px"
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
            isDisabled={isPreviousData ?? currentPage >= totalPage}
            boxSize="32px"
            p="0"
            color={currentPage === totalPage ? 'neutral.400' : 'black'}
            minW="0"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(currentPage + 1);
            }}
          >
            <MyIcon
              name="prePage"
              boxSize={'12px'}
              fill={'currentcolor'}
              transform={'rotate(180deg)'}
            />
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
