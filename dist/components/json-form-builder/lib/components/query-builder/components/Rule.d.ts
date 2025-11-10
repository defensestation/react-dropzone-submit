import { JsonSchema } from '@jsonforms/core';
import { Rule } from '../types';
import { Item } from '../../../types/dnd-types';
interface RuleBuilderProps {
    schema: JsonSchema;
    initialRule?: Rule;
    onSave?: (rule: Rule) => void;
    items: Item[];
    onClose: () => void;
}
export default function RuleBuilder({ schema, initialRule, onSave, onClose, items }: RuleBuilderProps): import("react/jsx-runtime").JSX.Element;
export {};
