import { FormControl, FormItem } from "@/components/ui/form";
import BaseComponent from "../BaseComponent";
import { FieldProps } from "../../../../types/dnd-types";
import { useJSONBuilderContext } from "@/components/json-form-builder/lib/context/dnd-context";
import { useEffect, useRef } from "react";
import useContenteditable from "@/components/json-form-builder/lib/hooks/use-conteneditable";
import { cn } from "@/lib/utils";

export default function TextField(props: FieldProps) {
  const { updateItem } = useJSONBuilderContext();
  const isInitialMount = useRef(true);

  const { ref: titleRef, onInput: onTitleInput, onPaste: onPasteTitle } = useContenteditable({
    onChange: (val) => {
      updateItem({ ...props, title: val, labelPlaceholder: val });
    },
    preventDefault: true,
  });

  const { ref: descriptionRef, onInput: onDescriptionInput, onPaste: onPasteDescription } = useContenteditable({
    onChange: (val) => {
      updateItem({ ...props, description: val });
    },
    preventDefault: true,
    innerText: true,
  });

  const preventSpaceKeyBubbling = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  useEffect(() => {
    if (isInitialMount.current) {
      if (titleRef.current && props.labelPlaceholder)
        titleRef.current.textContent = props.labelPlaceholder;
      if (descriptionRef.current && props.description)
        descriptionRef.current.innerText = props.description;
      isInitialMount.current = false;
    }
  }, [props.labelPlaceholder, props.description, props.placeholder]);

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
              onInput={onTitleInput}
              onPaste={onPasteTitle}
              className={cn(
                "editable-placeholder text-lg font-semibold cursor-text focus:outline-none border-b border-dotted border-transparent hover:border-gray-300",
                props.required ? "after:content-['_*'] after:text-destructive" : ""
              )}
              data-placeholder={props.labelPlaceholder || "Enter the title..."}
            ></div>
            {/* Editable Description */}
            <div
              ref={descriptionRef}
              contentEditable
              suppressContentEditableWarning
              onKeyDown={preventSpaceKeyBubbling}
              onInput={onDescriptionInput}
              onPaste={onPasteDescription}
              className="editable-placeholder text-sm text-muted-foreground cursor-text focus:outline-none border-b border-dotted border-transparent hover:border-gray-300"
              data-placeholder={props.description || "Description(Markdown)"}
            ></div>
          </div>
        </FormItem>
      </FormControl>
    </BaseComponent>
  );
}
