import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, SquareDashed } from "lucide-react";

import { useState } from 'react'
import {JsonFormViewer} from "@defensestation/json-form-viewer";
import { JsonFormsCore, JsonSchema } from "@jsonforms/core";
import "@/assets/css/index.css"
import { ErrorObject } from "ajv";
import { cn } from "@/lib/utils";
import { CustomJsonSchema, CustomLayoutType, FormProperties } from "../../context/dnd-context";
type NormalLayoutProps = {
  jsonSchema: CustomJsonSchema | object;
  uiSchema: CustomLayoutType;
  properties?: FormProperties;
  data?: any;
  onSubmit?: (data: any) => void;
  onChange?: (args: Pick<JsonFormsCore, "data" | "errors">) => void;
  className?: string;
  actionButtonText?: string;
  readonly?: boolean;
}

export default function NormalForm({ jsonSchema, uiSchema, data, onSubmit, className, actionButtonText, properties, readonly }: NormalLayoutProps) {

  const [formData, setFormData] = useState();
  const [errors, setErrors] = useState<ErrorObject[]>();

  const onChange = (args: Pick<JsonFormsCore, "data" | "errors">) => {
    setFormData(args.data)
    // @ts-ignore
    setErrors(args.errors)
  };
  console.log({ properties, jsonSchema, uiSchema })

  return (
    // <div className={cn("bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center", className)}>
    <div id="normal-preview" className={cn("w-full", className)} style={{
      backgroundColor: properties?.color?  properties.color : ""
    }}>
      <CardHeader className="space-y-2">

        <div className="flex items-center justify-between">
          <div>
            {!!properties?.title && <><CardTitle className="text-2xl">
              {properties.title}
            </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                {properties.description}
              </CardDescription>
            </>}
          </div>
          <div className="flex flex-col items-center gap-2">
            {!!properties?.showLogo && properties?.logo && (properties?.logo ? <img className="w-10 h-10" src={properties.logo} /> : <SquareDashed className="w-10 h-10 text-gray-300" />)}
          </div>
        </div>

      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* Name Field */}
          <JsonFormViewer
            data={data}
            onSubmit={onChange}
            jsonSchema={jsonSchema as JsonSchema}
            uiSchema={uiSchema}
            readonly={readonly}
          />
        </div>
      </CardContent>

      {onSubmit && <CardFooter className="flex justify-start gap-4 w-full">
        {/* <Button variant="outline">
            Cancel
          </Button> */}
        <Button type="button" disabled={!!errors?.length} onClick={() => onSubmit?.(formData)} className="bg-linear-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white w-full">
          {/* <Send className="w-4 h-4 mr-2" /> */}
          {actionButtonText ? actionButtonText : "Submit Data"}
        </Button>
      </CardFooter>}
    </div>
    // </div>

  )
}
