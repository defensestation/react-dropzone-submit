import { useEffect, useRef, useState } from "react";
import {
  FormControl,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { FieldProps } from "../../../../types/dnd-types";
import BaseComponent from "../BaseComponent";
import { useJSONBuilderContext } from "@/components/json-form-builder/lib/context/dnd-context";
import { TrashIcon, PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import useContenteditable from "@/components/json-form-builder/lib/hooks/use-conteneditable";
import { cn } from "@/lib/utils";

export default function SelectField(props: FieldProps) {
  const { updateItem } = useJSONBuilderContext();
  const [newOption, setNewOption] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const isInitialMount = useRef(true);
  const { ref: titleRef, onInput: onTitleInput } = useContenteditable({
    onChange: (val) => {
      updateItem({ ...props, title: val, labelPlaceholder: val })
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
    if (isInitialMount.current) {
      if (titleRef.current && props.labelPlaceholder) titleRef.current.textContent = props.labelPlaceholder
      if (descriptionRef.current && props.description) descriptionRef.current.textContent = props.description
      if (placeholderRef.current && props.placeholder) placeholderRef.current.textContent = props.placeholder
      isInitialMount.current = false;
    }

  }, [props.labelPlaceholder, props.description, props.placeholder])

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...(props.options || [])];
    const otherOptions = updatedOptions.filter((_, i) => i !== index);

    if (otherOptions.includes(value)) {
      setErrorMessage("This option already exists");
      return;
    }

    if (value == '') {
      setErrorMessage("option can't be empty");
      return;
    }

    updatedOptions[index] = value;
    updateItem({ ...props, options: updatedOptions });
    setErrorMessage("");
  };

  const handleAddOption = () => {
    const trimmedOption = newOption.trim();
    if (trimmedOption) {
      if ((props.options || []).includes(trimmedOption)) {
        setErrorMessage("This option already exists");
        return;
      }

      const updatedOptions = [...(props.options || []), trimmedOption];
      updateItem({ ...props, options: updatedOptions });
      setNewOption("");
      setErrorMessage("");
    }
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = (props.options || []).filter((_, i) => i !== index);
    updateItem({ ...props, options: updatedOptions });
    setErrorMessage("");
  };

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
              onInput={onTitleInput}
              className={cn("editable-placeholder text-lg font-semibold cursor-text focus:outline-none border-b border-dotted border-transparent hover:border-gray-300", props.required ? "after:content-['_*'] after:text-destructive" : "")}
              data-placeholder={props.labelPlaceholder || "Your Label here..."}
            >
            </div>
            <div
              ref={descriptionRef}
              contentEditable
              suppressContentEditableWarning
              onKeyDown={preventSpaceKeyBubbling}
              onInput={onPlaceholderInput}
              className="editable-placeholder text-sm text-muted-foreground cursor-text focus:outline-none border-b border-dotted border-transparent hover:border-gray-300 mt-1"
              data-placeholder={props.description || "Placeholder (Optional)"}
            >
            </div>
            <div
              ref={descriptionRef}
              contentEditable
              suppressContentEditableWarning
              onKeyDown={preventSpaceKeyBubbling}
              onInput={onDescriptionInput}
              className="editable-placeholder text-sm text-muted-foreground cursor-text focus:outline-none border-b border-dotted border-transparent hover:border-gray-300 mt-1"
              data-placeholder={props.description || "Description (Optional)"}
            >
            </div>
          </div>

          <div className="mt-4">
            {(props.options || []).map((option, index) => (
              <div
                key={index}
                className="flex items-center mb-2 space-x-2"
              >
                <Input
                  type="text"
                  value={option}
                  onKeyDown={preventSpaceKeyBubbling}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 border rounded p-2 text-sm dark:border-white"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="text-red-500 hover:text-red-700"
                  aria-label={`Remove option ${index + 1}`}
                >
                  <TrashIcon size={18} />
                </button>
              </div>
            ))}

            <div className="flex items-center mt-2 space-x-2">
              <Input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Type new option and press Enter to add"
                className="flex-1 border rounded p-2 text-sm dark:border-white"
                onKeyDown={(e) => {
                  preventSpaceKeyBubbling(e)
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddOption();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddOption}
                className="text-green-500 hover:text-green-700"
                aria-label="Add option"
              >
                <PlusIcon size={18} />
              </button>
            </div>

            {errorMessage && (
              <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
            )}
          </div>

        </FormItem>
      </FormControl>
    </BaseComponent>
  );
}