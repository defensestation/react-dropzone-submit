import React, { useState } from "react";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  useColorModeValue,
} from "@chakra-ui/react";
import { useReadResponse } from "../../context/read-dropzone-context";
import { useSubmitData } from "../../context/submit-data";
import { Dropzone } from "../Dropzone";

export default function CustomStringField(props) {
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  const [fileName, setFileName] = useState(null);
  const MAX_FILE_SIZE = props?.schema?.maxSize;
  const MAX_FILE_HEADING = props?.schema?.maxSize == 1073741824 ? "1GB" : "5GB";
  const { addFile, files, addFilesWithKeys, setFiles } = useSubmitData();
  const isFile = props.schema.format == "file";
  const isMultifile = props.schema.format == "multifile";
  const readRequest = useReadResponse();
  const readFiles = readRequest.files;

  const onChange = (event) => {
    if (isFile) {
      const file = event.target.files[0];
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        props.onChange(reader.result);
      };
    } else {
      props.onChange(event.target.value);
    }
  };
  const onFileChange = (file) => {
    if (file) {
      if (MAX_FILE_SIZE) {
        if (file?.size >= MAX_FILE_SIZE) {
          showErrorToast(
            "Error!",
            `File size cannot be larger than ${MAX_FILE_HEADING}.`
          );
          return;
        }
      }

      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFileName(`${file.path} (${file.size} bytes)`);
        props.onChange(file?.name);
      };
    } else {
      props.onChange(file);
      setFileName(null);
    }
    addFile(file, props.name);
  };
  const onMultiFileChange = (selectedFiles) => {
    if (selectedFiles?.length) {
      let newFilesObject = {};
      Object.keys(files)?.map((key) => {
        if (!key.includes(props.name)) {
          newFilesObject[key] = files[key];
        }
      });
      setFiles(newFilesObject);
      let newFiles = {};
      let fileNames = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          setFileName(`${file.path} (${file.size} bytes)`);
        };
        fileNames.push(file?.name);
        newFiles[props.name + [i]] = file;
        if (i + 1 > props.schema?.maxLength) {
          break;
        }
      }
      props.onChange(fileNames.join(","));
      addFilesWithKeys(newFiles);
    } else if (selectedFiles == undefined) {
      let newFilesObject = {};
      Object.keys(files)?.map((key) => {
        if (!key.includes(props.name)) {
          newFilesObject[key] = files[key];
        }
      });
      setFiles(newFilesObject);
      props.onChange(undefined);
      setFileName(null);
    } else {
    }
  };
  if (isMultifile) {
    let filesToBeShown = [];
    if (props.readonly) {
      const fileKeys = Object.keys(readFiles);
      for (let index = 0; index < props.schema.maxLength; index++) {
        const name = props.name + index;
        if (fileKeys.includes(name)) {
          filesToBeShown.push(readFiles[name]);
        }
      }
    }
    return (
      <>
        <FormControl isRequired={props.required} width={"100%"}>
          <FormLabel
            display="flex"
            ms="10px"
            color={textColorPrimary}
            fontSize={"md"}
            fontWeight="bold"
            _hover={{ cursor: "pointer" }}
          >
            {props.schema.title}
          </FormLabel>
          <Dropzone
            multifiles={true}
            isRequired={props.required}
            maxFiles={props.schema?.maxLength}
            onChange={onMultiFileChange}
            name={props.name}
            values={fileName ? { [props.name]: { name: fileName } } : null}
            width="full"
          />
        </FormControl>
      </>
    );
  }

  return isFile ? (
    <>
      <FormControl isRequired={props.required} width={"100%"}>
        <FormLabel
          display="flex"
          ms="10px"
          color={textColorPrimary}
          fontSize={"md"}
          fontWeight="bold"
          _hover={{ cursor: "pointer" }}
        >
          {props.schema.title}
        </FormLabel>
        <Dropzone
          onChange={onFileChange}
          isRequired={props.required}
          name={props.name}
          values={fileName ? { [props.name]: { name: fileName } } : null}
          width="full"
        />
      </FormControl>
    </>
  ) : (
    <FormControl isRequired={props.required}>
      <FormLabel display="flex"
          ms="10px"
          color={textColorPrimary}
          fontSize={"md"}
          fontWeight="bold"
          _hover={{ cursor: "pointer" }}
          htmlFor="message">{props.schema.title}</FormLabel>
      <Input
        pr="4.5rem"
        mb="0px"
        disabled={props.readonly}
        type={isFile ? "file" : "text"}
        fontSize="md"
        borderRadius={"16px"}
        value={props.formData}
        placeholder={`Enter ${props.schema.title}`}
        name={props.name}
        onChange={onChange}
      />
    </FormControl>
  );
}
