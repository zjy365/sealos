import { Box, Flex, useRadio, UseRadioProps, Text } from '@chakra-ui/react';
import { FC, ReactNode } from 'react';

interface RadioOptionProps extends UseRadioProps {
  children?: ReactNode;
  icons?: ReactNode;
}
const RadioOption: FC<RadioOptionProps> = (props) => {
  const { getInputProps, getRadioProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getRadioProps();

  return (
    <Flex
      as="label"
      cursor="pointer"
      p="12px 16px"
      bg="#fff"
      width="100%"
      alignContent="center"
      borderRadius="8px"
    >
      <Flex flexGrow="1" gap="8px" alignItems="center">
        <input {...input} />
        <Box
          {...checkbox}
          w="14px"
          h="14px"
          outline="1px solid rgb(24, 24, 27)"
          border="2px solid #fff"
          borderRadius="50%"
          _checked={{
            bg: 'rgb(24, 24, 27)'
          }}
          _focus={{
            boxShadow: 'outline'
          }}
        />
        <Text lineHeight="20px" fontSize="14px" fontWeight="500" mt="-1px">
          {props.children}
        </Text>
      </Flex>
      {props.icons ? <Flex gap="4px">{props.icons}</Flex> : null}
    </Flex>
  );
};
export default RadioOption;
