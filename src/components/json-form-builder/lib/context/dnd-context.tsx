import type { Active, Over, UniqueIdentifier } from "@dnd-kit/core";
import { createContext, useContext, useEffect, useState } from "react";
import React from "react";
import type { Item } from "../types/dnd-types";
import type { JsonSchema, Layout, Rule, UISchemaElement } from "@jsonforms/core";
import { v4 as uuidv4 } from "uuid";
import type { JsonSchema7 } from "@jsonforms/core";
import debounce from 'lodash/debounce';

export type FormProperties = {
  logo?: string;
  title?: string;
  description?: string;
  color: string;
  multistep: boolean;
  showLogo: boolean;
}

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

const JSONBuilderContext = createContext<JSONBuilderContextType | undefined>(
  undefined
);

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

export type CustomLayoutType =
  | Layout
  | { label: string; scope?: string; elements?: UISchemaElement[] }
  | { properties: FormProperties };

type CustomUiSchemaMapObject = { [key: string]: CustomLayoutType };

export default function JSONBuilderProvider({
  children,
}: React.PropsWithChildren): React.ReactElement {
  const [uiSchema, setUISchema] = useState<UISchemaElement>({
    type: "VerticalLayout",
  });
  const [jsonSchema, setJsonSchema] = useState<CustomJsonSchema | object>({});
  const [jsonFormData, setJsonFormData] = useState<unknown>({});
  const [active, setActive] = useState<Active | undefined>();
  const [over, setOver] = useState<Over | undefined>();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item>();
  const [clonedItems, setClonedItems] = useState<Item[]>();
  const [sidebarKey, setSidebardKey] = useState<number>(Date.now());
  const [isPreviewMode, setPreviewMode] = useState<boolean>(false);
  const [formProperties, setFormProperties] = useState<FormProperties>()

  const debouncedUpdateUISchema = debounce((items: Item[]) => {
    const uiSchema: Layout = { type: "VerticalLayout", elements: [] };
    const map: CustomUiSchemaMapObject = {};
    console.log("Schema builder", items)
    items.forEach((item) => {
      if (item.isLayoutElement) {
        map[item.id] = {
          type: item.type,
          label: item.title,
          elements: [],
        };
      } else {
        map[item.id] = {
          type: "Control",
          label: item.title,
          options: {
            placeholder: item.placeholder ? item.placeholder : "",
            multi: item.multiline || item.format == "multiline" ? true : false,
            toggle: true,
            detail: "DEFAULT",
            readonly: item.readonly ? true : false,
            format: item.format === "radio" ? "radio" : "",
            helperText: item.helperText,
          },
          rule: item.rule as Rule,
          scope: `#/properties/${item.keyName}`,
        };
      }
    });

    items.forEach((item) => {
      if (!item.parentId) return item;
      const parent: CustomLayoutType = map[item.parentId];
      if (parent) {
        parent?.elements?.push(map[item.id] as unknown as UISchemaElement);
      } else {
        uiSchema.elements.push(map[item.id] as unknown as UISchemaElement);
      }
    });
    setUISchema(formProperties?{...uiSchema, properties: formProperties}:uiSchema);
  }, 300);

  const debouncedUpdateJsonSchema = debounce((items: Item[]) => {
    const schema: CustomJsonSchema = {
      type: "object",
      properties: {},
      required: [] as string[],
    };
    const required: string[] = [];
    const properties: {
      [key: string]: JsonSchema & {
        formatMinimum?: string;
        formatMaximum?: string;
        placeholder?: string;
        labelPlaceholder?: string;
        dsType?: string;
      };
    } = {};
    items.map((item) => {
      if (item.isLayoutElement) return item;
      properties[item.keyName] = {
        type: item.type,
        title: item.title,
        dsType: item.dsType,
      };
      if (item.format) properties[item.keyName]["format"] = item.format;
      if (item.pattern) {
        properties[item.keyName]["pattern"] = item.pattern;
        if (item.patternMessage) properties[item.keyName]["patternProperties"] = {
          message: {
            title: item.patternMessage
          }
        }
      }
      if (item.format === "date") {
        if (item.minDate)
          properties[item.keyName]["formatMinimum"] = item.minDate;
        if (item.maxDate)
          properties[item.keyName]["formatMaximum"] = item.maxDate;
      }
      if (item.minLength !== undefined)
        properties[item.keyName]["minLength"] = item.minLength;
      if (item.maxLength !== undefined)
        properties[item.keyName]["maxLength"] = item.maxLength;
      if (item.minimum !== undefined)
        properties[item.keyName]["minimum"] = item.minimum;
      if (item.maximum !== undefined)
        properties[item.keyName]["maximum"] = item.maximum;
      if (item.description !== undefined)
        properties[item.keyName]["description"] = item.description;
      if (item.labelPlaceholder !== undefined)
        properties[item.keyName]["labelPlaceholder"] = item.labelPlaceholder;
      if (item.placeholder !== undefined)
        properties[item.keyName]["placeholder"] = item.placeholder;
      if (item.required) required.push(item.keyName);
      if (item.format === "enum") {
        properties[item.keyName]["enum"] = item.options?.length
          ? item.options
          : [""];
      } else if (item.format === "radio") {
        properties[item.keyName]["enum"] = item.options?.length
          ? item.options
          : [""];
      }
      return item;
    });
    schema.properties = properties;
    schema.required = required;
    setJsonSchema(schema);
  }, 300);

  useEffect(() => {
    debouncedUpdateJsonSchema(items);
    debouncedUpdateUISchema(items);
    setJsonFormData(undefined);
  }, [items]);

  const addItem = (item: Item) => {
    let count = 0;
    items.map(itm => {
      itm.keyName.includes(item.keyName) ? count++ : null;
    })
    setItems(items => [...items, { ...item, parentId: "mainContainer", id: uuidv4(), keyName: item.keyName + (count ? count : '') }])
  }

  const removeItem = (id: UniqueIdentifier) => {
    setItems((items) =>
      items?.filter((item) => item.id !== id && item.parentId !== id)
    );
    setSelectedItem(undefined);
  };

  const updateItems = (items: Item[]) => {
    if (selectedItem) {
      const currentItem = items.find(item => item.id == selectedItem.id)
      if (currentItem) setSelectedItem(currentItem)
    }
    setItems(items);
  };

  const updateItem = (item: Item) => {
    const newItems = items.map((oldItem) => {
      if (oldItem.id === item.id) {
        if (selectedItem?.id == item.id) return item;
      }
      return oldItem;
    });
    if (selectedItem) {
      setSelectedItem(newItems.find(itm => itm.id == selectedItem.id))
    }
    setItems(newItems);
  };

  const getItems = (parentId: UniqueIdentifier | undefined = undefined) => {
    return items.filter((item) =>
      parentId ? item.parentId === parentId : !item.parentId
    );
  };

  const updatetFormProperties = debounce((properties: FormProperties) => {
    setFormProperties(properties)
    setUISchema(schema => ({ ...schema, properties: properties }))
  }, 300);

  const value = {
    active,
    setActive,
    over,
    setOver,
    items,
    setItems,
    removeItem,
    selectedItem,
    setSelectedItem,
    updateItem,
    updateItems,
    jsonSchema,
    uiSchema,
    jsonFormData,
    setJsonFormData,
    getItems,
    clonedItems,
    setClonedItems,
    sidebarKey,
    setSidebardKey,
    isPreviewMode,
    setPreviewMode,
    addItem,
    updatetFormProperties,
    formProperties,
    setFormProperties
  };
  return (
    <JSONBuilderContext.Provider value={value}>
      {children}
    </JSONBuilderContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useJSONBuilderContext = () =>
  useContext(JSONBuilderContext) as JSONBuilderContextType;