import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        color: 'grayModern.900',
        fontSize: 'md',
        height: '100%',
        overflowY: 'auto',
        fontWeight: 400,
        minWidth: '700px'
      }
    }
    // colors
  }
});
