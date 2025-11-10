import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import BaseComponent from "../BaseComponent"
import { FieldProps } from "../../../../types/dnd-types"
import { useJSONBuilderContext } from "@/components/json-form-builder/lib/context/dnd-context";

import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useEffect, useRef } from "react";
import useContenteditable from "@/components/json-form-builder/lib/hooks/use-conteneditable";
import { cn } from "@/lib/utils";


export default function DateField(props: FieldProps) {
  const { updateItem } = useJSONBuilderContext();
  const isInitialMount = useRef(true);
  const { ref: titleRef, onInput: onTitleInput } = useContenteditable({
    onChange: (val) => {
      updateItem({ ...props, title: val, labelPlaceholder: val})
    },
    preventDefault: true
  });
  const { ref: descriptionRef, onInput: onDescriptionInput } = useContenteditable({
    onChange: (val) => {
      updateItem({ ...props, description: val })
    },
    preventDefault: true
  });

  const preventSpaceKeyBubbling = (e: React.KeyboardEvent<HTMLDivElement>) => {
      e.stopPropagation(); // Stop the event from bubbling up
  };

  useEffect(() => {
    console.log({ props })
    if (isInitialMount.current) {
      if (titleRef.current && props.labelPlaceholder) titleRef.current.textContent = props.labelPlaceholder;
      if (descriptionRef.current && props.description) descriptionRef.current.textContent = props.description;
      isInitialMount.current = false;
    }
  }, [props.description, props.placeholder]);

  return (
    <BaseComponent {...props}>
      <FormControl>
        <FormItem>

          <div>
            <div
              ref={titleRef}
              contentEditable
              suppressContentEditableWarning
              onKeyDown={preventSpaceKeyBubbling}
              onBlur={onTitleInput}
              className={cn("editable-placeholder text-lg font-semibold cursor-text focus:outline-none border-b border-dotted border-transparent hover:border-gray-300", props.required ? "after:content-['_*'] after:text-destructive" : "")}
              data-placeholder={props.labelPlaceholder || "Your Date Label here..."}
            >

            </div>
            {/* Editable Description */}
            <div
              ref={descriptionRef}
              contentEditable
              suppressContentEditableWarning
              onKeyDown={preventSpaceKeyBubbling}
              onBlur={onDescriptionInput}
              className="editable-placeholder text-sm text-muted-foreground cursor-text focus:outline-none border-b border-dotted border-transparent hover:border-gray-300"
              data-placeholder={props.description || "Description(Optional)"}
            >

            </div>

          </div>


          <Popover>
            <PopoverTrigger disabled asChild>
              <Button
                variant={"outline"}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 border rounded-md"
              >
                <CalendarIcon className="h-4 w-4" />
                <span>Pick a date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4 bg-white shadow-lg rounded-md" align="start">
              <Calendar
                mode="single"
                disabled
                captionLayout="dropdown-buttons"
                classNames={{
                  caption_label: "hidden",
                  caption_dropdowns: "flex gap-2 mb-4",
                  dropdown: "border p-2 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                  dropdown_month: "w-40",
                  dropdown_year: "w-24",
                  head_cell: "w-10 h-10 font-normal text-gray-500",
                  cell: "w-10 h-10 text-center p-0 relative focus-within:relative focus-within:z-20",
                  day: "w-10 h-10 p-0 font-normal hover:bg-gray-100 rounded-md",
                  day_selected: "bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white"
                }}
                fromDate={new Date(1950, 0, 1)}
                toDate={new Date(2100, 11, 31)}
                initialFocus
              />
            </PopoverContent>
          </Popover>


          {props.description && <FormDescription>{props.description}</FormDescription>}
        
        </FormItem>
      </FormControl>
    </BaseComponent>
  )
}