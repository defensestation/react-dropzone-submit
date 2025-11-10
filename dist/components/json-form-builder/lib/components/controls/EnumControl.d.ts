import { default as React } from 'react';
import { ControlProps, ControlState, RankedTester } from '@jsonforms/core';
import { Control } from '@jsonforms/react';
import { VanillaRendererProps } from '@jsonforms/vanilla-renderers';
export declare class EnumControl extends Control<ControlProps & VanillaRendererProps, ControlState> {
    render(): import("react/jsx-runtime").JSX.Element | null;
}
export declare const enumControlTester: RankedTester;
declare const _default: (props: any) => React.JSX.Element;
export default _default;
