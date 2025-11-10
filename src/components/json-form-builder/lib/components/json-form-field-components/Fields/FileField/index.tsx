import { Input } from "@/components/ui/input"
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import BaseComponent from "../BaseComponent"
import { FieldProps } from "../../../../types/dnd-types"
import { cn } from "@/lib/utils"

export default function FileField(props: FieldProps) {
  return (
    <BaseComponent {...props}>
      <FormControl>
        <FormItem>
          <FormLabel className={cn("", props.required ? "after:content-['_*'] after:text-destructive" : "")}>{props.title}</FormLabel>
          <Input 
            type="file"
            name=""
            placeholder={props.placeholder}
            minLength={props.minLength}
            isDisabled={true}
          />
          {props.description && <FormDescription>{props.description}</FormDescription>}
       
        </FormItem>
      </FormControl>
    </BaseComponent>
  )
}