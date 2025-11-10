import { DateRange } from 'react-day-picker';
interface DatePickerWithRangeProps {
    minDate?: Date;
    maxDate?: Date;
    defaultFrom?: Date;
    defaultTo?: Date;
    name?: string;
    onChange?: (value: DateRange | undefined) => void;
    className?: string;
    disabled?: boolean;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
    hideIcon?: boolean;
}
export default function DatePickerWithRange({ className, minDate, // Default minimum date
maxDate, // Default maximum date (today)
defaultFrom, defaultTo, name, onChange, hideIcon, disabled, size, }: DatePickerWithRangeProps): import("react/jsx-runtime").JSX.Element;
export {};
