"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

//
// TYPES
//
type ConditionType = "const" | "enum" | "range";

interface ConditionSchema {
  // The final object to be injected into "condition.schema"
  [key: string]: any;
}

interface ConditionSchemaBuilderProps {
  initialValue?: ConditionSchema;  
  onChange: (schema: ConditionSchema) => void;
}

/**
 * ConditionSchemaBuilder
 * Allows user to pick between:
 *  - const
 *  - enum
 *  - range
 * 
 * Also includes a "Negate?" toggle to wrap the final schema in { "not": ... }.
 */
export function ConditionSchemaBuilder({
  initialValue,
  onChange,
}: ConditionSchemaBuilderProps) {
  // Condition Type
  const [type, setType] = React.useState<ConditionType>("const");

  // For "const"
  const [constValue, setConstValue] = React.useState<string>("");

  // For "enum"
  const [enumValues, setEnumValues] = React.useState<string[]>([""]);

  // For "range"
  const [minValue, setMinValue] = React.useState<number | undefined>(undefined);
  const [maxValue, setMaxValue] = React.useState<number | undefined>(undefined);
  const [exclusiveMin, setExclusiveMin] = React.useState(false);
  const [exclusiveMax, setExclusiveMax] = React.useState(false);

  // Negate
  const [negate, setNegate] = React.useState(false);

  /**
   * You may want to parse the `initialValue` to pre-populate 
   * these states if the user is editing an existing condition schema. 
   * For brevity, we skip that in the example.
   */

  // Create the final schema object
  const buildSchema = React.useCallback((): ConditionSchema => {
    let schema: ConditionSchema = {};

    switch (type) {
      case "const":
        if (constValue !== "") {
          // try to parse the constValue as a number if it’s numeric,
          // else treat it as string. In real usage, you might add 
          // additional logic for booleans, etc.
          const maybeNumber = Number(constValue);
          schema["const"] = isNaN(maybeNumber) ? constValue : maybeNumber;
        }
        break;

      case "enum":
        // remove empty strings and try to parse numbers
        const filtered = enumValues
          .map((val) => {
            const maybeNumber = Number(val);
            return isNaN(maybeNumber) ? val : maybeNumber;
          })
          .filter((v) => v !== "");
        if (filtered.length > 0) {
          schema["enum"] = filtered;
        }
        break;

      case "range":
        // note: we only include properties if they are set
        if (minValue !== undefined) {
          schema["minimum"] = minValue;
          if (exclusiveMin) {
            schema["exclusiveMinimum"] = true;
          }
        }
        if (maxValue !== undefined) {
          schema["maximum"] = maxValue;
          if (exclusiveMax) {
            schema["exclusiveMaximum"] = true;
          }
        }
        break;
    }

    // Wrap in not if needed
    if (negate && Object.keys(schema).length > 0) {
      schema = { not: schema };
    }

    return schema;
  }, [type, constValue, enumValues, minValue, maxValue, exclusiveMin, exclusiveMax, negate]);

  // Update parent whenever something changes
  React.useEffect(() => {
    onChange(buildSchema());
  }, [buildSchema, onChange]);

  //
  // RENDER
  //
  return (
    <div className="space-y-4">
      <Label>Condition Type</Label>
      <Select value={type} onValueChange={(val: ConditionType) => setType(val)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Pick a condition type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="const">Constant Value</SelectItem>
          <SelectItem value="enum">Enum Values</SelectItem>
          <SelectItem value="range">Range</SelectItem>
        </SelectContent>
      </Select>

      <Separator />

      {type === "const" && (
        <div className="flex flex-col gap-2">
          <Label>Const Value</Label>
          <Input
            value={constValue}
            onChange={(e) => setConstValue(e.target.value)}
            placeholder='Example: "foo" or "10"'
          />
        </div>
      )}

      {type === "enum" && (
        <div className="space-y-2">
          <Label>Enum Values</Label>
          {enumValues.map((val, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                value={val}
                onChange={(e) => {
                  const newVals = [...enumValues];
                  newVals[idx] = e.target.value;
                  setEnumValues(newVals);
                }}
                placeholder='Example: "foo", "bar", "10"'
              />
              <Button
                variant="secondary"
                onClick={() => {
                  // remove item
                  setEnumValues(enumValues.filter((_, i) => i !== idx));
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            onClick={() => setEnumValues([...enumValues, ""])}
            variant="outline"
          >
            Add Value
          </Button>
        </div>
      )}

      {type === "range" && (
        <div className="flex flex-col gap-4">
          {/* Min */}
          <div>
            <Label className="text-sm font-medium">Minimum</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                value={minValue ?? ""}
                onChange={(e) => setMinValue(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="No min"
              />
              <div className="flex items-center gap-1">
                <Switch checked={exclusiveMin} onCheckedChange={setExclusiveMin} />
                <Label className="text-sm">Exclusive</Label>
              </div>
            </div>
          </div>

          {/* Max */}
          <div>
            <Label className="text-sm font-medium">Maximum</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                value={maxValue ?? ""}
                onChange={(e) => setMaxValue(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="No max"
              />
              <div className="flex items-center gap-1">
                <Switch checked={exclusiveMax} onCheckedChange={setExclusiveMax} />
                <Label className="text-sm">Exclusive</Label>
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator />

      <div className="flex items-center gap-4">
        <Switch checked={negate} onCheckedChange={setNegate} id="negate-switch" />
        <Label htmlFor="negate-switch">Negate Condition?</Label>
      </div>
    </div>
  );
}
