import React from 'react';
import { Box, useTab } from '@chakra-ui/react';

const Tab = React.forwardRef((props: { children: React.ReactNode }, ref) => {
  const tabProps = useTab({ ...props, ref: ref as React.Ref<HTMLElement> });

  return (
    <Box
      {...tabProps}
      color={'grayModern.500'}
      cursor={'pointer'}
      _hover={{
        color: '#18181B'
      }}
      textAlign={'center'}
      w={'full'}
      h={'32px'}
      fontWeight={400}
      fontSize={'14px'}
      _selected={{
        color: '#18181B',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-2px',
          left: '0px',
          width: '100%',
          height: '2px',
          backgroundColor: '#18181B'
        }
      }}
    >
      {tabProps.children}
    </Box>
  );
});

Tab.displayName = 'Tab';

export default Tab;
