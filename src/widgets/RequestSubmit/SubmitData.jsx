import React, { useEffect, useState } from "react";

import {
  Flex,
  Heading,
  Spinner,
  Button,
  FormControl,
  FormLabel,
  Text,
  Tooltip,
  useColorModeValue,
  Stack,
  Card,
  CardHeader,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  CardBody,
  Box,
} from "@chakra-ui/react";
import { Form } from "@rjsf/chakra-ui";
import validator from "@rjsf/validator-ajv8";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import * as yup from "yup";
import { addDays, endOfDay, startOfDay } from "date-fns";
import {
  accessDropzone,
  createResponse,
  createResponseWithLimit,
} from "../../services/api-service";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { GRAPHQL_ENDPOINT } from "../../constants/api-endpoints";
import { buildFileFromString, uploadFile } from "../../utils/custom-function";
import { PostQAsymEncryptFile } from "../../utils/encrypt";
import { useSubmitData } from "../../context/submit-data";
import PropType from "prop-types";
import DatePicker from "../../components/DatePicker";
import CustomStringField from "../../components/rjsf/CustomStringField";
import CustomCheckboxField from "../../components/rjsf/CustomCheckboxField";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import ContextProvider from "../../components/ContextProvider";

const buildValidationRules = (requestedData = null) => {
  let schema = {};
  if (requestedData) {
    requestedData?.requested_fields?.map((field) => {
      if (field?.field_required) {
        schema = {
          ...schema,
          [field?.field_name]: yup
            .string()
            .required(`${field?.field_name} can't blank.`),
        };
      }
    });
    requestedData?.requested_files?.map((file) => {
      if (file?.file_required) {
        schema = {
          ...schema,
          [file?.file_name]: yup
            .mixed()
            .required(`${file?.file_name} can't blank.`),
        };
      }
    });
  }
  return yup.object().shape(schema);
};

function SubmitData({
  dropzoneId,
  dropzoneKey,
  onError,
  onSuccess,
  submitButtonText = "Submit",
}) {
  const [validations, setValidations] = useState(buildValidationRules());
  const [data, setData] = useState(null);
  const [session, setSession] = useState(null);
  const [schema, setSchema] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState("");
  const [formKey, setFormKey] = useState(new Date());
  const baseDate = new Date();
  const [range, setRange] = useState([
    {
      start_date: startOfDay(baseDate),
      end_date: endOfDay(addDays(baseDate, 3)),
      startDate: startOfDay(baseDate),
      endDate: endOfDay(addDays(baseDate, 3)),
      key: "selection",
    },
  ]);
  const [accessLimit, setAccessLimit] = useState(10);
  const onAccessLimitChange = (value) => {
    if (value >= 100) {
      setAccessLimit(100);
    } else if (value <= 0) {
      setAccessLimit(0);
    } else {
      setAccessLimit(value);
    }
  };
  const [isSubmitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const { files, client, setClient } =
    useSubmitData();
  const fetchData = async () => {
    try{
      if (!client) return;
      if (!dropzoneId || !dropzoneKey) {
        throw new Error("dropzoneId and dropzoneKey are required.");
      }
  
      const res = await accessDropzone(client, {
        dropzone_id: dropzoneId,
        dropzone_key: dropzoneKey,
      });
      setSession(res?.session);
      let template = String.fromCharCode(...res?.dropzone?.template?.data?.data);
      template = JSON.parse(template);
      setSchema(template);
      if (res.errors) {
        const error = res.errors[0]?.message;
        const code = error.split(" ")[0];
        if (code == 7) {
        }
      } else {
        setData(res?.dropzone);
      }
    }
    catch(e) {
      onError(e)
      setError("Error:" + e.message)
      setIsError(true)
    }
  };
  const init = () => {
    if (!client) {
      const apolloClient = new ApolloClient({
        uri: GRAPHQL_ENDPOINT,
        cache: new InMemoryCache(),
      });
      setClient(apolloClient);
    }
  };
  useEffect(() => {
    init();
    fetchData();
  }, [client]);

  const onChange = (data) => {
    if (data?.formData)
      setFormData(
        formData ? { ...formData, ...data?.formData } : { ...formData }
      );
  };

  const onSubmit = async (submittedFormData) => {
    setSubmitting(true);
    try {
      const enc_key = data.enc_key;
      const formData = submittedFormData.formData;
      // Added bytes to match the size after encryption so that we can send it to create the response.
      const FIXED_ENCRYPTION_SIZE = 5645;
      let dataSize = 0;
      const fileData = Object.keys(files)?.map((key) => {
        dataSize += files[key]?.size + FIXED_ENCRYPTION_SIZE;
        return {
          id: key,
          size: files[key]?.size + FIXED_ENCRYPTION_SIZE,
        };
      });
      const submittableData = JSON.stringify(formData);
      const dataFile = buildFileFromString(submittableData);
      let response = null;
      const sendableFiles = fileData
        ? [
            ...fileData,
            { id: "data", size: dataFile.size + FIXED_ENCRYPTION_SIZE },
          ]
        : [{ id: "data", size: dataFile.size + FIXED_ENCRYPTION_SIZE }];
      dataSize += dataFile.size + FIXED_ENCRYPTION_SIZE;
      // const totalSize = contentLength + dataSize;
      if (data?.responder_controls) {
        response = await createResponseWithLimit(client, {
          session: session,
          files: sendableFiles,
          access_limit: accessLimit,
          start_date: range[0].start_date?.toISOString(),
          end_date: range[0].end_date?.toISOString(),
        });
      } else {
        response = await createResponse(client, {
          session: session,
          files: sendableFiles,
        });
      }
      const urls = response?.signed_urls;
      let headers = null;
      if (data?.responder_controls) {
        headers = {
          "x-amz-meta-expired-at": range[0].end_date?.toISOString(),
        };
      }
      await Promise.all(
        Object.keys(urls)?.map(async (key) => {
          if (key != "data") {
            const enBlob = await PostQAsymEncryptFile(enc_key, files[key]);
            const file = new File([enBlob], files[key].name, {
              type: files[key]?.type,
            });
            const headers = {
              ...headers,
              "Content-Type": file?.type,
            };
            await uploadFile(urls[key], file, headers);
          } else {
            const enBlob = await PostQAsymEncryptFile(enc_key, dataFile);
            const file = new File([enBlob], dataFile.name, {
              type: "plain/text",
            });
            const headers = {
              ...headers,
              "Content-Type": file?.type,
            };
            await uploadFile(urls[key], file, headers);
          }
        })
      ).catch((e) => {
        throw e;
      });
      setFormData(undefined);
      setFormKey(new Date());
      if (onSuccess) onSuccess({ status: "done" });
      setSubmitting(false);
    } catch (e) {
      if (onError) onError(e);
      setSubmitting(false);
    }
  };

  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  return (
    <>
      {data ? (
        <Stack w="full">
          {data?.responder_controls && (
            <Box w="full">
              <Stack>
                <Flex flex="1">
                  <FormControl isRequired direction="column" mb="0px">
                    <FormLabel
                      display="flex"
                      ms="10px"
                      fontSize="sm"
                      color={textColorPrimary}
                      fontWeight="bold"
                      _hover={{ cursor: "pointer" }}
                    >
                      Select Access Date Range
                      <Flex
                        ml="2"
                        alignItems={"center"}
                        justifyContent="center"
                      >
                        <Tooltip label="Choose when you want message to be accessed">
                          <InfoOutlineIcon color={"brand.600"} />
                        </Tooltip>
                      </Flex>
                    </FormLabel>
                    <DatePicker
                      baseDate={baseDate}
                      range={range}
                      onDateChange={(range) => setRange(range)}
                    />
                  </FormControl>
                </Flex>
                <Flex flex="1">
                  <FormControl isRequired>
                    <FormLabel htmlFor="access_limit">Access Limit</FormLabel>
                    <NumberInput
                      name="access_limit"
                      onChange={onAccessLimitChange}
                      value={accessLimit}
                      step={1}
                      defaultValue={15}
                      min={1}
                      max={100}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </Flex>
              </Stack>
              {/* </CardBody> */}
            </Box>
          )}
          <>
            {schema ? (
              <Box w="full">
                <Form
                  key={formKey}
                  validator={validator}
                  schema={schema}
                  disabled={isSubmitting}
                  formData={formData}
                  onChange={onChange}
                  fields={{
                    StringField: CustomStringField,
                  }}
                  widgets={{
                    CheckboxWidget: CustomCheckboxField,
                  }}
                  onSubmit={onSubmit}
                >
                  <Flex mt="4" mb="4">
                    <Button
                      type="submit"
                      borderRadius={"16px"}
                      variant={"solid"}
                      colorScheme="brand"
                      isLoading={isSubmitting}
                      width={"full"}
                    >
                      {submitButtonText}
                    </Button>
                  </Flex>
                </Form>
              </Box>
            ) : null}
            <Flex w="full" justify={"flex-end"} pr="4">
              <Text color="gray.500" fontWeight={"semibold"}>Dropzone - Powered by Sypher</Text>
            </Flex>
          </>
        </Stack>
      ) : (isError?
        <Flex justifyContent={"center"} alignItems="center">
          <Text color={"red"}>{error}</Text>
        </Flex>
        :
        <Flex justifyContent={"center"} alignItems="center">
          <Spinner size={"lg"} />
        </Flex>
      )}
    </>
  );
}

export default (props) => (
  <ContextProvider>
    <SubmitData {...props} />
  </ContextProvider>
);

SubmitData.propTypes = {
  dropzoneId: PropType.string.isRequired,
  dropzoneKey: PropType.string.isRequired,
  onError: PropType.func,
  onSuccess: PropType.func,
  submitButtonText: PropType.string,
  title: PropType.string,
  description: PropType.string,
};
