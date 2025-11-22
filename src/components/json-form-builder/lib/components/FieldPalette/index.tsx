import React, { useState, type ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import { CardTitle } from "@/components/ui/card";
import { type FieldItemType } from "../../types/common-types";
import DraggableItem, { type DraggableProps } from "../dnd-components/DraggableItem";
import { useJSONBuilderContext } from "../../context/dnd-context";
import { cn } from "@/lib/utils";
import {
  type CategoryData,
  CHOICE_FIELDS,
  CONTACT_INFO_FIELDS,
  LAYOUT_FIELDS,
  OTHER_FIELDS,
  TEXT_AND_FILES_FIELDS,
} from "../../constants/fields";
import { GripVertical, LayoutGrid, Search, X } from "lucide-react";
import { FloatingLabelInput } from "@/components/ui/floating-input";
import { type Item } from "../../types/dnd-types";

type CustomFieldPaletteItem = {
  addItem: (item: Item) => void;
};

type FieldPaletteProps = {
  fields?: FieldItemType[];
  CustomFieldPaletteItem?: React.ComponentType<FieldItemType & CustomFieldPaletteItem>;
  onClickActionMenu?: () => void;
};



const ColoredPaletteElement = ({
  iconColor,
  onClick,
  dragHandleProps,
  ...props
}: FieldItemType & { iconColor: string; onClick: () => void } & { dragHandleProps: DraggableProps }) => {
  const { attributes, listeners, setNodeRef } = dragHandleProps;
  const IconComponent = props.Icon;
  return (
    <div
      ref={dragHandleProps.setNodeRef}
      onClick={onClick}
      className="flex items-center justify-between gap-2 px-2 py-0 rounded-md border hover:bg-accent cursor-pointer text-sm"
      
    >
      <div className="flex gap-2 items-center">
        {IconComponent && <IconComponent className="w-4 h-4" color={iconColor} />}
        <span className="text-xs">{props.title}</span>
      </div>
      <div {...attributes} {...listeners} className="p-1 hover:bg-gray-700/10 dark:hover:bg-accent rounded-lg">
        <GripVertical className="w-4 h-6" />
      </div>
    </div>
  );
};

const FieldCategory = ({
  title,
  fields,
  color,
  CustomFieldPaletteItem,
  addItem,
}: CategoryData & {
  CustomFieldPaletteItem?: React.ComponentType<FieldItemType & CustomFieldPaletteItem>;
  addItem: (item: Item) => void;
}) => {
  return (
    <div className="w-full">
      <div className="pb-2 flex">
        <CardTitle className="font-medium text-md flex items-center gap-2 flex-1 pl-1">
          {title}
        </CardTitle>
      </div>
      <div>
        <div className="grid grid-cols-1 gap-2">
          {fields.map((field) => {
            const id = uuidv4();
            return (
              <DraggableItem
                key={id}
                id={id}
                data={{ ...field, id, fromPallete: true, color: color }}
              >
                {(dragHandleProps) =>
                  CustomFieldPaletteItem ? (
                    <CustomFieldPaletteItem {...field} addItem={addItem} {...dragHandleProps} />
                  ) : (
                    <ColoredPaletteElement
                      dragHandleProps={dragHandleProps}
                      {...field}
                      onClick={() => addItem({...field, color: color})}
                      iconColor={color}
                    />
                  )
                }
              </DraggableItem>
            );
          })}
        </div>
      </div>
    </div>
  );
};


export default function FieldPalette({
  CustomFieldPaletteItem,
  className,
  onClickActionMenu,
}: Omit<FieldPaletteProps, "fields"> & React.HTMLAttributes<HTMLDivElement>) {
  const { sidebarKey, addItem } = useJSONBuilderContext();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const categories: CategoryData[] = [
    CONTACT_INFO_FIELDS,
    TEXT_AND_FILES_FIELDS,
    LAYOUT_FIELDS,
    CHOICE_FIELDS,
    OTHER_FIELDS,
  ];

  // Filter categories based on search query
  const filteredCategories = categories
    .map((category) => ({
      ...category,
      fields: category.fields.filter((field) =>
        field.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.fields.length > 0);

    const handleClear = () => {
      setSearchQuery('');
    };

  return (
    <>
      {/* Search Bar */}
      <div className="relative col-span-4 mb-4">
      <FloatingLabelInput
        id="palette-search"
        label="Search"
        value={searchQuery}
        onChange={handleSearchChange}
        className="w-full"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
        {searchQuery ? (
          <X 
            className="w-4 h-4 text-gray-500 hover:text-gray-700 transition-colors" 
            onClick={handleClear}
          />
        ) : (
          <Search className="w-4 h-4 text-gray-500" />
        )}
      </div>
    </div>
      <div
        key={sidebarKey?.toString()}
        className={cn("relative grid grid-cols-3 gap-4 p-4 space-y-3", className)}
      >
        {/* Render Filtered Categories */}
        {filteredCategories.map((category) => (
          <FieldCategory
            key={category.title}
            {...category}
            CustomFieldPaletteItem={CustomFieldPaletteItem}
            addItem={addItem}
          />
        ))}
        {onClickActionMenu && <LayoutGrid className="w-4 h-4 absolute right-2 top-0 cursor-pointer" onClick={onClickActionMenu} />}
      </div>
    </>
  );
}
