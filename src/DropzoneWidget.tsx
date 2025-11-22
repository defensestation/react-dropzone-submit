import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, InfoIcon, Loader2 } from "lucide-react";
import { addDays, endOfDay, startOfDay } from "date-fns";
// import SubmitDataProvider, { useSubmitData } from "@/context/SubmitData";
import { getExpirationMessage, getExpirationMessageColor, getDynamicChunkSize, uploadStream } from "@/components/json-form-builder/lib/lib/functions";

import NormalForm from "@/components/json-form-builder/lib/components/JsonFormViewer/NormalForm";
import { byteArrayToJSON, splitJsonFormsSchemas } from "@/components/json-form-builder/lib/utils/util-function";
import type { DateRange } from "react-day-picker";
import type { CustomJsonSchema } from "@/components/json-form-builder/lib/context/dnd-context";
import DataSubmitted from "@/components/DataSubmitted";
import { CommonTypes, ResponseTypes } from "@ds-sdk/sypher";
import { cn } from "@/lib/utils";
import { encryptFile, encryptMessage, predictEncryptedSize } from "@ds-sdk/crypto";
import { Semaphore } from "@/lib/Semaphore";
import PercentageSpinner from "@/components/json-form-builder/lib/components/ui/percentage-spinner";
import { StepperJsonForm } from "@/components/json-form-builder/lib/components/JsonFormViewer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/json-form-builder/lib/components/ui/card";
import { Label } from "@/components/json-form-builder/lib/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/json-form-builder/lib/components/ui/tooltip";
import { motion } from "motion/react"
import DatePickerWithRange from "@/components/json-form-builder/lib/components/ui/date-picker-with-range";
import { Input } from "@/components/json-form-builder/lib/components/ui/input";
import { Button } from "@/components/json-form-builder/lib/components/ui/button";
import { useSubmitData, FileUploadProvider } from "@defensestation/json-form-viewer"
import { useDsClients } from "./hooks/user-ds-client";

interface DropzoneWidgetProps {
    accessKey: string;
    isPassword?: boolean;
    showStats?: boolean;
    submitButtonText?: string;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
    region?: string;
    domain?: string;
}

function DropzoneWidget(props: DropzoneWidgetProps) {
    const {
    dropzoneClientWithoutRedirection,
    responseClientWithoutRedirection,
} = useDsClients(props.region, props.domain);
    const { accessKey, isPassword, onError, onSuccess, showStats, submitButtonText } = props;
    const [loginRequired, setLoginRequired] = useState(false);
    const [linkBroken, setLinkBroke] = useState(false);
    const [data, setData] = useState<CommonTypes.DropzoneAccess>();
    const [session, setSession] = useState<string>();
    const [schema, setSchema] = useState<CustomJsonSchema>();
    const [isResponderControlVisible, setIsResponderControlVisible] = useState<boolean>(false);
    const [uischema, setUISchema] = useState<CustomJsonSchema>();
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setSubmitting] = useState(false);
    const [_, setLoadingText] = useState("");
    const [progress, setProgress] = useState<number>(0);
    const [requestParams, setRequestParams] = useState<ResponseTypes.CreateResponseRequest>();
    const uploadedDataRef = useRef(0); // Track total uploaded bytes using a ref
    const [filesMetadata, setFilesMetadata] = useState<CommonTypes.MultiPartUploadFile[]>();
    const cardVariants = {
        enter: (direction: "right" | "left") => ({
            x: direction === "right" ? 1000 : -1000,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: "right" | "left") => ({
            x: direction === "right" ? -1000 : 1000,
            opacity: 0,
        }),
    };
    const [isLoading, setLoading] = useState(false);
    const baseDate = new Date();

    const [range, setRange] = useState<DateRange>({
        from: startOfDay(baseDate),
        to: endOfDay(addDays(baseDate, 3)),
    });
    const [accessLimit, setAccessLimit] = useState(10);
    const { files } = useSubmitData();
    const fetchData = async (password = null) => {
        console.log("Getting data");
        if (!accessKey) {
            setLinkBroke(true);
            return true;
        }
        console.log("After data");

        if (isPassword && !password) {
            return;
        }
        console.log("Settin loading state");
        setLoading(true);
        console.log({
            accessKey: accessKey || ''
        })
        console.log("fetching")
        await dropzoneClientWithoutRedirection.accessDropzone({
            accessKey: accessKey || ''
        }, {
            headers: {

            }
        })
            .then((result) => {
                console.log({ result })
                const res = result;
                setSession(res?.session);
                if (!res.dropzone?.template?.jsonForm?.schema || !res.dropzone?.template?.jsonForm?.uiSchema) {
                    throw new Error("No template data found.")
                }
                const schema = byteArrayToJSON(res.dropzone?.template?.jsonForm?.schema)
                const uischema = byteArrayToJSON(res.dropzone?.template?.jsonForm?.uiSchema)
                setSchema(schema)
                setUISchema(uischema)
                console.log("Here is the schema for UI", { schema, uischema })
                setData(res.dropzone)
            })
            .catch((e) => {
                if (e.message.includes("user not logged in")) {
                    setLoginRequired(true);
                }
                else if (e.message.includes("access denied")) {
                    setLinkBroke(true);
                } else {
                    setLinkBroke(true);
                }
            });
        setLoading(false);
    };
    useEffect(() => {
        fetchData();
    }, []);

    const sendRequest = async (params = requestParams, fileMetadata: CommonTypes.MultiPartUploadFile[] = filesMetadata || []) => {
        try {
            setSubmitting(true)
            const uploadSemaphore = new Semaphore(20); // Change the number for concurrent uploads.
            if (!params) return;
            console.log({ params })
            const contentLength = JSON.stringify(params).length
            console.log({ files })
            const endDate = endOfDay(range.to).toISOString();
            const requestParams = data?.isResponderControlsEnabled ? {
                ...params,
                accessSettings: {
                    accessLimit: accessLimit,
                    endDate: endDate,
                    startDate: range.from?.toISOString(),
                }
            } : params
            console.log({ requestParams })
            const response = await responseClientWithoutRedirection.createResponse(requestParams);
            console.log({ response })
            let dataSize = 0;
            const fileProgressMap: { [fileName: string]: number } = {};
            Object.keys(files).forEach((key) => {
                fileProgressMap[key] = 0;
            });
            const totalSize = fileMetadata.reduce((accum, value) => accum + Number(value.size), dataSize + JSON.stringify(params).length);
            // Set the initial progress based solely on the metadata upload.
            setProgress(Math.round((contentLength / totalSize) * 100));
            const fileToUpload = response?.files;
            if (fileToUpload?.length) {
                try {
                    const uploadTasks = fileToUpload.map(async (fileObj) => {
                        const file = files[fileObj.id];
                        if (!file) throw new Error(`File with key ${fileObj.id} not found`);

                        // Log file details for debugging
                        console.log("File details:", file);
                        console.log("File size:", file.size);
                        console.log("File last modified:", file.lastModified);

                        const encryptedFileSize = Number(
                            fileMetadata.find((v) => fileObj.id === v.id)?.size
                        );
                        const unencryptedChunkSize = getDynamicChunkSize(file.size);

                        try {
                            const encryptedStream = encryptFile(file, {
                                useKyber: true,
                                kyberPubKey: data?.publicKey,
                                chunkSize: unencryptedChunkSize,
                            });

                            let headers: { [key: string]: string } = { "Content-Type": file.type };
                            // if (data?.isResponderControlsEnabled) {
                            //   headers = { ...headers, "x-amz-meta-expired-at": endDate || '' }
                            // }
                            let fileUploadedBytes = 0;

                            const onProgress = (fileProgressPercentage: number) => {
                                const newBytes = (fileProgressPercentage / 100) * encryptedFileSize;
                                const delta = newBytes - fileUploadedBytes;
                                fileUploadedBytes = newBytes;

                                uploadedDataRef.current += delta;
                                setProgress(currentProgress => Math.max(currentProgress, Math.round((uploadedDataRef.current / totalSize) * 100)));

                            };
                            const partsWithEtag = await uploadStream(
                                encryptedStream,
                                fileObj.presignUrls,
                                headers,
                                onProgress,
                                encryptedFileSize,
                                0,
                                getDynamicChunkSize(encryptedFileSize),
                                uploadSemaphore,
                                3
                            );
                            const payload = {
                                id: fileObj.id,
                                uploadId: fileObj.uploadId,
                                responseId: response.responseId,
                                parts: partsWithEtag as unknown as CommonTypes.CompleteMultiParts[]
                            } as ResponseTypes.CompleteMultiPartUploadRequest
                            await responseClientWithoutRedirection.completeMultiPartUpload(payload)
                        } catch (error) {
                            console.error(file.name, "- Error processing or uploading file:", error);
                            // throw new Error("Failed to upload file");
                        }
                    });
                    await Promise.all(uploadTasks);
                } catch (error) {
                    //   showServerError(error)
                }

            }
            setSubmitted(true);
            onSuccess?.();
        }
        catch (e: unknown) {
            //   showServerError(e);
            onError?.(e)
        }
        finally {
            setSubmitting(false);
        }
    }




    const onSubmit = async (formData: unknown) => {
        setProgress(0);
        setLoadingText("Encrypting...");
        setSubmitting(true);
        try {
            const enc_key = data?.publicKey || '';
            console.log("Encryption key", enc_key)
            // Added bytes to match the size after encryption so that we can send it to create the response.
            let dataSize = 0;
            const fileMetadata = Object.keys(files)?.map((key) => {
                const file = files[key];
                const chunkSize = getDynamicChunkSize(file.size);
                const encryptedSize = predictEncryptedSize(file.size, { useKyber: true }, chunkSize);
                const encryptedChunkSize = getDynamicChunkSize(encryptedSize);
                dataSize += encryptedSize;
                return {
                    id: key,
                    size: BigInt(encryptedSize),
                    chunkSize: BigInt(encryptedChunkSize),
                } as unknown as CommonTypes.MultiPartUploadFile;
            });

            setFilesMetadata(fileMetadata)
            let contentLength = 0;
            setLoadingText("Uploading...");
            const submittableData = JSON.stringify(formData);
            console.log({ submittableData })
            const encryptedData = await encryptMessage(submittableData, {
                kyberPubKey: enc_key,
                useKyber: true
            })
            console.log({ encryptedData })
            const sendableFiles: CommonTypes.MultiPartUploadFile[] = fileMetadata;
            dataSize += encryptedData.length;
            let params = {} as ResponseTypes.CreateResponseRequest;
            params = {
                encryptedData: encryptedData,
                files: sendableFiles,
                session: session || '',
            } as ResponseTypes.CreateResponseRequest;
            contentLength = JSON.stringify(params).length;
            setRequestParams(params as ResponseTypes.CreateResponseRequest)
            console.log({ data })
            if (data?.isResponderControlsEnabled) {
                setIsResponderControlVisible(true);
            }
            else {
                await sendRequest(params, sendableFiles);
            }
        } catch (e) {
            //   showServerError(e)
        }
        finally {
            setSubmitting(false);
        }
    };

    const splitSchemas = useMemo(() => {
        if (schema?.properties && schema) {
            const splitSchemas = splitJsonFormsSchemas(schema, uischema)
            return splitSchemas;
        }
    }, [schema, uischema])


    if (linkBroken) {
        return <p>Link Broken</p>
    }

    if (loginRequired) {
        return <p>Login required.</p>
    }


    if (submitted) {
        console.log("Submitted")
        return (<div className="flex h-full w-full justify-center items-center">
            <div className="flex flex-col items-center">
                <DataSubmitted />
            </div>
        </div>)
    }

    if (linkBroken) {
        return <div className="flex h-full w-full justify-center items-center"><p>Invalid ID</p></div>
    }

    if (!data) {
        return (<div className="flex h-full w-full justify-center items-center">
            <div className="flex items-center space-x-2">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        </div>)
    }

    if (isSubmitting) {
        return (<div className="flex h-full w-full justify-center items-center">
            <div className="flex flex-col items-center">
                <PercentageSpinner size="lg" percentage={progress} />
                <p className="mt-4 text-xl">Submitting your data</p>
            </div>
        </div>)
    }


    return (<div className={cn("flex justify-center items-center w-full h-full",
        {
            "justify-center items-center": isResponderControlVisible
        }
    )}>
        <div className={cn("flex flex-col justify-center container mx-auto 2xl:grid-cols-[2.9fr_1fr] gap-4 w-full", {
            "w-full max-w-full": uischema?.properties?.multistep
        })}>
            {isResponderControlVisible ?
                data?.isResponderControlsEnabled && (
                    <motion.div
                        key={"responder-control"}
                        custom={"right"}
                        variants={cardVariants}
                        initial={!uischema?.properties?.multistep ? false : "enter"}
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                        }}>
                        <Card className="z-10 relative">
                            <CardHeader>
                                <CardTitle>Controls</CardTitle>
                                <CardDescription>
                                    Take control of your data.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-2 ">
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Label>Select Access Date Range</Label>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <InfoIcon className="h-4 w-4" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Choose when you want message to be accessed
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <DatePickerWithRange
                                            minDate={addDays(new Date(), -1)}
                                            maxDate={addDays(new Date(), 30)}
                                            onChange={date => setRange({
                                                from: date?.from,
                                                to: date?.to
                                            })}
                                            defaultTo={range.to}
                                            defaultFrom={range.from} size={"sm"} />
                                        <p className={cn("text-[0.8rem] text-muted-foreground")}>This will define the time vaidity of your data.</p>
                                    </div>

                                    <div>
                                        <Label>Retry Limit</Label>
                                        <Input
                                            type="number"
                                            max={100}
                                            min={1}
                                            value={accessLimit}
                                            onChange={(e) =>
                                                setAccessLimit(Number(e.target.value))
                                            }
                                        />
                                        <p className={cn("text-[0.8rem] text-muted-foreground")}>This decides how many time the requester can open your data.</p>
                                    </div>
                                </div>
                                <Button className="w-full mt-4" onClick={() => sendRequest()}>Submit</Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : uischema?.properties?.multistep ?
                    <>
                        {schema && (
                            <StepperJsonForm
                                schemas={splitSchemas}
                                properties={uischema?.properties}
                                onSubmit={onSubmit}
                            />
                        )}
                        {!data?.accessSettings?.isStatsHidden && !showStats && (
                            <div className="w-full flex justify-end absolute top-4 right-4 z-10">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    {data?.accessSettings?.endDate && <div className="flex items-center gap-2 text-muted-foreground bg-gray-50 dark:bg-transparent border px-3 py-1.5 rounded-lg backdrop-blur-lg backdrop-saturate-180 bg-[rgba(17, 25, 40, 0.90)] border-[rgba(255, 255, 255, 0.125)]">
                                        <Clock className={cn("text-primary w-4 h-4", getExpirationMessageColor(data?.accessSettings?.endDate))} />
                                        {getExpirationMessage(data?.accessSettings?.endDate)}
                                    </div>}
                                </div>
                            </div>
                        )}
                    </>
                    : <div className="space-y-4 z-10 w-full mx-auto">
                        {isResponderControlVisible ?
                            data?.isResponderControlsEnabled && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Controls</CardTitle>
                                        <CardDescription>
                                            Take control of your data.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col gap-2 ">
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <Label>Select Access Date Range</Label>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <InfoIcon className="h-4 w-4" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Choose when you want message to be accessed
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                                <DatePickerWithRange
                                                    minDate={addDays(new Date(), -1)}
                                                    maxDate={addDays(new Date(), 30)}
                                                    onChange={date => setRange({
                                                        from: date?.from,
                                                        to: date?.to
                                                    })}
                                                    defaultTo={range.to}
                                                    defaultFrom={range.from} size={"sm"} />
                                                <p className={cn("text-[0.8rem] text-muted-foreground")}>This will define the time vaidity of your data.</p>
                                            </div>

                                            <div>
                                                <Label>Retry Limit</Label>
                                                <Input
                                                    type="number"
                                                    max={100}
                                                    min={1}
                                                    value={accessLimit}
                                                    onChange={(e) =>
                                                        setAccessLimit(Number(e.target.value))
                                                    }
                                                />
                                                <p className={cn("text-[0.8rem] text-muted-foreground")}>This decides how many time the requester can open your data.</p>
                                            </div>
                                        </div>
                                        <Button className="w-full mt-4" onClick={() => sendRequest()}>Submit</Button>
                                    </CardContent>
                                </Card>
                            )
                            : <div className="w-full z-10 max-h-app">
                                <div className="w-full mx-auto space-y-4">{!data?.accessSettings?.isStatsHidden && showStats && (
                                    <div className="w-full flex justify-end">
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            {data?.accessSettings?.endDate && <div className="flex items-center gap-2 text-muted-foreground bg-gray-50 dark:bg-transparent border px-3 py-1.5 rounded-lg backdrop-blur-lg backdrop-saturate-180 bg-[rgba(17, 25, 40, 0.90)] border-[rgba(255, 255, 255, 0.125)]">
                                                <Clock className={cn("text-primary w-4 h-4", getExpirationMessageColor(data?.accessSettings?.endDate))} />
                                                {getExpirationMessage(data?.accessSettings?.endDate)}
                                            </div>}
                                        </div>
                                    </div>
                                )}
                                    {schema && (
                                        <NormalForm
                                            jsonSchema={schema}
                                            uiSchema={uischema}
                                            properties={uischema?.properties}
                                            onSubmit={onSubmit}
                                            actionButtonText={data?.isResponderControlsEnabled ? "Next" : submitButtonText || "Submit"}
                                        />
                                    )}
                                </div>
                            </div>}
                    </div>}
        </div>
    </div>);
}

export default (props: DropzoneWidgetProps) => {
    return <FileUploadProvider><DropzoneWidget {...props} /></FileUploadProvider>
}