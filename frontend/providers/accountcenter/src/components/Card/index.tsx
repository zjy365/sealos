import { Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';

function Card({ children, ...props }: { children?: ReactNode } & any) {
  return (
    <Box
      {...props}
      p={'20px 24px 24px 24px'}
      borderRadius={'xl'}
      border={'1px solid #E4E4E7'}
      shadow={'0px 1px 2px 0px #0000000D'}
    >
      {children}
    </Box>
  );
}

export default Card;
