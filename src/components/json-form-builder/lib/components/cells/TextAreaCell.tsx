/*
  The MIT License

  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import { Textarea } from '@/components/ui/textarea';
import {
  CellProps,
  isMultiLineControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsCellProps } from '@jsonforms/react';
import { VanillaRendererProps, withVanillaCellProps } from '@jsonforms/vanilla-renderers';
import merge from 'lodash/merge';
import { PaletteIconMap } from '../../constants/fields';
import { cn } from '@/lib/utils';

export const TextAreaCell = (props: CellProps & VanillaRendererProps) => {
  const { data, className, id, enabled, config, uischema, path, handleChange, schema, visible } =
    props;
  const maxLength = schema.maxLength;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const Icon = PaletteIconMap?.[schema.dsType ? schema.dsType : 'input'];
  return (
    <div className='relative'>
      <Textarea
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
      />
      <Icon className="w-4 h-4 absolute top-5 -translate-y-1/2 left-2" />
    </div>)
};

/**
 * Tester for a multi-line string control.
 * @type {RankedTester}
 */
export const textAreaCellTester: RankedTester = rankWith(3, isMultiLineControl);

export default withJsonFormsCellProps(withVanillaCellProps(TextAreaCell));
