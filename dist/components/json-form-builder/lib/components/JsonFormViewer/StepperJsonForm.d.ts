import { default as React } from 'react';
type SchemaObject = {
    name: string;
    jsonSchema: Record<string, any>;
    uiSchema: Record<string, any>;
    properties?: JSON;
};
type StepperJsonFormProps = {
    schemas: SchemaObject[];
    properties?: JSON;
    onSubmit?: (data: any) => void;
    isFullBackButton?: boolean;
    disableAnimation?: boolean;
};
declare const StepperJsonForm: React.FC<StepperJsonFormProps>;
export default StepperJsonForm;
