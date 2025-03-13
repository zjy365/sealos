import {
  Alert,
  Box,
  Divider,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuList,
  Button,
  Grid
} from '@chakra-ui/react';
import { useMessage } from '@sealos/ui';
import { createContext, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { listTag } from '@/api/template';
import { Tag, TagType } from '@/prisma/generated/client';
import { createTagSelectorStore } from '@/stores/tagSelector';

import MyIcon from '@/components/Icon';
import { TagCheckbox } from '../../TagCheckbox';
import MyFormLabel from '@/components/MyFormControl';

const TagSelectorStoreCtx = createContext<ReturnType<typeof createTagSelectorStore> | null>(null);

const TagList = ({ tags, title }: { tags: Tag[]; title: string }) => {
  const locale = useLocale();
  const t = useTranslations();
  const { message: toast } = useMessage();

  const { control, watch } = useFormContext<{ tags: Array<{ value: string }> }>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tags'
  });
  const currentTags = watch('tags');

  const containTag = (tagUid: string) => fields.findIndex((t) => t.value === tagUid) > -1;
  const handleTagClick = (tag: Tag, isChecked: boolean) => {
    const index = fields.findIndex((t) => t.value === tag.uid);
    if (currentTags.length >= 3 && isChecked) {
      toast({
        title: t('tag_limit_tips'),
        status: 'error'
      });
      return;
    }
    if (!isChecked) {
      if (index === -1) {
        return;
      }
      remove(index);
    } else {
      if (index > -1) {
        return;
      }
      append({ value: tag.uid });
    }
  };

  return (
    <Box>
      <Text fontSize="12px" fontWeight={500} color={'grayModern.600'} mb={'4'}>
        {title}
      </Text>
      <Grid gap={'8px'} templateColumns="repeat(2, minmax(100px, 1fr))" w={'full'}>
        {tags.map((tag) => (
          <Flex key={tag.uid} px={'8px'} py={'4px'} borderRadius="full">
            <TagCheckbox
              name={`tag-${tag.uid}`}
              isChecked={containTag(tag.uid)}
              onChange={(e) => handleTagClick(tag, e.target.checked)}
            >
              <Text color={'grayModern.900'}>
                {tag[locale === 'zh' ? 'zhName' : 'enName'] || tag.name}
              </Text>
            </TagCheckbox>
          </Flex>
        ))}
      </Grid>
    </Box>
  );
};

export default function TemplateRepositoryTagField() {
  const t = useTranslations();
  const locale = useLocale();

  const tagsQuery = useQuery(['template-repository-tags'], listTag, {
    staleTime: Infinity,
    cacheTime: Infinity
  });
  const { watch } = useFormContext<{ tags: Array<{ value: string }> }>();
  const currentTags = watch('tags');

  const tagList = (tagsQuery.data?.tagList || []).filter((tag) => tag.name !== 'official');

  const selectedTagList = tagList.filter((tag) => {
    return currentTags.some((currentTag) => {
      if (currentTag.value === tag.uid) {
        return true;
      }
    });
  });

  let tagListCollection = tagList.reduce(
    (acc, tag) => {
      if (!acc[tag.type]) {
        acc[tag.type] = [];
      }
      acc[tag.type].push(tag);
      return acc;
    },
    {
      [TagType.OFFICIAL_CONTENT]: [],
      [TagType.USE_CASE]: [],
      [TagType.PROGRAMMING_LANGUAGE]: []
    } as Record<TagType, Tag[]>
  );
  const tagSelectorStore = useRef(createTagSelectorStore()).current;

  return (
    <Flex align={'start'} direction={'column'} gap={4} w={'full'}>
      <MyFormLabel width="108px" m="0" fontSize="14px">
        {t('tags')}
      </MyFormLabel>

      <Box w={'full'}>
        <Menu>
          {({ isOpen }) => (
            <>
              <MenuButton
                as={Button}
                rightIcon={<MyIcon name="arrowDown" w={'16px'} h={'16px'} />}
                width="full"
                mb="12px"
                h={'40px'}
                variant="outline"
                textAlign="left"
                justifyContent="space-between"
                _hover={{
                  bg: 'grayModern.50'
                }}
                fontWeight={'400'}
              >
                {currentTags.length > 0
                  ? selectedTagList.map((tag) => (
                      <Box
                        key={tag.uid}
                        display={'inline-block'}
                        mx={'4px'}
                        borderRadius={'full'}
                        py={'1'}
                        fontWeight={'500'}
                        px={'3'}
                        bg={'#EFF6FF'}
                        color={'#224EF5'}
                      >
                        {tag[locale === 'zh' ? 'zhName' : 'enName'] || tag.name}
                      </Box>
                    ))
                  : t('please_select_tag')}
              </MenuButton>
              <MenuList w={'460px'}>
                <Box p={'4'}>
                  <TagSelectorStoreCtx.Provider value={tagSelectorStore}>
                    <TagList tags={tagListCollection[TagType.USE_CASE]} title={t('use_case')} />
                    <Divider my={'12px'} color={'grayModern.150'} />
                    <TagList
                      tags={tagListCollection[TagType.PROGRAMMING_LANGUAGE]}
                      title={t('programming_language')}
                    />
                  </TagSelectorStoreCtx.Provider>
                </Box>
              </MenuList>
            </>
          )}
        </Menu>
        <Alert
          status="info"
          borderRadius="md"
          py={'6px'}
          color={'grayModern.500'}
          bgColor={'grayModern.50'}
          px={'0'}
        >
          <Text fontSize="12px" fontWeight={400}>
            {t('select_tag_tips')}
          </Text>
        </Alert>
      </Box>
    </Flex>
  );
}
