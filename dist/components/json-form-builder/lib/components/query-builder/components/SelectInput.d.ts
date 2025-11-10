import { default as React } from 'react';
import { Select } from '../../../../../ui/select';
import { VariantProps } from 'class-variance-authority';
interface Option {
    label: string;
    value: string;
}
interface SelectInputProps extends VariantProps<typeof Select> {
    label: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
}
declare const SelectInput: React.FC<SelectInputProps>;
export default SelectInput;
