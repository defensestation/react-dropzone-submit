import { UISchemaElement } from '@jsonforms/core';
import { CustomJsonSchema } from '../../context/dnd-context';
import { CustomRule, Item } from '../../types/dnd-types';
type QueryBuilder = {
    onChange?: (rules: CustomRule) => void;
    initialValue?: CustomRule;
    jsonSchema: CustomJsonSchema;
    uiSchema: UISchemaElement;
    items: Item[];
    onRemoveCondition?: (rule: CustomRule) => void;
};
export default function QueryBuilder({ initialValue, onChange, jsonSchema, uiSchema, onRemoveCondition, items }: QueryBuilder): import("react/jsx-runtime").JSX.Element;
export {};
