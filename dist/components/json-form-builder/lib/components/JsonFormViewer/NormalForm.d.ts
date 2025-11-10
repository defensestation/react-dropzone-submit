import { JsonFormsCore } from '@jsonforms/core';
import { CustomJsonSchema, CustomLayoutType, FormProperties } from '../../context/dnd-context';
type NormalLayoutProps = {
    jsonSchema: CustomJsonSchema | object;
    uiSchema: CustomLayoutType;
    properties?: FormProperties;
    data?: any;
    onSubmit?: (data: any) => void;
    onChange?: (args: Pick<JsonFormsCore, "data" | "errors">) => void;
    className?: string;
    actionButtonText?: string;
    readonly?: boolean;
};
export default function NormalForm({ jsonSchema, uiSchema, data, onSubmit, className, actionButtonText, properties, readonly }: NormalLayoutProps): import("react/jsx-runtime").JSX.Element;
export {};
