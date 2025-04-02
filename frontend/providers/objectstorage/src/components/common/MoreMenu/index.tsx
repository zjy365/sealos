import { IconButton, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { TBucket } from '@/consts';
import MoreIcon from '@/components/Icons/MoreIcon';
import EditIcon from '@/components/Icons/EditIcon';
import DeleteBucketModal from '@/components/common/modal/DeleteBucketModal';
import { bucketConfigQueryParam } from '@/consts';
import { useCopyData } from '@/utils/tools';
import CopyIcon from '@/components/Icons/CopyIcon';

export default function MoreMenu({ bucket }: { bucket: TBucket }) {
  const router = useRouter();
  const { t } = useTranslation(['common', 'bucket']);
  const [hoverIdx, setHoverIdx] = useState(-1);
  const { copyData } = useCopyData();
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        variant={'white-bg-icon'}
        icon={<MoreIcon transform="rotate(90deg)" w="16px" h="16px" color="grayModern.500" />}
        p="8px"
        onClick={(e) => e.stopPropagation()}
      ></MenuButton>
      <MenuList
        p="6px"
        minW={'85px'}
        fontSize={'12px'}
        onClick={(e) => e.stopPropagation()}
        boxShadow={'0px 0px 1px 0px #13336B1A, 0px 4px 10px 0px #13336B1A'}
      >
        <MenuItem
          px="4px"
          py="6px"
          display={'flex'}
          gap={'8px'}
          onClick={() => {
            copyData(bucket.name);
          }}
          fill={'grayModern.600'}
          color={'grayModern.600'}
          alignItems={'center'}
        >
          <CopyIcon w={'16px'} h={'16px'} fill={'inherit'} />
          <Text fontSize={'12px'} fontWeight={500}>
            {t('copy')}
          </Text>
        </MenuItem>
        <MenuItem
          px="4px"
          py="6px"
          display={'flex'}
          gap={'8px'}
          onClick={() => {
            const _params: bucketConfigQueryParam = {
              bucketName: bucket.crName,
              bucketPolicy: bucket.policy
            };
            const params = new URLSearchParams(_params);
            router.push('/bucketConfig?' + params.toString());
          }}
          fill={'grayModern.600'}
          color={'grayModern.600'}
          alignItems={'center'}
        >
          <EditIcon w="16px" h="16px" fill={'inherit'} />
          <Text fontSize={'12px'} fontWeight={500}>
            {t('edit')}
          </Text>
        </MenuItem>
        <MenuItem p="0">
          <DeleteBucketModal
            borderTop={'1px solid #F4F4F5'}
            color={'#DC2626'}
            layout="sm"
            bucketName={bucket.name}
          />
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
