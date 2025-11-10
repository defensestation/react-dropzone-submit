import { default as React } from 'react';
type SizeVariant = 'xs' | 'sm' | 'md' | 'lg';
interface PercentageSpinnerProps {
    percentage?: number;
    size?: SizeVariant;
}
declare const PercentageSpinner: React.FC<PercentageSpinnerProps>;
export default PercentageSpinner;
