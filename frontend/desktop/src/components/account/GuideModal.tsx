import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  Box,
  Flex,
  Icon,
  Link,
  Center,
  Grid,
  Divider,
  Button
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { Book, Github, Video, MessageCircle, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { UserInfo } from '@/api/auth';
import useSessionStore from '@/stores/session';
import { useState } from 'react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuideModal = ({ isOpen, onClose }: GuideModalProps) => {
  const { t } = useTranslation();
  const { session } = useSessionStore((s) => s);
  const [selectedGuide, setSelectedGuide] = useState<number | null>(null);

  const infoData = useQuery({
    queryFn: UserInfo,
    queryKey: [session?.token, 'UserInfo'],
    select(d) {
      return d.data?.info;
    }
  });

  const guideLinks = [
    {
      icon: Book,
      title: t('cc:devbox_title'),
      description: t('cc:devbox_desc'),
      steps: [
        {
          title: 'Access DevBox',
          description: 'Enter the DevBox page and create a new development environment.'
        },
        {
          title: 'Configure Your DevBox',
          description: 'Set up your development environment with your preferred settings.'
        },
        {
          title: 'Start Coding in Your IDE',
          description: 'Begin coding in your preferred IDE with all configurations set.'
        },
        {
          title: 'Manage and Deploy',
          description: 'Manage your development environment and deploy your application.'
        }
      ]
    },
    {
      icon: Video,
      title: t('cc:launchpad_title'),
      description: t('cc:launchpad_desc'),
      steps: [
        {
          title: 'Access DevBox',
          description: 'Enter the DevBox page and create a new development environment.'
        },
        {
          title: 'Configure Your DevBox',
          description: 'Set up your development environment with your preferred settings.'
        },
        {
          title: 'Start Coding in Your IDE',
          description: 'Begin coding in your preferred IDE with all configurations set.'
        },
        {
          title: 'Manage and Deploy',
          description: 'Manage your development environment and deploy your application.'
        }
      ]
    },
    {
      icon: Github,
      title: t('cc:template_title'),
      description: t('cc:template_desc'),
      steps: [
        {
          title: 'Access DevBox',
          description: 'Enter the DevBox page and create a new development environment.'
        },
        {
          title: 'Configure Your DevBox',
          description: 'Set up your development environment with your preferred settings.'
        },
        {
          title: 'Start Coding in Your IDE',
          description: 'Begin coding in your preferred IDE with all configurations set.'
        },
        {
          title: 'Manage and Deploy',
          description: 'Manage your development environment and deploy your application.'
        }
      ]
    },
    {
      icon: MessageCircle,
      title: t('cc:database_title'),
      description: t('cc:database_desc'),
      steps: [
        {
          title: 'Access DevBox',
          description: 'Enter the DevBox page and create a new development environment.'
        },
        {
          title: 'Configure Your DevBox',
          description: 'Set up your development environment with your preferred settings.'
        },
        {
          title: 'Start Coding in Your IDE',
          description: 'Begin coding in your preferred IDE with all configurations set.'
        },
        {
          title: 'Manage and Deploy',
          description: 'Manage your development environment and deploy your application.'
        }
      ]
    }
  ];

  console.log(infoData.data);

  const StepCard = ({ step, index }: { step: any; index: number }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Flex
        cursor={'pointer'}
        key={index}
        p={4}
        mb={3}
        borderRadius="xl"
        border="1px solid"
        borderColor="gray.200"
        bg="white"
        transition="all 0.3s"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        // _hover={{
        //   boxShadow: 'lg',
        //   borderColor: 'blue.500'
        // }}
        height={isHovered ? 'auto' : '56px'}
        overflow="hidden"
      >
        <Center
          w={8}
          h={8}
          borderRadius="full"
          bg="gray.100"
          fontSize="md"
          fontWeight="bold"
          mr={4}
          flexShrink={0}
        >
          {index + 1}
        </Center>
        <Box>
          <Text fontSize="16px" fontWeight="600">
            {step.title}
          </Text>
          <Text
            color="gray.600"
            mt={1}
            fontSize="14px"
            opacity={isHovered ? 1 : 0}
            maxH={isHovered ? '100px' : '0'}
            transition="all 0.3s"
          >
            {step.description}
          </Text>
        </Box>
      </Flex>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent
        minW={'900px'}
        h={'510px'}
        p={'4px'}
        borderRadius={'20px'}
        background={'rgba(255, 255, 255, 0.80)'}
        boxShadow={'0px 10px 15px -3px rgba(0, 0, 0, 0.10), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)'}
      >
        <Flex
          flexDirection="column"
          bg={'#fff'}
          w={'100%'}
          h={'100%'}
          borderRadius={'16px'}
          border={'1px solid #B0CBFF'}
          boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.05)'}
          px={'40px'}
        >
          {selectedGuide !== null ? (
            <Box>
              <Flex justify="space-between" align="center" mt={'32px'}>
                <Flex align="center" gap={4}>
                  <Icon
                    as={ArrowLeft}
                    boxSize={6}
                    cursor="pointer"
                    onClick={() => setSelectedGuide(null)}
                    _hover={{ color: 'blue.500' }}
                  />
                  <Box>
                    <Text fontSize="24px" fontWeight={600}>
                      {guideLinks[selectedGuide].title}
                    </Text>
                    <Text color="gray.600" mt={1} fontSize="14px">
                      {guideLinks[selectedGuide].description}
                    </Text>
                  </Box>
                </Flex>
                <Button
                  height={'36px'}
                  bg="black"
                  color="white"
                  borderRadius="8px"
                  _hover={{ bg: 'gray.800' }}
                >
                  Show me
                </Button>
              </Flex>

              <Box maxH="350px" overflowY="auto" pt={'20px'} pr={2}>
                {guideLinks[selectedGuide].steps.map((step, index) => (
                  <StepCard key={index} step={step} index={index} />
                ))}
              </Box>
            </Box>
          ) : (
            <>
              <Center mt={'40px'} flexDirection={'column'}>
                <Text fontSize={'24px'} fontWeight={600} color={'#000'} lineHeight={'24px'}>
                  {t('cc:guide_title', { name: infoData.data?.nickname || '' })}
                </Text>
                <Text
                  mt={'8px'}
                  fontSize={'14px'}
                  fontWeight={'400'}
                  color={'#71717A'}
                  lineHeight={'20px'}
                >
                  {t('cc:documentation_desc')}
                </Text>
              </Center>

              <Grid templateColumns="repeat(2, 1fr)" gap={'16px'} mt={'40px'} flex={1}>
                {guideLinks.map((item, index) => (
                  <Flex
                    key={index}
                    onClick={() => setSelectedGuide(index)}
                    p={'20px'}
                    borderRadius="16px"
                    border={'1px solid #E4E4E7'}
                    background={'#FFF'}
                    boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.05)'}
                    _hover={{
                      boxShadow: 'lg',
                      transform: 'scale(1.002)',
                      transition: 'all 0.2s'
                    }}
                    cursor={'pointer'}
                    gap={'16px'}
                  >
                    <Center
                      flexShrink={0}
                      width={'40px'}
                      height={'40px'}
                      borderRadius={'7px'}
                      border={'0.5px solid #E4E4E7'}
                      background={'rgba(255, 255, 255, 0.90)'}
                      boxShadow={'0px 0.455px 1.818px 0px rgba(0, 0, 0, 0.12)'}
                    >
                      <Icon as={item.icon} boxSize={'24px'} color="gray.700" />
                    </Center>
                    <Box>
                      <Text
                        fontSize="16px"
                        fontWeight="600"
                        mb={'8px'}
                        color={'#18181B'}
                        lineHeight={'16px'}
                      >
                        {item.title}
                      </Text>
                      <Text color="#71717A" height={'40px'} fontSize="14px" mb={'12px'}>
                        {item.description}
                      </Text>
                      <Text
                        lineHeight={'20px'}
                        color="#18181B"
                        fontSize="14px"
                        mt={'auto'}
                        fontWeight={'500'}
                      >
                        {t('cc:guide_steps', { count: item.steps.length })}
                      </Text>
                    </Box>
                  </Flex>
                ))}
              </Grid>
              <Divider my={'20px'} borderColor={'#E4E4E7'} />
              <Text
                cursor={'pointer'}
                fontSize={'14px'}
                fontWeight={'500'}
                color={'#1C4EF5'}
                mb={'20px'}
                textAlign={'center'}
                onClick={onClose}
              >
                {t('cc:step_title')}
              </Text>
            </>
          )}
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export default GuideModal;
