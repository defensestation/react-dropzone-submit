import React, { createContext, useContext, useState } from "react";

const SubmitDataContext = createContext({});

const SubmitDataProvider = ({ children }) => {
  const [files, setFiles] = useState({});
  const [user, setUser] = useState(null);
  const [token, setAuthToken] = useState(null);
  const [client, setClient] = useState(null);
  const addFile = (file, key) => {
    setFiles({ ...files, [key]: file });
  };

  const addFilesWithKeys = (newFiles) => {
    setFiles({ ...files, ...newFiles });
  };
  const removeFile = (key) => {
    let newFiles = { ...files };
    delete newFiles[key];
    setFiles(newFiles);
  };

  const context = {
    files,
    setFiles,
    addFile,
    removeFile,
    addFilesWithKeys,
    user, 
    setUser,
    token, 
    setAuthToken,
    client, 
    setClient
  };
  return (
    <SubmitDataContext.Provider value={context}>
      {children}
    </SubmitDataContext.Provider>
  );
};

export const useSubmitData = () => useContext(SubmitDataContext);

export default SubmitDataProvider;
