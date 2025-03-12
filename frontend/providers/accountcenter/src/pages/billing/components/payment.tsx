import React from 'react';
import { useRouter } from 'next/router';
import { Button, Text, Flex, Tag, TagLabel, IconButton, Tooltip, Center } from '@chakra-ui/react';
import Card from '@/components/Card';
import MyIcon from '@/components/Icon';
import { useTranslation } from 'next-i18next';
import { Ellipsis, Settings, Trash2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent, PopoverBody } from '@chakra-ui/react';
import Empty from './empty';
import { CardSchema } from '@/schema/card';
import z from 'zod';

const Payment = ({
  cardList,
  handleSetDefault,
  handleDelete,
  ...props
}: {
  handleSetDefault: (id: string) => void;
  handleDelete: (id: string) => void;
  cardList: z.infer<typeof CardSchema>[];
} & any) => {
  const { t } = useTranslation();
  const handleAddCard = () => {};

  return (
    <Card {...props}>
      <Flex justify={'space-between'} align={'center'} mb={'16px'}>
        <Text fontSize={'18px'} fontWeight={600} lineHeight={'28px'}>
          {t('PayMethod')}
        </Text>
        <Button onClick={handleAddCard} variant={'outline'} colorScheme={'gray'}>
          {t('AddPayment')}
        </Button>
      </Flex>
      <Flex gap={'8px'} direction={'column'}>
        {cardList.length !== 0 ? (
          cardList.map((item: z.infer<typeof CardSchema>) => (
            <Flex
              key={item.id}
              justify={'space-between'}
              align={'center'}
              pl={'12px'}
              pr={'16px'}
              py={'12px'}
              bg={'#F9F9F9'}
              borderRadius={'xl'}
            >
              <Flex align={'center'}>
                <Center
                  border={'1.5px solid #E4E4E7'}
                  borderRadius={'6px'}
                  w={'52.5px'}
                  h={'36px'}
                  mr={'12px'}
                >
                  <MyIcon name={item.cardBrand.toLowerCase() as 'mastercard' | 'visa'} />
                </Center>
                <Text fontSize={'16px'} fontWeight={600} lineHeight={'24px'} mr={'8px'}>
                  {item.cardBrand}
                </Text>
                <Text fontSize={'16px'} fontWeight={600} lineHeight={'24px'} mr={'12px'}>
                  {item.cardNo}
                </Text>
                {item.default && (
                  <Tag
                    variant={'subtle'}
                    size={'md'}
                    colorScheme={'gray'}
                    borderRadius={'full'}
                    mr={'8px'}
                  >
                    <TagLabel>{t('Default')}</TagLabel>
                  </Tag>
                )}
                {item.lastPaymentStatus.toLowerCase() === 'failed' && (
                  <Tag
                    variant={'outline'}
                    size={'md'}
                    colorScheme={'red'}
                    borderRadius={'full'}
                    bg={'#FEF2F2'}
                  >
                    <TagLabel>{t('NotAvailable')}</TagLabel>
                  </Tag>
                )}
              </Flex>
              <Popover>
                <PopoverTrigger>
                  <IconButton aria-label="More" icon={<Ellipsis />} variant={'ghost'} />
                </PopoverTrigger>
                <PopoverContent
                  width={'160px'}
                  borderRadius={'xl'}
                  shadow={'0px 4px 12px 0px #00000014'}
                >
                  <PopoverBody p={'8px'}>
                    <Tooltip
                      hasArrow
                      label={
                        item.default
                          ? t('DefaultToDefault')
                          : item.lastPaymentStatus.toLowerCase() === 'failed'
                          ? t('FailedToDefault')
                          : ''
                      }
                    >
                      <Button
                        onClick={() => handleSetDefault(item.id)}
                        variant={'ghost'}
                        w={'100%'}
                        justifyContent={'flex-start'}
                        disabled={item.default || item.lastPaymentStatus.toLowerCase() === 'failed'}
                      >
                        <Settings size={'16px'} />
                        <Text fontSize={'14px'} lineHeight={'20px'} ml={'8px'}>
                          {t('SetDefault')}
                        </Text>
                      </Button>
                    </Tooltip>
                    <Tooltip
                      hasArrow
                      label={
                        item.default
                          ? t('DeleteDefault')
                          : cardList.length === 1
                          ? t('DeleteOnlyOne')
                          : ''
                      }
                    >
                      <Button
                        onClick={() => handleDelete(item.id)}
                        variant={'ghost'}
                        w={'100%'}
                        justifyContent={'flex-start'}
                        disabled={item.default || cardList.length === 1}
                      >
                        <Trash2 size={'16px'} />
                        <Text fontSize={'14px'} lineHeight={'20px'} ml={'8px'}>
                          {t('Delete')}
                        </Text>
                      </Button>
                    </Tooltip>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </Flex>
          ))
        ) : (
          <Center
            borderRadius={'xl'}
            border={'1px dashed #D4D4D4'}
            cursor={'pointer'}
            onClick={handleAddCard}
          >
            <Empty
              title={t('NoPayment')}
              description={t('NoPaymentPrompt')}
              Icon={<MyIcon name={'emptyPayment'} color={'white'} w={'90px'} h={'90px'} />}
            />
          </Center>
        )}
      </Flex>
    </Card>
  );
};

export default Payment;
