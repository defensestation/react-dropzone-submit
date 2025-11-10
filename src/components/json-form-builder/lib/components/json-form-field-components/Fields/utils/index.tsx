import { CheckboxField, DateField, NumberField, SelectField, TextArea, TextField, FileField, RadioField, LabelField } from "..";
import { BuilderFieldArguments } from "../../../../types/dnd-types";

export const renderBuilderField = (
    args: BuilderFieldArguments
  ): React.ReactElement => {
    if (args.type === "string") {
      if (args.format === "date") {
        return <DateField {...args} />;
      } 
      else if(args.format === "enum") {
        return (<SelectField {...args} />)
      }
      else if(args.format === "radio") {
        return (<RadioField {...args} />)
      }
      else if (args.multiline) {
        return <TextArea {...args} />;
      } else if(args.format === "file") {
        return <FileField {...args} />
      } else if(args.format === "label") {
        return <LabelField {...args} />
      }
      else {
        return <TextField {...args} />;
      }
    } else if (args.type === "boolean") {
      return <CheckboxField {...args} />;
    } else if (args.type === "number" || args.type === "integer") {
      return <NumberField {...args} />;
    } 
    return <div>No renderer is compatible with type.</div>;
  };