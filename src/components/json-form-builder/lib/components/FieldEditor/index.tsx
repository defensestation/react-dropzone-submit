import React from "react";
import { DroppableLayout } from "../json-form-field-components/Layouts/DroppableLayout";
import { LayoutType } from "../../types/dnd-types";
import { useJSONBuilderContext } from "../../context/dnd-context";

export default function FieldEditor({ className }: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  const { items } = useJSONBuilderContext();
  return (
    <>{!items.length && <div className="absolute w-full h-full top-0 left-0 flex justify-center items-center"></div>}
    <DroppableLayout
      direction={LayoutType.VERTICAL}
      id="mainContainer"
      className={className}
      isPlaceholderVisible={false}
    /></>
  );
}
