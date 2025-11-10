import { CustomRule, Item, LayoutType } from "../types/dnd-types";
import {
  ArrowBigDown, Binary, Calendar, Check, Circle, Columns, File, FormInput,
  Group, Link, LocateIcon, Mail, Phone, Rows, SquareMinus, Text,
  TextCursorInput,
  TextIcon
} from "lucide-react";


// Field Keys Type
export type FIELD_KEYS =
  | "email"
  | "uri"
  | "phone"
  | "input"
  | "number"
  | "integer"
  | "date"
  | "textarea"
  | "checkbox"
  | "dropdown"
  | "radio"
  | "ip"
  | "horizontal-layout"
  | "vertical-layout"
  | "group"
  | "secret"
  | "longtext"
  | "file"
  | "sin"
  | "label";

// Icon Mapping
export const PaletteIconMap: Record<FIELD_KEYS, typeof ArrowBigDown> = {
  email: Mail,
  uri: Link,
  phone: Phone,
  input: TextCursorInput,
  number: Binary,
  integer: Binary,
  date: Calendar,
  textarea: Text,
  checkbox: Check,
  dropdown: ArrowBigDown,
  radio: Circle,
  ip: LocateIcon,
  sin: SquareMinus,
  file: File,
  "horizontal-layout": Columns,
  "vertical-layout": Rows,
  group: Group,
  longtext: FormInput,
  secret: FormInput,
  label: TextIcon,
};

// Utility Definitions
const defaultRule: CustomRule = {
  effect: "HIDE",
  condition: undefined,
};

const defaultConditions = {
  required: true,
  beginsWith: true,
  contains: true,
  doesNotContain: true,
  endsWith: true,
  enum: true,
  isEqual: true,
  isNotEqual: true,
};

const validations = {
  helperText: true,
  keyName: true,
  max: true,
  min: true,
  readonly: true,
  regex: true,
  required: true,
};

const extendedValidations = {
  ...validations,
  secret: true,
};



// Field Map
export const FIELD_MAP: Record<FIELD_KEYS, Omit<Item, "id">> = {
  label: {
    keyName: "Label",
    title: "Label",
    type: "string",
    format: "label",
    dsType: "label",
    Icon: PaletteIconMap.label,
  },
  email: {
    keyName: "Email",
    title: "Email",
    type: "string",
    format: "email",
    dsType: "email",
    Icon: PaletteIconMap.email,
    // rule: defaultRule,
    validations: extendedValidations,
  },
  uri: {
    keyName: "URI",
    title: "URI",
    type: "string",
    format: "uri",
    dsType: "uri",
    Icon: PaletteIconMap.uri,
    // rule: defaultRule,
    validations: extendedValidations,
  },
  phone: {
    keyName: "PhoneNumber",
    title: "Phone Number",
    type: "string",
    format: "string",
    dsType: "phone",
    Icon: PaletteIconMap.phone,
    // rule: defaultRule,
    validations: extendedValidations,
    pattern: "^[0-9]{10}$",
    patternMessage: "Invalid phone number"
  },
  input: {
    keyName: "Input",
    title: "Input",
    type: "string",
    dsType: "input",
    minLength: 3,
    Icon: PaletteIconMap.input,
    enablePattern: true,
    // rule: defaultRule,
    validations: extendedValidations,
  },
  number: {
    keyName: "Number Input",
    title: "Number Input",
    type: "number",
    dsType: "number",
    minLength: 3,
    Icon: PaletteIconMap.number,
    // rule: defaultRule,
    validations: { ...extendedValidations, range: true },
  },
  integer: {
    keyName: "Integer Input",
    title: "Integer Input",
    type: "integer",
    dsType: "integer",
    minLength: 3,
    Icon: PaletteIconMap.number,
    // rule: defaultRule,
    validations: { ...extendedValidations, range: true },
  },
  date: {
    keyName: "Date",
    title: "Date",
    type: "string",
    format: "date",
    dsType: "date",
    Icon: PaletteIconMap.date,
    // rule: defaultRule,
    validations: { 
      ...extendedValidations, 
      range: true 
    },
  },
  textarea: {
    keyName: "TextArea",
    title: "TextArea",
    type: "string",
    format: 'multiline',
    dsType: "textarea",
    minLength: 3,
    multiline: true,
    Icon: PaletteIconMap.textarea,
    // rule: defaultRule,
    validations: extendedValidations,
  },
  checkbox: {
    keyName: "Checkbox",
    title: "Checkbox",
    type: "boolean",
    dsType: "checkbox",
    Icon: PaletteIconMap.checkbox,
    // rule: defaultRule,
    validations: { isEqual: true },
  },
  dropdown: {
    keyName: "Dropdown",
    title: "Dropdown",
    type: "string",
    format: "enum",
    dsType: "dropdown",
    Icon: PaletteIconMap.dropdown,
    // rule: defaultRule,
    validations: extendedValidations,
  },
  radio: {
    keyName: "Radio",
    title: "Radio",
    type: "string",
    format: "radio",
    dsType: "radio",
    Icon: PaletteIconMap.radio,
    // rule: defaultRule,
    validations: extendedValidations,
  },
  ip: {
    keyName: "IPv4",
    title: "IPv4",
    type: "string",
    format: "ipv4",
    dsType: "ip",
    Icon: PaletteIconMap.ip,
    // rule: defaultRule,
    validations: extendedValidations,
  },
  "horizontal-layout": {
    keyName: "Horizontal",
    title: "Horizontal",
    type: "HorizontalLayout",
    dsType: "horizontal-layout",
    direction: LayoutType.HORIZONTAL,
    Icon: PaletteIconMap["horizontal-layout"],
    isLayoutElement: true,
    // rule: defaultRule,
  },
  "vertical-layout": {
    keyName: "Vertical",
    title: "Vertical",
    type: "VerticalLayout",
    dsType: "vertical-layout",
    direction: LayoutType.VERTICAL,
    Icon: PaletteIconMap["vertical-layout"],
    isLayoutElement: true,
    // rule: defaultRule,
  },
  group: {
    keyName: "Group",
    title: "Group",
    type: "Group",
    dsType: "group",
    direction: LayoutType.VERTICAL,
    Icon: PaletteIconMap.group,
    isLayoutElement: true,
    // rule: defaultRule,
  },
  secret: {
    keyName: "Secret",
    title: "Secret",
    type: "string",
    format: "password",
    dsType: "secret",
    color: "#2563eb",
    minLength: 3,
    Icon: PaletteIconMap.secret,
    validations: extendedValidations,
    // rule: defaultRule,
  },
  longtext: {
    keyName: "LongText",
    title: "Long Text",
    type: "string",
    format: 'multiline',
    dsType: "longtext",
    color: "#16a34a",
    minLength: 3,
    Icon: PaletteIconMap.longtext,
    enablePattern: true,
    validations,
    // rule: defaultRule,
  },
  file: {
    keyName: "File",
    title: "File",
    type: "string",
    dsType: "file",
    format: "data-url",
    color: "#16a34a",
    minLength: 3,
    Icon: PaletteIconMap.file,
    validations: { helperText: true, keyName: true, required: true },
    // rule: defaultRule,
  },
  sin: {
    keyName: "SIN",
    title: "SIN Number",
    type: "string",
    dsType: "sin",
    color: "#dc2626",
    pattern: "^\\d{3}[-]?\\d{3}[-]?\\d{3}$",
    patternMessage: "Invalid SIN number.",
    Icon: PaletteIconMap.sin,
    validations: { helperText: true, keyName: true, readonly: true, required: true },
    // rule: defaultRule,
  },
};

// Grouped Fields
export const FIELDS = Object.values(FIELD_MAP);

export type CategoryData = {
  title: string;
  fields: Omit<Item, 'id'>[];
  color: string;
};

export const CONTACT_INFO_FIELDS: CategoryData = {
  title: "Contact Information",
  color: "#2563eb",
  fields: [FIELD_MAP.email, FIELD_MAP.phone, FIELD_MAP.secret]
}

export const TEXT_AND_FILES_FIELDS: CategoryData = {
  title: "Text & Files",
  color: "#16a34a",
  fields: [FIELD_MAP.input, FIELD_MAP.textarea, FIELD_MAP.file]
}

export const CHOICE_FIELDS: CategoryData = {
  title: "Choice Fields",
  color: "#9333ea",
  fields: [FIELD_MAP.checkbox, FIELD_MAP.dropdown, FIELD_MAP.radio]
}

export const LAYOUT_FIELDS: CategoryData = {
  title: "Layout",
  color: "#ea580c",
  fields: [FIELD_MAP.label, FIELD_MAP["horizontal-layout"], FIELD_MAP["vertical-layout"], FIELD_MAP.group]
}

export const OTHER_FIELDS: CategoryData = {
  title: "Other Fields",
  color: "#dc2626",
  fields: [FIELD_MAP.number, FIELD_MAP.integer, FIELD_MAP.date, FIELD_MAP.ip, FIELD_MAP.sin]
}

export const BOOTSTRAP_FIELDS = [
  { ...FIELD_MAP.email, color: "#2563eb", },
  { ...FIELD_MAP.input, color: "#16a34a", },
  { ...FIELD_MAP.group, color: "#ea580c", },
  { ...FIELD_MAP.textarea, color: "#16a34a", },
  { ...FIELD_MAP["horizontal-layout"], color: "#ea580c", },
  { ...FIELD_MAP.checkbox, color: "#9333ea", },
]