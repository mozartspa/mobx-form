import debouncePromise from "debounce-promise"
import get from "lodash.get"
import set from "lodash.set"
import { runInAction, toJS } from "mobx"
import { observer, useLocalObservable } from "mobx-react-lite"
import React, { useMemo, useRef, useState } from "react"
import isEqual from "react-fast-compare"
import { DebugForm } from "./DebugForm"
import { Field, FieldProps } from "./Field"
import { FieldArray, FieldArrayProps } from "./FieldArray"
import { Form, FormErrors, FormModel, FormTouched } from "./types"
import { FormContext, useFormContext } from "./useFormContext"
import {
  getSelectedValues,
  getValueForCheckbox,
  isFunction,
  isString,
  setNestedObjectValues,
  useCounter,
} from "./utils"

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

  const [originalModelMemoized] = useState(() =>
    toJS(isFunction(model) ? model() : model)
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
      const { type, name, id, value, checked, options, multiple } = (
        eventOrValue as React.ChangeEvent<any>
      ).target

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

  const counter = useCounter()

  const executeValidate = useMemo(() => {
    const doValidate = async () => {
      try {
        form.isValidating = true
        const validationId = counter.getValue()
        const data = toJS(form.model)
        const errors = await onValidate(data)
        if (counter.isLastValue(validationId)) {
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
  }, [
    validateDebounce,
    validateDebounceWait,
    validateDebounceLeading,
    counter,
    onValidate,
  ])

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
        return (event) => executeBlur(event, eventOrString)
      } else {
        executeBlur(eventOrString)
      }
    },
    handleChange(
      eventOrPath: string | React.ChangeEvent<any>
    ): void | ((eventOrTextValue: React.ChangeEvent<any> | any) => void) {
      if (isString(eventOrPath)) {
        return (event) => executeChange(event, eventOrPath)
      } else {
        executeChange(eventOrPath)
      }
    },
  }))

  const [formWithComponents] = useState(() =>
    Object.assign(form, {
      FormContext: withFormProvider(
        form,
        (({ children }) => children) as React.FC<{}>
      ),
      Form: withFormProvider(form, FormComp),
      Field: withFormProvider(form, Field),
      FieldArray: withFormProvider(form, FieldArray),
    })
  )

  return formWithComponents
}

export const FormProvider = FormContext.Provider

export type FormProps = React.FormHTMLAttributes<HTMLFormElement> & {
  debug?: boolean
}

export const FormComp: React.FC<FormProps> = (props) => {
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
