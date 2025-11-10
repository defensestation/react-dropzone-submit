
import merge from 'lodash/merge';
import { VanillaRendererProps, withVanillaCellProps } from '@jsonforms/vanilla-renderers';
import { withJsonFormsCellProps } from '@jsonforms/react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { CellProps, isStringControl, RankedTester, rankWith } from '@jsonforms/core';
import { PaletteIconMap } from '../../constants/fields';

export const TextCell = (props: CellProps & VanillaRendererProps) => {
  const {
    config,
    data,
    className,
    id,
    enabled,
    uischema,
    schema,
    path,
    visible,
    handleChange,
  } = props;
  const maxLength = schema.maxLength;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const Icon = PaletteIconMap?.[schema.dsType ? schema.dsType : 'input'];
  return (
    <div className='relative'>
      <Input
        type={schema.format === 'password' ? 'password' : 'text'}
        value={data || ''}
        onChange={(ev) =>
          handleChange(path, ev.target.value === '' ? undefined : ev.target.value)
        }
        className={cn("pl-8", visible ? '' : 'hidden')}
        id={id}
        disabled={!enabled}
        autoFocus={appliedUiSchemaOptions.focus}
        hidden={!visible}
        placeholder={appliedUiSchemaOptions.placeholder}
        maxLength={appliedUiSchemaOptions.restrict ? maxLength : undefined}
        size={appliedUiSchemaOptions.trim ? maxLength : undefined}
      />
      <Icon className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-2" />
    </div>
  );
};

/**
 * Default tester for text-based/string controls.
 * @type {RankedTester}
 */
export const textCellTester: RankedTester = rankWith(2, isStringControl);

export default withJsonFormsCellProps(withVanillaCellProps(TextCell));