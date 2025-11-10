export type OptionType = {
    label: string;
    value: string;
};
interface MultiSelectProps {
    options?: OptionType[];
    loadOptions?: (search: string) => Promise<OptionType[]>;
    value: OptionType[];
    onChange: (value: OptionType[]) => void;
    placeholder?: string;
    className?: string;
    isLoading?: boolean;
}
export declare function MultiSelect({ options: propOptions, loadOptions, value, onChange, placeholder, className, isLoading, }: MultiSelectProps): import("react/jsx-runtime").JSX.Element;
export {};
