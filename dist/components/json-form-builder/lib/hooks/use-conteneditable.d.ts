type Params = {
    onChange?: (val: string) => void;
    preventDefault?: boolean;
    innerText?: boolean;
};
declare const useContenteditable: ({ onChange, preventDefault, innerText }: Params) => {
    ref: import('react').RefObject<HTMLDivElement | null>;
    onInput: (e: React.FormEvent<HTMLDivElement>) => void;
    onPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
};
export default useContenteditable;
