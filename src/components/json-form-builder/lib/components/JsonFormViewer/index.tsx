import { JsonForms } from '@jsonforms/react';
import { vanillaCells, vanillaRenderers } from '@jsonforms/vanilla-renderers';
import { JsonFormsCore, JsonSchema, UISchemaElement } from '@jsonforms/core';
import { JsonFormsStyleContext, vanillaStyles } from '@jsonforms/vanilla-renderers';
import TextCell, { textCellTester } from '../cells/TextCell';
import { InputControl, inputControlTester, EnumControl, enumControlTester } from "../controls"
import EnumCell, { enumCellTester } from '../cells/EnumCell';
import FileCell, { fileCellTester } from '../cells/FileCell';
import RadioGroupControl, { radioGroupControlTester } from '../controls/RadioGroupControl';
import NumberCell, { numberCellTester } from '../cells/NumberCell';
import IntegerCell, { integerCellTester } from '../cells/IntegerCell';
import NumberFormatCell, { numberFormatCellTester } from '../cells/NumberFormatCell';
import DateCell, { dateCellTester } from '../cells/DateCell';
import DateTimeCell, { dateTimeCellTester } from '../cells/DateTimeCell';
import BooleanCell, { booleanCellTester } from '../cells/BooleanCell';
import { cn } from '@/lib/utils';
import TextAreaCell, { textAreaCellTester } from '../cells/TextAreaCell';
import LabelControl, { labelControlTester } from '../controls/LabelControl';

const cells = [
  ...vanillaCells,
  { cell: TextCell, tester: textCellTester },
  { cell: EnumCell, tester: enumCellTester },
  { cell: FileCell, tester: fileCellTester },
  { cell: NumberCell, tester: numberCellTester },
  { cell: IntegerCell, tester: integerCellTester },
  { cell: NumberFormatCell, tester: numberFormatCellTester },
  { cell: DateCell, tester: dateCellTester },
  { cell: DateTimeCell, tester: dateTimeCellTester },
  { cell: BooleanCell, tester: booleanCellTester },
  { cell: TextAreaCell, tester: textAreaCellTester },
]

const renderers = [
  ...vanillaRenderers,
  { tester: enumControlTester, renderer: EnumControl },
  { tester: inputControlTester, renderer: InputControl },
  { tester: radioGroupControlTester, renderer: RadioGroupControl },
  { tester: labelControlTester, renderer: LabelControl },
]

const styleContextValue = {
  styles: [
    ...vanillaStyles,
    {
      name: 'control',
      classNames: ['flex', 'flex-col', 'space-y-2', 'w-full'],
    },
    {
      name: 'control.trim',
      classNames: ['truncate'],
    },
    {
      name: 'control.input',
      classNames: ['input', 'border', 'border-input', 'rounded-md', 'px-3', 'py-2', 'shadow-sm', 'focus:ring-2', 'focus:ring-primary', 'bg-transparent'],
    },
    {
      name: 'control.select',
      classNames: ['select', 'border', 'border-input', 'rounded-md', 'px-3', 'py-2', 'shadow-sm', 'focus:ring-2', 'focus:ring-primary'],
    },
    {
      name: 'control.checkbox',
      classNames: ['checkbox', 'w-4', 'h-4', 'border', 'rounded', 'focus:ring-2', 'focus:ring-primary'],
    },
    {
      name: 'control.radio',
      classNames: ['flex', 'items-center', 'space-x-2'],
    },
    {
      name: 'control.radio.option',
      classNames: ['flex', 'items-center', 'space-x-2'],
    },
    {
      name: 'control.radio.input',
      classNames: ['radio', 'w-4', 'h-4', 'border', 'rounded-full', 'focus:ring-2', 'focus:ring-primary'],
    },
    {
      name: 'control.radio.label',
      classNames: ['text-sm', 'font-medium', 'text-foreground'],
    },
    {
      name: 'control.validation.error',
      classNames: ['text-sm', 'text-red-600'],
    },
    {
      name: 'control.validation',
      classNames: ['text-sm', 'text-warning'],
    },
    {
      name: 'categorization',
      classNames: ['flex', 'border', 'rounded-lg', 'overflow-hidden'],
    },
    {
      name: 'categorization.master',
      classNames: ['w-1/4', 'bg-secondary', 'text-secondary-foreground', 'p-4', 'space-y-2'],
    },
    {
      name: 'categorization.detail',
      classNames: ['w-3/4', 'p-4'],
    },
    {
      name: 'category.group',
      classNames: ['py-2', 'hover:bg-secondary-light', 'cursor-pointer'],
    },
    {
      name: 'category.subcategories',
      classNames: ['list-none', 'space-y-1'],
    },
    {
      name: 'array.layout',
      classNames: [cn('flex', 'flex-col', 'space-y-4')],
    },
    {
      name: 'array.children',
      classNames: ['space-y-2'],
    },
    {
      name: 'group.layout',
      classNames: [cn('p-4', 'border', 'rounded-md', 'space-y-4', 'w-full')],
    },
    {
      name: 'horizontal.layout',
      classNames: ['flex', 'space-x-4', 'w-full'],
    },
    {
      name: 'horizontal.layout.item',
      classNames: ['flex-1'],
    },
    {
      name: 'vertical.layout',
      classNames: [cn('flex', 'flex-col', 'space-y-4', 'w-full')],
    },
    {
      name: 'array.table.validation.error',
      classNames: ['text-sm', 'text-red-600'],
    },
    {
      name: 'array.table.validation',
      classNames: ['text-sm', 'text-warning'],
    },
    {
      name: 'array.table',
      classNames: ['border', 'rounded-md', 'shadow-sm', 'overflow-hidden'],
    },
    {
      name: 'array.control.validation.error',
      classNames: ['text-sm', 'text-red-600'],
    },
    {
      name: 'array.control.validation',
      classNames: ['text-sm', 'text-warning'],
    },
    {
      name: 'array.control.add',
      classNames: ['bg-primary', 'text-white', 'px-4', 'py-2', 'rounded-md', 'hover:bg-primary-dark'],
    },
    {
      name: 'array.child.controls',
      classNames: ['flex', 'items-center', 'space-x-2'],
    },
    {
      name: 'array.child.controls.up',
      classNames: ['bg-gray-100', 'p-2', 'rounded-md', 'hover:bg-gray-200'],
    },
    {
      name: 'array.child.controls.down',
      classNames: ['bg-gray-100', 'p-2', 'rounded-md', 'hover:bg-gray-200'],
    },
    {
      name: 'array.child.controls.delete',
      classNames: ['bg-red-500', 'text-white', 'p-2', 'rounded-md', 'hover:bg-red-600'],
    },
    {
      name: 'array.control',
      classNames: ['p-4', 'border', 'rounded-md', 'space-y-4'],
    },
    {
      name: 'input.description',
      classNames: ['text-sm', 'text-muted-foreground'],
    },
  ]
};

type JsonFormViewerProps = {
  uiSchema: UISchemaElement;
  jsonSchema: JsonSchema;
  onSubmit?: (args: Pick<JsonFormsCore, "data" | "errors">) => void
  data?: unknown;
  readonly?: boolean;
}

export default function JsonFormViewer({ jsonSchema, data, uiSchema, onSubmit, readonly }: JsonFormViewerProps) {
  return (
    <JsonFormsStyleContext.Provider value={styleContextValue}>
      <JsonForms
        i18n={{
          translateError: (error) => {
            if (error) {
              if (error.keyword === 'pattern') {
                const customMessage =
                  error.parentSchema?.patternProperties?.message?.title || error.message;
                return customMessage;
              }
              else {
                return error.message
              }
            }
          }
        }}
        schema={jsonSchema}
        uischema={uiSchema}
        data={data}
        renderers={renderers}
        cells={cells}
        onChange={onSubmit}
        readonly={readonly}
      />
    </JsonFormsStyleContext.Provider>
  );
}
export { default as StepperJsonForm } from "./StepperJsonForm"
