import { default as React } from 'react';
import { UniqueIdentifier } from '@dnd-kit/core';
import { FieldItemType } from '../../types/common-types';
type BoxProps = {
    onDelete?: (id: UniqueIdentifier) => void;
};
export default function PaletteElement({ title, Icon, ...rest }: React.HTMLAttributes<HTMLDivElement> & FieldItemType & BoxProps): React.ReactElement;
export {};
