import { extendTheme } from '@chakra-ui/react';
import { theme as SealosTheme } from '@sealos/ui';
import { cardAnatomy, checkboxAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { colors } from '@sealos/ui/src/theme/colors';
import { Button } from '@sealos/ui/src/theme/components/Button';
import { merge } from 'lodash';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  checkboxAnatomy.keys
);
const checkbox = defineMultiStyleConfig({
  baseStyle: {
    control: {
      borderWidth: '1px',
      borderRadius: '4px',
      _checked: {
        bg: '#F0FBFF',
        borderColor: '#219BF4',
        boxShadow: ' 0px 0px 0px 2.4px rgba(33, 155, 244, 0.15)',
        _hover: {
          bg: '#F0FBFF',
          borderColor: '#219BF4'
        }
      },
      _hover: {
        bg: 'transparent'
      }
    },
    icon: {
      color: '#219BF4'
    }
  }
});

export const theme = extendTheme(SealosTheme, {
  styles: {
    global: {
      'html, body': {
        color: 'grayModern.900',
        fontSize: 'md',
        height: '100%',
        fontWeight: 400
        // overflowY: 'auto',
        // minWidth: '700px'
      }
    }
  },
  components: {
    Checkbox: checkbox,
    // extend并不会deep merge会丢失sealos定义的button样式，这里deep merge以下
    Button: merge(Button, {
      sizes: {
        md: {
          h: '40px',
          borderRadius: '8px'
        }
      },
      variants: {
        danger: {
          bg: '#DC2626',
          color: '#fff',
          _hover: {
            bg: colors.red['600']
          },
          _active: {
            bg: colors.red['700']
          }
        }
      }
    }),
    Card: {
      baseStyle: {
        container: {
          borderRadius: '16px',
          boxShadow: '0px 1px 2px 0px #0000000D'
        },
        header: {
          padding: '20px 24px 0',
          fontSize: '18px',
          fontWeight: '600',
          lineHeight: '28px'
        },
        body: {
          padding: '14px 24px 24px'
        }
      }
    },
    Modal: {
      baseStyle: {
        dialog: {
          border: '1px solid #E4E4E7',
          boxShadow: '0px 2px 4px -1px #0000000F,0px 4px 6px -1px #0000001A',
          _before: {
            content: '""',
            position: 'absolute',
            top: '-5px',
            left: '-5px',
            bottom: '-5px',
            right: '-5px',
            pointerEvents: 'none',
            bg: '#F1F1F1',
            borderRadius: '20px',
            zIndex: 1
          }
        },
        header: {
          px: '24px',
          pt: '24px',
          pb: '16px',
          bg: '#fff',
          borderBottom: 'none',
          fontSize: '20px',
          fontWeight: 600,
          zIndex: 2,
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        },
        body: {
          p: '16px 24px',
          bg: '#fff',
          zIndex: 2
        },
        footer: {
          px: '24px',
          justifyContent: 'flex-start',
          gap: '12px',
          bg: '#fff',
          zIndex: 2,
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px'
        },
        overlay: {
          backdropFilter: 'blur(10px)'
        }
      }
    },
    Alert: {
      baseStyle: {
        container: {
          borderRadius: '8px',
          p: '16px'
        }
      },
      variants: {
        danger: {
          container: {
            bg: '#FEF2F2',
            color: '#DC2626'
          },
          description: {
            fontSize: '14px',
            lineHeight: '20px'
          }
        }
      }
    }
  }
});
