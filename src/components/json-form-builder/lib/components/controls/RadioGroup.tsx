/*
  The MIT License

  Copyright (c) 2017-2021 EclipseSource Munich
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
import React, { useMemo, useState } from 'react';
import {
  computeLabel,
  ControlProps,
  isDescriptionHidden,
  OwnPropsOfEnum,
} from '@jsonforms/core';
import merge from 'lodash/merge';
import join from 'lodash/join';
import filter from 'lodash/filter';
import reduce from 'lodash/reduce';
import { StyleDef, useStyles, VanillaRendererProps } from '@jsonforms/vanilla-renderers';
import { Label } from '@/components/ui/label';
import { RadioGroupItem, RadioGroup as CustomRadioGroup } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export const findStyle =
  (styles: StyleDef[]) =>
    (style: string, ...args: any[]): string[] => {
      const foundStyles = filter(styles, (s) => s.name === style);
      return reduce(
        foundStyles,
        (res: string[], style: StyleDef) => {
          if (typeof style.classNames === 'function') {
            return res.concat(style.classNames(args));
          }
          return res.concat(style.classNames);
        },
        []
      );
    };

export const findStyleAsClassName =
  (styles: StyleDef[]) =>
    (style: string, ...args: any[]): string =>
      join(findStyle(styles)(style, args), ' ');

export const RadioGroup = ({
  classNames,
  id,
  label,
  options,
  required,
  description,
  errors,
  data,
  uischema,
  visible,
  config,
  enabled,
  path,
  schema,
  handleChange,
}: ControlProps & VanillaRendererProps & OwnPropsOfEnum) => {
  const contextStyles = useStyles();
  const [isFocused, setFocus] = useState(false);
  const radioControl = useMemo(
    () => findStyleAsClassName(contextStyles)('control.radio'),
    [contextStyles]
  );
  const radioOption = useMemo(
    () => findStyleAsClassName(contextStyles)('control.radio.option'),
    [contextStyles]
  );
  const radioInput = useMemo(
    () => findStyleAsClassName(contextStyles)('control.radio.input'),
    [contextStyles]
  );
  const radioLabel = useMemo(
    () => findStyleAsClassName(contextStyles)('control.radio.label'),
    [contextStyles]
  );
  const isValid = errors.length === 0;
  const divClassNames = [classNames.validation]
    .concat(isValid ? classNames.description : classNames.validationError)
    .join(' ');
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const showDescription = !isDescriptionHidden(
    visible,
    description,
    isFocused,
    appliedUiSchemaOptions.showUnfocusedDescription
  );
  const hasRadioClass = !radioControl || radioControl === 'radio';
  let groupStyle: { [x: string]: any } = {};
  if (hasRadioClass) {
    groupStyle = {
      display: 'flex',
      flexDirection:
        'vertical' === appliedUiSchemaOptions.orientation ? 'column' : 'row',
    };
  }
  return (
    <div
      className={cn(classNames.wrapper, visible ? '' : 'hidden', 'space-y-2')}
      hidden={!visible}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    >
      <Label htmlFor={id} className={cn(!isValid && "text-destructive")}>
        {computeLabel(
          label,
          required,
          appliedUiSchemaOptions.hideRequiredAsterisk
        )}
      </Label>
      <CustomRadioGroup
        onValueChange={(val) => handleChange(path, val)}
        defaultValue={data}
        name={id}
        className={cn("flex flex-col space-y-1 items-start")}
      >
        {options.map((option) => (
          <div key={option.label} className={cn("flex items-center space-x-3 space-y-0")}>
            <RadioGroupItem disabled={!enabled} value={option.value} />
            <Label className="font-normal text-muted-foreground">
              {option.label}
            </Label>
          </div>))}
      </CustomRadioGroup>
      {schema.description ? <p className="text-[0.8rem] text-muted-foreground">
        {schema.description}
      </p> : null}
      {!isValid && <div className={cn("text-[0.8rem] font-medium text-destructive")}>
        {!isValid ? errors : null}
      </div>}
    </div>
  );
};
