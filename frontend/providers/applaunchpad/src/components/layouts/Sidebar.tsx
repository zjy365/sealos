import { Center, Text, Stack, HStack, Divider, Flex } from '@chakra-ui/react';
import MyIcon from '../Icon';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

export const ROUTES = {
  OVERVIEW: '/app/detail',
  MONITOR: '/app/detail/monitor',
  LOGS: '/app/detail/logs'
} as const;

export default function Sidebar() {
  const { t } = useTranslation();
  const router = useRouter();

  const siderbarMap = [
    {
      label: t('overview'),
      icon: (
        <MyIcon
          name="pods"
          w={'24px'}
          h={'24px'}
          color={router.pathname === ROUTES.OVERVIEW ? 'grayModern.900' : 'grayModern.500'}
        />
      ),
      path: ROUTES.OVERVIEW
    },
    {
      label: t('monitor'),
      icon: (
        <MyIcon
          name="monitor"
          w={'24px'}
          h={'24px'}
          color={router.pathname === ROUTES.MONITOR ? 'grayModern.900' : 'grayModern.500'}
        />
      ),
      path: ROUTES.MONITOR
    },
    {
      label: t('Log'),
      icon: (
        <MyIcon
          name="log"
          w={'24px'}
          h={'24px'}
          color={router.pathname === ROUTES.LOGS ? 'grayModern.900' : 'grayModern.500'}
        />
      ),
      path: ROUTES.LOGS
    }
  ];

  return (
    <Flex alignItems={'center'} px={'40px'}>
      {siderbarMap.map((item, index) => (
        <>
          {index > 0 && (
            <Divider
              w={'0px'}
              mx={'12px'}
              flexShrink={0}
              height={'24px'}
              borderLeft={'1px'}
              borderColor={'#CCCCCC'}
            />
          )}
          <Center
            px={'12px'}
            key={item.path}
            gap={'4px'}
            flexDirection={'column'}
            bg={router.pathname === item.path ? 'rgba(0, 0, 0, 0.05)' : 'transparent'}
            _hover={{
              bg: 'rgba(0, 0, 0, 0.05)'
            }}
            borderRadius={'md'}
            h={'32px'}
            cursor={'pointer'}
            onClick={() => {
              console.log(router.query);
              router.push({
                pathname: item.path,
                query: { ...router.query }
              });
            }}
          >
            <Text fontSize={'14px'} color={'#000000'} fontWeight={'500'} whiteSpace={'nowrap'}>
              {item.label}
            </Text>
          </Center>
        </>
      ))}
    </Flex>
  );
}
