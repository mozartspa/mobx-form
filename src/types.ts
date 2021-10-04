export type FormValues = {
  [field: string]: any
}

export type FieldError = string | string[] | undefined

export type FormErrors = {
  [index: string]: FieldError
}

export type FormTouched = {
  [index: string]: boolean | undefined
}

export type FieldRegistrant<T = any, Values = any> = {
  validate?: FieldValidate<T, Values>
}

export type Disposer = () => void

export type Form<Values = FormValues> = {
  observableValues: Values
  values: Values
  errors: FormErrors
  touched: FormTouched
  isSubmitting: boolean
  isValidating: boolean
  readonly isDirty: boolean
  readonly isValid: boolean
  isFreezed: boolean
  setErrors(errors: FormErrors): void
  setTouched(touched: FormTouched): void
  setValues(values: Values): void
  setFieldValue(field: string, value: any): void
  setFieldError(field: string, message: FieldError): void
  addFieldError(field: string, message: FieldError): void
  setFieldTouched(field: string, isTouched?: boolean): void
  getFieldValue(field: string): any
  getFieldError(field: string): string | undefined
  getFieldErrors(field: string): string[] | undefined
  isFieldTouched(field: string): boolean
  isFieldValid(field: string): boolean
  isFieldDirty(field: string): boolean
  validate(): Promise<FormErrors>
  validateField(field: string): Promise<FieldError>
  reset(values?: Values): void
  resetField(field: string, value?: any): void
  submit(): Promise<FormErrors>
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => Promise<FormErrors>
  handleReset: (e?: React.SyntheticEvent<any>) => void
  register: (
    field: string,
    registrant: FieldRegistrant<any, Values>
  ) => Disposer
  freeze(): void
  unfreeze(): void
}

export type FormValidate<Values = any> = (
  values: Values
) => FormErrors | Promise<FormErrors>

export type ValidateDebounce =
  | boolean
  | number
  | { wait?: number; leading?: boolean }

export type FormConfig<Values = any> = {
  initialValues?: Values | (() => Values)
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validateDebounce?: ValidateDebounce
  onSubmit?: (values: Values) => void | FormErrors | Promise<void | FormErrors>
  onValidate?: FormValidate<Values>
  onFailedSubmit?: () => void
}

export type FieldValidate<T = any, Values = any> = (
  value: T,
  values: Values
) => FieldError | Promise<FieldError>

export type UseFieldOptions<T = any, Values = any> = {
  form?: Form<Values> | undefined
  format?: (value: T) => any
  parse?: (value: any) => T
  parseOnBlur?: (value: any) => T
  validate?: FieldValidate<T, Values> | FieldValidate<T, Values>[]
  validateDebounce?: ValidateDebounce
  validateOnChangeFields?: string[]
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export type UseFieldArrayOptions<Values = any> = {
  form?: Form<Values>
}
