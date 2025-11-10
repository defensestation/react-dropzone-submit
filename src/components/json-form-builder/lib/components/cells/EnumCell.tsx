import merge from 'lodash/merge';
import {
  TranslateProps,
  withJsonFormsEnumCellProps,
  withTranslateProps,
} from '@jsonforms/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VanillaRendererProps, withVanillaEnumCellProps } from '@jsonforms/vanilla-renderers';
import { cn } from '@/lib/utils';
import { EnumCellProps, isEnumControl, RankedTester, rankWith } from '@jsonforms/core';

export const EnumCell = (
  props: EnumCellProps & VanillaRendererProps & TranslateProps
) => {
  const {
    config,
    data,
    className,
    id,
    enabled,
    uischema,
    path,
    handleChange,
    options,
    visible,
    schema
  } = props;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  console.log(appliedUiSchemaOptions, className, visible)
  return (
    <Select
      defaultValue={data || ''}
      onValueChange={(ev) => handleChange(path, ev)}
    >
      <SelectTrigger
        autoFocus={uischema.options && uischema.options.focus}
        disabled={!enabled}
        className={cn(visible ? '' : 'hidden')}
      >
        <SelectValue id={id} placeholder={appliedUiSchemaOptions.placeholder} />
      </SelectTrigger>

      <SelectContent>

        {options?.filter(opt => !!opt.value)?.map((optionValue) => (
          <SelectItem
            value={optionValue.value}
            key={optionValue.value}
          >
            {optionValue.label}
          </SelectItem>
        ))}

      </SelectContent>
    </Select>
  );
};
/**
 * Default tester for enum controls.
 * @type {RankedTester}
 */
export const enumCellTester: RankedTester = rankWith(3, isEnumControl);

export default withJsonFormsEnumCellProps(
  withTranslateProps(withVanillaEnumCellProps(EnumCell))
);
