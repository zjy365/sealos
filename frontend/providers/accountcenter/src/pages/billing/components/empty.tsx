import React, { ReactNode } from 'react';
import { Box, Text } from '@chakra-ui/react';

const Empty = ({
  title,
  description,
  Icon,
  ...props
}: {
  title?: string;
  description?: string;
  Icon?: ReactNode;
}) => {
  return (
    <Box
      {...props}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      backgroundColor={'white'}
      w={'293px'}
      borderRadius={'xl'}
      py={'24px'}
    >
      {Icon}
      <Text fontSize={'14px'} fontWeight={'600'}>
        {title}
      </Text>
      <Text fontSize={'14px'} fontWeight={'400'} lineHeight={'20px'}>
        {description}
      </Text>
    </Box>
  );
};

export default Empty;
