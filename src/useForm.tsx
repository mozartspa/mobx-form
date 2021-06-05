import debouncePromise from "debounce-promise"
import get from "lodash.get"
import set from "lodash.set"
import { runInAction, toJS } from "mobx"
import { observer, useLocalObservable } from "mobx-react-lite"
import React, { useRef, useState } from "react"
import isEqual from "react-fast-compare"
import { DebugForm } from "./DebugForm"
import { Field, FieldProps } from "./Field"
import { FieldArray, FieldArrayProps } from "./FieldArray"
import { Form, FormErrors, FormTouched, FormValues } from "./types"
import { FormContext, useFormContext } from "./useFormContext"
import {
  isFunction,
  setNestedObjectValues,
  useCounter,
  useLatestValue,
} from "./utils"

export type FormConfig<Values> = {
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validateDebounce?: boolean
  validateDebounceWait?: number
  validateDebounceLeading?: boolean
  onSubmit?: (values: Values) => void | Promise<any>
  onValidate?: (values: Values) => Promise<FormErrors<Values>>
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

export type UseFormResult<Values> = Form<Values> & {
  FormContext: React.FC<{}>
  Form: React.FC<FormProps>
  Field: React.FC<FieldProps>
  FieldArray: React.FC<FieldArrayProps>
}

export function useForm<Values extends FormValues>(
  initialValues: Values | (() => Values),
  config: FormConfig<Values> = {}
): UseFormResult<Values> {
  const {
    validateOnChange = true,
    validateOnBlur = false,
    validateDebounce = false,
    validateDebounceWait = 300,
    validateDebounceLeading = false,
    onValidate = async () => ({}),
  } = config

  const [originalValuesMemoized] = useState(() =>
    toJS(isFunction(initialValues) ? initialValues() : initialValues)
  )
  const originalValuesRef = useRef<Values>(originalValuesMemoized)

  const counter = useCounter()

  const executeValidate = useLatestValue(() => {
    const doValidate = async () => {
      try {
        form.isValidating = true
        const validationId = counter.getValue()
        const data = toJS(form.values)
        const errors = await onValidate(data)
        if (counter.isLastValue(validationId)) {
          form.setErrors(errors)
          if (form.isValid) {
            runInAction(() => (form.validValues = data))
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
  })

  const form: Form<Values> = useLocalObservable(() => ({
    values: originalValuesRef.current,
    validValues: originalValuesRef.current,
    submittedValues: undefined,
    errors: {} as FormErrors<Values>,
    touched: {} as FormTouched<Values>,
    isSubmitting: false,
    isValidating: false,
    get isDirty() {
      return !isEqual(originalValuesRef.current, toJS(form.values))
    },
    get isValid() {
      return Object.keys(form.errors).length === 0
    },
    setErrors(errors: FormErrors<Values>) {
      form.errors = errors
    },
    setTouched(touched: FormTouched<Values>) {
      form.touched = touched
    },
    setValues(values: Values) {
      form.values = toJS(values)
    },
    setFieldValue(field: keyof Values & string, value: any) {
      if (form.getFieldValue(field) !== value) {
        set(form.values, field, value)
        validateOnChange && form.validate()
      }
    },
    getFieldValue(field: keyof Values & string) {
      return get(form.values, field)
    },
    setFieldError(field: keyof Values & string, message: string) {
      set(form.errors, field, message)
    },
    getFieldError(field: keyof Values & string) {
      return get(form.errors, field) as string
    },
    setFieldTouched(field: keyof Values & string, isTouched: boolean = true) {
      set(form.touched, field, isTouched)
      isTouched && validateOnBlur && form.validate()
    },
    getFieldTouched(field: keyof Values & string) {
      return get(form.touched, field) as boolean
    },
    async validate() {
      return executeValidate.current()
    },
    reset(values: Values | undefined = undefined, isValid: boolean = true) {
      if (values) {
        originalValuesRef.current = toJS(values)
      }

      form.setValues(originalValuesRef.current)
      form.setErrors({})
      form.setTouched({})

      if (isValid) {
        form.validValues = toJS(form.values)
      } else {
        form.validate()
      }
    },
    resetField(field: keyof Values & string, value: any = undefined) {
      if (value !== undefined) {
        set(originalValuesRef.current, field, toJS(value))
      }

      form.setFieldValue(field, toJS(get(originalValuesRef.current, field)))
    },
    async submit() {
      try {
        form.isSubmitting = true
        const data = toJS(form.values)
        form.touched = setNestedObjectValues(data, true)
        const errors = await form.validate()
        if (Object.keys(errors).length === 0) {
          runInAction(() => (form.submittedValues = data))
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
