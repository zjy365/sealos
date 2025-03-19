import { BoxProps, Box } from '@chakra-ui/react';
import { FC, ReactElement, cloneElement, useId } from 'react';

interface BorderGradientProps extends Omit<BoxProps, 'borderRadius'> {
  borderGradientWidth: number;
  borderGradient?: ReactElement<SVGLinearGradientElement>;
  borderRadius?: number;
}
/** 边框渐变使用svg实现，会超出框外不要用overflowhidden */
const BorderGradient: FC<BorderGradientProps> = ({
  borderGradient: propBroderGradient,
  borderGradientWidth,
  borderRadius,
  children,
  ...restProps
}) => {
  const pos = `-${borderGradientWidth}px`;
  const id = useId();
  let borderGradient = propBroderGradient;
  let linearGradientId = '';
  if (borderGradient) {
    if (borderGradient.props?.id) {
      linearGradientId = borderGradient.props?.id;
    } else {
      linearGradientId = `borderGradient-${id}`;
      borderGradient = cloneElement(borderGradient, {
        id: linearGradientId
      });
    }
  }
  return (
    <Box position="relative" borderRadius={`${borderRadius}px`} {...restProps}>
      <Box position="absolute" left={pos} top={pos} right={pos} bottom={pos} zIndex={1}>
        <svg width="100%" height="100%" fill="none">
          <defs>{borderGradient}</defs>
          <rect
            rx={borderRadius}
            width="100%"
            height="100%"
            strokeWidth={borderGradientWidth}
            stroke={`url(#${linearGradientId})`}
            shapeRendering="crispEdges"
          />
        </svg>
      </Box>
      <Box position="relative" zIndex={2}>
        {children}
      </Box>
    </Box>
  );
};
export default BorderGradient;
