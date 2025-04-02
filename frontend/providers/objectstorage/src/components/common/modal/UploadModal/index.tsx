import {
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  IconButtonProps,
  Button,
  Center,
  Spinner,
  HStack,
  Link,
  Flex
} from '@chakra-ui/react';
import UploadIcon from '@/components/Icons/UploadIcon';
import MyIcon from '@/components/Icon';

type TFileItem = {
  file: File;
  path: string;
};
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { putObject } from '@/api/s3';
import { useOssStore } from '@/store/ossStore';
import { useDropzone } from 'react-dropzone';
import { FolderPlaceholder, QueryKey } from '@/consts';
import { useTranslation } from 'next-i18next';
import { useToast } from '@/hooks/useToast';
import style from './index.module.css';

export default function UploadModal({ ...styles }: Omit<IconButtonProps, 'aria-label'> & {}) {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { t, i18n } = useTranslation('file');
  const handleFile = function (entry: FileSystemEntry, fileArray: TFileItem[]) {
    return new Promise((resolve, reject) => {
      if (entry.isFile) {
        (entry as FileSystemFileEntry).file((f: File) => {
          const customFile = {
            file: f,
            path: entry.fullPath
          };
          fileArray.push(customFile);
          resolve(null);
        }, reject);
      } else if (entry.isDirectory) {
        const dirReader = (entry as FileSystemDirectoryEntry).createReader();
        fileArray.push({
          file: new File([], FolderPlaceholder),
          path: entry.fullPath + '/' + FolderPlaceholder
        });
        dirReader.readEntries(function (entries) {
          const promises = [];
          for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            promises.push(handleFile(entry, fileArray));
          }
          Promise.all(promises).then(resolve, reject);
        });
      }
    });
  };
  const queryClient = useQueryClient();
  const s3client = useOssStore((s) => s.client);
  const bucket = useOssStore((s) => s.currentBucket);
  const prefix = useOssStore((s) => s.prefix);
  const [isLoading, setIsLoading] = useState(false);
  const mutation = useMutation({
    mutationFn: putObject(s3client!)
  });
  const { toast } = useToast();
  const { getRootProps, getInputProps, isDragAccept, inputRef } = useDropzone({
    noClick: true,
    noKeyboard: true,
    useFsAccessApi: false,
    // if use firefox, mime will be losed
    noDrag: window.navigator.userAgent.indexOf('Chrome') < 0,
    onDropAccepted(files) {
      if (!bucket) return;
      setIsLoading(true);
      const values = files.map((file) => {
        // clear '/' and merege path
        const Key = [...prefix, ...(Reflect.get(file, 'path') as string).split('/')]
          .filter((v) => v !== '')
          .join('/');
        const reqV = {
          Bucket: bucket.name,
          Key,
          ContentType: file.type,
          Body: file
        };
        return reqV;
      });
      const values2: typeof values = [];
      Promise.allSettled(
        values.map((v) => {
          return mutation.mutateAsync(v);
        })
      )
        .then((results) => {
          // retry
          results.forEach((res, i) => {
            if (res.status === 'rejected') {
              values2.push(values[i]);
            }
          });
          values.length = 0;
          return Promise.allSettled(values2.map((v) => mutation.mutateAsync(v)));
        })
        .then((results) => {
          if (
            results.some((res) => {
              return res.status === 'rejected';
            })
          ) {
            toast({
              status: 'error',
              title: 'upload error'
            });
          } else {
            toast({
              status: 'success',
              title: 'upload success'
            });
          }
          // @ts-ignore
          inputRef.current && (inputRef.current.value = null);
          setIsLoading(false);
          queryClient.invalidateQueries([QueryKey.minioFileList]);
          onClose();
        });
    },
    async getFilesFromEvent(event) {
      const files: File[] = [];
      if (event.type === 'drop') {
        const _files: TFileItem[] = [];
        const promises = [];
        const dataTransfer = (event as React.DragEvent).dataTransfer;
        for (const item of dataTransfer.items) {
          const entry = item.webkitGetAsEntry();
          if (!entry) return [];
          promises.push(handleFile(entry, _files));
        }
        return Promise.all(promises).then<File[], File[]>(
          () => {
            return _files.map((_file) => {
              const file = _file.file;
              Reflect.set(file, 'path', _file.path);
              return file;
            });
          },
          () => []
        );
      } else if (event.type === 'change') {
        const fileList = (event as React.ChangeEvent<HTMLInputElement>).target.files || [];
        for (const file of fileList) {
          // 支持文件夹
          const path = file.webkitRelativePath || file.name;
          Reflect.set(file, 'path', path);
          files.push(file);
        }
      }
      return files;
    }
  });
  const onButtonClick = (uploadType: 'folder' | 'file') => {
    if (uploadType === 'folder') {
      inputRef.current?.setAttribute('webkitdirectory', '');
      inputRef.current?.setAttribute('directory', '');
    } else {
      inputRef.current?.removeAttribute('webkitdirectory');
      inputRef.current?.removeAttribute('directory');
    }
    // openDialog()
    inputRef.current?.click();
  };
  return (
    <>
      <Button
        display={'flex'}
        gap={'8px'}
        p="4px"
        minW={'unset'}
        onClick={() => onOpen()}
        {...styles}
      >
        {/* <UploadIcon boxSize="24px" color={'grayModern.500'} /> */}
        <Text display={['none', null, null, null, 'initial']} color={'#1C4EF5'}>
          {t('upload')}
        </Text>
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent maxW={'448px'} bgColor={'#FFF'} backdropFilter="blur(150px)">
          <ModalCloseButton />
          {!isLoading && <ModalHeader>{t('upload')}</ModalHeader>}
          <ModalBody h="100%" w="100%">
            {isLoading ? (
              <Center h={'288px'} w="full" flexDirection={'column'} gap={'26px'}>
                {/* <Spinner size={'md'} mx="auto" /> */}
                <MyIcon className={style.loader} name="loader"></MyIcon>
                <Text fontWeight={600} fontSize={'20px'}>
                  {t('uploading')}
                </Text>
              </Center>
            ) : (
              <Flex gap={'8px'} w={'full'}>
                <Center
                  // width={'510px'}
                  cursor={'pointer'}
                  _hover={{
                    color: '#1C4EF5'
                  }}
                  flex={1}
                  h="120px"
                  borderRadius={'6px'}
                  border={'dashed'}
                  borderColor={'#E4E4E7'}
                  transition={'0.3s'}
                  {...getRootProps()}
                  onClick={() => {
                    onButtonClick('file');
                  }}
                >
                  <input {...getInputProps({ multiple: true })} />
                  {i18n.language === 'zh' ? (
                    <HStack spacing={'8px'}>
                      <UploadIcon></UploadIcon>
                      <Text>打开文件</Text>
                    </HStack>
                  ) : (
                    <HStack spacing={'8px'}>
                      <UploadIcon></UploadIcon>
                      <Text>Upload file</Text>
                    </HStack>
                  )}
                </Center>
                <Center
                  // width={'510px'}
                  cursor={'pointer'}
                  _hover={{
                    color: '#1C4EF5'
                  }}
                  flex={1}
                  h="120px"
                  borderRadius={'6px'}
                  border={'dashed'}
                  borderColor={'#E4E4E7'}
                  transition={'0.3s'}
                  {...getRootProps()}
                  onClick={() => {
                    onButtonClick('folder');
                  }}
                >
                  <input {...getInputProps({ multiple: true })} />
                  {i18n.language === 'zh' ? (
                    <HStack spacing={'8px'}>
                      <UploadIcon></UploadIcon>
                      <Text>打开文件夹</Text>
                    </HStack>
                  ) : (
                    <HStack spacing={'8px'}>
                      <UploadIcon></UploadIcon>
                      <Text>Upload folder</Text>
                    </HStack>
                  )}
                </Center>
              </Flex>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
