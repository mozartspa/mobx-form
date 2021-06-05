export type FormModel = {
  [field: string]: any
}

export type FormErrors<Model> = {
  [K in keyof Model]?: Model[K] extends any[]
    ? Model[K][number] extends object
      ? FormErrors<Model[K][number]>[] | string
      : string
    : Model[K] extends object
    ? FormErrors<Model[K]>
    : string
}

export type FormTouched<Model> = {
  [K in keyof Model]?: Model[K] extends any[]
    ? Model[K][number] extends object
      ? FormTouched<Model[K][number]>[]
      : boolean
    : Model[K] extends object
    ? FormTouched<Model[K]>
    : boolean
}

export type Form<Model = FormModel> = {
  model: Model
  validModel: Model
  submittedModel: Model | undefined
  errors: FormErrors<Model>
  touched: FormTouched<Model>
  isSubmitting: boolean
  isValidating: boolean
  readonly isDirty: boolean
  readonly isValid: boolean
  setErrors(errors: FormErrors<Model>): void
  setTouched(touched: FormTouched<Model>): void
  setModel(model: Model): void
  setFieldValue(field: keyof Model & string, value: any): void
  setFieldError(field: keyof Model & string, message: string): void
  setFieldTouched(field: keyof Model & string, isTouched?: boolean): void
  getFieldValue(field: keyof Model & string): any
  getFieldError(field: keyof Model & string): string
  getFieldTouched(field: keyof Model & string): boolean
  validate(): Promise<FormErrors<Error>>
  reset(model?: Model, isValid?: boolean): void
  resetField(field: keyof Model & string, value?: any): void
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
