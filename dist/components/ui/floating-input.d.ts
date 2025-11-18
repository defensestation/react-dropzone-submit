import * as React from 'react';
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
}
declare const FloatingInput: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
declare const FloatingTextarea: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
declare const FloatingLabel: React.ForwardRefExoticComponent<Omit<Omit<import('@radix-ui/react-label').LabelProps & React.RefAttributes<HTMLLabelElement>, "ref"> & import('class-variance-authority').VariantProps<(props?: import('class-variance-authority/types').ClassProp | undefined) => string> & React.RefAttributes<HTMLLabelElement>, "ref"> & React.RefAttributes<HTMLLabelElement>>;
declare const FloatingLabelInput: React.ForwardRefExoticComponent<InputProps & {
    label?: string;
} & React.RefAttributes<HTMLInputElement>>;
declare const FloatingLabeTextarea: React.ForwardRefExoticComponent<InputProps & {
    label?: string;
} & React.RefAttributes<HTMLInputElement>>;
export { FloatingInput, FloatingLabel, FloatingLabelInput, FloatingTextarea, FloatingLabeTextarea };
