import { default as React } from 'react';
import { DraggableAttributes } from '@dnd-kit/core';
interface DraggableItemProps {
    id: string;
    data?: Record<string, unknown>;
    disabled?: boolean;
    component?: React.ElementType<any>;
    render?: (props: DraggableProps) => React.ReactNode;
    children?: ((props: DraggableProps) => React.ReactNode) | React.ReactNode;
}
export interface DraggableProps {
    attributes: DraggableAttributes;
    listeners: any;
    setNodeRef: (node: HTMLElement | null) => void;
    transform: {
        x: number;
        y: number;
    } | null;
    isDragging: boolean;
}
export default function DraggableItem({ id, data, disabled, component, render, children, }: DraggableItemProps): React.ReactNode;
export {};
