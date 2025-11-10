import { default as React } from 'react';
import { FieldItemType } from '../../types/common-types';
import { Item } from '../../types/dnd-types';
type CustomFieldPaletteItem = {
    addItem: (item: Item) => void;
};
type FieldPaletteProps = {
    fields?: FieldItemType[];
    CustomFieldPaletteItem?: React.ComponentType<FieldItemType & CustomFieldPaletteItem>;
    onClickActionMenu?: () => void;
};
export default function FieldPalette({ CustomFieldPaletteItem, className, onClickActionMenu, }: Omit<FieldPaletteProps, "fields"> & React.HTMLAttributes<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;
export {};
