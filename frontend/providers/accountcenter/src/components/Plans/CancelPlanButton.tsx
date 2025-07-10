import { checkForCancel, TCheckForCancelResponse, updatePlan } from '@/api/plan';
import {
  TLastTransactionResponse,
  TPlanApiResponse,
  TSubscriptionApiResponse
} from '@/schema/plan';
import {
  Button,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Alert,
  AlertDescription,
  Text,
  Divider,
  Flex,
  ButtonProps
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { FC, ReactNode, useRef, useState } from 'react';
import CircleCheck from '@/components/Icon/icons/circleCheck.svg';
import CircleX from '@/components/Icon/icons/circleX.svg';
import useToastAPIResult from '@/hooks/useToastAPIResult';
import ActionButton from '../ActionButton';
import { isPlanCancelling } from './planStatus';

interface CancelPlanButtonProps {
  plan: TPlanApiResponse;
  freePlan: TPlanApiResponse | undefined;
  lastTransaction: TLastTransactionResponse | undefined;
  onCancelSuccess?: () => void;
  onCancelClick?: () => void;
  buttonProps?: (opt: { isCancelled: boolean; isCancellable: boolean }) => Partial<ButtonProps>;
  text?: (opt: { isCancelled: boolean; isCancellable: boolean }) => ReactNode;
  fallback?: ReactNode;
}
const cancelButtonStyle = {
  variant: 'outline',
  h: '36px',
  border: '1px solid #E4E4E766',
  bg: 'transparent',
  color: '#fff',
  _hover: {
    color: '#fff'
  },
  _active: {
    color: '#fff'
  }
};
const CancelPlanButton: FC<CancelPlanButtonProps> = ({
  plan,
  lastTransaction,
  freePlan,
  onCancelSuccess,
  onCancelClick,
  buttonProps,
  text,
  fallback
}) => {
  const { t } = useTranslation();
  const { getAPIErrorMessage, toastAPIError, toastSuccess } = useToastAPIResult();
  const isCancelled = isPlanCancelling(lastTransaction);
  const isCancellable =
    Array.isArray(plan.downgradePlanList) && plan.downgradePlanList.includes('Free');
  const requestIdRef = useRef(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [checkResult, setCheckResult] = useState<TCheckForCancelResponse | null>(null);
  const [checkError, setCheckError] = useState<any>(null);
  const override = {
    buttonProps:
      typeof buttonProps === 'function' ? buttonProps({ isCancellable, isCancelled }) : {},
    text: typeof text === 'function' ? text({ isCancellable, isCancelled }) : null
  };
  if (plan.amount === 0) {
    return null;
  }
  if (isCancelled) {
    return (
      <Button {...cancelButtonStyle} {...override.buttonProps} isDisabled>
        {override.text || t('Cancelled')}
      </Button>
    );
  }
  if (isCancellable) {
    const handleCancelClick = () => {
      onCancelClick?.();
      setCheckResult(null);
      setCheckError(null);
      onOpen();
      const requestId = ++requestIdRef.current;
      checkForCancel().then(
        (res) => {
          if (requestId !== requestIdRef.current) return;
          setCheckResult(res);
        },
        (error) => {
          if (requestId !== requestIdRef.current) return;
          setCheckError(error);
        }
      );
    };
    const isCancelButtonDisabled =
      !checkResult || !checkResult.seatReady || !checkResult.workspaceReady;
    const handleConfirmCancel = () => {
      if (!freePlan) return;
      return updatePlan({
        planID: freePlan?.id,
        planName: freePlan?.name,
        planType: 'downgrade',
        period: 'MONTHLY'
      }).then(
        () => {
          toastSuccess('CancelSuccess');
          onClose();
          onCancelSuccess?.();
        },
        (e) => {
          toastAPIError(e);
        }
      );
    };
    const renderCheckResult = () => {
      const hint = (
        <Text my="16px" fontSize="14px" lineHeight="20px" fontWeight="400">
          {t('CancelPlanHint', { planName: plan.name })}
        </Text>
      );
      if (!checkResult) {
        return (
          <>
            <Alert variant="warning">
              <AlertDescription>{t('CancelPlanChecking')}</AlertDescription>
            </Alert>
            {hint}
          </>
        );
      }
      const freeCount = freePlan
        ? {
            workspace: freePlan.maxWorkspaces,
            seat: freePlan.maxSeats
          }
        : {
            workspace: 1,
            seat: 1
          };
      const workspaceText = (
        <Text color="rgba(113, 113, 122, 1)" fontSize="14px" lineHeight="20px" fontWeight="400">
          {t('PlanWorkspaceCount', {
            count: freeCount.workspace,
            countText: `${freeCount.workspace} `
          })}{' '}
          / {t('Region').toLowerCase()}
        </Text>
      );
      const seatText = (
        <Text color="rgba(113, 113, 122, 1)" fontSize="14px" lineHeight="20px" fontWeight="400">
          {t('PlanSeatCount', { count: freeCount.seat, countText: `${freeCount.seat} ` })} /{' '}
          {t('workspace').toLowerCase()}
        </Text>
      );
      const renderLimit = (pass: boolean, text: ReactNode) => {
        const icon = pass ? (
          <CircleCheck width="16" height="16" stroke="rgb(249, 115, 22)" />
        ) : (
          <CircleX width="16" height="16" stroke="#71717A" />
        );
        return (
          <Flex gap="8px" alignItems="center">
            {icon}
            {text}
          </Flex>
        );
      };
      if (checkResult.seatReady && checkResult.workspaceReady) {
        return (
          <>
            <Alert variant="warning">
              <AlertDescription>
                <Text>{t('CancelPlanCheckingPass')}</Text>
                <Divider my="14px" borderColor="rgba(113, 113, 122, 1)" />
                {renderLimit(true, workspaceText)}
                {renderLimit(true, seatText)}
              </AlertDescription>
            </Alert>
            {hint}
          </>
        );
      }
      return (
        <>
          <Alert variant="warning">
            <AlertDescription>
              <Text>{t('CancelPlanCheckingFail')}</Text>
              <Divider my="14px" borderColor="rgba(113, 113, 122, 1)" />
              {renderLimit(checkResult.workspaceReady, workspaceText)}
              {renderLimit(checkResult.seatReady, seatText)}
            </AlertDescription>
          </Alert>
          {hint}
        </>
      );
    };
    return (
      <>
        <Button {...cancelButtonStyle} {...override.buttonProps} onClick={handleCancelClick}>
          {override.text || t('CancelPlan')}
        </Button>
        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
          <AlertDialogOverlay>
            <AlertDialogContent maxW="448px">
              <AlertDialogHeader>{t('CancelPlanModalTitle')}</AlertDialogHeader>
              <AlertDialogBody>
                {checkError ? (
                  <Alert status="error" variant="danger">
                    <AlertDescription>{getAPIErrorMessage(checkError)}</AlertDescription>
                  </Alert>
                ) : (
                  renderCheckResult()
                )}
              </AlertDialogBody>
              <AlertDialogFooter>
                <ActionButton
                  variant="danger"
                  onClick={handleConfirmCancel}
                  isDisabled={isCancelButtonDisabled}
                >
                  {t('CancelPlan')}
                </ActionButton>
                <Button
                  colorScheme="blackAlpha"
                  variant="outline"
                  ref={cancelRef}
                  onClick={onClose}
                >
                  {t('KeepPlan')}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </>
    );
  }
  return fallback || null;
};
export default CancelPlanButton;
