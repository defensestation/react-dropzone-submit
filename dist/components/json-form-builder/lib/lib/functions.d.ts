import { CustomJsonSchema } from '../context/dnd-context';
import { CommonTypes } from '@ds-sdk/sypher';
import { Semaphore } from '../../../../lib/Semaphore';
export declare function bufferDecode(value: string): ArrayBuffer;
export declare function formatBytes(bytes: number | bigint, decimals?: number): string;
export declare function buildMinimalAddressString(accessHistory: CommonTypes.AccessHistory): string;
export declare const getThreatInfo: (security?: CommonTypes.Security) => {
    level: string;
    type: string;
    color: string;
    icon: string;
};
/**
 * A customFetch implementation using the Fetch API with support for upload progress.
 * When the request body is a Blob or ReadableStream, it wraps the underlying stream to
 * track bytes as they're read.
 *
 * Note: When streaming, we must specify `duplex: "half"`.
 */
export declare const customFetch: (url: string, opts?: any, onProgress?: (percentage: number, loaded: number, total: number) => void) => Promise<Response>;
/**
 * Uploads an encrypted file to S3 using multipart upload.
 *
 * @param file - The File to encrypt and upload.
 * @param encryptionOptions - Options for encryption (passphrase, chunkSize, useKyber, compress, etc.)
 * @param initiateUrl - Your backend endpoint that initiates the multipart upload.
 *                      It should return a JSON object with { uploadId, presignedUrls }.
 *                      presignedUrls is an array of URLs for each part (ordered by part number).
 * @param completeUrl - Your backend endpoint that completes the multipart upload.
 * @param onPartProgress - (Optional) Callback called after each part upload with (partNumber, overallPercentage).
 */
export declare function uploadEncryptedFileMultipart(file: File, encryptionOptions: {
    passphrase: string;
    chunkSize?: number;
    useKyber?: boolean;
    compress?: boolean;
}, initiateUrl: string, completeUrl: string, onPartProgress?: (partNumber: number, overallPercentage: number) => void): Promise<any>;
export declare function debounce<T extends (...args: any[]) => void>(func: T, wait: number, immediate?: boolean): (...args: Parameters<T>) => void;
export declare function createSaltFromString(inputString: string): ArrayBuffer;
export declare const extractFilesFromSchema: (schema: CustomJsonSchema) => {
    [key: string]: CommonTypes.TemplateFile;
};
export declare const formatDateToUTC: (date: Date) => string;
export declare function downloadJsonAsCsv(jsonData: any, filename: string): void;
export declare const delay: (duration: number) => Promise<unknown>;
/**
 * Function to calculate and format the time difference
 * @param utcTimestamp - The expiration time in UTC format (e.g., "2023-10-25T12:00:00Z")
 * @returns A string like "Expiring in 2 days" or "Expired"
 */
export declare const getExpirationMessage: (utcTimestamp: string) => string;
/**
 * Function to calculate and format the time difference
 * @param utcTimestamp - The expiration time in UTC format (e.g., "2023-10-25T12:00:00Z")
 * @returns A string like "Expiring in 2 days" or "Expired"
 */
export declare const getExpirationMessageColor: (utcTimestamp: string) => string;
export declare const getOpenLimitStatusColor: (accessLimit: number) => "text-destructive" | "text-yellow-500" | "text-primary";
/**
 * Converts a data URL to a File object.
 * @param dataUrl - The data URL to convert.
 * @param fileName - The name of the resulting file.
 * @returns A File object.
 */
export declare function dataUrlToFile(dataUrl: string, fileName: string): File;
export declare const readAndDecryptFileBlobFromURL: (url: string, dec_key: string, trackProgress?: (progress: number) => void, title?: string, signal?: AbortSignal) => Promise<ReadableStream<Uint8Array<ArrayBufferLike>>>;
export declare const getDynamicChunkSize: (fileSize: number) => number;
export declare function uploadPart(partData: Uint8Array, presignUrl: string, headers: Record<string, string>, onPartProgress?: (progress: number) => void): Promise<string>;
export declare function uploadStream(encryptedStream: ReadableStream<Uint8Array>, presignUrls: {
    [partNumber: string]: string;
}, headers: Record<string, string>, onProgress: (progress: number) => void, totalSize: number, maxRetries: number | undefined, minPartSize: number | undefined, semaphore: Semaphore, batchSize?: number): Promise<Array<{
    eTag: string;
    partNumber: string;
}>>;
export declare function extractEmail(input: string): string | null;
export declare const generateCSV: (data: any) => Blob | undefined;
export declare const stopEnterPropagation: (e: React.KeyboardEvent<HTMLElement>) => void;
export declare function parseDRI(dri: any): {
    partition: string;
    accountId: string;
    region: string;
    service: string;
    resourceType: string;
    resourceId: string;
} | null;
