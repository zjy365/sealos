import { defineStyle, defineStyleConfig, extendTheme } from '@chakra-ui/react';
import { runTheme as originTheme } from '@sealos/ui';
originTheme.font;
export const theme = extendTheme(originTheme, {
  components: {
    Modal: {
      baseStyle: {}
    },
    Button: defineStyleConfig({
      variants: {
        warningConfirm: defineStyle({
          fontWeight: '500',
          color: '#FEF2F2',
          bgColor: 'red.600',
          boxShadow: '0px 0px 1px 0px #13336B14, 0px 1px 2px 0px #13336B0D',
          _hover: {
            bgColor: 'rgba(217, 45, 32, 0.9)'
          }
        })
      }
    })
  }
});
