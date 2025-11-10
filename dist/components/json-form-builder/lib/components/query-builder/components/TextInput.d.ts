import { default as React } from 'react';
import { Input } from '../../../../../ui/input';
import { VariantProps } from 'class-variance-authority';
interface TextInputProps extends VariantProps<typeof Input> {
    label: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}
declare const TextInput: React.FC<TextInputProps>;
export default TextInput;
