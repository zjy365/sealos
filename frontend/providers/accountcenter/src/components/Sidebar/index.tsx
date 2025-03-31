import { Center, Text, Stack } from '@chakra-ui/react';
import { User, Dock, ReceiptText, BarChart3, Gift } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

const iconProps = {
  width: '16px',
  height: '16px',
  color: 'black'
};
export default function Sidebar({ ...props }: any) {
  const { t } = useTranslation();
  const router = useRouter();

  const siderbarMap = [
    {
      label: t('Setting'),
      icon: <User {...iconProps} />,
      path: '/setting'
    },
    {
      label: t('Plan'),
      icon: <Dock {...iconProps} />,
      path: '/plan'
    },
    {
      label: t('Billing'),
      icon: <ReceiptText {...iconProps} />,
      path: '/billing'
    },
    {
      label: t('Usage'),
      icon: <BarChart3 {...iconProps} />,
      path: '/usage'
    },
    {
      label: t('Referral'),
      icon: <Gift {...iconProps} />,
      path: '/referral'
    }
  ];

  return (
    <Stack {...props} w={'266px'} flexShrink={0} spacing={'4px'}>
      {siderbarMap.map((item) => (
        <Center
          key={item.path}
          gap={'8px'}
          flexDirection={'row'}
          justifyContent={'flex-start'}
          alignItems={'center'}
          p={'6px 8px'}
          bg={router.pathname === item.path ? 'rgba(0, 0, 0, 0.05)' : 'transparent'}
          color={'grayModern.900'}
          borderRadius={'md'}
          h={'44px'}
          cursor={'pointer'}
          onClick={() => router.replace(item.path)}
        >
          {item.icon}
          <Text fontSize={'14px'} lineHeight={'20px'}>
            {item.label}
          </Text>
        </Center>
      ))}
    </Stack>
  );
}
