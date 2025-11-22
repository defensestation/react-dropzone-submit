import { useDroppable } from "@dnd-kit/core";
import React from "react";
import type { DroppableItemProps } from "../../../types/dnd-types";

interface Props extends DroppableItemProps {}

export default function DroppableItem({
  children,
  id,
  disabled,
  className,
  ...rest
}: Props & React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  const { setNodeRef, isOver, active } = useDroppable({
    id: id,
    data: {
      parent: null,
      isContainer: true,
    },
    disabled: !!disabled,
  });

  return (
    <div ref={setNodeRef} className={`${active?.id !== id && isOver ? "gray.100" : "#fff"} border-lg p-2.5 ${active?.id !== id && isOver ? "white" : "black"} ${className?className:''}`} {...rest}>
      {children}
    </div>
  );
}
