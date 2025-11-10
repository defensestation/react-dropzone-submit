import React from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import { FieldItemType } from "../../types/common-types";
import { Card, CardContent } from "@/components/ui/card";

type BoxProps = {
  onDelete?: (id: UniqueIdentifier) => void;
};

export default function PaletteElement({
  title,
  Icon,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & FieldItemType & BoxProps): React.ReactElement {
  return (
    <Card {...rest}>
      <CardContent className="p-6">
        <div className="gap-2 w-full flex flex-col justify-center items-center">
          {Icon && <Icon className="w-6 h-5 text-green-500" />}
          <p>{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
