import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { UISchemaElement } from "@jsonforms/core";
import type { CustomJsonSchema } from "../../context/dnd-context";
import type { CustomRule, Item } from "../../types/dnd-types";
import RuleBuilder from "./components/Rule";
import ConfigDisplay from "../FieldProperties/ConditionViewer";
import { Label } from "@/components/ui/label";

type QueryBuilder = {
  onChange?: (rules: CustomRule) => void;
  initialValue?: CustomRule;
  jsonSchema: CustomJsonSchema;
  uiSchema: UISchemaElement;
  items: Item[];
  onRemoveCondition?: (rule: CustomRule) => void;
}

export default function QueryBuilder({ 
  initialValue, 
  onChange, 
  jsonSchema, 
  uiSchema, 
  onRemoveCondition, 
  items = [] 
}: QueryBuilder) {
  const [query, setQuery] = useState<CustomRule>();
  const [open, setOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  // Enhanced items with options from jsonSchema
  const enhancedItems = useMemo(() => {
    return items.map(item => {
      // Check if this item has options in the jsonSchema
      const schemaProperty = jsonSchema?.properties?.[item.keyName];
      let options: string[] = [];
      
      if (schemaProperty) {
        // Check for enum values in the schema
        if (schemaProperty.enum) {
          options = schemaProperty.enum.map(val => String(val));
        }
        // Check for oneOf with const values (another common pattern)
        else if (schemaProperty.oneOf) {
          options = schemaProperty.oneOf
            .filter(option => option.const !== undefined)
            .map(option => String(option.const));
        }
      }
      
      // Also check if the item itself has options
      if (item.options && Array.isArray(item.options)) {
        options = item.options.map(opt => 
          typeof opt === 'string' ? opt : opt.label || opt.value || String(opt)
        );
      }

      return {
        ...item,
        options: options.length > 0 ? options : undefined
      };
    });
  }, [items, jsonSchema]);

  const fields = useMemo(() => {
    if (!jsonSchema?.properties) return []
    return Object.keys(jsonSchema.properties).map(key => ({
      name: key,
      label: key
    }))
  }, [jsonSchema])

  const filedItems = useMemo(() => 
    enhancedItems.filter(item => !item.isLayoutElement), 
    [enhancedItems]
  );

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue])

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        {initialValue ? 
          <div onClick={e => e.stopPropagation()} className="flex flex-col gap-2">
            <Label>Condition</Label>
            <ConfigDisplay 
              rule={initialValue} 
              onRemoveCondition={() => setIsDeleteDialogOpen(true)} 
              onEditCondition={() => setOpen(true)} 
            />
          </div> 
          : 
          <DialogTrigger disabled={!!query?.condition} asChild className="w-full">
            <Button className="w-full">Add Condition</Button>
          </DialogTrigger>
        }
        
        <DialogContent className="max-w-[1000px] w-[1000px] overflow-auto max-h-[800px] h-auto">
          <DialogHeader>
            <DialogTitle>Rule Builder</DialogTitle>
            <DialogDescription>
              Construct your filter query below:
            </DialogDescription>
          </DialogHeader>
          
          <RuleBuilder 
            schema={jsonSchema} 
            initialRule={initialValue} 
            items={filedItems}
            onSave={(newRule) => {
              setQuery(newRule);
              onChange?.(newRule)
              setOpen(false)
            }} 
            onClose={() => setOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
    </div>
  );
}