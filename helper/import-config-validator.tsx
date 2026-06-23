export const validateImportedConfig = (
  jsonContent: any,
  requiredKeys: { moduleName: string; fields: string[] },
  isForcePrefill: boolean = false
) => {
  // Invalid JSON format
  if (
    !jsonContent ||
    typeof jsonContent !== "object" ||
    Array.isArray(jsonContent)
  ) {
    return { valid: false, message: "Invalid JSON format." };
  }

  // check JSON empty
  if (Object.keys(jsonContent).length === 0) {
    return { valid: false, message: "The JSON content is empty." };
  }

  switch (requiredKeys.moduleName) {
    case "class_group":
      return classGroupValidation(
        jsonContent,
        requiredKeys.fields,
        isForcePrefill
      );

    case "data_template":
      return dataTemplateValidation(
        jsonContent,
        requiredKeys.fields,
        isForcePrefill
      );

    default:
      return { valid: true };
  }
};

const classGroupValidation = (
  jsonContent: any,
  fields: string[],
  isForcePrefill: boolean
) => {
  const hasAnyExpectedField = fields.some((f) => f in jsonContent);
  if (!hasAnyExpectedField) {
    return { valid: false, message: "Invalid JSON format." };
  }

  // First validate KEY only
  const keyValue = jsonContent.key;
  if (
    keyValue === undefined ||
    keyValue === null ||
    (typeof keyValue === "string" && keyValue.trim() === "")
  ) {
    return { valid: false, message: "Missing or invalid field: key" };
  }

  // If isForcePrefill = true → skip all validations and allow autoFill

  if (isForcePrefill) {
    return { valid: true };
  }

  // Check class_schema exists
  const classSchema = jsonContent.class_schema;
  if (!Array.isArray(classSchema) || classSchema.length === 0) {
    return { valid: false, message: "class_schema is empty or missing." };
  }
  // Deep validate items inside class_schema
  for (const item of classSchema) {
    if (
      !item.class_name ||
      item.class_name.trim() === "" ||
      !item.class_description ||
      item.class_description.trim() === ""
    ) {
      return {
        valid: false,
        message: "Missing data inside class_schema",
      };
    }
  }

  // Validate remaining top-level fields
  const remainingFields = ["name", "description", "class_schema"];
  const missingFields: string[] = [];

  remainingFields.forEach((field) => {
    const value = jsonContent[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    return {
      valid: false,
      message: `Missing or invalid fields: ${missingFields.join(", ")}`,
    };
  }

  return { valid: true };
};

const dataTemplateValidation = (
  jsonContent: any,
  fields: string[],
  isForcePrefill: boolean
) => {
  const missingTemplateKeys = fields.filter((f) => !(f in jsonContent));

  if (missingTemplateKeys.length === fields.length) {
    return { valid: false, message: "Invalid JSON format." };
  }

  //  First validate template_class only
  const templateClass = jsonContent.template_class;
  if (
    templateClass === undefined ||
    templateClass === null ||
    (typeof templateClass === "string" && templateClass.trim() === "")
  ) {
    return {
      valid: false,
      message: "Missing or invalid field: template_class",
    };
  }

  // If isForcePrefill = true → allow prefill and skip all validations
  if (isForcePrefill) {
    return { valid: true };
  }

  // Validate top-level fields
  const topFields = ["name", "description", "data_schema"];
  const missingFields: string[] = [];

  topFields.forEach((field) => {
    const value = jsonContent[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    return {
      valid: false,
      message: `Missing or invalid fields: ${missingFields.join(", ")}`,
    };
  }

  // Validate data_schema
  const dataSchema = jsonContent.data_schema;
  if (!Array.isArray(dataSchema) || dataSchema.length === 0) {
    return { valid: false, message: "data_schema is empty or missing." };
  }

  for (const item of dataSchema) {
    if (
      !item.name ||
      item.name.trim() === "" ||
      !item.description ||
      item.description.trim() === "" ||
      !item.data_type ||
      item.data_type.trim() === ""
    ) {
      return {
        valid: false,
        message: "Missing data inside data_schema",
      };
    }
  }

  return { valid: true };
};
