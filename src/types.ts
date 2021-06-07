export type FormValues = {
  [field: string]: any
}

export type FieldError = string | string[] | undefined

export type FormErrors<Values = any> = {
  [K in keyof Values & string]?: FieldError
}

export type FormTouched<Values = any> = {
  [K in keyof Values & string]?: boolean | undefined
}

export type Form<Values = FormValues> = {
  values: Values
  validValues: Values
  submittedValues: Values | undefined
  errors: FormErrors<Values>
  touched: FormTouched<Values>
  isSubmitting: boolean
  isValidating: boolean
  readonly isDirty: boolean
  readonly isValid: boolean
  setErrors(errors: FormErrors<Values>): void
  setTouched(touched: FormTouched<Values>): void
  setValues(values: Values): void
  setFieldValue(field: keyof Values & string, value: any): void
  setFieldError(field: keyof Values & string, message: FieldError): void
  setFieldTouched(field: keyof Values & string, isTouched?: boolean): void
  getFieldValue(field: keyof Values & string): any
  getFieldError(field: keyof Values & string): string | undefined
  getFieldErrors(field: keyof Values & string): string[] | undefined
  getFieldTouched(field: keyof Values & string): boolean
  validate(): Promise<FormErrors<Error>>
  reset(values?: Values, isValid?: boolean): void
  resetField(field: keyof Values & string, value?: any): void
  submit(): Promise<void>
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => Promise<void>
  handleReset: (e?: React.SyntheticEvent<any>) => void
}
