import { TranslateProps } from '@jsonforms/react';
import { VanillaRendererProps } from '@jsonforms/vanilla-renderers';
import { EnumCellProps, RankedTester } from '@jsonforms/core';
export declare const EnumCell: (props: EnumCellProps & VanillaRendererProps & TranslateProps) => import("react/jsx-runtime").JSX.Element;
/**
 * Default tester for enum controls.
 * @type {RankedTester}
 */
export declare const enumCellTester: RankedTester;
declare const _default: import('react').ComponentType<import('@jsonforms/core').OwnPropsOfEnumCell>;
export default _default;
