import React, { createContext, useContext, useState } from "react";

const ReadResponseContext = createContext({});

const ReadResponseProvider = ({children}) => {
    const [files, setFiles] = useState({});
    const [decKey, setDecKey] = useState(null);
    const addFile = (file, key) => {
        setFiles({...files, [key]: file})
    }
    const removeFile = (key) => {
        let newFiles = {...files}
        delete newFiles[key]
        setFiles(newFiles)
    }

    const context = {
        files,
        setFiles,
        addFile,
        removeFile,
        decKey, 
        setDecKey
    }
    return (
        <ReadResponseContext.Provider value={context}>
            {children}
        </ReadResponseContext.Provider>
    )
}

export const useReadResponse = () => useContext(ReadResponseContext);

export default ReadResponseProvider;