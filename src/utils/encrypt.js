import { Decrypt1024, Encrypt1024, KeyGen1024 } from "./kyber1024";

// unit arry ecoder decoder
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Use a lookup table to find the index.
const lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
}

export const encode = (arraybuffer) => {
    let bytes = new Uint8Array(arraybuffer),
        i,
        len = bytes.length,
        base64 = '';

    for (i = 0; i < len; i += 3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += chars[bytes[i + 2] & 63];
    }

    if (len % 3 === 2) {
        base64 = base64.substring(0, base64.length - 1) + '=';
    } else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + '==';
    }

    return base64;
};

export const decode = (base64) => {
    let bufferLength = base64.length * 0.75,
        len = base64.length,
        i,
        p = 0,
        encoded1,
        encoded2,
        encoded3,
        encoded4;

    if (base64[base64.length - 1] === '=') {
        bufferLength--;
        if (base64[base64.length - 2] === '=') {
            bufferLength--;
        }
    }

    const arraybuffer = new ArrayBuffer(bufferLength),
        bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i += 4) {
        encoded1 = lookup[base64.charCodeAt(i)];
        encoded2 = lookup[base64.charCodeAt(i + 1)];
        encoded3 = lookup[base64.charCodeAt(i + 2)];
        encoded4 = lookup[base64.charCodeAt(i + 3)];

        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
};

// read file function
const readfile = (file) => {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      resolve(fr.result);
    };
    fr.readAsArrayBuffer(file);
  });
};

export const GenSymKey  = async () => {
  let genKey = await window.crypto.subtle.generateKey(
    {
        name: "AES-GCM",
        length: 256, //can be  128, 192, or 256
    },
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ["encrypt", "decrypt"] //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
  )
  return genKey
}

// gen symkeys
export const ExportSymmetricKey = async () => {
let genKey = await GenSymKey();
let key = await window.crypto.subtle.exportKey(
    "raw", //can be "jwk" or "raw"
    genKey //extractable must be true
)
return {"key": key}
}

export const ImportSymmetricKey = async (key) => {
// const decodeKey = decode(key)
let importKey = await window.crypto.subtle.importKey(
          "raw", //can be "jwk" or "raw"
          key,
          {   //this is the algorithm options
              name: "AES-GCM",
          },
          false, //whether the key is extractable (i.e. can be used in exportKey)
          ["encrypt", "decrypt"] //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
      )
return importKey
}

// encrypt files
export const SymEncryptFile = async (key, file) => {
  try {
    // read file
    const plaintextbytes = await readfile(file);
    // convert it to uint8array 
    const plaintextbyteArray = new Uint8Array(plaintextbytes);

    // encrypt file
    const encrypted_data =  await SymmetricEncryption(key, plaintextbyteArray)

    // create file blob and return
    const blob = new Blob([encrypted_data]);
    return blob;

  } catch (err) {
    console.log('unable to read file');
    throw err;
  }
}

// decrypt files
export const SymDecryptFile = async (key, file) => {
   try {
    // read file
    const cipherbytes = await readfile(file);
    // convert it to uint8array 
    const plaintextbyteArray = new Uint8Array(cipherbytes);

    // encrypt file
    const decyptedData =  await SymmetricDecryption(key, plaintextbyteArray)

    // create file blob and return
    const blob = new Blob([decyptedData]);

    return blob;

  } catch (err) {
    console.log('unable to read file');
    throw err;
  }
}



export const SymEncrptMessage = async (key, message) => {
  var enc = new TextEncoder(); // always utf-8
  const plaintextbyteArray = enc.encode(message)

  // encrypt file
  const encrypted_data =  await SymmetricEncryption(key, plaintextbyteArray)
  // encode data first
  return encode(encrypted_data);
}

export const SymDecryptMessage = async (key, string) => {
  // convert it to uint8array 
  // const string = window.atob(base64data)
  const plaintextbyteArray = decode(string);
  // const cipherbytesArray = new Uint8Array(plaintextbyteArray);
    // encrypt file
  const decyptedArryData =  await SymmetricDecryption(key, plaintextbyteArray)
  
  var dec = new TextDecoder(); // always utf-8
  const plaintxt = dec.decode(decyptedArryData)

  return plaintxt
}


export const SymmetricEncryption = async (key, plaintextbyteArray) => {
  try {

    // set key iterations
    const pbkdf2iterations = 10000;

    // convert key to bytest
    const passphrasebytes = new TextEncoder('utf-8').encode(key);

    // generate salt
    const pbkdf2salt = window.crypto.getRandomValues(new Uint8Array(8));

    // Returns a Promise that fulfills with a CryptoKey corresponding to the format, the algorithm, raw key data, usages, and extractability given as parameters.
    const passphrasekey = await window.crypto.subtle.importKey(
      'raw',
      passphrasebytes,
      { name: 'PBKDF2' },
      false,
      ['deriveBits'],
    );

    // Returns a Promise that fulfills with a newly generated buffer of pseudo-random bits derived from the master key and specific algorithm given as parameters.
    const pbkdf2bytes = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: pbkdf2salt,
        iterations: pbkdf2iterations,
        hash: 'SHA-256',
      },
      passphrasekey,
      384,
    );

    // convert to bytes array
    const pbkdf2bytesArray = new Uint8Array(pbkdf2bytes);

    // get ivbytest
    const keybytes = pbkdf2bytesArray.slice(0, 32);
    const ivbytes = pbkdf2bytesArray.slice(32);

    // import key
    const aeskey = await window.crypto.subtle.importKey(
      'raw',
      keybytes,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt'],
    );

    // encrypt data
    const cipherbytes = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: ivbytes },
      aeskey,
      plaintextbyteArray,
    );

    if (!cipherbytes) {
      // TODO: return error for crypt probs
      console.log("encryption error #1")
    }

    // convert to unitarry
    const cipherbytesArray = new Uint8Array(cipherbytes);

    // add data 
    const resultbytes = new Uint8Array(cipherbytesArray.length + 16);
    resultbytes.set(new TextEncoder('utf-8').encode('Salted__'));
    resultbytes.set(pbkdf2salt, 8);
    resultbytes.set(cipherbytesArray, 16);

    return resultbytes;

  } catch (err) {
    console.log('encrypt error');
    throw err;
  }
};

// decrypt data

export const SymmetricDecryption = async (key, plaintextbyteArray) => {
  try {

    // set key iterations
    const pbkdf2iterations = 10000;

    // convert key to bytest
    const passphrasebytes = new TextEncoder('utf-8').encode(key);

    // salt bytes array
    const pbkdf2salt = plaintextbyteArray.slice(8, 16);

    // Returns a Promise that fulfills with a CryptoKey corresponding to the format, the algorithm, raw key data, usages, and extractability given as parameters.
    const passphrasekey = await window.crypto.subtle.importKey(
      'raw',
      passphrasebytes,
      { name: 'PBKDF2' },
      false,
      ['deriveBits'],
    );

    // Returns a Promise that fulfills with a newly generated buffer of pseudo-random bits derived from the master key and specific algorithm given as parameters.
    const pbkdf2bytes = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: pbkdf2salt,
        iterations: pbkdf2iterations,
        hash: 'SHA-256',
      },
      passphrasekey,
      384,
    );


    const pbkdf2bytesArrays = new Uint8Array(pbkdf2bytes);

    const keybytes = pbkdf2bytesArrays.slice(0, 32);
    const ivbytes = pbkdf2bytesArrays.slice(32);

    // get cipher bytes data
    const cipherbyteData = plaintextbyteArray.slice(16);

    const aeskey = await window.crypto.subtle.importKey(
      'raw',
      keybytes,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    );

    // decrypt
    const plaintextbytes = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivbytes },
      aeskey,
      cipherbyteData,
    );

    const plaintextArray = new Uint8Array(plaintextbytes);

    return plaintextArray
  } catch (err) {
    console.log('decryption error');
    console.log(err);
    throw err;
  }
};

// Asymmentric 

export const ExportAsymmetricKeys = async () => {
  
  const keyPair = await window.crypto.subtle.generateKey(
    {
    name: "RSA-OAEP",
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  )

  const publicKey = await window.crypto.subtle.exportKey(
    "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
    keyPair.publicKey //can be a publicKey or privateKey, as long as extractable was true
  )

  const privateKey = await window.crypto.subtle.exportKey(
    "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
    keyPair.privateKey //can be a publicKey or privateKey, as long as extractable was true
  )

  // return keyPair.publicKey keyPair.privateKey

  return {"privateKey": window.btoa(JSON.stringify(privateKey)),"publicKey": window.btoa(JSON.stringify(publicKey))}
}

export const ImportAsymmetricKeys = async (key, type) => {
  const decodeKey = JSON.parse(window.atob(key))
  const importKey = await window.crypto.subtle.importKey(
                      "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
                      decodeKey,
                      {   //these are the algorithm options
                          name: "RSA-OAEP",
                          hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
                      },
                      false, //whether the key is extractable (i.e. can be used in exportKey)
                      [type] //"verify" for public key import, "sign" for private key imports
                  )

 
  // return keyPair.publicKey keyPair.privateKey
  return importKey
}


export const AsymEncryptMessage = async (pubkey, data) => {
  try {
    // create new symetric key
    let symKey = await ExportSymmetricKey()
    // let symKey = await GenSymKey();
    let symKeyString = symKey.key;
    //encode the sym key
    let enc = new TextEncoder();
    const encodedKey = enc.encode(symKeyString);

    let encSymKey = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      pubkey,
      encodedKey
    );

    // encypt message
    let encData = await SymEncrptMessage(symKeyString, data);
    let ciphertext = encode(encSymKey) + '.' + encData;
    return ciphertext;

  } catch (err) {
    console.log('as encrypt error');
    throw err;
  }
};


export const AsymDecryptMessage = async (privKey, ciphertext) => {
  try {
    const split = ciphertext.split('.');
    let encSymKey = decode(split[0])
    let encData   =  split[1]

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP"
      },
      privKey,
      encSymKey
    );

    let dec = new TextDecoder();
    let decSymKey = dec.decode(decrypted);

    let clearText = await SymDecryptMessage(decSymKey, encData);
    return clearText;

  } catch (err) {
    console.log('as decrypt error');
    throw err;
  }
};


export const AsymEncryptFile = async (pubkey, file) => {
      // create new symetric key
      let symKey = await ExportSymmetricKey();
      let symKeyString = symKey.key;
      //encode the sym key
      let enc = new TextEncoder();
      const encodedKey = enc.encode(symKeyString);
  
      let encSymKey = await window.crypto.subtle.encrypt(
        {
          name: "RSA-OAEP"
        },
        pubkey,
        encodedKey
      );
      // read file
      // read file
      const plaintextbytes = await readfile(file);
      // convert it to uint8array 
      const plaintextbyteArray = new Uint8Array(plaintextbytes);
  
       // encrypt file
      const encrypted_data =  await SymmetricEncryption(symKeyString, plaintextbyteArray)
      const cipherbytesArray = new Uint8Array(encSymKey);
      // append sym key into file 512 key size plus 8 bytes for encrypt_
      const resultbytes = new Uint8Array(encrypted_data.length + 520);
      resultbytes.set(new TextEncoder('utf-8').encode('encrypt_'));
      resultbytes.set(cipherbytesArray, 8);
      resultbytes.set(encrypted_data, 520);
      // create file blob and return
      const blob = new Blob([resultbytes]);
      return blob;
  }

export const AsymDecryptionFile = async (privKey, file) => {
  try {

     // read file
    const cipherbytes = await readfile(file);
    // convert it to uint8array 
    const plaintextbyteArray = new Uint8Array(cipherbytes);

    // key bytes array
    const encSymKey = plaintextbyteArray.slice(8, 520);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP"
      },
      privKey,
      encSymKey
    );
    let dec = new TextDecoder();
    let decSymKey = dec.decode(decrypted);

    // data 
     // key bytes array
    const fileData = plaintextbyteArray.slice(520);

     // encrypt file
    const encrypted_data =  await SymmetricDecryption(decSymKey, fileData)
    // create file blob and return
    const blob = new Blob([encrypted_data]);
    return blob;
  }
  catch(e){
    console.log("Decrypt file error", e);
    throw e;
}
}


export const ExportPostQAsymmetricKeys = async () => {

  let pk_sk = KeyGen1024();
  let publicKey = pk_sk[0];
  let privateKey  = pk_sk[1];
 
  return {"privateKey": window.btoa(JSON.stringify(privateKey)),"publicKey": window.btoa(JSON.stringify(publicKey))}
 }
 
 
 export const ImportPostQAsymmetricKeys = async (key) => {
   const decodeKey = JSON.parse(window.atob(key))
   return decodeKey
 }
 
 export const PostQAsymEncryptMessage = async (impubkey, data) => {
   try {
     // import the key first
     const pubkey = await ImportPostQAsymmetricKeys(impubkey)
     // To generate a random 256 bit symmetric key (ss) and its encapsulation (c)
     let c_ss = Encrypt1024(pubkey);
     let encap = c_ss[0];
     let rawSymKey = c_ss[1];
 
     // import raw sym key to AES
     let symKey = await ImportSymmetricKey(rawSymKey);
 
     let encData = await SymEncrptMessage(symKey, data);
 
     // add encp to message
     let ciphertext = encode(encap) + '.' + encData;
     return ciphertext;
   } catch (err) {
     console.log('error: PostQAsymEncryptMessage');
     throw err;
   }
 }
 
 export const PostQAsymDecryptMessage = async (imprivKey, ciphertext) => { 
   try {
     // import the key first
     const privKey = await ImportPostQAsymmetricKeys(imprivKey)
     // seprate encap and message
     const split     = ciphertext.split('.');
     let encapSymKey = decode(split[0])
     let encData     =  split[1]
 
     // get symkey
     let rawSymKey = Decrypt1024(encapSymKey,privKey);
 
     // import raw sym key to AES
     let symKey = await ImportSymmetricKey(rawSymKey);
 
     let clearText = await SymDecryptMessage(symKey, encData);
 
     // return clear text
     return clearText;
   } catch (err) {
     console.log('error: PostQAsymDecryptMessage');
     throw err;
   }
 }
 
 const FIXED_EXTRA_BYTE_SIZE = 5613;
 
 export const PostQAsymEncryptFile = async (impubkey, file) => {
   try {
     // import the key first
     const pubkey = await ImportPostQAsymmetricKeys(impubkey)
     // To generate a random 256 bit symmetric key (ss) and its encapsulation (c)
     let c_ss = Encrypt1024(pubkey);
     let encap = c_ss[0];
     let rawSymKey = c_ss[1];
 
     // import raw sym key to AES
     let symKey = await ImportSymmetricKey(rawSymKey);
 
 
      // read file
     // read file
     const plaintextbytes = await readfile(file);
     // convert it to uint8array 
     const plaintextbyteArray = new Uint8Array(plaintextbytes);
 
      // encrypt file
     const encryptedData =  await SymmetricEncryption(symKey, plaintextbyteArray)
 
       // append sym key into file 512 key size plus 8 bytes for encrypt_
     const resultbytes = new Uint8Array(encryptedData.length + FIXED_EXTRA_BYTE_SIZE);
     resultbytes.set(new TextEncoder('utf-8').encode('encrypt_'));
     resultbytes.set(new TextEncoder('utf-8').encode(encap), 8);
     resultbytes.set(encryptedData, + FIXED_EXTRA_BYTE_SIZE);
     // create file blob and return
     const blob = new Blob([resultbytes]);
     return blob;
 
   } catch (err) {
     console.log('error: PostQAsymEncryptFile');
     throw err;
   }
 }
 
 export const PostQAsymDecryptFile = async (imprivKey, file) => {
   try {
     // import the key first
     const privKey = await ImportPostQAsymmetricKeys(imprivKey)
     // get encapsulation (c) from file
      // read file
     const cipherbytes = await readfile(file);
     // convert it to uint8array 
     const plaintextbyteArray = new Uint8Array(cipherbytes);
 
     // key bytes array
     const encencap = plaintextbyteArray.slice(8, FIXED_EXTRA_BYTE_SIZE);
 
     let dec = new TextDecoder();
     let encap = dec.decode(encencap);
 
     // To decapsulate and obtain the same symmetric key
     let rawSymKey = Decrypt1024(encap,privKey);
     // import raw sym key to AES
     let symKey = await ImportSymmetricKey(rawSymKey);
 
  // data 
      // key bytes array
     const fileData = plaintextbyteArray.slice(FIXED_EXTRA_BYTE_SIZE);
 
      // encrypt file
     const ciphertext =  await SymmetricDecryption(symKey, fileData)
     // create file blob and return
     const blob = new Blob([ciphertext]);
     return blob;
 
   } catch (err) {
     console.log('error: PostQAsymDecryptFile');
     throw err;
   }
 }