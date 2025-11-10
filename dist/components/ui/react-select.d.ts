import { default as React, ReactElement, Ref } from 'react';
import { ClassNamesConfig, DropdownIndicatorProps, GroupBase, StylesConfig, MultiValueRemoveProps, ClearIndicatorProps, OptionProps, MenuProps, MenuListProps, Props, SelectInstance } from 'react-select';
/** select option type */
export type OptionType = {
    label: string;
    value: string | number;
};
/**
 * This factory method is used to build custom classNames configuration
 */
export declare const createClassNames: (classNames: ClassNamesConfig<OptionType, boolean, GroupBase<OptionType>>) => ClassNamesConfig<OptionType, boolean, GroupBase<OptionType>>;
export declare const defaultClassNames: ClassNamesConfig<OptionType, boolean, GroupBase<OptionType>>;
export declare const defaultStyles: StylesConfig<OptionType, boolean, GroupBase<OptionType>>;
/**
 * React select custom components
 */
export declare const DropdownIndicator: (props: DropdownIndicatorProps<OptionType>) => import("react/jsx-runtime").JSX.Element;
export declare const ClearIndicator: (props: ClearIndicatorProps<OptionType>) => import("react/jsx-runtime").JSX.Element;
export declare const MultiValueRemove: (props: MultiValueRemoveProps<OptionType>) => import("react/jsx-runtime").JSX.Element;
export declare const Option: (props: OptionProps<OptionType>) => import("react/jsx-runtime").JSX.Element;
export declare const Menu: (props: MenuProps<OptionType>) => import("react/jsx-runtime").JSX.Element;
export declare const MenuList: (props: MenuListProps<OptionType>) => import("react/jsx-runtime").JSX.Element;
declare const _default: <IsMulti extends boolean = false>(p: Props<OptionType, IsMulti> & {
    ref?: Ref<React.LegacyRef<SelectInstance<OptionType, IsMulti, GroupBase<OptionType>>>>;
    isMulti?: IsMulti;
}) => ReactElement;
export default _default;
