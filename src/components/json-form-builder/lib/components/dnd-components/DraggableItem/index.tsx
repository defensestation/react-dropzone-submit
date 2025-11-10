import React from "react";
import { DraggableAttributes, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface DraggableItemProps {
  id: string;
  data?: Record<string, unknown>;
  disabled?: boolean;
  component?: React.ElementType<any>;
  render?: (props: DraggableProps) => React.ReactNode;
  children?:
    | ((props: DraggableProps) => React.ReactNode)
    | React.ReactNode;
}

export interface DraggableProps {
  attributes: DraggableAttributes;
  listeners: any;
  setNodeRef: (node: HTMLElement | null) => void;
  transform: { x: number; y: number } | null;
  isDragging: boolean;
}

export default function DraggableItem({
  id,
  data,
  disabled,
  component,
  render,
  children,
}: DraggableItemProps): React.ReactNode {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data,
      disabled: !!disabled,
    });

  const draggableProps: DraggableProps = {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  };

  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: disabled ? "not-allowed" : undefined,
    transition: "transform 150ms ease",
    opacity: isDragging ? 0.5 : 1,
  };

  if (component) {
    return React.createElement(component, { ...draggableProps, style });
  }

  if (render) {
    return <>{render(draggableProps)}</>;
  }

  if (children) {
    return typeof children === "function"
      ? children(draggableProps)
      : React.Children.only(children);
  }

  return null;
}
