import { colors } from '@sealos/ui/src/theme/colors';

export const colorScheme = {
  red: {
    button: {
      bg: '#DC2626',
      _hover: {
        bg: colors.red['600']
      },
      _active: {
        bg: colors.red['700']
      }
    },
    card: {
      bg: 'linear-gradient(0deg, #FEF2F2,  #FEF2F2), linear-gradient(0deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4))',
      borderColor: '#FCA5A5'
    }
  }
};
