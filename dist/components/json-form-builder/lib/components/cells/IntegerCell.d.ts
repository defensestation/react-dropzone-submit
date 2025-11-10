import { default as React } from 'react';
import { CellProps, RankedTester } from '@jsonforms/core';
import { VanillaRendererProps } from '@jsonforms/vanilla-renderers';
export declare const IntegerCell: (props: CellProps & VanillaRendererProps) => import("react/jsx-runtime").JSX.Element;
/**
 * Default tester for integer controls.
 * @type {RankedTester}
 */
export declare const integerCellTester: RankedTester;
declare const _default: React.ComponentType<import('@jsonforms/core').OwnPropsOfCell>;
export default _default;
