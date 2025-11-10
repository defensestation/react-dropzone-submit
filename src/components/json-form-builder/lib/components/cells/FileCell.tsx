import merge from 'lodash/merge';
import { ChangeEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { VanillaRendererProps, withVanillaCellProps } from '@jsonforms/vanilla-renderers';
import { and, CellProps, formatIs, isStringControl, RankedTester, rankWith } from '@jsonforms/core';
import { withJsonFormsCellProps } from '@jsonforms/react';
import { cn } from '@/lib/utils';
import { useSubmitData } from '@/context/SubmitData';

export const FileCell = (props: CellProps & VanillaRendererProps) => {
  const {
    config,
    data,
    className,
    id,
    enabled,
    uischema,
    schema,
    path,
    handleChange,
  } = props;
  const maxLength = schema.maxLength;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const [isDragging, setIsDragging] = useState(false);
  const { addFile, files } = useSubmitData();
  console.log({files})

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      if (event.target.files?.length) {
        const file = event.target.files[0];
        // const dataUrl = await processFile(file);
        handleChange(path, file.name);
        addFile(file, path)
      }
    } catch (error) {
      console.error('Error handling file:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    try {
      if (event.dataTransfer.files?.length) {
        const file = event.dataTransfer.files[0];
        // const dataUrl = await processFile(file);
        handleChange(path, file.name);
        addFile(file, path)
      }
    } catch (error) {
      console.error('Error handling dropped file:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer",
        isDragging ? "border-primary bg-primary/10" : "border-gray-200",
        !enabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <Input
        type="file"
        onChange={handleFileChange}
        accept={appliedUiSchemaOptions.accept}
        multiple={false}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        required={appliedUiSchemaOptions.required}
        id={id}
        disabled={!enabled}
        autoFocus={appliedUiSchemaOptions.focus}
      />
      <div className="space-y-2">
        <div className="text-sm text-gray-500">
          {data ? (
            <p>File selected</p>
          ) : (
            <>
              <p>Drag and drop a file here, or click to select</p>
              {appliedUiSchemaOptions.accept && (
                <p className="text-xs">
                  Accepted formats: {appliedUiSchemaOptions.accept}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const fileCellTester: RankedTester = rankWith(4, and(
  isStringControl,
  formatIs('data-url')
));

export default withJsonFormsCellProps(withVanillaCellProps(FileCell));