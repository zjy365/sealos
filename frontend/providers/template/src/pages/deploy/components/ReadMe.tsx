import MyIcon from '@/components/Icon';
import { Box, BoxProps } from '@chakra-ui/react';
import 'github-markdown-css/github-markdown-light.css';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeRewrite from 'rehype-rewrite';
import remarkGfm from 'remark-gfm';
import remarkUnwrapImages from 'remark-unwrap-images';
import styles from './index.module.scss';

const ReadMe = ({
  readUrl,
  readmeContent,
  ...props
}: { readUrl: string; readmeContent: string } & BoxProps & { [key: string]: any }) => {
  // @ts-ignore
  const myRewrite = (node, index, parent) => {
    if (node.tagName === 'img' && !node.properties.src.startsWith('http')) {
      const imgSrc = node.properties.src.replace(/^\.\/|^\//, '');
      const baseUrl = readUrl?.substring(0, readUrl?.lastIndexOf('/') + 1);
      node.properties.referrerPolicy = 'no-referrer';
      node.properties.src = `${baseUrl}${imgSrc}`;
    }
  };

  return (
    <Box px={'42px'} py={'32px'} {...props} flexGrow={1}>
      {/* <Box color={'#24282C'} fontSize={'20px'} lineHeight={'28px'} fontWeight={500} mb={'16px'}>
        <MyIcon name={'markdown'} mr={'8px'} w={'20px'} ml={'42px'} color={'myGray.500'} />
        Readme
      </Box> */}
      <Box borderRadius={'8px'} className={`markdown-body ${styles.customMarkDownBody}`}>
        <ReactMarkdown
          linkTarget={'_blank'}
          rehypePlugins={[rehypeRaw, [rehypeRewrite, { rewrite: myRewrite }]]}
          remarkPlugins={[remarkGfm, remarkUnwrapImages]}
          components={{
            h3({ node, ...props }) {
              return <h3 style={{ fontSize: '20px' }} {...props} />;
            },
            h2({ node, ...props }) {
              return <h2 style={{ fontSize: '20px' }} {...props} />;
            }
          }}
        >
          {readmeContent}
        </ReactMarkdown>
      </Box>
    </Box>
  );
};

export default ReadMe;
