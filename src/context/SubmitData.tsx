import { PropsWithChildren, createContext, useContext, useState } from "react";

// Define the type for the context value
type SubmitDataContextType = {
  files: Record<string, File>;
  setFiles: React.Dispatch<React.SetStateAction<Record<string, File>>>;
  addFile: (file: File, key: string) => void;
  removeFile: (key: string) => void;
  addFilesWithKeys: (files: Record<string, File>) => void;
};

// Create the context with a default value
const SubmitDataContext = createContext<SubmitDataContextType | undefined>(undefined);

// Provider component
const SubmitDataProvider = ({ children }: PropsWithChildren) => {
  const [files, setFiles] = useState<Record<string, File>>({});

  const addFile = (file: File, key: string) => {
    setFiles((prevFiles) => ({ ...prevFiles, [key]: file }));
  };

  const addFilesWithKeys = (newFiles: Record<string, File>) => {
    setFiles((prevFiles) => ({ ...prevFiles, ...newFiles }));
  };

  const removeFile = (key: string) => {
    setFiles((prevFiles) => {
      const newFiles = { ...prevFiles };
      delete newFiles[key];
      return newFiles;
    });
  };

  const contextValue: SubmitDataContextType = {
    files,
    setFiles,
    addFile,
    removeFile,
    addFilesWithKeys,
  };

  return (
    <SubmitDataContext.Provider value={contextValue}>
      {children}
    </SubmitDataContext.Provider>
  );
};

// Custom hook to use the context
export const useSubmitData = () => {
  const context = useContext(SubmitDataContext);
  if (!context) {
    throw new Error("useSubmitData must be used within a SubmitDataProvider");
  }
  return context;
};

export default SubmitDataProvider;