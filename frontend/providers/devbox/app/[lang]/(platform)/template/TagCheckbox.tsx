import { CheckIcon } from '@chakra-ui/icons';
import { Box, chakra, CheckboxProps, useCheckbox } from '@chakra-ui/react';

export const TagCheckbox = (props: CheckboxProps) => {
  const { state, getCheckboxProps, getInputProps, getLabelProps, htmlProps } = useCheckbox(props);

  return (
    <chakra.label display="flex" alignItems="center" gridColumnGap="8px" {...htmlProps}>
      <input {...getInputProps()} hidden />
      <Box
        {...getCheckboxProps()}
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="16px"
        h="16px"
        p="2px"
        borderRadius="4px"
        border="1px solid"
        cursor={'pointer'}
        {...(state.isChecked
          ? {
              bg: 'black'
            }
          : {
              borderColor: 'grayModern.300'
            })}
        transition="all 0.2s"
      >
        {state.isChecked && <CheckIcon w="12px" h="12px" color="white" />}
      </Box>
      <Box {...getLabelProps()}>{props.children}</Box>
    </chakra.label>
  );
};
