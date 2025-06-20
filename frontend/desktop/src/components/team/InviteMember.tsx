import {
  Button,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Flex,
  Spinner,
  ButtonProps,
  HStack,
  useToast,
  Tooltip
} from '@chakra-ui/react';
import { MouseEventHandler, useState } from 'react';
import { ROLE_LIST, UserRole } from '@/types/team';
import useSessionStore from '@/stores/session';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getInviteCodeRequest, inviteMemberRequest } from '@/api/namespace';
import { isWithinLimit, isWithinLimitAndNotEqual, vaildManage } from '@/utils/tools';
import { ApiResp } from '@/types';
import { useTranslation } from 'next-i18next';
import { GroupAddIcon, MyTooltip } from '@sealos/ui';
import { useCopyData } from '@/hooks/useCopyData';
import { Plus } from 'lucide-react';
import { getUserPlan } from '@/api/platform';

export default function InviteMember({
  ns_uid,
  workspaceName,
  seat,
  ownRole,
  ...props
}: ButtonProps & {
  ns_uid: string;
  workspaceName: string;
  seat: number;
  ownRole: UserRole;
}) {
  const { onOpen, isOpen, onClose } = useDisclosure();
  const session = useSessionStore((s) => s.session);
  const k8s_username = session?.user.k8s_username;
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState(UserRole.Developer);
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: plan, isSuccess } = useQuery(['getUserPlan'], () => getUserPlan(), {
    cacheTime: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
  const mutation = useMutation({
    mutationFn: inviteMemberRequest,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['ns-detail'], exact: false });
      onClose();
    },
    onError(error) {
      toast({
        status: 'error',
        title: (error as ApiResp).message,
        isClosable: true,
        position: 'top'
      });
    }
  });
  const canManage = vaildManage(ownRole);
  const { t } = useTranslation();
  const { copyData } = useCopyData();
  const getLinkCode = useMutation({
    mutationFn: getInviteCodeRequest,
    mutationKey: [session?.user.ns_uid],
    onError() {
      toast({
        status: 'error',
        title: t('common:failed_to_generate_invitation_link'),
        isClosable: true,
        position: 'top'
      });
    }
  });

  const generateLink = (code: string) => {
    return window.location.origin + encodeURI(`/WorkspaceInvite/?code=${code}`);
  };
  const handleGenLink: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    const data = await getLinkCode.mutateAsync({
      ns_uid,
      role
    });
    const code = data.data?.code!;
    const link = generateLink(code);
    await copyData(link);
  };
  const canInvite = isWithinLimitAndNotEqual(
    seat,
    Number(plan?.data?.subscription.subscriptionPlan.max_seats) || 1
  );
  return (
    <>
      {[UserRole.Manager, UserRole.Owner].includes(ownRole) ? (
        <MyTooltip
          label={'Seat limit reached. Upgrade your plan to lift the limit.'}
          width={'220px'}
          fontWeight="400"
          fontSize="14px"
          lineHeight="20px"
          textAlign="center"
          color="#09090B"
          offset={[0, 0]}
          isDisabled={canInvite}
        >
          <Button
            height={'36px'}
            variant={'solid'}
            borderRadius={'8px'}
            {...props}
            isDisabled={!canInvite}
            _disabled={{
              opacity: '0.5'
            }}
            color={'#FAFAFA'}
            leftIcon={<Plus size={16} color="#FAFAFA" />}
            onClick={onOpen}
          >
            {t('common:invite_member')}
          </Button>
        </MyTooltip>
      ) : (
        <></>
      )}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          borderRadius={'4px'}
          maxW={'380px'}
          bgColor={'#FFF'}
          backdropFilter="blur(150px)"
          p="24px"
        >
          <ModalCloseButton right={'24px'} top="16px" p="0" />
          <ModalHeader bg={'white'} border={'none'} p="0">
            {t('common:invite_member')}
          </ModalHeader>
          {mutation.isLoading ? (
            <Spinner mx="auto" />
          ) : (
            <ModalBody h="100%" w="100%" p="0" mt="22px">
              <Text>
                {t('common:invite_members_to_workspace', {
                  workspace: workspaceName
                })}
              </Text>
              <HStack gap={'8px'} justifyContent={'stretch'}>
                <Menu>
                  <MenuButton
                    as={Button}
                    variant={'unstyled'}
                    borderRadius="2px"
                    border="1px solid #DEE0E2"
                    bgColor="#FBFBFC"
                    w="140px"
                    mt="24px"
                    px="12px"
                  >
                    <Flex alignItems={'center'} justifyContent={'space-between'}>
                      <Text>{ROLE_LIST[role]}</Text>
                      <Image
                        src="/images/material-symbols_expand-more-rounded.svg"
                        w="16px"
                        h="16px"
                        transform={'rotate(90deg)'}
                      />
                    </Flex>
                  </MenuButton>
                  <MenuList borderRadius={'2px'} minW={'unset'}>
                    {ROLE_LIST.map((role, idx) => (
                      <MenuItem
                        w="140px"
                        onClick={(e) => {
                          e.preventDefault();
                          setRole(idx);
                        }}
                        key={idx}
                      >
                        {role}
                      </MenuItem>
                    )).filter((_, i) => canManage(i, false) && i !== UserRole.Owner)}
                  </MenuList>
                </Menu>
                <Button
                  flex={'1'}
                  variant={''}
                  bg="#24282C"
                  borderRadius={'4px'}
                  color="#fff"
                  py="6px"
                  px="12px"
                  mt="24px"
                  _hover={{
                    opacity: '0.8'
                  }}
                  isDisabled={getLinkCode.isLoading}
                  onClick={handleGenLink}
                >
                  {t('common:generate_invitation_link')}
                </Button>
              </HStack>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
