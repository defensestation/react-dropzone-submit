import type { CustomJsonSchema } from "@/components/json-form-builder/lib/context/dnd-context";
import { decryptFile, encryptFile, readStreamInFixedChunks } from "@ds-sdk/crypto";
import { CommonTypes } from "@ds-sdk/sypher";
import { format } from "date-fns";
import { Semaphore } from "@/lib/Semaphore";

// Helpers for base64 <-> ArrayBuffer
export function bufferDecode(value: string) {
  // Replace URL-safe chars if needed
  const binaryString = window.atob(value.replace(/_/g, '/').replace(/-/g, '+'));
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function formatBytes(bytes: number | bigint, decimals = 2): string {
  if ((typeof bytes === 'bigint' && bytes === 0n) || (typeof bytes === 'number' && bytes === 0)) {
    return '0 B';
  }

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  let value: number;
  let i: number;

  if (typeof bytes === 'bigint') {
    i = 0;
    let bigBytes = bytes;
    while (bigBytes >= BigInt(k) && i < sizes.length - 1) {
      bigBytes /= BigInt(k);
      i++;
    }
    value = Number(bigBytes); // Convert to number for formatting
  } else {
    if (bytes < 0) {
      throw new Error('Negative values are not supported.');
    }
    i = Math.floor(Math.log(bytes) / Math.log(k));
    value = bytes / Math.pow(k, i);
  }

  decimals = Math.max(0, decimals);

  // Remove trailing zeros after decimal
  const formattedValue = parseFloat(value.toFixed(decimals)).toString();

  return `${formattedValue} ${sizes[i]}`;
}




export function buildMinimalAddressString(accessHistory: CommonTypes.AccessHistory): string {

  const parts = [
    accessHistory.ipInfo?.location?.city,        // City name
  ];

  // Filter out undefined or empty parts and join them with a comma
  return parts.filter(part => part && part?.trim()).join(", ");
}


// Determine threat level and type
export const getThreatInfo = (security?: CommonTypes.Security) => {
  if (!security) return { level: 'unknown', type: 'Unknown', color: 'text-gray-500', icon: '❓' };

  if (security.isThreat || security.isAttacker || security.isAbuser) {
    return { level: 'high', type: 'High Risk', color: 'text-red-600', icon: '🚨' };
  }

  if (security.isTor || security.isTorExit || security.isAnonymous) {
    return { level: 'medium', type: 'Anonymous', color: 'text-orange-500', icon: '🔒' };
  }

  if (security.isVpn || security.isProxy || security.isRelay) {
    return { level: 'medium', type: 'Proxy/VPN', color: 'text-yellow-600', icon: '🛡️' };
  }

  if (security.isCloudProvider) {
    return { level: 'low', type: 'Cloud Provider', color: 'text-blue-500', icon: '☁️' };
  }

  if (security.isBogon) {
    return { level: 'low', type: 'Private IP', color: 'text-gray-500', icon: '🏠' };
  }

  return { level: 'safe', type: 'Safe', color: 'text-green-600', icon: '✅' };
};

/**
 * A customFetch implementation using the Fetch API with support for upload progress.
 * When the request body is a Blob or ReadableStream, it wraps the underlying stream to
 * track bytes as they're read.
 *
 * Note: When streaming, we must specify `duplex: "half"`.
 */
export const customFetch = async (
  url: string,
  opts: any = {},
  onProgress?: (percentage: number, loaded: number, total: number) => void
) => {
  if (!url) throw new Error("URL is required");

  const defaultOpts = { method: "GET", headers: {}, body: null };
  opts = { ...defaultOpts, ...opts };

  let body = opts.body;

  // Wrap the body to track progress if onProgress is provided.
  if (body && onProgress) {
    // CASE 1: If the body is a Blob and supports streaming
    if (body instanceof Blob && typeof body.stream === "function") {
      const total = body.size;
      let loaded = 0;
      const originalStream = body.stream();
      body = new ReadableStream({
        start(controller) {
          const reader = originalStream.getReader();
          function pump() {
            reader.read().then(({ done, value }) => {
              if (done) {
                controller.close();
                return;
              }
              loaded += value.byteLength;
              const percentage = (loaded / total) * 100;
              onProgress(percentage, loaded, total);
              controller.enqueue(value);
              pump();
            }).catch((err) => controller.error(err));
          }
          pump();
        },
      });
      // Ensure the Content-Length header is set
      if (!opts.headers["Content-Length"]) {
        opts.headers["Content-Length"] = total.toString();
      }
    }
    // CASE 2: If the body is already a ReadableStream
    else if (body instanceof ReadableStream) {
      const total = opts.headers["Content-Length"]
        ? parseInt(opts.headers["Content-Length"])
        : 0;
      let loaded = 0;
      const originalStream = body;
      body = new ReadableStream({
        start(controller) {
          const reader = originalStream.getReader();
          function pump() {
            reader.read().then(({ done, value }) => {
              if (done) {
                controller.close();
                return;
              }
              loaded += value.byteLength;
              const percentage = total ? (loaded / total) * 100 : 0;
              onProgress(percentage, loaded, total);
              controller.enqueue(value);
              pump();
            }).catch((err) => controller.error(err));
          }
          pump();
        },
      });
    }
  }

  opts.body = body;

  // When using a streaming body, we must specify the duplex option.
  if (body instanceof ReadableStream) {
    opts.duplex = "half";
  }

  const response = await fetch(url, opts);
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
  return response;
};

// Helper: Concatenate two Uint8Arrays
function concatUint8Arrays(a: Uint8Array, b: Uint8Array): Uint8Array {
  const result = new Uint8Array(a.length + b.length);
  result.set(a, 0);
  result.set(b, a.length);
  return result;
}

/**
 * Predicts the final encrypted size based on the original file size, encryption options,
 * and fixed chunk size. (This is used for overall progress reporting.)
 */
function predictEncryptedSize(
  fileSize: number,
  options: { useKyber?: boolean } = {},
  chunkSize?: number
): number {
  const defaultChunkSize = 64 * 1024; // 64 KB default chunk size
  const effectiveChunkSize = chunkSize ?? defaultChunkSize;
  let headerSize: number;
  if (options.useKyber) {
    const kyberCtLength = 1568; // adjust if needed
    headerSize = 2 + 4 + kyberCtLength;
  } else {
    headerSize = 2 + 32;
  }
  const numChunks = Math.ceil(fileSize / effectiveChunkSize);
  const perChunkOverhead = 36; // 4 + 4 + 12 + 16 bytes per chunk
  return headerSize + fileSize + numChunks * perChunkOverhead;
}

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
export async function uploadEncryptedFileMultipart(
  file: File,
  encryptionOptions: { passphrase: string; chunkSize?: number; useKyber?: boolean; compress?: boolean },
  initiateUrl: string,
  completeUrl: string,
  onPartProgress?: (partNumber: number, overallPercentage: number) => void
): Promise<any> {
  // STEP 1: Initiate the multipart upload.
  const initiateResp = await fetch(initiateUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, contentType: file.type }),
  });
  if (!initiateResp.ok) {
    throw new Error("Failed to initiate multipart upload.");
  }
  const { uploadId, presignedUrls } = await initiateResp.json();
  // presignedUrls should be an array (the backend may either provide a fixed list or generate one on demand).

  // STEP 2: Get the encrypted data as a stream.
  const encryptedStream: ReadableStream<Uint8Array> = encryptFile(file, {
    ...encryptionOptions,
  });
  const reader = encryptedStream.getReader();

  const MIN_PART_SIZE = 5 * 1024 * 1024; // 5 MB minimum (except the final part)
  let buffer = new Uint8Array(0);
  let partNumber = 1;
  const partsInfo: Array<{ PartNumber: number; ETag: string }> = [];
  let totalBytesUploaded = 0;

  // For overall progress tracking, we use a prediction of the final encrypted size.
  const predictedEncryptedSize = predictEncryptedSize(file.size, { useKyber: encryptionOptions.useKyber || false }, encryptionOptions.chunkSize);

  while (true) {
    const { done, value } = await reader.read();
    if (value) {
      buffer = concatUint8Arrays(buffer, value);
    }

    // If we have enough data for a part, or if we are done and have a leftover:
    if ((buffer.length >= MIN_PART_SIZE) || (done && buffer.length > 0)) {
      const partBlob = new Blob([buffer]);
      const partUrl = presignedUrls[partNumber - 1];
      if (!partUrl) {
        throw new Error(`No presigned URL available for part ${partNumber}`);
      }

      // Upload the part using fetch.
      const partResp = await fetch(partUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": partBlob.size.toString(),
        },
        body: partBlob,
      });
      if (!partResp.ok) {
        throw new Error(`Failed to upload part ${partNumber}: ${partResp.statusText}`);
      }
      const etag = partResp.headers.get("ETag");
      if (!etag) {
        throw new Error(`Missing ETag for part ${partNumber}`);
      }
      partsInfo.push({ PartNumber: partNumber, ETag: etag });
      partNumber++;
      totalBytesUploaded += partBlob.size;

      // Optionally update overall progress.
      if (onPartProgress) {
        const percentage = (totalBytesUploaded / predictedEncryptedSize) * 100;
        onPartProgress(partNumber - 1, percentage);
      }

      // Reset the buffer.
      buffer = new Uint8Array(0);
    }

    if (done) {
      break;
    }
  }

  // STEP 3: Complete the multipart upload.
  const completeResp = await fetch(completeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadId, parts: partsInfo, fileName: file.name }),
  });
  if (!completeResp.ok) {
    throw new Error("Failed to complete multipart upload.");
  }
  return await completeResp.json();
}


export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>): void {
    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) {
        func(...args);
      }
    }, wait);

    if (callNow) {
      func(...args);
    }
  };
}

export function createSaltFromString(inputString: string) {
  // Encode the string into bytes (UTF-8)
  const encoder = new TextEncoder();
  const stringBytes = encoder.encode(inputString);

  // Create a Uint8Array of 32 bytes, initialized to zero
  const salt = new Uint8Array(32);

  // Copy the string's bytes into the salt array (truncate or pad with zeros)
  salt.set(stringBytes.slice(0, 32));

  return salt.buffer; // Return the ArrayBuffer
}

export const extractFilesFromSchema = (schema: CustomJsonSchema): { [key: string]: CommonTypes.TemplateFile } => {
  let signerFiles: { [key: string]: CommonTypes.TemplateFile } = {
  }
  Object.keys(schema.properties).map(key => {
    const property = schema.properties[key]
    if (property.format == 'data-url') {
      signerFiles[key] = {
        allowedExt: ['png', 'jpg'],
        maxSize: BigInt(5000),
      } as CommonTypes.TemplateFile;
    }
  })
  return signerFiles;
}

export const formatDateToUTC = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")

export function downloadJsonAsCsv(jsonData: any, filename: string): void {
  if (!Array.isArray(jsonData)) {
    if (typeof jsonData === "object" && jsonData !== null) {
      jsonData = [jsonData];
    } else {
      console.error("Provided data is neither an array nor an object.");
      return;
    }
  }

  if (jsonData.length === 0) {
    console.error("No data provided for CSV download.");
    return;
  }

  const flattenObject = (obj: any, parentKey = ""): Record<string, any> => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        Object.assign(acc, flattenObject(value, newKey));
      } else {
        acc[newKey] = value;
      }
      return acc;
    }, {} as Record<string, any>);
  };

  const flattenedData = jsonData.map((item: any) => flattenObject(item));
  const headers = Array.from(
    new Set(flattenedData.flatMap((item: {}) => Object.keys(item)))
  );

  const csvContent = [
    headers.join(","), // Header row
    ...flattenedData.map((row: { [x: string]: any; }) =>
      headers.map(header => JSON.stringify(row[header] || "")).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


export const delay = (duration: number) => {
  return new Promise((resolve) => setTimeout(resolve, duration))
}

/**
 * Function to calculate and format the time difference
 * @param utcTimestamp - The expiration time in UTC format (e.g., "2023-10-25T12:00:00Z")
 * @returns A string like "Expiring in 2 days" or "Expired"
 */
export const getExpirationMessage = (utcTimestamp: string): string => {
  // Parse the UTC timestamp
  const expirationDate = new Date(utcTimestamp);
  const currentDate = new Date();

  // Calculate the difference in milliseconds
  const timeDifference = expirationDate.getTime() - currentDate.getTime();

  // If the expiration date is in the past, return "Expired"
  if (timeDifference < 0) {
    return "Expired";
  }

  // Convert the difference to days
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  // Return the formatted message
  if (daysDifference === 0) {
    return "Expiring today";
  } else if (daysDifference === 1) {
    return "Expiring in 1 day";
  } else {
    return `Expiring in ${daysDifference} days`;
  }
};

/**
 * Function to calculate and format the time difference
 * @param utcTimestamp - The expiration time in UTC format (e.g., "2023-10-25T12:00:00Z")
 * @returns A string like "Expiring in 2 days" or "Expired"
 */
export const getExpirationMessageColor = (utcTimestamp: string): string => {
  // Parse the UTC timestamp
  const expirationDate = new Date(utcTimestamp);
  const currentDate = new Date();

  // Calculate the difference in milliseconds
  const timeDifference = expirationDate.getTime() - currentDate.getTime();

  // If the expiration date is in the past, return "Expired"
  if (timeDifference < 0) {
    return "Expired";
  }

  // Convert the difference to days
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  // Return the formatted message
  if (daysDifference === 0) {
    return "text-destructive";
  } else if (daysDifference === 1) {
    return "text-yellow-500";
  } else {
    return `text-primary`;
  }
};


export const getOpenLimitStatusColor = (accessLimit: number) => {
  return accessLimit > 10 ? "text-primary" : accessLimit > 3 ? "text-yellow-500" : "text-destructive"
}

/**
 * Converts a data URL to a File object.
 * @param dataUrl - The data URL to convert.
 * @param fileName - The name of the resulting file.
 * @returns A File object.
 */
export function dataUrlToFile(dataUrl: string, fileName: string): File {
  // Split the data URL into the content type and base64 data
  const [header, base64Data] = dataUrl.split(",");
  const mimeType = header.match(/:(.*?);/)?.[1] || "";

  // Decode the base64 string
  const binary = atob(base64Data);
  const arrayBuffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    arrayBuffer[i] = binary.charCodeAt(i);
  }

  // Create a File object
  return new File([arrayBuffer], fileName, { type: mimeType });
}


export const readAndDecryptFileBlobFromURL = async (
  url: string,
  dec_key: string,
  trackProgress?: (progress: number) => void,
  title: string = "file.txt",
  signal?: AbortSignal
) => {
  const response = await fetch(url, { cache: "no-cache", signal: signal });
  const contentLength: number = +response.headers.get("Content-Length")!;
  let loadedSize = 0;
  let receivedLength: number = 0; // received that many bytes at the moment
  let chunks = []; // array of received binary chunks (comprises the body)
  const reader = response?.body?.getReader();
  while (true) {
    // done is true for the last chunk
    // value is Uint8Array of the chunk bytes
    if (reader) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
      receivedLength += value.length;
      trackProgress?.((receivedLength / contentLength) * 100);
    }



  }

  // Step 4: concatenate chunks into single Uint8Array
  let chunksAll = new Uint8Array(receivedLength); // (4.1)
  let position = 0;
  for (let chunk of chunks) {
    chunksAll.set(chunk, position); // (4.2)
    position += chunk.length;
  }
  // Step 5: decode into a string
  // let result = new TextDecoder("utf-8").decode(chunksAll);

  const fullData = new Blob([chunksAll]);
  const defile = new File([fullData], title);

  const decryptBlob = await decryptFile(defile.stream(), {
    kyberPrivKey: dec_key
  });
  return decryptBlob;
};

export const getDynamicChunkSize = (fileSize: number) => {
  if (fileSize > 1 * 1024 * 1024 * 1024) { // Very large files (> 1GB)
    return 20 * 1024 * 1024; // 256MB
  } else if (fileSize > 100 * 1024 * 1024) { // Large files (100MB - 1GB)
    return 64 * 1024 * 1024; // 64MB
  } else if (fileSize > 10 * 1024 * 1024) { // Medium files (10MB - 100MB)
    return 16 * 1024 * 1024; // 16MB
  } else { // Small files (< 10MB)
    return fileSize; // Use the entire file as one chunk
  }
};


export async function uploadPart(
  partData: Uint8Array,
  presignUrl: string,
  headers: Record<string, string>,
  onPartProgress?: (progress: number) => void
): Promise<string> {
  const response = await fetch(presignUrl, {
    method: "PUT",
    headers: headers,
    body: partData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  const etag = response.headers.get("ETag");
  if (!etag) {
    throw new Error("ETag not found in response headers");
  }

  onPartProgress && onPartProgress(100);
  return etag;
}

export async function uploadStream(
  encryptedStream: ReadableStream<Uint8Array>,
  presignUrls: { [partNumber: string]: string },
  headers: Record<string, string>,
  onProgress: (progress: number) => void,
  totalSize: number,
  maxRetries: number = 0,
  minPartSize: number = 5 * 1024 * 1024,
  semaphore: Semaphore,
  batchSize: number = 5 // Number of concurrent uploads per batch
): Promise<Array<{ eTag: string; partNumber: string }>> {
  if (totalSize <= 0) {
    throw new Error("totalSize must be greater than 0");
  }

  let partIndex = 1;
  let uploadedBytes = 0;
  const etags: Array<{ eTag: string; partNumber: string }> = [];

  const updateOverallProgress = (uploaded: number) => {
    const overallProgress = (uploaded / totalSize) * 100;
    onProgress(overallProgress);
  };

  const uploadChunk = (partIndex: number, chunk: Uint8Array) => {
    return async () => {
      await semaphore.acquire();
      try {
        const etag = await uploadPartWithRetries(
          chunk,
          partIndex,
          presignUrls,
          headers,
          maxRetries,
          (partProgress: number) => {
            const chunkUploaded = (partProgress / 100) * chunk.byteLength;
            updateOverallProgress(uploadedBytes + chunkUploaded);
          }
        );
        uploadedBytes += chunk.byteLength;
        etags.push({ eTag: etag, partNumber: partIndex.toString() });
      } finally {
        semaphore.release();
      }
    };
  };

  const processBatch = async (tasks: Promise<void>[]) => {
    await Promise.all(tasks);
  };

  let currentBatch: (() => Promise<void>)[] = []; // Array of task functions

  for await (const chunk of readStreamInFixedChunks(encryptedStream, minPartSize)) {
    const task = await uploadChunk(partIndex++, chunk);
    currentBatch.push(task); // Push the task function, not invoked yet

    // If the current batch reaches the batch size, process it
    if (currentBatch.length >= batchSize) {
      await processBatch(currentBatch.map((task) => task())); // Invoke the tasks when processing
      currentBatch = []; // Reset the batch
    }
    console.log("reading chunk ", partIndex, chunk.byteLength)
  }

  // Process any remaining tasks in the last batch
  if (currentBatch.length > 0) {
    await processBatch(currentBatch.map((task) => task())); // Invoke the tasks
  }

  // Ensure progress reaches 100% at the end
  onProgress(100);

  return etags.sort((a, b) => Number(a.partNumber) - Number(b.partNumber));
}




async function uploadPartWithRetries(
  partData: Uint8Array,
  partIndex: number,
  presignUrls: { [partNumber: string]: string },
  headers: Record<string, string>,
  maxRetries: number,
  onPartProgress?: (progress: number) => void
): Promise<string> { // Return the ETag as a string
  const presignUrl = presignUrls[partIndex.toString()];
  if (!presignUrl) {
    throw new Error(`No presigned URL for part ${partIndex}`);
  }

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const etag = await uploadPart(
        partData,
        presignUrl,
        { ...headers, partNumber: partIndex.toString() },
        onPartProgress
      );
      return etag; // Return the ETag on success.
    } catch (error) {
      attempt++;
      if (attempt > maxRetries) {
        console.error(`Failed to upload part ${partIndex} after ${maxRetries} attempts:`, error);
        throw error; // Propagate error if all retries fail.
      }
      console.warn(`Retrying part ${partIndex} (attempt ${attempt})...`);
    }
  }

  throw new Error("Unexpected error in uploadPartWithRetries");
}

export function extractEmail(input: string) {
  const match = input.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

export const generateCSV = (data: any) => {
  if (data.length === 0) {
    console.error('Data array is empty.');
    return;
  }

  try {
    // Wrap fields containing commas in double quotes
    const csvData = data.map(row =>
      row.map(field =>
        typeof field === 'string' && field.includes(',') ? `"${field}"` : field
      ).join(',')
    );

    // Create a Blob containing the CSV data
    const blob = new Blob([csvData.join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    return blob;
  } catch (error) {
    console.error('Error generating CSV:', error);
  }
};


export const stopEnterPropagation = (e: React.KeyboardEvent<HTMLElement>) => {
  if (e.key === "Enter") {
    e.preventDefault();
    e.stopPropagation();
  }
}


export function parseDRI(dri) {
  if (typeof dri !== 'string') return null;

  const parts = dri.split(':');
  if (parts.length !== 8 || parts[0] !== 'dri') {
    throw new Error('Invalid DRI format');
  }

  const [
    _prefix,     // dri
    partition,
    accountId,
    region,
    _empty,      // between the double colons
    service,
    resourceType,
    resourceId
  ] = parts;

  return {
    partition,
    accountId,
    region,
    service,
    resourceType,
    resourceId
  };
}
