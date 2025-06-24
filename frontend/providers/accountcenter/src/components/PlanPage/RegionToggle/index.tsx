import {
  Box,
  BoxProps,
  Button,
  Center,
  Flex,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { CheckIcon, ChevronDown } from 'lucide-react';
import { RawRegion } from '@/types/region';

export default function RegionToggle({
  regionList,
  currentRegionUid,
  setCurrentRegion,
  ...props
}: BoxProps & {
  regionList: RawRegion[];
  currentRegionUid: string;
  setCurrentRegion: (uid: string) => void;
}) {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  const currentRegion = regionList.find((r) => r.uid === currentRegionUid);
  return (
    <Box mb={'16px'} {...props}>
      <Popover
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        placement="bottom-start"
        closeOnBlur={true}
      >
        <PopoverTrigger>
          <Button
            w={'full'}
            fontSize={'14px'}
            variant={'outline'}
            fontWeight={'500'}
            justifyContent={'space-between'}
            gap={'8px'}
          >
            <Text>{currentRegion?.displayName}</Text>
            <Center
              bg={isOpen ? '#FFF' : ''}
              transform={isOpen ? 'rotate(-90deg)' : 'rotate(0deg)'}
              borderRadius={'4px'}
              transition={'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'}
            >
              <ChevronDown size={16} color={'#525252'} />
            </Center>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          width={'336px'}
          borderRadius={'12px'}
          border={'1px solid #E4E4E7'}
          boxShadow={'0px 4px 12px 0px rgba(0, 0, 0, 0.08)'}
          _focusVisible={{ outline: 'none' }}
        >
          <PopoverBody p={'8px'}>
            {/* <VStack alignItems={'stretch'}> */}
            {regionList.map((region) => {
              const canUse = true;
              return (
                <Button
                  key={region.uid}
                  width={'320px'}
                  height={'40px'}
                  variant={'unstyled'}
                  display={'flex'}
                  fontSize={'14px'}
                  justifyContent={'space-between'}
                  alignItems={'center'}
                  whiteSpace={'nowrap'}
                  borderRadius={'8px'}
                  py={'10px'}
                  px={'8px'}
                  onClick={() => {
                    setCurrentRegion(region.uid);
                    onClose();
                  }}
                  bgColor={!canUse ? '#F4F4F5' : ''}
                  cursor={'pointer'}
                  _hover={{
                    bgColor: '#F4F4F5'
                  }}
                >
                  <Flex alignItems={'center'}>
                    <Box
                      bgColor={region.description?.color || '#DC2626'}
                      boxSize={'6px'}
                      mr={'7px'}
                      borderRadius={'full'}
                    ></Box>
                    <Text color={canUse ? '#18181B' : '#71717A'}>{region?.displayName}</Text>
                    {/* {!region.description.isFree && (
                          <Flex
                            ml={'8px'}
                            px={'8px'}
                            borderRadius={'full'}
                            py={'2px'}
                            color={'#FFFFFF'}
                            fontSize={'12px'}
                            bg={'linear-gradient(270.48deg, #2778FD 3.93%, #829DFE 80.66%)'}
                          >
                            Hobby & Pro
                          </Flex>
                        )} */}
                  </Flex>
                  {region.uid === currentRegionUid && <CheckIcon size={16} color={'#1C4EF5'} />}
                </Button>
              );
            })}
            {/* </VStack> */}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
}
