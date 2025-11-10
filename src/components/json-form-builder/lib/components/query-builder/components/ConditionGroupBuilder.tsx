import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ConditionSchemaBuilder from "./ConditionSchemaBuilder";

// Reuse your existing ConditionSchema type or define a new one:
interface ConditionSchema {
  [key: string]: any;
}

type LogicType = "AND" | "OR";

/**
 * -------------------------------
 * 1) A "group" component that can hold multiple conditions 
 *    and combine them with AND/OR.
 * -------------------------------
 */
export default function ConditionGroupBuilder({
  value,
  onChange,
}: {
  /** The final combined schema (if you want to prefill or edit) */
  value?: ConditionSchema;
  /** Callback when the final schema changes */
  onChange: (schema: ConditionSchema) => void;
}) {
  // Let user pick how to combine multiple conditions
  const [logic, setLogic] = React.useState<LogicType>("AND");

  // An array of sub-conditions. Each item is an object returned by ConditionSchemaBuilder.
  const [conditions, setConditions] = React.useState<ConditionSchema[]>([]);

  const [negate, setNegate] = React.useState(false);

  /** 
   * Build the final schema: if user picks AND, wrap in `allOf`; 
   * if OR, wrap in `anyOf`. 
   */
  const buildSchema = React.useCallback(() => {
    if (conditions.length === 0) {
      return {};
    }
    let base =
      logic === "AND"
        ? { allOf: conditions }
        : { anyOf: conditions };

    // Optionally apply "not" if you want a global Negate? 
    if (negate) {
      base = { not: base };
    }
    return base;
  }, [conditions, logic, negate]);

  React.useEffect(() => {
    // onChange(buildSchema());
  }, [buildSchema, onChange]);

  /** Add a blank sub-condition */
  function handleAddCondition() {
    setConditions((prev) => [...prev, {}]);
  }

  /** Remove a sub-condition */
  function handleRemoveCondition(index: number) {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  }

  /** Update an existing sub-condition */
  function handleSubConditionChange(index: number, updated: ConditionSchema) {
    setConditions((prev) => {
      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
  }

  return (
    <div className="space-y-4 p-4 border rounded">
      <div className="flex items-center gap-4">
        <Label>Combine Conditions with:</Label>
        <Select
          value={logic}
          onValueChange={(val: LogicType) => setLogic(val)}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="AND/OR" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">AND</SelectItem>
            <SelectItem value="OR">OR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {conditions.map((conditionSchema, index) => (
        <div key={index} className="border p-3 rounded space-y-2 relative mt-2">
          <Label className="text-sm font-medium">Condition #{index + 1}</Label>
          {/* 
            2) Reuse your existing single-condition builder here. 
               You pass in conditionSchema and get updated sub-schema 
               via onChange. 
          */}
          <ConditionSchemaBuilder
            value={conditionSchema}
            onChange={(subSchema) => handleSubConditionChange(index, subSchema)}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRemoveCondition(index)}
          >
            Remove Condition
          </Button>
        </div>
      ))}

      <Button variant="outline" onClick={handleAddCondition}>
        + Add Condition
      </Button>

      {/* Global Negate switch, if you want it. */}
      <div className="flex items-center gap-4 pt-2">
        <Switch
          checked={negate}
          onCheckedChange={setNegate}
          id="negate-switch"
        />
        <Label htmlFor="negate-switch">Negate entire group?</Label>
      </div>
    </div>
  );
}
