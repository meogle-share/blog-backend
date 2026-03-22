import { ValidationError } from 'class-validator';

export interface ValidationFieldErrors {
  [field: string]: string[];
}

export function parseValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): ValidationFieldErrors {
  const fields: ValidationFieldErrors = {};

  for (const error of errors) {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;

    if (error.constraints) {
      fields[path] = Object.values(error.constraints);
    }

    if (error.children?.length) {
      Object.assign(fields, parseValidationErrors(error.children, path));
    }
  }

  return fields;
}
