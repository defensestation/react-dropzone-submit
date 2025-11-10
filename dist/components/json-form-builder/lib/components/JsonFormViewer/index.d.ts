import { JsonFormsCore, JsonSchema, UISchemaElement } from '@jsonforms/core';
type JsonFormViewerProps = {
    uiSchema: UISchemaElement;
    jsonSchema: JsonSchema;
    onSubmit?: (args: Pick<JsonFormsCore, "data" | "errors">) => void;
    data?: unknown;
    readonly?: boolean;
};
export default function JsonFormViewer({ jsonSchema, data, uiSchema, onSubmit, readonly }: JsonFormViewerProps): import("react/jsx-runtime").JSX.Element;
export { default as StepperJsonForm } from './StepperJsonForm';
