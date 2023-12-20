import {
  Box,
  Flex,
  Icon,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import DropZone from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";

export const Dropzone = ({
  setFieldValue,
  values,
  errors,
  name,
  isRequired,
  disableDescription,
  onChange,
  multifiles,
  maxFiles,
  ...props
}) => {
  const [selected, setSelected] = useState();
  const onDrop = (acceptedFiles) => {
    if (setFieldValue) setFieldValue([name], acceptedFiles?.[0]);
    if (onChange) {
      onChange(acceptedFiles?.[0]);
    }
  };

  const onDropMulti = (acceptedFiles) => {
    if (maxFiles) {
      if (acceptedFiles.length > maxFiles) {
        acceptedFiles = acceptedFiles?.slice(-maxFiles);
      }
    }
    setSelected(acceptedFiles);
    if (setFieldValue) setFieldValue([name], acceptedFiles);
    if (onChange) {
      onChange(acceptedFiles);
    }
  };

  const onClear = () => {
    setSelected(undefined);
    if (setFieldValue) setFieldValue([name], undefined);
    if (onChange) {
      onChange(undefined);
    }
  };
  return multifiles ? (
    <DropZone maxFiles={maxFiles} onDrop={multifiles ? onDropMulti : onDrop}>
      {({ getRootProps, getInputProps }) => (
        <>
          <Box
            {...getRootProps()}
            mb={4}
            cursor="pointer"
            display="flex"
            minHeight={100}
            overflowY="auto"
            alignItems="center"
            justifyContent="center"
            borderWidth={2}
            p={5}
            borderRadius="lg"
            borderColor="brand.600"
            borderStyle="dashed"
            css={{
              "::-webkit-scrollbar": {
                width: "0px" /* Remove scrollbar space */,
              },
            }}
          >
            <input hidden {...getInputProps()} />
            <Flex flexDirection="column" alignItems="center">
              <Icon
                as={FaCloudUploadAlt}
                boxSize="3em"
                color="brand.600"
                mb={2}
              />
              {selected ? (
                <Text
                  textAlign="center"
                  color="brand.600"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  {`${selected?.length} ` +
                    (selected?.length == 1 ? "file" : "files") +
                    " selected."}
                </Text>
              ) : null}
              <Text
                textAlign="center"
                color="brand.600"
                fontWeight="medium"
                textTransform="uppercase"
              >
                Click or Drag &apos;n&apos; Drop File
              </Text>
            </Flex>
          </Box>
        </>
      )}
    </DropZone>
  ) : (
    <DropZone onDrop={multifiles ? onDropMulti : onDrop}>
      {({ getRootProps, getInputProps }) => (
        <>
          {!values?.[name] ? (
            <Box
              {...getRootProps()}
              mb={4}
              cursor="pointer"
              display="flex"
              minHeight={100}
              overflowY="auto"
              alignItems="center"
              justifyContent="center"
              borderWidth={2}
              p={5}
              borderRadius="lg"
              borderColor="brand.600"
              borderStyle="dashed"
              css={{
                "::-webkit-scrollbar": {
                  width: "0px" /* Remove scrollbar space */,
                },
              }}
            >
              <input hidden {...getInputProps()} />
              <Flex flexDirection="column" alignItems="center">
                <Icon
                  as={FaCloudUploadAlt}
                  boxSize="3em"
                  color="brand.600"
                  mb={2}
                />

                <Text
                  textAlign="center"
                  color="brand.600"
                  fontWeight="medium"
                  textTransform="uppercase"
                >
                  Click or Drag &apos;n&apos; Drop File
                </Text>
              </Flex>
            </Box>
          ) : (
            <Tag
              key={values?.[name]?.name}
              variant="outline"
              colorScheme={"brand"}
              size="lg"
            >
              <TagLabel>{values?.[name]?.name}</TagLabel>
              <TagCloseButton color="red.800" ml="auto" onClick={onClear} />
            </Tag>
          )}
        </>
      )}
    </DropZone>
  );
};
