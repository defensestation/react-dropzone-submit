import { CellProps, Formatted, RankedTester } from '@jsonforms/core';
import { VanillaRendererProps } from '@jsonforms/vanilla-renderers';
export declare const NumberFormatCell: (props: CellProps & VanillaRendererProps & Formatted<number | undefined>) => import("react/jsx-runtime").JSX.Element;
/**
 * Default tester for text-based/string controls.
 * @type {RankedTester}
 */
export declare const numberFormatCellTester: RankedTester;
declare const _default: import('react').ComponentType<import('@jsonforms/core').OwnPropsOfCell>;
export default _default;
