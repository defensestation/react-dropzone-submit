import React, { type ReactNode } from "react";
import {  TbEye, TbEyeOff, TbInputCheck, TbInputX } from "react-icons/tb";
import { type FieldProps } from "../../../../types/dnd-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Split, Trash } from "lucide-react";

export default function BaseComponent(props: FieldProps & React.PropsWithChildren) {
  const {
    Icon: IconComponent,
    color = "#000000", // Default color if not provided
    keyName,
    children,
    onDelete,
    // New Props for Status Indicators
    hasConditions = true,
    statusIcon: StatusIcon, // Optional custom status icon
    statusTooltip, // Tooltip text for status
    rule,
  } = props;

  let Icon: ReactNode;

  if(rule?.effect == "JUMP") {
    Icon = <Split className="w-4 h-4" />
  }

  if(rule?.effect == "DISABLE") {
    Icon = <TbInputX className="w-4 h-4" />
  }

  if(rule?.effect == "ENABLE") {
    Icon = <TbInputCheck className="w-4 h-4" />
  }

  if(rule?.effect == "HIDE") {
    Icon = <TbEyeOff className="w-4 h-4" />
  }

  if(rule?.effect == "SHOW") {
    Icon = <TbEye className="w-4 h-4" />
  }


  return (
    <div
      role="group"
      className="group w-full relative flex flex-col gap-4 min-w-[100px]"
    >

      {/* Badge with Icon and Key Name */}
      <Badge
        variant="secondary"
        className="absolute bg-gray-200 dark:bg-gray-800 text-muted-foreground -top-6 right-0 px-1 text-nowrap flex items-center gap-1"
      >
        {IconComponent && (
          <IconComponent
            style={{ color }}
            className="w-4 h-4"
          />
        )}
        {keyName}

        {/* Status Indicators */}
        {hasConditions && (
          Icon
        )}
        {StatusIcon && (
          <StatusIcon
            title={statusTooltip}
            className="w-4 h-4 ml-2"
          />
        )}
      </Badge>
      <Button onClick={onDelete} variant={'outline'} size={'icon'} className="hidden border-red-500 text-red-500 group-hover:flex hover:bg-red-500 hover:text-white rounded-full absolute -right-8 top-1/2 -translate-y-1/2"><Trash /></Button>

      {/* Children */}
      {children}
    </div>
  );
}
