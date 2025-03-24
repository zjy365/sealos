import { StackDivider, useRadioGroup, VStack } from '@chakra-ui/react';
import { FC, ReactNode } from 'react';
import RadioOption from '.';

interface RadioOptionGroupProps {
  value?: string | undefined;
  onChange?: (nextValue: string) => void;
  name?: string;
  defaultValue?: string;
  options: Option[];
}
interface Option {
  label: string;
  value: string;
  icons?: ReactNode;
}
const RadioOptionGroup: FC<RadioOptionGroupProps> = ({
  value,
  onChange,
  name,
  defaultValue,
  options
}) => {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name,
    value,
    onChange,
    defaultValue
  });
  const group = getRootProps();
  return (
    <VStack
      {...group}
      divider={<StackDivider borderColor="rgb(228, 228, 231)" my="0!important" />}
      border="1px solid rgb(228, 228, 231)"
      borderRadius="8px"
    >
      {options.map((option) => {
        const radio = getRadioProps({ value: option.value });
        return (
          <RadioOption key={option.value} {...radio} icons={option.icons}>
            {option.label}
          </RadioOption>
        );
      })}
    </VStack>
  );
};
export default RadioOptionGroup;
