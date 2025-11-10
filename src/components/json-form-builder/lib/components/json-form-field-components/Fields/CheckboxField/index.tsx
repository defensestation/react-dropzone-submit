import { Checkbox } from "@/components/ui/checkbox"
import BaseComponent from "../BaseComponent"
import { FieldProps } from "../../../../types/dnd-types"
import { useJSONBuilderContext } from "@/components/json-form-builder/lib/context/dnd-context";
import { useEffect, useRef } from "react";
import useContenteditable from "@/components/json-form-builder/lib/hooks/use-conteneditable";
import { cn } from "@/lib/utils";


export default function CheckboxField(props: FieldProps) {
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
    console.log({props})
    if (isInitialMount.current) {
      if (titleRef.current && props.labelPlaceholder) titleRef.current.textContent = props.labelPlaceholder;
      if (descriptionRef.current && props.description) descriptionRef.current.textContent = props.description;
      isInitialMount.current = false;
    }
  }, [props.description, props.placeholder]);

  return (
    <BaseComponent {...props}>
      <div className="flex items-center space-x-2">
        <Checkbox
          disabled
          id={`checkbox-${props.title?.replace(/\s+/g, '-').toLowerCase()}`}
          color={props.color}
        // style={{color: props.color}} 
        />
        <div>
          <div
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            onKeyDown={preventSpaceKeyBubbling}
            onBlur={onTitleInput}
            className={cn("editable-placeholder text-lg font-semibold cursor-text focus:outline-none border-b border-dotted border-transparent hover:border-gray-300", props.required ? "after:content-['_*'] after:text-destructive" : "")}
            data-placeholder={props.labelPlaceholder || "Your statement here..."}
          >
          </div>

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
      </div>
    </BaseComponent>
  )
}