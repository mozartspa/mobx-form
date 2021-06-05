export type FormValues = {
  [field: string]: any
}

export type FormErrors<Values> = {
  [K in keyof Values]?: Values[K] extends any[]
    ? Values[K][number] extends object
      ? FormErrors<Values[K][number]>[] | string
      : string
    : Values[K] extends object
    ? FormErrors<Values[K]>
    : string
}

export type FormTouched<Values> = {
  [K in keyof Values]?: Values[K] extends any[]
    ? Values[K][number] extends object
      ? FormTouched<Values[K][number]>[]
      : boolean
    : Values[K] extends object
    ? FormTouched<Values[K]>
    : boolean
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
  setFieldError(field: keyof Values & string, message: string): void
  setFieldTouched(field: keyof Values & string, isTouched?: boolean): void
  getFieldValue(field: keyof Values & string): any
  getFieldError(field: keyof Values & string): string
  getFieldTouched(field: keyof Values & string): boolean
  validate(): Promise<FormErrors<Error>>
  reset(values?: Values, isValid?: boolean): void
  resetField(field: keyof Values & string, value?: any): void
  submit(): Promise<void>
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => Promise<void>
  handleReset: (e?: React.SyntheticEvent<any>) => void
  handleBlur(e: React.FocusEvent<any>): void
  handleBlur<T = string | any>(
    fieldOrEvent: T
  ): T extends string ? (e: any) => void : void
  handleChange(e: React.ChangeEvent<any>): void
  handleChange<T = string | React.ChangeEvent<any>>(
    field: T
  ): T extends React.ChangeEvent<any>
    ? void
    : (eventOrValue: React.ChangeEvent<any> | any) => void
}
