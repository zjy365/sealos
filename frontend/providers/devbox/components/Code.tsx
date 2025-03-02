import { useMemo } from 'react';
import { Box } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';

import { lightCodeTheme, darkCodeTheme } from '@/constants/hljs';

type TMarkDown = {
  content: string;
  language: string;
  theme?: 'light' | 'dark';
  [key: string]: any;
};

const Code = ({ content, language, theme = 'light', ...props }: TMarkDown) => {
  const code = useMemo(() => '```' + language + '\n' + content + '```', [content, language]);

  return (
    <Box
      sx={{
        height: '100%',
        '& div': {
          overflow: 'auto !important',
          maxW: '100%'
        }
      }}
    >
      <ReactMarkdown
        {...props}
        // eslint-disable-next-line react/no-children-prop
        children={code}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                // eslint-disable-next-line react/no-children-prop
                children={String(children).replace(/\n$/, '')}
                showLineNumbers={true}
                // @ts-ignore nextline
                style={theme === 'light' ? lightCodeTheme : darkCodeTheme}
                language={match[1]}
                PreTag="div"
                {...props}
              />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      />
    </Box>
  );
};

export default Code;
