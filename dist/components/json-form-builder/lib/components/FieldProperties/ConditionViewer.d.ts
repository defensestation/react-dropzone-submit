import { default as React } from 'react';
import { CustomRule } from '../../types/dnd-types';
interface ConfigDisplayProps {
    rule?: CustomRule;
    onRemoveCondition?: () => void;
    onEditCondition?: () => void;
}
declare const ConfigDisplay: React.FC<ConfigDisplayProps>;
export default ConfigDisplay;
