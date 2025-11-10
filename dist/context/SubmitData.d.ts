import { PropsWithChildren } from 'react';
type SubmitDataContextType = {
    files: Record<string, File>;
    setFiles: React.Dispatch<React.SetStateAction<Record<string, File>>>;
    addFile: (file: File, key: string) => void;
    removeFile: (key: string) => void;
    addFilesWithKeys: (files: Record<string, File>) => void;
};
declare const SubmitDataProvider: ({ children }: PropsWithChildren) => import("react/jsx-runtime").JSX.Element;
export declare const useSubmitData: () => SubmitDataContextType;
export default SubmitDataProvider;
