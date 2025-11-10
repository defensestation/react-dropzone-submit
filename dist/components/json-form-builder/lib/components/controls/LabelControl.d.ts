import { ControlProps, ControlState, RankedTester } from '@jsonforms/core';
import { Control } from '@jsonforms/react';
import { VanillaRendererProps } from '@jsonforms/vanilla-renderers';
export declare class LabelControl extends Control<ControlProps & VanillaRendererProps, ControlState> {
    render(): import("react/jsx-runtime").JSX.Element | null;
}
export declare const labelControlTester: RankedTester;
declare const _default: (props: any) => React.JSX.Element;
export default _default;
