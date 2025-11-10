// RuleBuilder.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import ConditionSchemaBuilder from "./ConditionSchemaBuilder"; // Ensure correct import path
import { JsonSchema } from "@jsonforms/core";
import { Label } from "@/components/ui/label";
import { Condition, Rule } from "../types"; // Import the Condition and Rule types
import { CustomRuleEffect, Item } from "../../../types/dnd-types";
import { Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RuleBuilderProps {
  schema: JsonSchema;
  initialRule?: Rule; // New prop for initial rule
  onSave?: (rule: Rule) => void;
  items: Item[];
  onClose: () => void;
}

// Helper function to build JSON Schema recursively
const buildJsonSchema = (condition: Condition): any => {
  if (condition.type === "condition") {
    return condition.schema;
  } else if (condition.type === "group") {
    const subSchemas = condition.conditions.map((cond) => buildJsonSchema(cond));
    return condition.logic === "AND"
      ? { allOf: subSchemas }
      : { anyOf: subSchemas };
  }
  return {};
};

// Helper function to parse JSON Schema into Condition
const parseJsonSchemaToCondition = (schema: any): Condition => {
  if (schema.allOf || schema.anyOf) {
    const logic = schema.allOf ? "AND" : "OR";
    const conditions = (schema.allOf || schema.anyOf).map((subSchema: any) =>
      parseJsonSchemaToCondition(subSchema)
    );
    return {
      type: "group",
      logic,
      conditions,
    };
  } else {
    return {
      type: "condition",
      schema,
    };
  }
};

export default function RuleBuilder({ schema, initialRule, onSave, onClose, items = [] }: RuleBuilderProps) {
  // State for validation
  const [errors, setErrors] = React.useState([]);
  const [touched, setTouched] = React.useState(false);

  // Main state
  const [effect, setEffect] = React.useState(initialRule?.effect || "");
  const [scope, setScope] = React.useState(initialRule?.condition.scope || "#");
  const [failWhenUndefined, setFailWhenUndefined] = React.useState(initialRule?.condition.failWhenUndefined != undefined ?
    initialRule?.condition.failWhenUndefined || false:true
  );
  const [rootCondition, setRootCondition] = React.useState(
    initialRule
      ? parseJsonSchemaToCondition(initialRule.condition.schema)
      : {
        type: "group",
        logic: "AND",
        conditions: [],
      }
  );
  const fields = React.useMemo(
    () => (schema?.properties ? Object.keys(schema.properties) : []),
    [schema]
  );


  // Validation helper functions
  const validateCondition = (condition, path = 'Root') => {
    const errors = [];

    if (condition.type === "condition") {
      // Check if schema exists
      if (!condition.schema || Object.keys(condition.schema).length === 0) {
        errors.push(`${path}: Condition configuration is missing`);
        return errors;
      }

      // Check if properties exist
      if (!condition.schema.properties) {
        errors.push(`${path}: Condition properties are missing`);
        return errors;
      }

      // Check if field is selected
      const field = Object.keys(condition.schema.properties)[0];
      if (!field || field.trim() === '') {
        errors.push(`${path}: No field is selected. Please select a field to check against`);
        return errors;
      }

      // Get the field condition
      const fieldCondition = condition.schema.properties[field];

      // Check if condition is properly configured
      if (!fieldCondition || Object.keys(fieldCondition).length === 0) {
        errors.push(`${path}: No value is set for field "${field}". Please specify a value to compare against`);
      } else {
        // Specific checks based on condition type
        if (fieldCondition.const !== undefined && fieldCondition.const === '') {
          errors.push(`${path}: Empty value for "equals" condition on field "${field}"`);
        }
        if (fieldCondition.not?.const !== undefined && fieldCondition.not.const === '') {
          errors.push(`${path}: Empty value for "not equals" condition on field "${field}"`);
        }
        if (fieldCondition.pattern !== undefined && fieldCondition.pattern === '') {
          errors.push(`${path}: Empty pattern for text condition on field "${field}"`);
        }
        if (fieldCondition.enum && fieldCondition.enum.length === 0) {
          errors.push(`${path}: No values selected for "one of" condition on field "${field}"`);
        }
        if ((fieldCondition.minimum !== undefined || fieldCondition.maximum !== undefined) &&
          fieldCondition.minimum === undefined && fieldCondition.maximum === undefined) {
          errors.push(`${path}: No range values specified for field "${field}"`);
        }
      }

    } else if (condition.type === "group") {
      if (!condition.conditions || condition.conditions.length === 0) {
        errors.push(`${path}: Group is empty. Please add at least one condition`);
      } else {
        condition.conditions.forEach((subCondition, index) => {
          const subPath = `${path} → Condition ${index + 1}`;
          const subErrors = validateCondition(subCondition, subPath);
          errors.push(...subErrors);
        });
      }
    }

    return errors;
  };

  const validateRule = () => {
    const errors = [];

    // Validate effect selection
    if (!effect) {
      errors.push("No effect selected. Please select an effect (SHOW, HIDE, ENABLE, DISABLE, or JUMP)");
    }

    // Special validation for JUMP effect
    if (effect === "JUMP") {
      const hasJumpTo = checkForJumpTo(rootCondition);
      if (!hasJumpTo) {
        errors.push("Jump destination not selected. Please select where to jump to when conditions are met");
      }

      if (rootCondition.type === "group" && rootCondition.logic !== "OR") {
        errors.push("Jump conditions must use OR logic. Please change the condition group logic to OR");
      }
    }

    // Validate root condition
    if (!rootCondition.conditions || rootCondition.conditions.length === 0) {
      errors.push("No conditions added. Please add at least one condition");
    } else {
      const conditionErrors = validateCondition(rootCondition);
      errors.push(...conditionErrors);
    }

    return errors;
  };

  const checkForJumpTo = (condition) => {
    if (condition.type === "condition") {
      return condition.schema?.jumpTo;
    } else if (condition.type === "group") {
      return condition.conditions.some(subCondition => checkForJumpTo(subCondition));
    }
    return false;
  };

  // Effect handlers
  const handleEffectChange = (newEffect) => {
    setEffect(newEffect);
    if (newEffect === "JUMP") {
      setRootCondition({
        type: "group",
        logic: "OR",
        conditions: [],
      });
    }
    setTouched(true);
  };

  const handleSave = () => {
    setTouched(true);
    const validationErrors = validateRule();
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      const finalRule = {
        effect,
        condition: {
          scope,
          schema: buildJsonSchema(rootCondition),
        },
      };

      if (failWhenUndefined) {
        finalRule.condition.failWhenUndefined = true;
      }

      onSave?.(finalRule);
    }
  };

  // Function to handle adding a new condition to a group
  const addCondition = (parent: Condition, newCondition: Condition) => {
    if (parent.type === "group") {
      parent.conditions.push(newCondition);
      setRootCondition({ ...rootCondition });
    }
  };

  // Function to handle removing a condition from a group
  const removeCondition = (parent: Condition, index: number) => {
    if (parent.type === "group") {
      parent.conditions.splice(index, 1);
      setRootCondition({ ...rootCondition });
    }
  };

  // Recursive component to render conditions and groups
  const renderCondition = (condition: Condition, parent: Condition, effect: CustomRuleEffect, index: number) => {
    if (condition.type === "condition") {
      return (
        <div key={index} className="relative space-y-2 before:content-[' '] before:w-[12.5px] before:-left-[13.5px] before:border-l before:border-b before:border-gray-500 before:-top-4 before:h-[calc(50%_+_0.5px_+_1px)] before:absolute before:box-border after:content-[' '] after:w-[12.5px] after:-left-[13.5px] after:border-l after:border-gray-500 after:top-[calc(50%_-_4rem)] after:h-[calc(50%_+_0.5px_+_4rem)] after:absolute after:box-border after:last:hidden">
          <ConditionSchemaBuilder
            items={items}
            value={condition.schema}
            effect={effect} // Pass the current effect here
            onChange={(updatedSchema) => {
              condition.schema = updatedSchema;
              setRootCondition({ ...rootCondition });
            }}
            fields={fields}
          />
          <div className="flex w-full justify-end">
            <Button
              variant="ghost"
              onClick={() => removeCondition(parent, index)}
            >
              Remove Condition
            </Button>
          </div>
        </div>
      );
    } else if (condition.type === "group") {
      return (
        <div key={index} className="relative border p-3 pt-8 rounded px-12 before:content-[' '] before:w-[12.5px] before:-left-[14.5px] before:border-l before:border-b before:border-gray-500 before:-top-4 before:h-[calc(50%_+_0.5px_+_1px)] before:absolute before:box-border after:content-[' '] after:w-[12.5px] after:-left-[14.5px] after:border-l after:border-gray-500 after:top-[calc(50%_-_4rem)] after:h-[calc(50%_+_0.5px_+_4rem)] after:absolute after:box-border after:last:hidden">
          {!!condition.conditions.length && (
            <div className="flex items-center gap-2 relative -left-10 -top-4">
              <Select
                value={condition.logic}
                onValueChange={(val: "AND" | "OR") => {
                  condition.logic = val;
                  setRootCondition({ ...rootCondition });
                }}
              >
                <SelectTrigger className="w-auto">
                  <SelectValue placeholder="AND/OR" />
                </SelectTrigger>
                <SelectContent>
                {effect !== "JUMP" && <SelectItem value="AND">AND</SelectItem>}
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="w-full space-y-2">
            {condition.conditions.map((subCond, subIndex) =>
              renderCondition(subCond, condition, effect, subIndex)
            )}
          </div>

          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                addCondition(condition, { type: "condition", schema: {} })
              }
            >
              + Add Condition
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                addCondition(condition, {
                  type: "group",
                  logic: "AND",
                  conditions: [],
                })
              }
            >
              + Add Group
            </Button>
          </div>
          {/* Prevent removing the root group */}
          {parent.type !== "root" && (
            <div className="flex w-full justify-end">
              <Button
                variant="ghost"
                onClick={() => removeCondition(parent, index)}
                className="mt-2"
              >
                Remove Group
              </Button>
            </div>
          )}
        </div>
      );
    }
    return null;
  };


  // Render helper components
  const renderErrors = () => {
    if (!touched || errors.length === 0) return null;

    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Please Fix the Following Issues</AlertTitle>
        <AlertDescription>
          <ul className="list-disc pl-4 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm">
                {error}
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="space-y-6 w-full mx-auto">
      {renderErrors()}

      <div className="flex flex-col gap-4">
        {effect === "JUMP" && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle className="font-bold">Be Aware!</AlertTitle>
            <AlertDescription>
              Jump condition only works in Stepper form while discarding every other conditions and vise-versa.
            </AlertDescription>
          </Alert>
        )}

        {/* Effect Selection */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Effect</Label>
          <Select value={effect} onValueChange={handleEffectChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an effect" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="JUMP">JUMP_TO</SelectItem>
              <SelectItem value="HIDE">HIDE</SelectItem>
              <SelectItem value="SHOW">SHOW</SelectItem>
              <SelectItem value="ENABLE">ENABLE</SelectItem>
              <SelectItem value="DISABLE">DISABLE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Root Condition Group */}
        <div className="p-3 pl-10 pr-0 space-y-2">
          {/* {rootCondition.conditions?.length > 0 && (
            <div className="flex items-center gap-2 relative -left-10 -top-2">
              <Select
                value={rootCondition.logic}
                onValueChange={(val) => {
                  setRootCondition({
                    ...rootCondition,
                    logic: val,
                  });
                }}
              >
                <SelectTrigger className="w-auto">
                  <SelectValue placeholder="AND/OR" />
                </SelectTrigger>
                <SelectContent>
                  {effect !== "JUMP" && <SelectItem value="AND">AND</SelectItem>}
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )} */}


          {/* Root Condition Group */}
          <div className="p-3 pl-0 pr-0 space-y-2">
            {!!rootCondition.conditions?.length && (
              <div className="flex items-center gap-2 relative -left-10 -top-2">
                <Select
                  value={rootCondition.logic}
                  onValueChange={(val: "AND" | "OR") => {
                    rootCondition.logic = val;
                    setRootCondition({ ...rootCondition });
                  }}
                >
                  <SelectTrigger className="w-auto">
                    <SelectValue placeholder="AND/OR" />
                  </SelectTrigger>
                  <SelectContent>
                    {effect !== "JUMP" && <SelectItem value="AND">AND</SelectItem>}
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="w-full space-y-2">
              {rootCondition.conditions?.map((cond, index) =>
                renderCondition(cond, rootCondition, effect, index)
              )}
            </div>

            <div className="flex gap-2 mt-2">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => addCondition(rootCondition, { type: "condition", schema: {} })}
              >
                + Add Condition
              </Button>
              {effect !== "JUMP" && <Button
                className="flex-1"
                variant="outline"
                onClick={() =>
                  addCondition(rootCondition, {
                    type: "group",
                    logic: "AND",
                    conditions: [],
                  })
                }
              >
                + Add Group
              </Button>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={failWhenUndefined}
            onCheckedChange={setFailWhenUndefined}
            id="fail-undefined-switch"
          />
          <Label htmlFor="fail-undefined-switch" className="text-sm">
            Fail when undefined?
          </Label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}
