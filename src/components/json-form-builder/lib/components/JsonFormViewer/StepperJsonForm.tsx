import React, { useState, useMemo, useRef, useEffect } from "react";
import {JsonFormViewer} from "@defensestation/json-form-viewer";
import { Button } from "@/components/ui/button";
import {
  Send,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import { evaluateRule } from "../../utils/evaluateRule";
import { type CustomRule } from "../../types/dnd-types";
import { motion, AnimatePresence } from "framer-motion";
import "@/assets/css/index.css";
import { Separator } from "../ui/separator";
import LogoIcon from "@/components/icons/icons";

type SchemaObject = {
  name: string;
  jsonSchema: Record<string, any>;
  uiSchema: Record<string, any>;
  properties?: JSON;
};

type StepperJsonFormProps = {
  schemas: SchemaObject[];
  properties?: JSON;
  onSubmit?: (data: any) => void;
  isFullBackButton?: boolean;
  disableAnimation?: boolean;
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Enhanced progress bar animation
const cardVariants = {
  enter: (direction: "right" | "left") => ({
    x: direction === "right" ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: "right" | "left") => ({
    x: direction === "right" ? -1000 : 1000,
    opacity: 0,
  }),
};

/**
 * Helper function: if any property in the schema has format "label",
 * set its value automatically to the label (using the schema's title or the property key)
 */
const setLabelFields = (schema: any, data: Record<string, any> = {}) => {
  if (!schema?.properties) return data;
  const newData = { ...data };
  Object.entries(schema.properties).forEach(([key, propertySchema]) => {
    if (propertySchema && propertySchema.format === "label") {
      // Automatically set the value as the label (using title if available)
      newData[key] = propertySchema.title || key;
    }
  });
  return newData;
};

const StepperJsonForm: React.FC<StepperJsonFormProps> = ({ schemas = [], properties, onSubmit, isFullBackButton = true, disableAnimation }) => {
  

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [direction, setDirection] = useState<"right" | "left">("right");
  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<any>();
  const cardContentRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  // Ensure currentStep is valid
  const safeCurrentStep = currentStep < schemas.length ? currentStep : 0;
  
  // Safely access the current schema
  const currentSchema = useMemo(() => 
    schemas[safeCurrentStep]?.jsonSchema || {}, 
  [schemas, safeCurrentStep]);
  
  const currentUISchema = useMemo(() => 
    schemas[safeCurrentStep]?.uiSchema || {}, 
  [schemas, safeCurrentStep]);
  
  const name = useMemo(() => 
    schemas[safeCurrentStep]?.name || `step-${safeCurrentStep}`, 
  [schemas, safeCurrentStep]);

  const findFirstElementWithRules = (uiSchema: any) => {
    if (uiSchema?.elements && Array.isArray(uiSchema.elements)) {
      for (const element of uiSchema.elements) {
        if (element?.rule) {
          return element;
        }
      }
    }
    return null;
  };

  const getTargetPropertyFromScope = (scope: string) => {
    const match = scope.match(/#\/properties\/([^/]+)/);
    return match ? match[1] : null;
  };

  const goToStep = (stepIndex: number) => {
    // Ensure stepIndex is valid
    if (stepIndex >= 0 && stepIndex < schemas.length) {
      setDirection(stepIndex > safeCurrentStep ? "right" : "left");
      setCurrentStep(stepIndex);
    }
  };

  const handleSubmit = async (data: any) => {
    // Ensure label fields are set according to the current schema
    const updatedData = setLabelFields(currentSchema, data);
    const currentKey = name;
    const newFormData = { ...formData, [currentKey]: updatedData };

    const elementWithRules = findFirstElementWithRules(currentUISchema);

    if (elementWithRules?.rule) {
      const { effect, condition } = elementWithRules.rule;
      if (effect === "JUMP" && condition) {
        const conditions = condition?.schema.anyOf || condition.schema.oneOf;
        if (conditions && Array.isArray(conditions)) {
          for (const condition of conditions) {
            const fieldAttributeName = getTargetPropertyFromScope(elementWithRules.scope);
            const newSchema = { ...condition };
            if (newSchema.jumpTo) {
              delete newSchema.jumpTo;
            }
            const newCondition: CustomRule = {
              effect: "JUMP",
              condition: {
                scope: "#",
                schema: newSchema,
              },
            };
            const isConditionMet = evaluateRule(newCondition, newFormData?.[fieldAttributeName]);
            if (isConditionMet && condition.jumpTo) {
              const jumpStep = schemas.findIndex((schema) => schema && schema.name === condition.jumpTo);
              if (jumpStep !== -1 && jumpStep !== safeCurrentStep) {
                goToStep(jumpStep);
                setFormData(newFormData);
                return;
              }
            }
          }
        }
      }
    }

    setFormData(newFormData);

    if (safeCurrentStep < schemas.length - 1) {
      goToStep(safeCurrentStep + 1);
    } else {
      let finalData = {};
      if (newFormData)
        Object.keys(newFormData).map((key) => {
          const localData = newFormData[key];
          if (localData) finalData = { ...finalData, ...localData };
        });
      onSubmit?.(finalData);
      // alert("All forms submitted successfully! Final data: " + JSON.stringify(newFormData, null, 2));
    }
  };

  // On step change, load data (if any) and ensure any "label" fields are updated.
  useEffect(() => {
    if (cardContentRef.current) {
      cardContentRef.current.scrollTo(0, 0);
      const stepData = formData[name] || {};
      const updatedStepData = setLabelFields(currentSchema, stepData);
      setCurrentData(updatedStepData);
      setHasErrors(false);
    }
  }, [safeCurrentStep, currentSchema, formData, name]);

  useEffect(() => {
    setTimeout(() => {
      focusInput();
    }, 500);
  }, []);

  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      handleSubmit(currentData);
    }
  };

  const focusInput = () => {
    if (formContainerRef.current) {
      const firstInput = formContainerRef.current.querySelector(
        "input, select, textarea"
      ) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      console.log("Running autofocus", firstInput);
      firstInput?.focus();
    }
  };

  // Add check for empty schemas array
  if (!schemas || schemas.length === 0) {
    return <div>No schemas provided</div>;
  }

  return (
    <div className="relative w-full shadow-none border-0 bg-transparent h-full max-h-app overflow-y-auto max-w-100vw overflow-hidden"  style={{
      backgroundColor: properties?.color?  properties.color : ""
    }}>
      {/* Add floating progress indicator */}
      <motion.div
        className="absolute top-0 left-0 h-1 bg-green-600 dark:bg-green-500 z-[1]"
        initial={{ width: 0 }}
        animate={{
          width: `${((safeCurrentStep + 1) / schemas.length) * 100}%`,
        }}
        transition={{ duration: 0.3 }}
      />
      <div ref={cardContentRef} className="relative min-h-[400px] h-full overflow-hidden">
        <AnimatePresence mode="popLayout" custom={direction} onExitComplete={focusInput}>
          <motion.div
            key={safeCurrentStep}
            custom={direction}
            variants={cardVariants}
            initial={disableAnimation?false:"enter"}
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute px-4  size-full"
          >
            <div
              ref={formContainerRef}
              className="max-w-2xl  mx-auto flex flex-row items-center size-full gap-4 justify-center"
              onKeyDown={onKeyDownHandler}
            >
              <div className="w-full [&_label]:text-2xl [&_label]:italic [&_label]:font-bold [&_label]:text-gray-700 dark:[&_label]:text-white stepper-form">
                <JsonFormViewer
                  key={safeCurrentStep}
                  jsonSchema={currentSchema}
                  uiSchema={currentUISchema}
                  data={currentData}
                  onSubmit={(data) => {
                    // Ensure any label fields are updated on change.
                    const updated = setLabelFields(currentSchema, data.data);
                    setCurrentData(updated);
                    setHasErrors(!!data.errors?.length);
                  }}
                />
                <motion.div
                  className="flex gap-2 items-center mt-4"
                  variants={buttonVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {safeCurrentStep > 0 && !isFullBackButton && (
                    <Button
                      onClick={() => goToStep(safeCurrentStep - 1)}
                      size={'icon'}
                      variant={'ghost'}>
                      <ChevronLeft className="w-8 h-8 transition-transform group-hover:-translate-x-1 text-primary" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    disabled={hasErrors}
                    onClick={() => handleSubmit(currentData)}
                  >
                    {safeCurrentStep === schemas.length - 1 ? (
                      <div className="flex items-center">
                        <Send className="w-5 h-5 mr-2 transition-transform group-hover:translate-x-1" />
                        Submit
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Continue
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                      </div>
                    )}
                  </Button>
                  {safeCurrentStep === schemas.length - 1 ? (
                    <div className="text-xs">
                      press <strong>Cmd ⌘</strong> + <strong>Enter ↵</strong>
                    </div>
                  ) : (
                    <div className="text-xs">press <strong>Enter ↵</strong></div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <motion.div
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="absolute w-full bottom-10 flex items-center justify-end max-w-full overflow-hidden"
      >
        <div className="w-full max-w-2xl mx-auto flex justify-end  items-center gap-2">
          <div className="bg-card shadow-md px-2 h-8 border-primary rounded-sm border border-rounded flex items-center gap-2">
            <p className="text-sm text-gray-600 dark:text-white">
              Powered by <strong>Sypher</strong>
            </p>
            <Separator orientation="vertical" className="bg-primary" />
            <LogoIcon className="w-5 h-5" />
          </div>
        </div>
      </motion.div>
      {safeCurrentStep > 0 && isFullBackButton && (
        <div
          onClick={() => goToStep(safeCurrentStep - 1)}
          className="absolute top-0 left-0 h-app flex items-center justify-center px-8 rounded-md hover:bg-accent cursor-pointer"
        >
          <ChevronLeft className="w-8 h-8 transition-transform group-hover:-translate-x-1 text-primary" />
        </div>
      )}
    </div>
  );
};

export default StepperJsonForm;