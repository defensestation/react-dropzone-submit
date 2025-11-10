import { default as React } from 'react';
import { DroppableItemProps } from '../../../types/dnd-types';
interface Props extends DroppableItemProps {
}
export default function DroppableItem({ children, id, disabled, className, ...rest }: Props & React.HTMLAttributes<HTMLDivElement>): React.ReactElement;
export {};
