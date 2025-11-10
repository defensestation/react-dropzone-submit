import { Active, Over, UniqueIdentifier } from '@dnd-kit/core';
import { default as React } from 'react';
import { Item } from '../types/dnd-types';
import { JsonSchema, Layout, UISchemaElement, JsonSchema7 } from '@jsonforms/core';
export type FormProperties = {
    logo?: string;
    title?: string;
    description?: string;
    color: string;
    multistep: boolean;
    showLogo: boolean;
};
type JSONBuilderContextType = {
    jsonFormData: unknown;
    setJsonFormData: React.Dispatch<React.SetStateAction<unknown>>;
    jsonSchema: CustomJsonSchema | object;
    uiSchema: UISchemaElement;
    active: Active | undefined;
    over: Over | undefined;
    setActive: React.Dispatch<React.SetStateAction<Active | undefined>>;
    selectedItem: Item | undefined;
    setSelectedItem: React.Dispatch<React.SetStateAction<Item | undefined>>;
    setOver: React.Dispatch<React.SetStateAction<Over | undefined>>;
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
    addItem: (item: Item) => void;
    updateItems: (items: Item[]) => void;
    updateItem: (item: Item) => void;
    removeItem: (id: UniqueIdentifier) => void;
    getItems: (parentId?: UniqueIdentifier | undefined) => Item[];
    clonedItems: Item[] | undefined;
    setClonedItems: React.Dispatch<React.SetStateAction<Item[] | undefined>>;
    sidebarKey: number;
    setSidebardKey: React.Dispatch<React.SetStateAction<number>>;
    isPreviewMode: boolean;
    setPreviewMode: React.Dispatch<React.SetStateAction<boolean>>;
    formProperties: FormProperties;
    updatetFormProperties: (properties: FormProperties) => void;
    setFormProperties: React.Dispatch<React.SetStateAction<FormProperties>>;
};
export interface CustomJsonSchema extends Omit<JsonSchema, "properties"> {
    properties: {
        [key: string]: JsonSchema7 & {
            formatMinimum?: string;
            formatMaximum?: string;
            dsType?: string;
            labelPlaceholder?: string;
        };
    };
}
export type CustomLayoutType = Layout | {
    label: string;
    scope?: string;
    elements?: UISchemaElement[];
} | {
    properties: FormProperties;
};
export default function JSONBuilderProvider({ children, }: React.PropsWithChildren): React.ReactElement;
export declare const useJSONBuilderContext: () => JSONBuilderContextType;
export {};
