import { VanillaRendererProps } from '@jsonforms/vanilla-renderers';
import { CellProps, RankedTester } from '@jsonforms/core';
export declare const TextCell: (props: CellProps & VanillaRendererProps) => import("react/jsx-runtime").JSX.Element;
/**
 * Default tester for text-based/string controls.
 * @type {RankedTester}
 */
export declare const textCellTester: RankedTester;
declare const _default: import('react').ComponentType<import('@jsonforms/core').OwnPropsOfCell>;
export default _default;
