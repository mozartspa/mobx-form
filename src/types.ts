export type FormValues = {
  [field: string]: any
}

export type FieldError = {
  message: string
  args?: any
}

export type FieldErrorInput = string | FieldError | (string | FieldError)[]

export type FormErrors = {
  [index: string]: FieldError[] | undefined
}

export type FormErrorsInput = {
  [index: string]: FieldErrorInput | undefined
}

export type FormTouched = {
  [index: string]: boolean | undefined
}

export type FieldRegistrant<T = any, Values = any> = {
  validate?: FieldValidate<T, Values>
  onBeforeSubmit?: () => void
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
  setErrors(errors: FormErrorsInput): void
  setTouched(touched: FormTouched): void
  setValues(values: Values): void
  setFieldValue(field: string, value: any): void
  setFieldError(field: string, message: FieldErrorInput | undefined): void
  addFieldError(field: string, message: FieldErrorInput | undefined): void
  setFieldTouched(field: string, isTouched?: boolean): void
  getFieldValue(field: string): any
  getFieldError(field: string): FieldError | undefined
  getFieldErrors(field: string): FieldError[] | undefined
  getFieldResetValue(field: string): any
  isFieldTouched(field: string): boolean
  isFieldValid(field: string): boolean
  isFieldDirty(field: string): boolean
  validate(): Promise<FormErrors>
  validateField(field: string): Promise<FieldError[] | undefined>
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
) => FormErrorsInput | Promise<FormErrorsInput>

export type ValidateDebounce =
  | boolean
  | number
  | { wait?: number; leading?: boolean }

export type FormConfig<Values = any> = {
  initialValues?: Values | (() => Values)
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validateDebounce?: ValidateDebounce
  onSubmit?: (
    values: Values
  ) => void | FormErrorsInput | Promise<void | FormErrorsInput>
  onValidate?: FormValidate<Values>
  onFailedSubmit?: () => void
}

export type FieldValidate<T = any, Values = any> = (
  value: T,
  values: Values
) => FieldErrorInput | undefined | Promise<FieldErrorInput | undefined>

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
