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
import { Input } from '@/components/ui/input';
import {
  CellProps,
  isNumberControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsCellProps } from '@jsonforms/react';
import { VanillaRendererProps, withVanillaCellProps } from '@jsonforms/vanilla-renderers';
import merge from 'lodash/merge';
import { PaletteIconMap } from '../../constants/fields';
import { cn } from '@/lib/utils';

const toNumber = (value: string) => (value === '' ? undefined : Number(value));

export const NumberCell = (props: CellProps & VanillaRendererProps) => {
  const { data, className, id, enabled, uischema, path, handleChange, config, visible, schema } = props;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const Icon = PaletteIconMap?.[schema.dsType ? schema.dsType : 'input'];

  return (
    <div className='relative'>
      <Input
        type='number'
        step='0.1'
        value={data ?? ''}
        onChange={(ev) => handleChange(path, toNumber(ev.target.value))}
        className={cn("pl-8", visible ? '' : 'hidden')}
        id={id}
        disabled={!enabled}
        placeholder={appliedUiSchemaOptions.placeholder}
        autoFocus={uischema.options && uischema.options.focus}
      />
      <Icon className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-2" />
    </div>
  );
};

/**
 * Default tester for number controls.
 * @type {RankedTester}
 */
export const numberCellTester: RankedTester = rankWith(3, isNumberControl);

export default withJsonFormsCellProps(withVanillaCellProps(NumberCell));
