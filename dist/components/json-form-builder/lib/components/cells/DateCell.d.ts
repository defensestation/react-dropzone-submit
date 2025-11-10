import { CellProps, RankedTester } from '@jsonforms/core';
import { VanillaRendererProps } from '@jsonforms/vanilla-renderers';
import { default as React } from 'react';
export declare const DateCell: (props: CellProps & VanillaRendererProps) => import("react/jsx-runtime").JSX.Element;
/**
 * Default tester for date controls.
 * @type {RankedTester}
 */
export declare const dateCellTester: RankedTester;
declare const _default: React.ComponentType<import('@jsonforms/core').OwnPropsOfCell>;
export default _default;
