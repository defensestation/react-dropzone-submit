import { Active } from '@dnd-kit/core';
import { CustomJsonSchema, CustomLayoutType } from '../../context/dnd-context';
import { JsonSchema } from '@jsonforms/core';
interface OverlayComponentType {
    active: Active;
}
interface OnChangeSchemaFunctionParams {
    schema: JsonSchema;
    uischema: CustomLayoutType;
}
interface EditorContextProp extends React.PropsWithChildren {
    initialData?: {
        schema: CustomJsonSchema;
        uischema: CustomLayoutType;
    };
    renderOverlay?: (props: OverlayComponentType) => React.ReactNode;
    onChange?: (data: OnChangeSchemaFunctionParams) => void;
}
declare const EditorContext: (props: EditorContextProp) => import("react/jsx-runtime").JSX.Element;
export default EditorContext;
