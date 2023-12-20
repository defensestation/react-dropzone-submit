import { PostQAsymDecryptFile, SymDecryptFile } from "./encrypt";

export const randomString = (length, chars) => {
  var mask = "";
  if (chars.indexOf("a") > -1) mask += "abcdefghijklmnopqrstuvwxyz";
  if (chars.indexOf("A") > -1) mask += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (chars.indexOf("#") > -1) mask += "0123456789";
  if (chars.indexOf("!") > -1) mask += "~`!@#$%^&*()_+-={}[]:\";'<>?,./|\\";
  var result = "";
  for (var i = length; i > 0; --i)
    result += mask[Math.round(Math.random() * (mask.length - 1))];
  return result;
};

export const buildFileFromString = (string, name = "message.txt") => {
  const file = new File([string], name, { type: "text/plain" });
  return file;
};

export const readAndDecryptFileContentFromURL = async (
  url,
  dec_key,
  title = "file.txt"
) => {
  const res = await fetch(url);

  const fullData = await res.blob();
  const defile = new File([fullData], title);

  const decryptBlob = await PostQAsymDecryptFile(dec_key, defile);
  const content = decryptBlob.text();
  return content;
};

export const readAndDecryptFileBlobFromURL = async (
  url,
  dec_key,
  title = "file.txt"
) => {
  const res = await fetch(url);

  const fullData = await res.blob();
  const defile = new File([fullData], title);

  const decryptBlob = await PostQAsymDecryptFile(dec_key, defile);
  return decryptBlob;
};

export const symDecryptFile = async (
  url,
  encryptionKey,
  title = "message.txt"
) => {
  const res = await fetch(url);

  const fullData = await res.blob();
  const defile = new File([fullData], title);

  const decryptBlob = await SymDecryptFile(encryptionKey, defile);
  return decryptBlob;
};

export function uploadFile(url, file, headers = null) {
    let headerObj = {
      "Content-Type": file?.type,
    };
    if (headers) {
      headerObj = { ...headerObj, ...headers };
    }
    return fetch(url, {
      method:"PUT",
      headers: headerObj,
      body: file,
      }).catch((err) => {
      throw err;
    });
}