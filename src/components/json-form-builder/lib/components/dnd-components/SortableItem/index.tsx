import { defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";
import React from 'react'
import type { DroppableItemProps } from '../../../types/dnd-types';
import { GripVertical } from 'lucide-react';


export default function SortableItem({
  children,
  id,
  animateLayoutChanges = defaultAnimateLayoutChanges,
  data,
  disabled,
  getNewIndex,
  resizeObserverConfig,
  DragHandle,
  strategy,
  ...rest
}: DroppableItemProps & React.HtmlHTMLAttributes<HTMLDivElement>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
    data,
    disabled,
    getNewIndex,
    resizeObserverConfig,
    strategy,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }
  return (
    <div ref={setNodeRef} {...rest} style={style}>
      <div className='flex gap-2 items-center'>
        <div {...attributes} {...listeners} className="p-2 hover:bg-gray-700/10 dark:hover:bg-accent rounded-lg">
          <GripVertical className="w-4 h-8" />
        </div>
        {children}
      </div>
    </div>
  )
}
