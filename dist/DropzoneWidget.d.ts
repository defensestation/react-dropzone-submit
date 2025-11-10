interface DropzoneWidgetProps {
    accessKey: string;
    isPassword?: boolean;
    showStats?: boolean;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
}
declare const _default: (props: DropzoneWidgetProps) => import("react/jsx-runtime").JSX.Element;
export default _default;
