import { useState } from 'react';
import { Box, Button, Collapse, Flex } from '@chakra-ui/react';

import MyIcon from './Icon';
import Code from './Code';
import { useCopyData } from '@/utils/tools';

const ScriptCode = ({
  platform,
  script,
  defaultOpen = false,
  oneLine = false
}: {
  platform: string;
  script: string;
  defaultOpen?: boolean;
  oneLine?: boolean;
}) => {
  const [onOpenScripts, setOnOpenScripts] = useState(defaultOpen);

  const { copyData } = useCopyData();

  return (
    <Flex
      px={2}
      py={1}
      borderRadius={'12px'}
      border={'1px solid'}
      bg={'black'}
      borderColor={'grayModern.200'}
      flexDirection={oneLine ? 'row' : 'column'}
      maxW={'100%'}
      maxH={'300px'}
    >
      <Flex justifyContent={oneLine ? 'null' : 'space-between'} alignItems={'center'} w={'full'}>
        {!oneLine && (
          <Box>
            <Button
              onClick={() => setOnOpenScripts(!onOpenScripts)}
              bg={'transparent'}
              border={'none'}
              boxShadow={'none'}
              color={'#93C5FD'}
              fontWeight={400}
              _hover={{
                cursor: 'pointer'
              }}
              leftIcon={
                <MyIcon
                  name="arrowRight"
                  color={'white'}
                  w={'16px'}
                  transform={onOpenScripts ? 'rotate(90deg)' : 'rotate(0)'}
                  transition="transform 0.2s ease"
                />
              }
            >
              {platform === 'Windows' ? 'PowerShell' : 'Bash'}
            </Button>
          </Box>
        )}
        {oneLine && (
          <Box py={2} overflowY={'auto'} h={'100%'} pl={4} maxW={'100%'}>
            <Code
              content={script}
              language={platform === 'Windows' ? 'powershell' : 'bash'}
              theme={'dark'}
            />
          </Box>
        )}
        <Button
          bg={'black'}
          border={'none'}
          zIndex={100}
          {...(oneLine && {
            position: 'absolute',
            right: 2
          })}
          boxShadow={'none'}
          _hover={{
            color: 'brightBlue.600',
            '& svg': {
              color: 'brightBlue.600'
            }
          }}
        >
          <MyIcon color={'#A3A3A3'} name="copy" w={'16px'} onClick={() => copyData(script)} />
        </Button>
      </Flex>
      {!oneLine && (
        <Collapse in={onOpenScripts} animateOpacity>
          <Box pt={2} pl={3} overflowY={'auto'} h={'100%'} maxW={'100%'}>
            <Code
              content={script}
              language={platform === 'Windows' ? 'powershell' : 'bash'}
              theme={'dark'}
            />
          </Box>
        </Collapse>
      )}
    </Flex>
  );
};

export default ScriptCode;
