import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  SimpleGrid,
  Box,
  Button,
  List,
  ListItem,
  ListIcon,
  Badge,
  useDisclosure,
  Flex
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { useTranslation } from 'next-i18next';
import { CircleCheck, Gift } from 'lucide-react';

export interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradePlanModal({ isOpen, onClose }: UpgradePlanModalProps) {
  const { t } = useTranslation();

  const plans = [
    {
      name: 'Free',
      price: '0',
      credits: '5',
      isCurrentPlan: true,
      features: ['4 vCPU / 8 GB / 10G disk per region', 'Single workspace', '1 seat', '1 region']
    },
    {
      name: 'Hobby',
      price: '5',
      credits: '10',
      isPopular: true,
      features: [
        '16 vCPU / 32 GB / ? disk per region',
        '5 workspaces / per region',
        '5 seats',
        'Multiple regions'
      ]
    },
    {
      name: 'Pro',
      price: '20',
      credits: '40',
      features: [
        '? / ? / ? per region',
        'Multiple workspaces',
        'Unlimited seats',
        'Multiple regions'
      ]
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent borderRadius="xl" p={0} maxW={'70%'} color="#71717A">
        <ModalHeader
          textAlign="center"
          pt={'40px'}
          px={'40px'}
          pb={'0px'}
          bg={'#FFF'}
          borderBottom={'none'}
        >
          <Text fontSize="24px" fontWeight="500" mb={'12px'}>
            {t('cc:upgrade_plan')}
          </Text>
          <Text fontSize="16px" fontWeight="400">
            {t('cc:get_started_from_recommended')}
          </Text>
        </ModalHeader>

        <ModalCloseButton />
        <ModalBody pt={'24px'} pb={'24px'}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={'24px'}>
            {plans.map((plan) => (
              <Box
                opacity={plan.isCurrentPlan ? 0.7 : 1}
                key={plan.name}
                borderWidth="1px"
                borderColor="E4E4E7"
                borderRadius="16px"
                p={'32px'}
                position="relative"
              >
                <Flex justifyContent={'space-between'} alignItems={'center'} mb={'12px'}>
                  <Text color="#18181B" fontSize="20px" fontWeight={600} lineHeight="28px">
                    {plan.name}
                  </Text>
                  {plan.isPopular && (
                    <Badge
                      bg="#1C4EF5"
                      color="white"
                      borderRadius="full"
                      border="1px solid rgba(255, 255, 255, 0)"
                      p={'2px 10px'}
                    >
                      {t('cc:most_popular')}
                    </Badge>
                  )}
                </Flex>
                <Text fontSize="14px" fontWeight={400} mb={'24px'}>
                  {t('cc:plan_benefit_statement')}
                </Text>
                <Box mb={'8px'}>
                  <Text color="#18181B" as="span" fontSize="36px" fontWeight="600">
                    ${plan.price}
                  </Text>
                  <Text ml={'2px'} as="span">
                    /month
                  </Text>
                </Box>
                <Flex mb={'24px'} alignItems="center">
                  <Gift size={16} style={{ marginRight: '8px' }} color="#18181B" />
                  <Text>{t('cc:includes_credits', { credits: plan.credits })}</Text>
                </Flex>
                <Button
                  w="full"
                  mb={'32px'}
                  variant={'solid'}
                  bg={'#18181B'}
                  color={'#FAFAFA'}
                  borderRadius={'8px'}
                >
                  {plan.isCurrentPlan ? t('cc:your_current_plan') : t('cc:purchase_plan')}
                </Button>
                <List spacing={3}>
                  {plan.features.map((feature, index) => (
                    <ListItem
                      color={'#71717A'}
                      fontSize={'14px'}
                      fontWeight={400}
                      key={index}
                      display="flex"
                      gap={'8px'}
                      alignItems="center"
                    >
                      <CircleCheck
                        style={{
                          flexShrink: 0
                        }}
                        size={20}
                        color="#1C4EF5"
                      />
                      <Text>{feature}</Text>
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </SimpleGrid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
