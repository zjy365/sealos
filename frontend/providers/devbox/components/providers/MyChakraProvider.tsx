import { ChakraProvider as CkProvider } from '@chakra-ui/react';

import { runTheme } from '@sealos/ui';

const ChakraProvider = ({ children }: { children: React.ReactNode }) => {
  return <CkProvider theme={runTheme}>{children}</CkProvider>;
};

export default ChakraProvider;
