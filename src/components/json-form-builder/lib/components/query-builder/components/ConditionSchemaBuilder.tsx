import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FaTimes } from "react-icons/fa";
import { CustomRuleEffect, Item } from "../../../types/dnd-types";
import { useJSONBuilderContext } from "../../../context/dnd-context";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format as DateFnsFormat } from "date-fns"
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

type ConditionSchemaBuilderProps = {
  value?: any; // JSON schema
  onChange: (schema: any) => void;
  fields: string[];
  items: Item[];
  effect: CustomRuleEffect;
};

function ConditionSchemaBuilder({
  value,
  onChange,
  fields,
  items = [],
  effect,
}: ConditionSchemaBuilderProps) {
  const { selectedItem } = useJSONBuilderContext();

  // Define condition types
  type ConditionType =
    | "isEqual"
    | "isNotEqual"
    | "beginsWith"
    | "endsWith"
    | "contains"
    | "doesNotContain"
    | "enum"
    | "range"
    | "all";

  // Helper function to get field type based on keyName or dsType
  const getFieldTypeInfo = (fieldItem: Item | undefined) => {
    if (!fieldItem) return { type: "string", dsType: "", format: "" };

    // Map field names to their types based on your field list
    const fieldTypeMap: Record<string, { type: string; dsType: string; format?: string }> = {
      // Contact Information
      "Email": { type: "string", dsType: "email", format: "email" },
      "Phone Number": { type: "string", dsType: "phone" },
      "Secret": { type: "string", dsType: "password", format: "password" },

      // Text & Files
      "Input": { type: "string", dsType: "text" },
      "TextArea": { type: "string", dsType: "textarea" },
      "File": { type: "string", dsType: "file" },

      // Layout (these don't have conditions typically)
      "Label": { type: "layout", dsType: "label" },
      "Horizontal": { type: "layout", dsType: "horizontal" },
      "Vertical": { type: "layout", dsType: "vertical" },
      "Group": { type: "layout", dsType: "group" },

      // Choice Fields
      "Checkbox": { type: "boolean", dsType: "checkbox" },
      "Dropdown": { type: "string", dsType: "dropdown", format: "enum" },
      "Radio": { type: "string", dsType: "radio", format: "enum" },

      // Other Fields
      "Number Input": { type: "number", dsType: "number" },
      "Integer Input": { type: "integer", dsType: "integer" },
      "Date": { type: "string", dsType: "date", format: "date" },
      "IPv4": { type: "string", dsType: "ipv4", format: "ipv4" },
      "SIN Number": { type: "string", dsType: "sin" },
    };

    // First try to match by keyName
    const mappedType = fieldTypeMap[fieldItem.keyName];
    if (mappedType) {
      return mappedType;
    }

    // Fall back to the item's own type/dsType/format
    return {
      type: fieldItem.type || "string",
      dsType: fieldItem.dsType || "",
      format: fieldItem.format || ""
    };
  };

  // Helper function to get available conditions based on field type
  const getAvailableConditions = (fieldItem: Item | undefined): ConditionType[] => {
    if (!fieldItem) return ["isEqual", "isNotEqual"];

    const fieldInfo = getFieldTypeInfo(fieldItem);
    const { type, dsType, format } = fieldInfo;

    // Layout elements typically don't have conditions
    if (type === "layout" || fieldItem.isLayoutElement) {
      return []; // No conditions for layout elements
    }

    const baseConditions: ConditionType[] = ["isEqual", "isNotEqual"];

    switch (type) {
      case "boolean":
        // Boolean fields (checkbox) can only be true/false
        return ["isEqual"];

      case "number":
      case "integer":
        // Numeric fields support equality and range conditions
        return [...baseConditions, "range"];

      case "string":
        switch (dsType) {
          case "checkbox":
            // Checkbox is boolean, only equality
            return ["isEqual"];

          case "dropdown":
          case "radio":
            // Choice fields support equality and enum conditions
            return [...baseConditions, "enum"];

          case "email":
          case "phone":
          case "password":
          case "ipv4":
          case "sin":
            // Formatted string fields support text-based conditions
            return [
              ...baseConditions,
              "beginsWith",
              "endsWith",
              "contains",
              "doesNotContain",
              "enum"
            ];

          case "date":
            // Date fields support equality and range conditions
            return [
              ...baseConditions,
              // "range"
            ];

          case "file":
            // File fields might only support equality (filename)
            return [...baseConditions, "contains", "doesNotContain"];

          case "text":
          case "textarea":
          default:
            // Regular text fields support all text-based conditions
            return [
              ...baseConditions,
              "beginsWith",
              "endsWith",
              "contains",
              "doesNotContain",
              "enum"
            ];
        }

      default:
        // Default to basic text conditions
        return [
          ...baseConditions,
          "beginsWith",
          "endsWith",
          "contains",
          "doesNotContain",
          "enum"
        ];
    }
  };

  // Helper function to parse schema into internal state
  const parseSchema = (schema: any) => {
    console.log({ schema });
    if (schema.enum) {
      return {
        conditionType: "enum",
        selectedField: Object.keys(schema?.properties)?.[0] || "",
        enumValues: schema.enum.map((val: any) => String(val)),
      };
    }
    if (schema.allOf || schema.anyOf) {
      return {
        conditionType: "all",
        subConditions: (schema.allOf || schema.anyOf).map((sub: any) => sub),
      };
    }
    // Handle other condition types based on schema
    const field = Object.keys(schema?.properties)?.[0] || "";
    const condition = schema?.properties?.[field];
    if (condition.const !== undefined) {
      return {
        conditionType: "isEqual",
        selectedField: field,
        constValue: String(condition.const),
      };
    }
    if (condition.not && condition.not.const !== undefined) {
      return {
        conditionType: "isNotEqual",
        selectedField: field,
        constValue: String(condition.not.const),
      };
    }
    if (condition.pattern) {
      if (condition.pattern.startsWith("^")) {
        return {
          conditionType: "beginsWith",
          selectedField: field,
          constValue: condition.pattern.slice(1),
        };
      }
      if (condition.pattern.endsWith("$")) {
        return {
          conditionType: "endsWith",
          selectedField: field,
          constValue: condition.pattern.slice(0, -1),
        };
      }
      return {
        conditionType: "contains",
        selectedField: field,
        constValue: condition.pattern,
      };
    }
    if (condition.minimum !== undefined || condition.maximum !== undefined) {
      return {
        conditionType: "range",
        selectedField: field,
        minValue: condition.minimum,
        maxValue: condition.maximum,
        exclusiveMin: condition.exclusiveMinimum || false,
        exclusiveMax: condition.exclusiveMaximum || false,
      };
    }
    return {
      conditionType: "isEqual",
      selectedField: field,
      constValue: "",
    };
  };

  // Initialize internal state based on the initial schema
  const initialParsed =
    value && Object.keys(value).length
      ? parseSchema(value)
      : {
        conditionType: "isEqual",
        selectedField: fields[0] || "",
        constValue: "",
      };

  const [conditionType, setConditionType] =
    React.useState<ConditionType>(initialParsed.conditionType);
  const [selectedField, setSelectedField] =
    React.useState<string>(initialParsed.selectedField);
  const [constValue, setConstValue] = React.useState<string>(
    initialParsed.constValue || ""
  );
  const [enumValues, setEnumValues] = React.useState<string[]>(
    initialParsed.enumValues || []
  );
  const [inputValue, setInputValue] = React.useState<string>("");
  const [minValue, setMinValue] = React.useState<number | undefined>(
    initialParsed.minValue
  );
  const [maxValue, setMaxValue] = React.useState<number | undefined>(
    initialParsed.maxValue
  );
  const [exclusiveMin, setExclusiveMin] =
    React.useState<boolean>(initialParsed.exclusiveMin || false);
  const [exclusiveMax, setExclusiveMax] =
    React.useState<boolean>(initialParsed.exclusiveMax || false);
  const [subConditions, setSubConditions] = React.useState<any[]>(
    initialParsed.subConditions || []
  );

  // New state for "Jump To" functionality
  const [jumpTo, setJumpTo] = React.useState<string>(
    value?.jumpTo || "" // Initialize with existing jumpTo if available
  );

  // Get current field item
  const currentIfField: Item = React.useMemo(() => {
    const selected = items.find(item => item.keyName === selectedField);
    return selected;
  }, [selectedField, items]);

  // Get available conditions for current field
  const availableConditions = React.useMemo(() => {
    return getAvailableConditions(currentIfField);
  }, [currentIfField]);

  const isCheckboxField = (fieldItem: Item | undefined): boolean => {
    if (!fieldItem) return false;
    const fieldInfo = getFieldTypeInfo(fieldItem);
    return fieldInfo.type === "boolean" || fieldInfo.dsType === "checkbox" || fieldItem.keyName === "Checkbox";
  };

  // Reset condition type if it's not available for the selected field
  React.useEffect(() => {
    if (selectedField && isCheckboxField(currentIfField)) {
      // For checkbox fields, always use "isEqual" and hide the condition select
      if (conditionType !== "isEqual") {
        setConditionType("isEqual");
      }
    } else if (selectedField && availableConditions.length > 0 && !availableConditions.includes(conditionType)) {
      setConditionType(availableConditions[0] || "isEqual");
      // Reset related state
      setConstValue("");
      setEnumValues([]);
      setMinValue(undefined);
      setMaxValue(undefined);
    }
  }, [selectedField, availableConditions, conditionType, currentIfField]);
  // Build the schema object based on current UI
  const buildSchema = React.useCallback(() => {
    if (conditionType === "all") {
      // Handle group conditions
      const allOfSchemas = subConditions.map((sub) => sub);
      let groupSchema = {
        allOf: allOfSchemas,
      };

      // If effect is "JUMP", include jumpTo in the schema
      if (effect === "JUMP" && jumpTo) {
        groupSchema = {
          ...groupSchema,
          jumpTo: jumpTo, // Adjust this based on your schema structure
        };
      }

      return groupSchema;
    }

    // Handle individual conditions
    let schema: any = {};

    if (!selectedField) {
      return schema;
    }

    // Define the property based on selectedField
    schema.properties = {};
    schema.required = [];

    // Build the condition for the selected field
    let condition: any = {};

    switch (conditionType) {
      case "isEqual":
        if (constValue.trim() !== "") {
          const fieldInfo = getFieldTypeInfo(currentIfField);
          // Handle boolean fields specially
          if (fieldInfo.type === "boolean" || fieldInfo.dsType === "checkbox") {
            condition.const = constValue === "true" || constValue === true;
          } else {
            const maybeNumber = Number(constValue);
            condition.const = isNaN(maybeNumber) ? constValue : maybeNumber;
          }
        }
        break;
      case "isNotEqual":
        if (constValue.trim() !== "") {
          const fieldInfo = getFieldTypeInfo(currentIfField);
          if (fieldInfo.type === "boolean" || fieldInfo.dsType === "checkbox") {
            condition.not = {
              const: constValue === "true" || constValue === true,
            };
          } else {
            const maybeNumber = Number(constValue);
            condition.not = {
              const: isNaN(maybeNumber) ? constValue : maybeNumber,
            };
          }
        }
        break;
      case "beginsWith":
        if (constValue.trim() !== "") {
          const escapedValue = constValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          condition.pattern = `^${escapedValue}`;
        }
        break;
      case "endsWith":
        if (constValue.trim() !== "") {
          const escapedValue = constValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          condition.pattern = `${escapedValue}$`;
        }
        break;
      case "contains":
        if (constValue.trim() !== "") {
          const escapedValue = constValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          condition.pattern = `${escapedValue}`;
        }
        break;
      case "doesNotContain":
        if (constValue.trim() !== "") {
          const escapedValue = constValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          condition.not = {
            pattern: `${escapedValue}`,
          };
        }
        break;
      case "enum":
        const cleaned = enumValues
          .map((val) => {
            const maybeNumber = Number(val);
            return isNaN(maybeNumber) ? val : maybeNumber;
          })
          .filter((val) => String(val).trim() !== "");
        if (cleaned.length > 0) {
          condition.enum = cleaned;
        }
        break;
      case "range":
        if (minValue !== undefined) {
          const { dsType } = getFieldTypeInfo(currentIfField);
          if (dsType === "date") {
            condition.minimum = new Date(minValue).toISOString().split("T")[0];
          } else {
            condition.minimum = minValue;
          }
          if (exclusiveMin) {
            condition.exclusiveMinimum = true;
          }
        }
        if (maxValue !== undefined) {
          const { dsType } = getFieldTypeInfo(currentIfField);
          if (dsType === "date") {
            condition.maximum = new Date(maxValue).toISOString().split("T")[0];
          } else {
            condition.maximum = maxValue;
          }
          if (exclusiveMax) {
            condition.exclusiveMaximum = true;
          }
        }
        break;
      default:
        break;
    }

    // Assign the condition to the selected field
    schema.properties[selectedField] = condition;

    // Add the field to required if applicable
    if (selectedField) {
      schema.required.push(selectedField);
    }

    // If effect is "JUMP", include jumpTo in the schema
    if (effect === "JUMP" && jumpTo) {
      schema.jumpTo = jumpTo; // Adjust this based on your schema structure
    }

    return schema;
  }, [
    conditionType,
    constValue,
    enumValues,
    minValue,
    maxValue,
    exclusiveMin,
    exclusiveMax,
    subConditions,
    selectedField,
    effect,
    jumpTo,
    currentIfField,
  ]);

  // Whenever inputs change, build a new schema object and propagate it upward
  React.useEffect(() => {
    const schema = buildSchema();
    console.log({ schema });
    onChange(schema);
  }, [buildSchema]);

  // A small helper to handle sub-condition changes in the "all" mode
  function updateSubCondition(index: number, updatedSchema: any) {
    setSubConditions((prev) => {
      const copy = [...prev];
      copy[index].schema = updatedSchema;
      return copy;
    });
  }

  // Handler for adding a new enum value
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = inputValue.trim();
      if (value && !enumValues.includes(value)) {
        setEnumValues([...enumValues, value]);
        setInputValue(""); // Clear the input after adding
      }
    }
  };

  // Handler for deleting an enum value
  const handleDelete = (valueToDelete: string) => {
    setEnumValues(enumValues.filter((value) => value !== valueToDelete));
  };

  // Handler to add a sub-condition in "all" mode
  const handleAddSubCondition = () => {
    setSubConditions((prev) => [...prev, {}]);
  };

  // Handler to remove a sub-condition in "all" mode
  const handleRemoveSubCondition = (index: number) => {
    setSubConditions((prev) => prev.filter((_, i) => i !== index));
  };

  // Handlers for Jump To functionality
  const handleJumpToChange = (value: string) => {
    setJumpTo(value);
  };

  // Determine the input component based on the selected field
  const getInputComponent = (fieldItem: Item | undefined) => {
    if (!fieldItem) {
      return (
        <Input
          placeholder='Enter value'
          value={constValue}
          onChange={(e) => setConstValue(e.target.value)}
        />
      );
    }

    const fieldInfo = getFieldTypeInfo(fieldItem);
    const { type, dsType, format } = fieldInfo;

    switch (type) {
      case "boolean":
        return (
          <Switch
            checked={constValue === "true" || constValue === true}
            onCheckedChange={(checked) => setConstValue(String(checked))}
          />
        );

      case "number":
      case "integer":
        return (
          <Input
            type="number"
            placeholder='Enter a number'
            value={constValue}
            onChange={(e) => setConstValue(e.target.value)}
          />
        );

      case "string":
        switch (dsType) {
          case "dropdown":
          case "radio":
            // Check if the field has options
            if (fieldItem.options && Array.isArray(fieldItem.options) && fieldItem.options.length > 0) {
              return (
                <Select
                  value={constValue}
                  onValueChange={(value) => setConstValue(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldItem.options.map((option, index) => {
                      // Handle different option formats
                      const optionValue = typeof option === 'string' ? option : option.value || option.label;
                      const optionLabel = typeof option === 'string' ? option : option.label || option.value;

                      return (
                        <SelectItem key={index} value={String(optionValue)}>
                          {String(optionLabel)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              );
            } else {
              // Fallback to regular input if no options are available
              return (
                <Input
                  type="text"
                  placeholder='Enter value'
                  value={constValue}
                  onChange={(e) => setConstValue(e.target.value)}
                />
              );
            }

          case "email":
            return (
              <Input
                type="email"
                placeholder='e.g. "example@example.com"'
                value={constValue}
                onChange={(e) => setConstValue(e.target.value)}
              />
            );

          case "password":
            return (
              <Input
                type="password"
                placeholder='Enter password'
                value={constValue}
                onChange={(e) => setConstValue(e.target.value)}
              />
            );

          case "phone":
            return (
              <Input
                type="tel"
                placeholder='e.g. "+1-234-567-8900"'
                value={constValue}
                onChange={(e) => setConstValue(e.target.value)}
              />
            );

          case "date":
            return (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !constValue && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {constValue ? DateFnsFormat(new Date(constValue), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={constValue ? new Date(constValue) : undefined}
                    onSelect={(date: Date | undefined) => setConstValue(date ? date.toISOString().split("T")[0] : "")}
                  />
                </PopoverContent>
              </Popover>
            );

          case "textarea":
            return (
              <Textarea
                placeholder='Enter text'
                value={constValue}
                onChange={(e) => setConstValue(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] w-full"
              />
            );

          case "ipv4":
            return (
              <Input
                type="text"
                placeholder='e.g. "192.168.1.1"'
                value={constValue}
                onChange={(e) => setConstValue(e.target.value)}
              />
            );

          case "file":
            return (
              <Input
                type="text"
                placeholder='Enter filename'
                value={constValue}
                onChange={(e) => setConstValue(e.target.value)}
              />
            );

          default:
            return (
              <Input
                type="text"
                placeholder='Enter value'
                value={constValue}
                onChange={(e) => setConstValue(e.target.value)}
              />
            );
        }

      default:
        return (
          <Input
            type="text"
            placeholder='Enter value'
            value={constValue}
            onChange={(e) => setConstValue(e.target.value)}
          />
        );
    }
  };

  // Helper function to get condition label
  const getConditionLabel = (conditionType: ConditionType): string => {
    const labels = {
      isEqual: "is equal to",
      isNotEqual: "is not equal to",
      beginsWith: "begins with",
      endsWith: "ends with",
      contains: "contains",
      doesNotContain: "does not contain",
      enum: "is one of",
      range: "is within range",
      all: "all conditions"
    };
    return labels[conditionType] || conditionType;
  };

  // Filter out layout items and items without valid conditions
  const validFieldItems = React.useMemo(() => {
    return items.filter(item => {
      const fieldInfo = getFieldTypeInfo(item);
      const conditions = getAvailableConditions(item);
      return fieldInfo.type !== "layout" && !item.isLayoutElement && conditions.length > 0;
    });
  }, [items]);

  console.log({ effect });

  return (
    <div className="space-y-4 border rounded p-2 py-4">
      {/* If conditionType is not 'all', render individual condition controls */}
      {conditionType !== "all" && (
        <>
          <div className="flex flex-row items-center gap-2">
            <Label className="text-sm font-medium">If</Label>
            <Select
              value={effect == "JUMP" ? selectedItem?.keyName : selectedField}
              onValueChange={(val: string) => setSelectedField(val)}
            >
              <SelectTrigger
                disabled={effect === "JUMP"}
                className="w-[200px]"
              >
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {validFieldItems.filter(item => effect == "JUMP" || item.id != selectedItem?.id).map((field) => (
                  <SelectItem key={field.id} value={field.keyName}>
                    <div className="flex items-center gap-2">
                      <field.Icon
                        className="w-4 h-4"
                        style={{ color: field.color }}
                      />
                      {field.keyName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isCheckboxField(currentIfField) ? (
              <Select
                value={conditionType}
                onValueChange={(val: ConditionType) => setConditionType(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {availableConditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {getConditionLabel(condition)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ): <div className="flex flex-col gap-2 pl-4">
                {getInputComponent(currentIfField)}
              </div>}
          </div>

          {/* For "isEqual", "isNotEqual", "beginsWith", "endsWith", "contains", "doesNotContain" */}
          {!isCheckboxField(currentIfField) && [
            "isEqual",
            "isNotEqual",
            "beginsWith",
            "endsWith",
            "contains",
            "doesNotContain",
          ].includes(conditionType) && (
              <div className="flex flex-col gap-2 pl-4">
                {getInputComponent(currentIfField)}
              </div>
            )}

          {/* Enum */}
          {conditionType === "enum" && (
            <div className="flex flex-col gap-2">
              <div className="space-y-2">
                <div className="flex flex-col gap-2">
                  {/* Check if the current field has predefined options */}
                  {currentIfField?.options && Array.isArray(currentIfField.options) && currentIfField.options.length > 0 ? (
                    <div className="space-y-2">
                      <Label className="text-sm">Select values from available options:</Label>
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (value && !enumValues.includes(value)) {
                            setEnumValues([...enumValues, value]);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an option to add" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentIfField.options
                            .filter(option => {
                              const optionValue = typeof option === 'string' ? option : option.value || option.label;
                              return !enumValues.includes(String(optionValue));
                            })
                            .map((option, index) => {
                              const optionValue = typeof option === 'string' ? option : option.value || option.label;
                              const optionLabel = typeof option === 'string' ? option : option.label || option.value;

                              return (
                                <SelectItem key={index} value={String(optionValue)}>
                                  {String(optionLabel)}
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                      <Label className="text-xs text-gray-500">Or add custom values:</Label>
                    </div>
                  ) : (
                    <Label className="text-sm">Add values:</Label>
                  )}

                  <Input
                    type="text"
                    placeholder='e.g. "Foo" or 10 and press enter'
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {enumValues.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm">Selected values:</Label>
                      <div className="flex flex-wrap gap-2">
                        {enumValues.map((value, index) => (
                          <Badge key={index} variant="secondary">
                            <span>{value}</span>
                            <FaTimes
                              className="ml-2 cursor-pointer"
                              onClick={() => handleDelete(value)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Range */}
          {conditionType === "range" && (
            <div className="flex flex-row gap-2">
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2">
                  {getFieldTypeInfo(currentIfField).dsType === "date" ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !minValue && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {minValue ? (
                            DateFnsFormat(new Date(minValue), "PPP")
                          ) : (
                            <span>Pick start date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={minValue ? new Date(minValue) : undefined}
                          onSelect={(date: Date | undefined) =>
                            setMinValue(date ? date.getTime() : undefined)
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Input
                      type="number"
                      placeholder="Minimum value"
                      value={minValue !== undefined ? String(minValue) : ""}
                      onChange={(e) =>
                        setMinValue(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  )}
                  <Label className="text-xs">Exclusive</Label>
                  <Switch
                    checked={exclusiveMin}
                    onCheckedChange={setExclusiveMin}
                    id="exclusive-min-switch"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2">
                  {getFieldTypeInfo(currentIfField).dsType === "date" ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !maxValue && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {maxValue ? (
                            DateFnsFormat(new Date(maxValue), "PPP")
                          ) : (
                            <span>Pick end date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={maxValue ? new Date(maxValue) : undefined}
                          onSelect={(date: Date | undefined) =>
                            setMaxValue(date ? date.getTime() : undefined)
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Input
                      type="number"
                      placeholder="Maximum value"
                      value={maxValue !== undefined ? String(maxValue) : ""}
                      onChange={(e) =>
                        setMaxValue(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  )}
                  <Label className="text-xs">Exclusive</Label>
                  <Switch
                    checked={exclusiveMax}
                    onCheckedChange={setExclusiveMax}
                    id="exclusive-max-switch"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )
      }

      {/* "Jump To" Effect Controls */}
      {
        effect === "JUMP" && (
          <div className="flex flex-row gap-4 items-center">
            <Label className="text-sm font-medium text-nowrap">then jump To</Label>
            <Select
              value={jumpTo}
              onValueChange={handleJumpToChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {items.filter(item => item.id != selectedItem?.id).map((field) => (
                  <SelectItem key={field.id} value={field.keyName}>
                    <div className="flex items-center gap-2">
                      <field.Icon
                        className="w-4 h-4"
                        style={{ color: field.color }}
                      />
                      {field.keyName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      }

      {/* If conditionType is 'all', render nested conditions */}
      {
        conditionType === "all" && (
          <div className="space-y-4 pl-4">
            <Label className="text-sm font-medium">All-Of Conditions (Nested)</Label>

            {subConditions.map((sub, index) => (
              <div key={index} className="border p-4 rounded space-y-2">
                <ConditionSchemaBuilder
                  value={sub.schema || sub}
                  onChange={(updatedSchema) =>
                    updateSubCondition(index, updatedSchema)
                  }
                  fields={fields}
                  items={items} // Ensure items are passed down
                  effect={effect} // Pass down the effect if necessary
                />
                <Button
                  variant="ghost"
                  onClick={() => handleRemoveSubCondition(index)}
                >
                  Remove Sub-condition
                </Button>
              </div>
            ))}

            <Button variant="outline" onClick={handleAddSubCondition}>
              + Add Sub-condition
            </Button>
          </div>
        )
      }
    </div >
  );
}

export default ConditionSchemaBuilder;