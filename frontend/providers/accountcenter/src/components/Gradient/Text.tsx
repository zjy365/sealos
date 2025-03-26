import { TextProps, Text } from '@chakra-ui/react';
import { FC } from 'react';

interface TextGradientProps extends Omit<TextProps, 'color'> {
  gradient: string;
}
const styles = { WebkitTextFillColor: 'transparent' };
const TextGradient: FC<TextGradientProps> = ({ gradient, children, ...restProps }) => {
  return (
    <Text color="transparent" style={styles} bg={gradient} backgroundClip="text" {...restProps}>
      {children}
    </Text>
  );
};
export default TextGradient;
