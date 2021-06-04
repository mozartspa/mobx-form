import debouncePromise from "debounce-promise"
import get from "lodash.get"
import { runInAction, toJS } from "mobx"
import { Observer, observer, useLocalObservable } from "mobx-react-lite"
import React, { ReactElement, useMemo, useRef } from "react"
import isEqual from "react-fast-compare"
import { set } from "./helpers/set"
import { DebugForm } from "./DebugForm"

const isString = (obj: any): obj is string =>
  Object.prototype.toString.call(obj) === "[object String]"

const isFunction = (func: any): func is Function => func instanceof Function

const isObject = (obj: any): obj is Object =>
  obj !== null && typeof obj === "object"

function setNestedObjectValues<T>(
  object: any,
  value: any,
  visited: any = new WeakMap(),
  response: any = {}
): T {
  for (let k of Object.keys(object)) {
    const val = object[k]
    if (isObject(val)) {
      if (!visited.get(val)) {
        visited.set(val, true)
        // In order to keep array values consistent for both dot path  and
        // bracket syntax, we need to check if this is an array so that
        // this will output  { friends: [true] } and not { friends: { "0": true } }
        response[k] = Array.isArray(val) ? [] : {}
        setNestedObjectValues(val, value, visited, response[k])
      }
    } else {
      response[k] = value
    }
  }

  return response
}

function getValueForCheckbox(
  currentValue: string | any[],
  checked: boolean,
  valueProp: any
) {
  // eslint-disable-next-line eqeqeq
  if (valueProp == "true" || valueProp == "false") {
    return !!checked
  }

  if (checked && valueProp) {
    return Array.isArray(currentValue)
      ? currentValue.concat(valueProp)
      : [valueProp]
  }
  if (!Array.isArray(currentValue)) {
    return !currentValue
  }
  const index = currentValue.indexOf(valueProp)
  if (index < 0) {
    return currentValue
  }
  return currentValue.slice(0, index).concat(currentValue.slice(index + 1))
}

function getSelectedValues(options: any[]) {
  return Array.from(options)
    .filter(el => el.selected)
    .map(el => el.value)
}

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

export type FormConfig<Model> = {
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validateDebounce?: boolean
  validateDebounceWait?: number
  validateDebounceLeading?: boolean
  onSubmit?: (model: Model) => void | Promise<any>
  onValidate?: (model: Model) => Promise<FormErrors<Model>>
  onFailedSubmit?: () => void
}

export const FormContext = React.createContext<Form | undefined>(undefined)

export function useFormContext<FormModel = any>() {
  const context = React.useContext(FormContext)
  if (!context) {
    throw new Error(
      `Missing FormContext. Did you use "<FormProvider />" or the "<Form />" provided by "useForm()"?`
    )
  }
  return context as Form<FormModel>
}

function withFormProvider<T extends React.ComponentType<any>>(
  form: Form,
  Component: T
): T {
  return observer((props: any) => (
    <FormContext.Provider value={form}>
      <Component {...props} />
    </FormContext.Provider>
  )) as T
}

export type UseFormResult<Model> = Form<Model> & {
  FormContext: React.FC<{}>
  Form: React.FC<FormProps>
  Field: React.FC<FieldProps>
  FieldArray: React.FC<FieldArrayProps>
}

export function useForm<Model extends FormModel>(
  model: Model | (() => Model),
  config: FormConfig<Model> = {}
): UseFormResult<Model> {
  const {
    validateOnChange = true,
    validateOnBlur = false,
    validateDebounce = false,
    validateDebounceWait = 300,
    validateDebounceLeading = false,
    onValidate = async () => ({}),
  } = config

  const originalModelMemoized = useMemo(
    () => toJS(isFunction(model) ? model() : model),
    []
  )
  const originalModelRef = useRef<Model>(originalModelMemoized)

  const executeBlur = (e: any = {}, path?: string) => {
    const { name, id } = e.target || {}
    const field = path ? path : name ? name : id
    form.setFieldTouched(field, true)
  }

  const executeChange = (
    eventOrValue: React.ChangeEvent<any> | any,
    maybePath?: string
  ) => {
    let field = maybePath
    let val = eventOrValue
    let parsed

    if (eventOrValue && eventOrValue.target) {
      const {
        type,
        name,
        id,
        value,
        checked,
        options,
        multiple,
      } = (eventOrValue as React.ChangeEvent<any>).target

      field = maybePath ? maybePath : name ? name : id

      val = /number|range/.test(type)
        ? ((parsed = parseFloat(value)), isNaN(parsed) ? undefined : parsed)
        : /checkbox/.test(type) // checkboxes
        ? getValueForCheckbox(get(form.model, field!), checked, value)
        : !!multiple // <select multiple>
        ? getSelectedValues(options)
        : value
    }

    if (field) {
      form.setFieldValue(field, val)
    }
  }

  const { getValidationId, isLastValidation } = useMemo(() => {
    let validationId = 0
    const getValidationId = () => {
      return ++validationId
    }
    const isLastValidation = (id: number) => {
      return id === validationId
    }
    return {
      getValidationId,
      isLastValidation,
    }
  }, [])

  const executeValidate = useMemo(() => {
    const doValidate = async () => {
      try {
        form.isValidating = true
        const validationId = getValidationId()
        const data = toJS(form.model)
        const errors = await onValidate(data)
        if (isLastValidation(validationId)) {
          form.setErrors(errors)
          if (form.isValid) {
            runInAction(() => (form.validModel = data))
          }
        }
        return errors
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        runInAction(() => (form.isValidating = false))
      }
    }

    if (validateDebounce) {
      return debouncePromise(doValidate, validateDebounceWait, {
        leading: validateDebounceLeading,
      })
    } else {
      return doValidate
    }
  }, [validateDebounce, validateDebounceWait, validateDebounceLeading])

  const form: Form<Model> = useLocalObservable(() => ({
    model: originalModelRef.current,
    validModel: originalModelRef.current,
    submittedModel: undefined,
    errors: {} as FormErrors<Model>,
    touched: {} as FormTouched<Model>,
    isSubmitting: false,
    isValidating: false,
    get isDirty() {
      return !isEqual(originalModelRef.current, toJS(form.model))
    },
    get isValid() {
      return Object.keys(form.errors).length === 0
    },
    setErrors(errors: FormErrors<Model>) {
      form.errors = errors
    },
    setTouched(touched: FormTouched<Model>) {
      form.touched = touched
    },
    setModel(model: Model) {
      form.model = toJS(model)
    },
    setFieldValue(field: keyof Model & string, value: any) {
      if (form.getFieldValue(field) !== value) {
        set(form.model, field, value)
        validateOnChange && form.validate()
      }
    },
    getFieldValue(field: keyof Model & string) {
      return get(form.model, field)
    },
    setFieldError(field: keyof Model & string, message: string) {
      set(form.errors, field, message)
    },
    getFieldError(field: keyof Model & string) {
      return get(form.errors, field) as string
    },
    setFieldTouched(field: keyof Model & string, isTouched: boolean = true) {
      set(form.touched, field, isTouched)
      isTouched && validateOnBlur && form.validate()
    },
    getFieldTouched(field: keyof Model & string) {
      return get(form.touched, field) as boolean
    },
    async validate() {
      return executeValidate()
    },
    reset(model: Model | undefined = undefined, isValid: boolean = true) {
      if (model) {
        originalModelRef.current = toJS(model)
      }

      form.setModel(originalModelRef.current)
      form.setErrors({})
      form.setTouched({})

      if (isValid) {
        form.validModel = toJS(form.model)
      } else {
        form.validate()
      }
    },
    resetField(field: keyof Model & string, value: any = undefined) {
      if (value !== undefined) {
        set(originalModelRef.current, field, toJS(value))
      }

      form.setFieldValue(field, toJS(get(originalModelRef.current, field)))
    },
    async submit() {
      try {
        form.isSubmitting = true
        const data = toJS(form.model)
        form.touched = setNestedObjectValues(data, true)
        const errors = await form.validate()
        if (Object.keys(errors).length === 0) {
          runInAction(() => (form.submittedModel = data))
          if (config.onSubmit) {
            await config.onSubmit(data)
          }
        } else {
          if (config.onFailedSubmit) {
            config.onFailedSubmit()
          }
        }
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        runInAction(() => (form.isSubmitting = false))
      }
    },
    async handleSubmit(e?: React.FormEvent<HTMLFormElement>) {
      if (e) {
        e.preventDefault()
      }
      return form.submit()
    },
    handleReset(e?: React.SyntheticEvent<any>) {
      if (e) {
        e.preventDefault()
      }
      form.reset()
    },
    handleBlur(eventOrString: any): void | ((e: any) => void) {
      if (isString(eventOrString)) {
        return event => executeBlur(event, eventOrString)
      } else {
        executeBlur(eventOrString)
      }
    },
    handleChange(
      eventOrPath: string | React.ChangeEvent<any>
    ): void | ((eventOrTextValue: React.ChangeEvent<any> | any) => void) {
      if (isString(eventOrPath)) {
        return event => executeChange(event, eventOrPath)
      } else {
        executeChange(eventOrPath)
      }
    },
  }))

  const FormContextComponent = useMemo(
    () => withFormProvider(form, (({ children }) => children) as React.FC<{}>),
    []
  )
  const FormComponent = useMemo(() => withFormProvider(form, Form), [])
  const FieldComponent = useMemo(() => withFormProvider(form, Field), [])
  const FieldArrayComponent = useMemo(
    () => withFormProvider(form, FieldArray),
    []
  )

  const formWithComponents = useMemo(
    () =>
      Object.assign(form, {
        FormContext: FormContextComponent,
        Form: FormComponent,
        Field: FieldComponent,
        FieldArray: FieldArrayComponent,
      }),
    []
  )

  return formWithComponents
}

export type FieldConverter<M = any, F = any> = {
  fromModelToForm: (value: M) => F
  fromFormToModel: (value: F) => M
}

export type UseFieldOptions = {
  defaultValue?: string
  converter?: FieldConverter
}

export type UseFieldResult<T = any> = {
  input: {
    name: string
    readonly value: T
    onBlur: (e: any) => void
    onChange: (eventOrValue: React.ChangeEvent<any> | any) => void
  }
  meta: {
    readonly value: T
    readonly touched: boolean
    readonly error: string
  }
  form: Form<any>
}

export function useField<T = any>(
  name: string,
  options: UseFieldOptions = {}
): UseFieldResult<T> {
  const { defaultValue = "", converter } = options

  const form = useFormContext()
  const onBlur = useMemo(() => form.handleBlur(name), [name])
  const onChange = useMemo(() => {
    if (converter) {
      return (eventOrValue: React.ChangeEvent<any> | any) => {
        const value =
          eventOrValue && eventOrValue.target
            ? eventOrValue.target.value
            : eventOrValue
        form.setFieldValue(name, converter.fromFormToModel(value))
      }
    } else {
      return form.handleChange(name)
    }
  }, [name, converter])

  return {
    input: {
      name,
      get value(): T {
        const value = form.getFieldValue(name)
        return converter
          ? converter.fromModelToForm(value)
          : value == null
          ? defaultValue
          : value
      },
      onBlur,
      onChange,
    },
    meta: {
      get value(): T {
        return form.getFieldValue(name)
      },
      get touched() {
        return form.getFieldTouched(name)
      },
      get error() {
        return form.getFieldError(name)
      },
    },
    form,
  }
}

export type UseFieldArrayOptions = {
  validateOnChange?: boolean
}

export function useFieldArray<T>(
  name: string,
  options: UseFieldArrayOptions = {}
) {
  const { validateOnChange = true } = options

  const field = useField(name)
  const { meta, form } = field

  function update<TResult>(fn: (array: T[]) => TResult) {
    const result = fn(ensureArray())
    if (validateOnChange) {
      form.validate()
    }
    return result
  }

  const ensureArray = (): T[] => {
    if (!Array.isArray(meta.value)) {
      form.setFieldValue(name, [])
      return form.getFieldValue(name)
    } else {
      return meta.value
    }
  }

  const getLength = () => (Array.isArray(meta.value) ? meta.value.length : 0)

  const forEach = (iterator: (name: string, index: number) => void): void => {
    const len = getLength()
    for (let i = 0; i < len; i++) {
      iterator(`${name}[${i}]`, i)
    }
  }

  const map = (iterator: (name: string, index: number) => any): any[] => {
    const len = getLength()
    const results: any[] = []
    for (let i = 0; i < len; i++) {
      results.push(iterator(`${name}[${i}]`, i))
    }
    return results
  }

  const push = (...items: T[]) => {
    return update(array => array.push(...items))
  }

  const pop = () => {
    return update(array => array.pop())
  }

  const clear = () => {
    return update(array => array.splice(0, array.length))
  }

  const insertAt = (index: number, item: T) => {
    update(array => array.splice(index, 0, item))
  }

  const removeAt = (index: number) => {
    return update(array => array.splice(index, 1)[0])
  }

  const remove = (item: T) => {
    const index = ensureArray().indexOf(item)
    if (index !== -1) {
      removeAt(index)
    }
  }

  const setValue = (value: T[]) => {
    form.setFieldValue(name, value)
  }

  const fields = {
    name,
    get value(): T[] {
      return form.getFieldValue(name) || []
    },
    get length() {
      return getLength()
    },
    forEach,
    map,
    push,
    pop,
    insertAt,
    removeAt,
    remove,
    clear,
    setValue,
  }

  return {
    fields,
    form,
  }
}

export const FormProvider = FormContext.Provider

export type FormProps = React.FormHTMLAttributes<HTMLFormElement> & {
  debug?: boolean
}

export const Form: React.FC<FormProps> = props => {
  const form = useFormContext()
  const { debug, children, ...formProps } = props

  return (
    <form
      {...formProps}
      onSubmit={form.handleSubmit}
      onReset={form.handleReset}
    >
      {children}
      {debug && <DebugForm showAll={true} />}
    </form>
  )
}

export type FieldRenderProps = UseFieldResult

export type FieldProps = UseFieldOptions & {
  name: string
  children: (props: FieldRenderProps) => ReactElement
}

export const Field: React.FC<FieldProps> = ({ name, children, ...options }) => {
  const field = useField(name, options)

  return <Observer>{() => children(field)}</Observer>
}

export type FieldArrayRenderProps = ReturnType<typeof useFieldArray>

export type FieldArrayProps = {
  name: string
  children: (props: FieldArrayRenderProps) => ReactElement
}

export const FieldArray: React.FC<FieldArrayProps> = ({ name, children }) => {
  const fieldArray = useFieldArray(name)

  return <Observer>{() => children(fieldArray)}</Observer>
}
