import { CHOICE_FIELDS, CONTACT_INFO_FIELDS, LAYOUT_FIELDS, OTHER_FIELDS, TEXT_AND_FILES_FIELDS } from "../constants/fields";

export function getCategoryColorByDsType(dsType: string): string {
    const categories = [
      CONTACT_INFO_FIELDS,
      TEXT_AND_FILES_FIELDS,
      CHOICE_FIELDS,
      LAYOUT_FIELDS,
      OTHER_FIELDS,
    ];
  
    for (const category of categories) {
      if (category.fields.some(field => field.dsType === dsType)) {
        return category.color;
      }
    }
  
    return ""; // Return undefined if no matching dsType is found
  }