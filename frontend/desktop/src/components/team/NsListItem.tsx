import { Box, Flex, FlexProps, HStack, Text, VStack } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckIcon } from 'lucide-react';
import { useTranslation } from 'next-i18next';

const NsListItem = ({
  isSelected,
  isPrivate,
  displayPoint = false,
  teamName,
  selectedColor = 'white',
  showCheck = false,
  ...flexprop
}: {
  displayPoint: boolean;
  teamName: string;
  isPrivate: boolean;
  isSelected: boolean;
  selectedColor?: string;
  showCheck?: boolean;
} & FlexProps) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return (
    <Flex
      align={'center'}
      px={'8px'}
      position={'relative'}
      onClick={(e) => {
        e.preventDefault();
        queryClient.invalidateQueries({ queryKey: ['teamList'] });
      }}
      cursor={'pointer'}
      {...flexprop}
      // {...(isSelected
      //   ? {
      //       background: 'rgba(255, 244, 244, 0.10)'
      //     }
      //   : {
      //       bgColor: 'unset'
      //     })}
      // _hover={{
      //   '> .namespace-option': {
      //     display: 'flex'
      //   },
      //   bgColor: 'rgba(255, 244, 244, 0.10)'
      // }}
    >
      <HStack
        align={'center'}
        width={'full'}
        justifyContent={'space-between'}
        px={'8px'}
        borderRadius={'8px'}
        p={'6px 8px'}
        _hover={{
          bg: '#F4F4F5'
        }}
      >
        <Text textTransform={'capitalize'}>{isPrivate ? t('common:default_team') : teamName}</Text>

        {isSelected && showCheck && <CheckIcon size={16} color={'#1C4EF5'} />}
      </HStack>
    </Flex>
  );
};

export default NsListItem;
