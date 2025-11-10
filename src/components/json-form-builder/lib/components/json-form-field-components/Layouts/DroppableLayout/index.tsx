import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React from "react";
import { BuilderFieldArguments, DroppableItemProps, LayoutType } from "../../../../types/dnd-types";
import DroppableItem from "../../../dnd-components/DroppableItem";
import { useJSONBuilderContext } from "../../../../context/dnd-context";
import SortableItem from "../../../dnd-components/SortableItem";
import { renderBuilderField } from "../../Fields/utils";
import { renderLayoutElement } from "../utils";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps extends Omit<DroppableItemProps, "children" | "items"> {
  direction: LayoutType;
  isPlaceholderVisible?: boolean;
}

export const DroppableLayout = ({
  id,
  direction = LayoutType.VERTICAL,
  className,
  isPlaceholderVisible
}: LayoutProps & React.HTMLAttributes<HTMLDivElement>): React.ReactElement => {
  const { removeItem, setSelectedItem, selectedItem, getItems } =
    useJSONBuilderContext();
  const form = useForm({
    defaultValues: {
      username: "",
    },
  })
  const items = getItems(id);
  return (
    <DroppableItem
      id={id.toString()}
      className={cn(`flex gap-10 min-w-full p-8 ${direction === LayoutType.VERTICAL ? "block space-y-6" : " flex-row max-w-full overflow-x-auto"}`, className)}
    >
      <SortableContext
        items={items}
        strategy={
          direction === LayoutType.VERTICAL
            ? verticalListSortingStrategy
            : horizontalListSortingStrategy
        }
      >
        {items.length?items.map((item) => {
          const onClickItem = (e: React.MouseEvent) => {
            e.stopPropagation();
            setSelectedItem(item);
          };
          const onDeleteClick = (
            e: React.MouseEvent<SVGElement, MouseEvent>
          ) => {
            e.stopPropagation();
            removeItem(item.id);
          };
          const args: BuilderFieldArguments = {
            onDelete: onDeleteClick,
            ...item,
          };
          return (
            <SortableItem
              className="flex-1 w-full"
              data={item}
              key={item.id}
              id={item.id.toString()}
              onClick={onClickItem}
            >
              <Card style={{
                backgroundColor: item.color?`${item.color}10`:'',
              }} className={`group w-full p-4 hover:scale-[1.02] transition-all duration-300 bg-gray-100 dark:bg-card border-0 rounded-lg ${selectedItem?.id === item.id ? 'border-green-500 ' : 'border-gray-500'}`}>
                {item.isLayoutElement && (
                  <div className="flex flex-row justify-between">
                    <div className="flex flex-row gap-2 items-center">
                      <item.Icon className="w-5 h-5" style={{ color: item.color }} />
                      <p className="font-medium text-gray-500">
                        {item.title}
                      </p>
                    </div>
                  </div>
                )}
                <Form {...form}>
                  <form className="space-y-8">
                    {item.isLayoutElement
                      ? renderLayoutElement(item)
                      : renderBuilderField(args)}
                  </form>
                </Form>
                <Button onClick={args.onDelete} variant={'outline'} size={'icon'} className="hidden border-red-500 text-red-500 group-hover:flex hover:bg-red-500 hover:text-white rounded-full absolute -right-4 top-1/2 -translate-y-1/2"><Trash /></Button>

              </Card>
            </SortableItem>
          );
        }):isPlaceholderVisible && <div className="w-full flex-1 justify-center items-center"><p className="text-muted-foreground text-center">Drop elements here...</p></div>}
      </SortableContext>
    </DroppableItem>
  );
};