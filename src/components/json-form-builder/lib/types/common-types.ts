import { LucideIcon } from "lucide-react";

export type FieldItemType = {
    title: string;
    type: string;
    minLength?: number;
    multiline?: boolean;
    Icon?: LucideIcon;
}