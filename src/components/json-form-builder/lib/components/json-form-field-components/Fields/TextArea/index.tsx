import { FormControl, FormItem } from "@/components/ui/form";

import { FieldProps } from "../../../../types/dnd-types";
import BaseComponent from "../BaseComponent";
import { useJSONBuilderContext } from "@/components/json-form-builder/lib/context/dnd-context";
import { useEffect, useRef } from "react";
import useContenteditable from "@/components/json-form-builder/lib/hooks/use-conteneditable";
import { cn } from "@/lib/utils";


export default function TextArea(props: FieldProps) {
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

  const { ref: placeholderRef, onInput: onPlaceholderInput } = useContenteditable({
    onChange: (val) => {
      updateItem({ ...props, placeholder: val })
    },
    preventDefault: true
  });

  const preventSpaceKeyBubbling = (e: React.KeyboardEvent<HTMLDivElement>) => {
      e.stopPropagation(); // Stop the event from bubbling up
  };

  useEffect(() => {
    console.log("hasjdjaskjdlkasjdasd")
    if (isInitialMount.current) {
      if(titleRef.current && props.labelPlaceholder) titleRef.current.textContent = props.labelPlaceholder
      if(descriptionRef.current && props.description) descriptionRef.current.textContent = props.description
      if(placeholderRef.current && props.placeholder) placeholderRef.current.textContent = props.placeholder
      isInitialMount.current = false;
    }
    
  }, [props.title, props.description, props.placeholder])
  
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
              data-placeholder={props.labelPlaceholder || "Your question here..."}
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

          <div
              ref={placeholderRef}
              contentEditable
            suppressContentEditableWarning
            onKeyDown={preventSpaceKeyBubbling}
            onBlur={onPlaceholderInput}
            className="editable-placeholder text-md mt-4 text-muted-foreground cursor-text focus:outline-none border-b border-b-gray-600 border-dotted border-transparent hover:border-gray-300"
            data-placeholder={props.placeholder || "Placeholder(optional)"}
            
          >
            {props.placeholder}
          </div>
      
        </FormItem>
      </FormControl>

    </BaseComponent>
  );
}