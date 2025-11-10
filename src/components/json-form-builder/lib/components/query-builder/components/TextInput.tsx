// src/components/TextInput.tsx
import React from 'react';
import { clsx } from 'clsx';
import { Input } from '@/components/ui/input';
import { VariantProps } from 'class-variance-authority';

interface TextInputProps extends VariantProps<typeof Input> {
    label: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, type = "text" }) => {
    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <Input
                type={type}
                value={value}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-md p-2"
            />
        </div>
    );
};

export default TextInput;
