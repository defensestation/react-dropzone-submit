import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useJSONBuilderContext } from "../../context/dnd-context";
import type { CustomRule, Item } from "../../types/dnd-types";
import { zodResolver } from "@hookform/resolvers/zod"
import { type Control, useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "../ui/separator";
import { Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import QueryBuilder from "../query-builder";
import { type FIELD_KEYS, FIELD_MAP } from "../../constants/fields";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { stopEnterPropagation } from "@/lib/functions";

export const JsonSchemaSchema: z.ZodType<any> = z.lazy(() =>
  z.any().optional(),
);

const valuesSchema = z
  .object({
    key: z.string().max(255, "Key cannot be longer than 255 characters").min(1, "Key is required"),
    title: z.string().max(255, "Title cannot be longer than 255 characters").min(1, "Title is required"),
    placeholder: z.string().max(255).optional(),
    description: z.string().max(255).optional(),
    helperText: z.string().max(255).optional(),
    required: z.boolean().optional(),
    jumpTo: z.string().max(255).optional(),
    jumptToEquals: z.string().max(255).optional(),
    minLength: z
      .number()
      .int("Minimum Length must be an integer")
      .positive("Minimum Length must be a positive number")
      .min(0, "Minimum Length must be greater than or equal to 0")
      .optional(),
    maxLength: z
      .number()
      .int("Maximum Length must be an integer")
      .positive("Maximum Length must be a positive number")
      .optional(),
    minimum: z.number().int("Minimum Value must be an integer").optional(),
    maximum: z.number().int("Maximum Value must be an integer").optional(),
    minDate: z.date().optional(),
    maxDate: z.date().optional(),
    readonly: z.boolean().optional(),
    secret: z.boolean().optional(),
    pattern: z
      .string()
      .optional()
      .refine((value) => {
        if (!value) return true;
        try {
          new RegExp(value);
          return true;
        } catch (e) {
          return false;
        }
      }, "Invalid regular expression"),
    patternMessage: z.string().max(255).optional(),
    rule: z.any().optional(),
  })
  .refine(
    (data) => {
      if (data.maxLength !== undefined && data.minLength !== undefined && data.maxLength < data.minLength) {
        return false;
      }
      return true;
    },
    {
      message: "Maximum Length must be greater than or equal to Minimum Length",
      path: ["maxLength"],
    }
  )
  .refine(
    (data) => {
      if (data.maximum !== undefined && data.minimum !== undefined && data.maximum <= data.minimum) {
        return false;
      }
      return true;
    },
    {
      message: "Maximum Value must be greater than Minimum Value",
      path: ["maximum"],
    }
  )
  .refine(
    (data) => {
      if (data.maxDate !== undefined && data.minDate !== undefined && data.maxDate < data.minDate) {
        return false;
      }
      return true;
    },
    {
      message: "Date must be after the minimum date",
      path: ["maxDate"],
    }
  );

// Define the LayoutValues schema
const layoutValuesSchema = z.object({
  type: z
    .string()
    .min(1, "Type is required")
    .refine((value) => ["Group", "VerticalLayout", "HorizontalLayout"].includes(value), {
      message: "Type must be one of 'Group', 'VerticalLayout', or 'HorizontalLayout'",
    })
  ,
  title: z.string().min(1, "Title is required"),
});

type Values = {
  key: string;
  title: string;
  type: string;
  placeholder: string;
  description: string;
  helperText: string;
  required: boolean;
  secret: boolean;
  pattern?: string;
  patternMessage?: string;
  minLength: number | undefined;
  maxLength: number | undefined;
  minimum: number | undefined;
  maximum: number | undefined;
  minDate: string | undefined;
  maxDate: string | undefined;
  readonly: boolean | undefined;
  options?: string[];
  rule: CustomRule | undefined;
};

type LayoutValues = {
  type: "layout";
  title: string;
} & Partial<Omit<Values, "type" | "title">>;

type FieldValues = {
  type: Exclude<string, "layout">;
} & Values;

const INITIAL_FORM_DATA: LayoutValues | FieldValues = {
  key: "",
  title: "",
  type: "",
  placeholder: "",
  description: "",
  helperText: "",
  secret: false,
  required: false,
  minLength: undefined,
  maxLength: undefined,
  readonly: false,
  pattern: "",
  patternMessage: "",
  minimum: undefined,
  minDate: undefined,
  maxDate: undefined,
  maximum: undefined,
  rule: undefined,
};

interface SelectOptionsProps {
  control: Control<any>;
  name?: string;
}



const SelectOptions: React.FC<SelectOptionsProps> = ({
  control,
  name = 'options'
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Options</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ label: "", value: "" })}
        >
          Add Option
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center space-x-2 mb-2">
          <div className="flex-1">
            <FormField
              control={control}
              name={`${name}.${index}.label`}
              render={({ field: inputField, fieldState: { error } }) => (
                <FormItem>
                  <FormControl>
                    <Input {...inputField}
                      placeholder="Label"
                      className={error ? 'border-destructive' : ''} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex-1">
            <FormField
              control={control}
              name={`${name}.${index}.value`}
              render={({ field: inputField, fieldState: { error } }) => (
                <FormItem>
                  <FormControl>
                    <Input {...inputField}
                      placeholder="Value"
                      className={error ? 'border-destructive' : ''} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {fields.length > 1 && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

let autoSaveTimer: any = undefined;

export default function FieldProperties(): React.ReactElement | null {
  const { selectedItem, setSelectedItem, updateItem, removeItem, items, jsonSchema, uiSchema } = useJSONBuilderContext();
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [formData, setFormData] = useState<LayoutValues | FieldValues>(
    INITIAL_FORM_DATA
  );
  const validationConditions = useMemo(() => {
    const key = Object.keys(FIELD_MAP).find((key) => {
      const field = FIELD_MAP[key as FIELD_KEYS];
      if (field.type == selectedItem?.type && field.dsType == selectedItem.dsType) {
        return true;
      }
      return false;
    })
    if (key) {
      return FIELD_MAP[key as FIELD_KEYS].validations
    }
    else {
      return {}
    }
  }, [selectedItem])
  const isPatterEnabled = useMemo(() => {
    const key = Object.keys(FIELD_MAP).find((key) => {
      const field = FIELD_MAP[key as FIELD_KEYS];
      if (field.type == selectedItem?.type && field.dsType == selectedItem.dsType) {
        return true;
      }
      return false;
    })
    if (key) {
      return FIELD_MAP[key as FIELD_KEYS].enablePattern
    }
    else {
      return false
    }
  }, [selectedItem])
  const form = useForm<LayoutValues | FieldValues>({
    resolver: zodResolver(selectedItem?.isLayoutElement ? layoutValuesSchema : valuesSchema),
    defaultValues: INITIAL_FORM_DATA,
    mode: "onChange"
  });
  const selectedItemRef = useRef(selectedItem); // Ref to track form submissions without causing re-renders

  // Effect hook to sync the state with ref
  useEffect(() => {
    selectedItemRef.current = selectedItem; // Update ref with the current state value
  }, [selectedItem]); // This effect runs whenever submitCount changes

  const onSubmit = useCallback((values: LayoutValues | FieldValues) => {
    const currentSelectedItem = selectedItemRef.current;
    if (currentSelectedItem) {
      console.log({values})
      let updatedItem: Item = {
        ...currentSelectedItem,
        title: values.title,
        keyName: values.key ? values.key : "",
      };
      if (currentSelectedItem.type !== "layout") {
        updatedItem = {
          ...updatedItem,
          required: values.required,
          description: values.description,
          placeholder: values.placeholder,
          helperText: values.helperText,
        };
        if (values.minLength !== undefined)
          updatedItem.minLength = values.minLength;
        if (values.maxLength !== undefined)
          updatedItem.maxLength = values.maxLength;
        if (values.minimum !== undefined) updatedItem.minimum = values.minimum;
        if (values.maximum !== undefined) updatedItem.maximum = values.maximum;
        if (
          currentSelectedItem.type == "string" &&
          (currentSelectedItem.format == undefined ||
            currentSelectedItem.format == "password")
        ) {
          updatedItem.format = values.secret || selectedItem?.format == "password" ? "password" : undefined;
        }
        if (values.pattern) {
          updatedItem.pattern = values.pattern;
          if (values.patternMessage) {
            updatedItem.patternMessage = values.patternMessage;
          }
        }
        if (values.rule) {
          updatedItem.rule = values.rule;
        }
        if (currentSelectedItem.format === "date") {
          if (values.minDate !== undefined)
            updatedItem.minDate = values.minDate;
          if (values.maxDate !== undefined)
            updatedItem.maxDate = values.maxDate;
        }
        if (values.readonly) updatedItem.readonly = values.readonly;
        // if (values.options?.length)
        //   updatedItem.options = values.options.map((option) => ({
        //     const: option.value,
        //     title: option.value,
        //   }));
      }
      if (currentSelectedItem.type === "layout") {
        updatedItem = {
          ...updatedItem,
          type: values?.type,
        };
      }
      console.log({updatedItem})
      updateItem(updatedItem);
    }
  }, [updateItem]);


  React.useEffect(() => {
    // Subscribe to form changes and trigger submit
    const subscription = form.watch((formValues) => {
      console.log("Values changesd", formValues.key)
      setIsInitialized(true);
      // Optional: Add conditions to control when submit occurs
      if ((formValues.key || (formValues.type == "Group" && formValues.title)) && isInitialized) {
        form.handleSubmit(onSubmit)();
      }
    });

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, [form, isInitialized, onSubmit]);


  const clearAutoSaveTimeout = () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    autoSaveTimer = undefined;
  };

  useEffect(() => {
    form.reset()
    clearAutoSaveTimeout();
    setIsInitialized(false)
    const updatedValues: LayoutValues | FieldValues = {
      description: selectedItem?.description ? selectedItem.description : "",
      helperText: selectedItem?.helperText ? selectedItem.helperText : "",
      maximum: selectedItem?.maximum ? selectedItem.maximum : undefined,
      maxLength: selectedItem?.maxLength ? selectedItem?.maxLength : undefined,
      minimum: selectedItem?.minimum ? selectedItem?.minimum : undefined,
      minLength: selectedItem?.minLength ? selectedItem?.minLength : undefined,
      minDate: selectedItem?.minDate ? selectedItem?.minDate : undefined,
      maxDate: selectedItem?.maxDate ? selectedItem?.maxDate : undefined,
      placeholder: selectedItem?.placeholder ? selectedItem?.placeholder : "",
      required: selectedItem?.required ? true : false,
      title: selectedItem?.title ? selectedItem?.title : "",
      readonly: selectedItem?.readonly ? true : false,
      secret: selectedItem?.format == "password" ? true : false,
      type: selectedItem?.type ? selectedItem?.type : "",
      key: selectedItem?.keyName ? selectedItem?.keyName : "",
      pattern: selectedItem?.pattern ? selectedItem.pattern : "",
      patternMessage: selectedItem?.patternMessage ? selectedItem.patternMessage : "",
      rule: selectedItem?.rule?.condition?.scope ? selectedItem.rule : undefined,
      options: selectedItem?.options?.length
        ? selectedItem.options
        : [],
    }
    setFormData(updatedValues);
    form.reset(updatedValues)
  }, [selectedItem?.id, selectedItem?.title, selectedItem?.placeholder]);

  const currentRule = form.watch('rule')

  return (
    <div className="w-full" onKeyDown={stopEnterPropagation}>
      {selectedItem &&
        formData &&
        ((selectedItem.isLayoutElement && selectedItem.type === "Group") ||
          !selectedItem.isLayoutElement) ? (

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-3">
              {selectedItem.type == 'Group' && <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription> It will be displayed above the field.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />}

              {!selectedItem.isLayoutElement && (
                <>
                  <FormField
                    control={form.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">Field Key</FormLabel>
                        <FormControl>
                          <Input {...field} className="border-primary border" />
                        </FormControl>
                        <FormDescription>The key name used in the data object of the form
                          output.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {validationConditions?.required && <FormField
                    control={form.control}
                    name="required"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Required</FormLabel>
                          <FormDescription>
                            When enabled user will have to enter the value.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />}
                  {validationConditions?.secret && selectedItem.type === "string" &&
                    !selectedItem.multiline &&
                    (selectedItem.format == undefined ||
                      selectedItem.format == "password") && (
                      <FormField
                        control={form.control}
                        name="secret"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Secret</FormLabel>
                              <FormDescription>
                                Make the field confidential.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  {validationConditions?.readonly && <FormField
                    control={form.control}
                    name="readonly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Read Only</FormLabel>
                          <FormDescription>
                            It will disable the field.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />}

                  {/* {validationConditions?.helperText && <FormField
                    control={form.control}
                    name="helperText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Helper Text</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>It will be displayed below the field.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />} */}
                  <Separator orientation="horizontal" />
                  <Accordion type="single" defaultValue="advance-settings">
                    <AccordionItem value="advance-settings" className="border-none py-1">
                      <AccordionTrigger className="pt-1">Advance Settings</AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        {validationConditions?.regex && isPatterEnabled && <FormField
                          control={form.control}
                          name="pattern"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Regex Pattern</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="^[a-zA-Z0-9]+$" />
                              </FormControl>
                              <FormDescription>
                                Enter a valid regular expression pattern for validation (e.g., ^[a-zA-Z0-9]+$ for alphanumeric only)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />}
                        {validationConditions?.regex && isPatterEnabled && (
                          <FormField
                            control={form.control}
                            name="patternMessage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Regex Error Message</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormDescription>This will be shown when when regex does not match.</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        {validationConditions?.min && selectedItem.type === "string" &&
                          selectedItem.format !== "enum" &&
                          selectedItem.format !== "radio" &&
                          selectedItem.format !== "date" &&
                          selectedItem.format !== "file" && (
                            <FormField
                              control={form.control}
                              name="minLength"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Minimum</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                  </FormControl>
                                  <FormDescription>Minimum character length for field.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        {validationConditions?.min && (selectedItem.type === "number" ||
                          selectedItem.type === "integer") && (
                            <FormField
                              control={form.control}
                              name="minimum"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Minimum</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                  </FormControl>
                                  <FormDescription>Minimum value for field.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        {validationConditions?.min && selectedItem.type === "string" &&
                          selectedItem.format === "date" && (
                            <FormField
                              control={form.control}
                              name="minDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormDescription>Start date of the field.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        {validationConditions?.max && selectedItem.type === "string" &&
                          selectedItem.format !== "enum" &&
                          selectedItem.format !== "radio" &&
                          selectedItem.format !== "date" &&
                          selectedItem.format !== "file" && (
                            <FormField
                              control={form.control}
                              name="maxLength"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Maximum</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                  </FormControl>
                                  <FormDescription>Maximum character length for field.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        {validationConditions?.max && (selectedItem.type === "number" ||
                          selectedItem.type === "integer") && (
                            <FormField
                              control={form.control}
                              name="maxLength"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Maximum</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                  </FormControl>
                                  <FormDescription> Maximum value for field.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        {validationConditions?.max && selectedItem.type === "string" &&
                          selectedItem.format === "date" && (
                            <FormField
                              control={form.control}
                              name="maxDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>End Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormDescription>End date for the field.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        {selectedItem.id && !selectedItem.isLayoutElement && <><Separator orientation="horizontal" />
                          <QueryBuilder items={items} onChange={rule => form.setValue('rule', rule)} initialValue={currentRule} jsonSchema={jsonSchema} uiSchema={uiSchema} onRemoveCondition={() => form.setValue('rule', undefined)} />
                        </>}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </>
              )}
            </div>
          </form>
        </Form>
      ) : null}
    </div>
  );
}
