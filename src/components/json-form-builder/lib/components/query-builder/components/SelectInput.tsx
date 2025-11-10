// src/components/SelectInput.tsx
import React from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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

const SelectInput: React.FC<SelectInputProps> = ({ label, options, value, onChange }) => {
    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={label || "Select a fruit"} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="apple">Apple</SelectItem>
                    {options.map((option) => (<SelectItem value="banana">Banana</SelectItem>))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default SelectInput;
