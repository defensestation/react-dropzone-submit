import { FormControl, FormItem } from "@/components/ui/form"
import BaseComponent from "../BaseComponent"
import { useJSONBuilderContext } from "@/components/json-form-builder/lib/context/dnd-context";
import { useEffect, useRef } from "react";
import useContenteditable from "@/components/json-form-builder/lib/hooks/use-conteneditable";
import type { FieldProps } from "@/components/json-form-builder/lib/types/dnd-types";
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
          {/* Editable Label */}
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
          {/* Input Field */}
          {/* <Input
            type="text"
            name=""
            placeholder={props.placeholder || "Placeholder will be here."}
            minLength={props.minLength}
            disabled={true}
            className="w-full mt-6 border-gray-300 focus:border-blue-500 focus:ring italic shadow-none focus:ring-blue-300 border-0 border-b rounded-none pl-0"
          /> */}
          <div
            ref={placeholderRef}
            contentEditable
            suppressContentEditableWarning
            onKeyDown={preventSpaceKeyBubbling}
            onBlur={onPlaceholderInput}
            className="editable-placeholder text-md mt-4 text-muted-foreground cursor-text focus:outline-none border-b border-b-gray-600 border-dotted border-transparent hover:border-gray-300"
            data-placeholder={props.placeholder || "Placeholder Number(optional)"}
          >
          </div>
        
        </FormItem>
      </FormControl>
    </BaseComponent>
  )
}