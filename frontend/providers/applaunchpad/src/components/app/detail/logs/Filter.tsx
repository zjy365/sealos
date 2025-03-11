import MyIcon from '@/components/Icon';
import { JsonFilterItem, LogsFormData } from '@/pages/app/detail/logs';
import {
  Button,
  ButtonProps,
  Center,
  Flex,
  Input,
  Switch,
  Text,
  Box,
  useDisclosure,
  Portal,
  BoxProps,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react';
import { MySelect } from '@sealos/ui';
import { debounce } from 'lodash';
import { Filter as FilterIcon, Search } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';

export const Filter = ({
  formHook,
  refetchData
}: {
  formHook: UseFormReturn<LogsFormData>;
  refetchData: () => void;
}) => {
  const { t } = useTranslation();
  const [inputKeyword, setInputKeyword] = useState(formHook.watch('keyword'));
  const { isOpen, onToggle, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isJsonMode = formHook.watch('isJsonMode');
  const isOnlyStderr = formHook.watch('isOnlyStderr');
  const filterKeys = formHook.watch('filterKeys');

  const { fields, append, remove } = useFieldArray({
    control: formHook.control,
    name: 'jsonFilters'
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        btnRef.current &&
        !btnRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <Box position="relative">
      <Button
        ref={btnRef}
        onClick={() => {
          onToggle();
          formHook.setValue('isJsonMode', !isJsonMode);
          formHook.setValue('jsonFilters', []);
        }}
        variant="outline"
        width="fit-content"
        h={'40px'}
        boxShadow={'none'}
        bg={'#fff'}
        color={'#181818'}
        borderRadius={'8px'}
        border={'1px dashed #D4D4D4'}
        leftIcon={<FilterIcon size={16} color="#737373" />}
      >
        {t('by_json')}
      </Button>

      <Portal>
        {isOpen && (
          <FloatingBox
            ref={menuRef}
            position="fixed"
            top={btnRef.current ? btnRef.current.getBoundingClientRect().bottom + 4 : '44px'}
            left={btnRef.current ? btnRef.current.getBoundingClientRect().left : 0}
            zIndex={1000}
            boxShadow="lg"
            bg="white"
            borderRadius="md"
            maxW="90vw"
            w="auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Flex
              p={'6'}
              flexDir={'column'}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              bg="white"
            >
              <Flex gap={'18px'} flexWrap="wrap">
                <Flex alignItems={'center'} gap={'12px'}>
                  <Text
                    fontSize={'12px'}
                    fontWeight={'500'}
                    lineHeight={'16px'}
                    color={'grayModern.900'}
                  >
                    {t('only_stderr')}
                  </Text>
                  <Switch
                    isChecked={isOnlyStderr}
                    onChange={() => formHook.setValue('isOnlyStderr', !isOnlyStderr)}
                  />
                </Flex>
                <InputGroup w={'200px'}>
                  <InputLeftElement pointerEvents="none" h={'40px'} w={'40px'}>
                    <Search color="#666666" size={16} />
                  </InputLeftElement>
                  <Input
                    height="40px"
                    w={'300px'}
                    width={'fit-content'}
                    bg={'#F5F5F5'}
                    border={'none'}
                    placeholder={t('search_keyword')}
                    _hover={{
                      bg: 'white',
                      border: '1px solid #E8EBF0'
                    }}
                    _focus={{
                      border: '1px solid #E8EBF0'
                    }}
                    value={inputKeyword}
                    onChange={(e) =>
                      debounce(() => {
                        setInputKeyword(e.target.value);
                        formHook.setValue('keyword', e.target.value);
                        refetchData();
                      }, 3000)
                    }
                  />
                </InputGroup>
              </Flex>

              {/* json mode */}
              {isJsonMode && (
                <Flex
                  w={'100%'}
                  bg={'grayModern.50'}
                  minH={'40px'}
                  mt={'24px'}
                  p={'12px'}
                  gap={'12px'}
                  flexWrap={'wrap'}
                  borderRadius={'0px 8px 8px 8px'}
                >
                  {filterKeys.length > 0 || fields.length > 0 ? (
                    <AppendJSONFormItemButton
                      onClick={() =>
                        append({
                          key: '',
                          value: '',
                          mode: '='
                        })
                      }
                    />
                  ) : (
                    <Center flex={1}>
                      <Text
                        fontSize={'12px'}
                        fontWeight={'400'}
                        lineHeight={'16px'}
                        color={'grayModern.500'}
                        py={'4px'}
                      >
                        {t('no_data_available')}
                      </Text>
                    </Center>
                  )}

                  {fields.map((field, index) => (
                    <Flex key={field.id} w={'fit-content'} gap={'2px'}>
                      <MySelect
                        height="32px"
                        minW={'160px'}
                        bg={'white'}
                        color={'grayModern.600'}
                        placeholder={t('field_name')}
                        value={formHook.watch(`jsonFilters.${index}.key`)}
                        list={formHook.watch('filterKeys')}
                        onchange={(val: string) =>
                          formHook.setValue(`jsonFilters.${index}.key`, val)
                        }
                      />
                      <MySelect
                        height="32px"
                        minW={'60px'}
                        bg={'white'}
                        color={'grayModern.600'}
                        value={formHook.watch(`jsonFilters.${index}.mode`)}
                        list={
                          [
                            { value: '=', label: t('equal') },
                            { value: '!=', label: t('not_equal') },
                            { value: '~', label: t('contains') },
                            { value: '!~', label: t('not_contains') }
                          ] as { value: JsonFilterItem['mode']; label: string }[]
                        }
                        onchange={(val: string) =>
                          formHook.setValue(
                            `jsonFilters.${index}.mode`,
                            val as JsonFilterItem['mode']
                          )
                        }
                      />
                      <Input
                        maxW={'160px'}
                        placeholder={t('value')}
                        bg={'white'}
                        value={formHook.watch(`jsonFilters.${index}.value`)}
                        onChange={(e) =>
                          formHook.setValue(`jsonFilters.${index}.value`, e.target.value)
                        }
                        border={'1px solid #E8EBF0'}
                        boxShadow={
                          '0px 1px 2px 0px rgba(19, 51, 107, 0.05),0px 0px 1px 0px rgba(19, 51, 107, 0.08)'
                        }
                      />
                      <Button
                        variant={'outline'}
                        h={'32px'}
                        w={'32px'}
                        _hover={{
                          bg: 'grayModern.50'
                        }}
                        onClick={() => remove(index)}
                      >
                        <MyIcon
                          name={'delete'}
                          color={'grayModern.600'}
                          w={'16px'}
                          h={'16px'}
                          _hover={{
                            color: 'red.600'
                          }}
                        />
                      </Button>
                      {index === fields.length - 1 && (
                        <AppendJSONFormItemButton
                          onClick={() =>
                            append({
                              key: '',
                              value: '',
                              mode: '='
                            })
                          }
                        />
                      )}
                    </Flex>
                  ))}
                </Flex>
              )}
            </Flex>
          </FloatingBox>
        )}
      </Portal>
    </Box>
  );
};

// 悬浮框组件
const FloatingBox = React.forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
  return <Box ref={ref} {...props} />;
});

FloatingBox.displayName = 'FloatingBox';

const AppendJSONFormItemButton = (props: ButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button
      variant={'outline'}
      h={'32px'}
      w={'32px'}
      _hover={{
        bg: 'grayModern.50'
      }}
      {...props}
    >
      <MyIcon
        name={'plus'}
        color={'grayModern.600'}
        w={'16px'}
        h={'16px'}
        _hover={{
          color: 'brightBlue.500'
        }}
      />
    </Button>
  );
};
