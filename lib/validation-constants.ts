
export const validationConstants = {
  required: { min: 1 },
  tool_name: { min: 6 },
  minimumText: { min: 4 },
  password:{ min: 8 },
  keywords: { min: 25 },
  title: { min: 2, max: 120 },
  name: { min: 4, max: 80 },
  labels: { min: 2, max: 60 },
  alert_recipients: { min: 1, max: 10 },
  description: { min: 10, max: 600 },
  short_text: { min: 10, max: 1000 },
  long_text: { min: 10, max: 4000 },
};

export const getValidationConstant = (
  key: keyof typeof validationConstants
): { min: number; max?: number } => {
  return validationConstants[key];
};
