import { Button, ButtonProps } from '@chakra-ui/react';
import { FC, SyntheticEvent, useState, MouseEvent } from 'react';

interface ActionButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick: (e: SyntheticEvent<HTMLButtonElement>) => any;
}
/** Auto loading button(If onClick return Promise) */
const ActionButton: FC<ActionButtonProps> = ({ onClick, ...rest }) => {
  const [loading, setLoading] = useState(false);
  const handleClick = (e: any) => {
    const res = onClick?.(e);
    if (res && typeof res.then === 'function') {
      setLoading(true);
      res.then(
        (d: any) => {
          setLoading(false);
          return d;
        },
        (e: any) => {
          setLoading(false);
          return Promise.reject(e);
        }
      );
    }
  };
  return <Button {...rest} isLoading={loading} onClick={handleClick}></Button>;
};
export default ActionButton;
