import { default as React } from 'react';
import { DroppableItemProps, LayoutType } from '../../../../types/dnd-types';
interface LayoutProps extends Omit<DroppableItemProps, "children" | "items"> {
    direction: LayoutType;
    isPlaceholderVisible?: boolean;
}
export declare const DroppableLayout: ({ id, direction, className, isPlaceholderVisible }: LayoutProps & React.HTMLAttributes<HTMLDivElement>) => React.ReactElement;
export {};
