import { StackProps, Stack, Flex, Box } from '@chakra-ui/react';
import { ReactElement } from 'react';

const ConfigFormContainer = ({
  header,
  main,
  ...props
}: Record<'header' | 'main', ReactElement> & StackProps) => (
  <Stack
    w="786px"
    alignSelf={'self-start'}
    overflow={'hidden'}
    gap="0"
    h="full"
    maxH={'500px'}
    borderRadius={'4px'}
    position={'relative'}
    {...props}
  >
    {/* <Flex px={'42px'} py={'15px'} bg={'white_.400'}>
      {header}
    </Flex> */}
    <Box flex={1} h={0} overflow={'auto'} bg={'white'}>
      {main}
    </Box>
  </Stack>
);
export default ConfigFormContainer;
