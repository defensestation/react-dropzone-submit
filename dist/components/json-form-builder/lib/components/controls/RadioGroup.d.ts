import { ControlProps, OwnPropsOfEnum } from '@jsonforms/core';
import { StyleDef, VanillaRendererProps } from '@jsonforms/vanilla-renderers';
export declare const findStyle: (styles: StyleDef[]) => (style: string, ...args: any[]) => string[];
export declare const findStyleAsClassName: (styles: StyleDef[]) => (style: string, ...args: any[]) => string;
export declare const RadioGroup: ({ classNames, id, label, options, required, description, errors, data, uischema, visible, config, enabled, path, schema, handleChange, }: ControlProps & VanillaRendererProps & OwnPropsOfEnum) => import("react/jsx-runtime").JSX.Element;
