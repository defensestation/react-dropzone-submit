import type { UniqueIdentifier } from "@dnd-kit/core";
import type { UseSortableArguments } from "@dnd-kit/sortable";
import type { JsonSchema } from "@jsonforms/core";
import type { LucideIcon } from "lucide-react";

export type DroppableItemProps = {
  children: React.ReactElement;
} & UseSortableArguments;

export type DraggableItemProps = {
  children: React.ReactElement;
} & UseSortableArguments;

export enum LayoutType {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
}

export type EnumOptionType = {
  title: string;
  const: string;
};

export type ValidationSettings = {
  keyName?: boolean;
  min?: boolean;
  max?: boolean;
  readonly?: boolean;
  regex?: boolean;
  helperText?: boolean;
  secret?: boolean;
  required?: boolean;
}

export enum RuleOperators {
  IsEqual = "isEqual",
  IsNotEqual = "isNotEqual",
  BeginsWith = "beginsWith",
  EndsWith = "endsWith",
  Contains = "contains",
  DoesNotContain = "doesNotContain",
  Enum = "enum",
  Range = "range",
}

export type AllowedConditions = {
  [key in RuleOperators]?: boolean;
};

export type Item = {
  keyName: string;
  title: string;
  labelPlaceholder?: string;
  type: string;
  format?: string;
  color?: string;
  dsType: string;
  id: UniqueIdentifier;
  required?: boolean;
  hasConditon?: boolean;
  description?: string;
  helperText?: string;
  enablePattern?: boolean;
  pattern?: string;
  patternMessage?: string;
  Icon: LucideIcon;
  minLength?: number | undefined;
  maxLength?: number | undefined;
  minimum?: number | undefined;
  maximum?: number | undefined;
  minDate?: string | undefined;
  maxDate?: string | undefined;
  readonly?: boolean;
  multiline?: boolean;
  placeholder?: string;
  direction?: LayoutType;
  parentId?: UniqueIdentifier;
  isLayoutElement?: boolean;
  options?: string[];
  validations?: ValidationSettings;
  rule: CustomRule;
  allowedConditions?: AllowedConditions;
};

export interface FieldProps extends Omit<Item, 'isLayoutElement' | 'parentId' | 'direction'> {
  onDelete: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  data?: any;
};

export interface BuilderFieldArguments extends FieldProps {

};


export type CustomRuleEffect = "HIDE" | "SHOW" | "ENABLE" | "DISABLE" | "JUMP"
export type CustomRule = {
  effect: CustomRuleEffect,
  condition?: {
    scope: string;
    schema?: JsonSchema | undefined;
  };
}