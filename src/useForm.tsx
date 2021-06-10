import debounce from "debounce-promise"
import get from "dlv"
import { dset as set } from "dset"
import { runInAction, toJS } from "mobx"
import { observer, useLocalObservable } from "mobx-react-lite"
import React, { useRef, useState } from "react"
import isEqual from "react-fast-compare"
import { DebugForm } from "./DebugForm"
import {
  FieldError,
  FieldRegistrant,
  Form,
  FormConfig,
  FormErrors,
  FormTouched,
  FormValues,
} from "./types"
import { FormContext, useFormContext } from "./useFormContext"
import {
  buildObjectPaths,
  getDebounceValues,
  hasErrors,
  isError,
  isFunction,
  logError,
  mergeErrors,
  useCounter,
  useLatestValue,
  warn,
} from "./utils"

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

type RegisteredFields<Values> = Record<string, FieldRegistrant<any, Values>>

export type UseFormResult<Values> = Form<Values> & {
  FormContext: React.FC<{}>
  Form: React.FC<FormProps>
}

export function useForm<Values extends FormValues>(
  config: FormConfig<Values> = {}
): UseFormResult<Values> {
  const {
    initialValues = {},
    validateOnChange = true,
    validateOnBlur = false,
    validateDebounce = false,
    onValidate = async () => ({}),
    onFailedSubmit,
    onSubmit,
  } = config

  // initialValues
  const [originalValuesMemoized] = useState(() =>
    toJS(isFunction(initialValues) ? initialValues() : initialValues)
  )
  const originalValuesRef = useRef<Values>(originalValuesMemoized)

  // create form validator
  const counter = useCounter()
  const debounceValues = getDebounceValues(validateDebounce)
  const executeValidate = useLatestValue(() => {
    const validateField = async (field: string, values: Values) => {
      const value = form.getFieldValue(field)
      const error = await registeredFields.current[field].validate(
        value,
        values
      )
      return {
        [field]: error,
      }
    }

    const doValidate = async () => {
      runInAction(() => {
        form.isValidating = true
      })

      const validationId = counter.getValue()
      const values = toJS(form.values)

      let errors: FormErrors
      try {
        errors = mergeErrors(
          await Promise.all([
            onValidate(values),
            ...Object.keys(registeredFields.current).map((field) =>
              validateField(field, values)
            ),
          ])
        )

        if (counter.isLastValue(validationId)) {
          form.setErrors(errors)
        }
      } catch (err) {
        logError(err)
        throw err
      } finally {
        if (counter.isLastValue(validationId)) {
          runInAction(() => {
            form.isValidating = false
          })
        }
      }

      return errors
    }

    if (debounceValues) {
      return debounce(doValidate, debounceValues.wait, {
        leading: debounceValues.leading,
      })
    } else {
      return doValidate
    }
  }, [
    onValidate,
    debounceValues && debounceValues.wait,
    debounceValues && debounceValues.leading,
  ])

  // submitter
  const executeSubmit = useLatestValue(() => {
    const doSubmit = async () => {
      const values = toJS(form.values)

      runInAction(() => {
        form.isSubmitting = true
        form.touched = buildObjectPaths(values, true)
      })

      const errors = await form.validate()
      const isValid = !hasErrors(errors)

      try {
        if (isValid) {
          const maybeErrors = await onSubmit?.(values)
          if (maybeErrors) {
            form.setErrors(maybeErrors)
          }
          return maybeErrors || ({} as FormErrors)
        } else {
          onFailedSubmit?.()
          return errors
        }
      } catch (err) {
        logError(err)
        throw err
      } finally {
        runInAction(() => {
          form.isSubmitting = false
        })
      }
    }

    return doSubmit
  }, [onSubmit, onFailedSubmit])

  // store field registrants
  const registeredFields = useRef<RegisteredFields<Values>>({})

  // refs to validation options
  const optionsRef = useLatestValue(() => ({
    validateOnChange,
    validateOnBlur,
  }))

  // the form!
  const form: Form<Values> = useLocalObservable(() => ({
    values: originalValuesRef.current,
    errors: {} as FormErrors,
    touched: {} as FormTouched,
    isSubmitting: false,
    isValidating: false,
    get isDirty() {
      return !isEqual(originalValuesRef.current, toJS(form.values))
    },
    get isValid() {
      return !hasErrors(form.errors)
    },
    setErrors(errors: FormErrors) {
      form.errors = errors || {}
    },
    setTouched(touched: FormTouched) {
      form.touched = touched || {}
    },
    setValues(values: Values) {
      form.values = toJS(values)
    },
    setFieldValue(field: string, value: any) {
      if (form.getFieldValue(field) !== value) {
        set(form.values, field, value)
        optionsRef.current.validateOnChange && form.validate()
      }
    },
    getFieldValue(field: string) {
      return get(form.values, field)
    },
    setFieldError(field: string, message: FieldError) {
      form.errors[field] = message
    },
    addFieldError(field: string, message: FieldError) {
      if (message == null) {
        return // do nothing
      }

      const error = Array.isArray(message) ? message : [message]
      const current = form.errors[field]

      if (current == null) {
        form.errors[field] = message
      } else if (Array.isArray(current)) {
        form.errors[field] = [...current, ...error]
      } else {
        form.errors[field] = [current, ...error]
      }
    },
    getFieldError(field: string): string | undefined {
      const err = form.errors[field]
      if (Array.isArray(err)) {
        return err.length > 0 ? err[0] : undefined
      } else {
        return err
      }
    },
    getFieldErrors(field: string): string[] | undefined {
      const err = form.errors[field]
      if (err == null) {
        return undefined
      } else if (Array.isArray(err)) {
        return err
      } else {
        return [err]
      }
    },
    setFieldTouched(field: string, isTouched: boolean = true) {
      form.touched[field] = isTouched
      isTouched && optionsRef.current.validateOnBlur && form.validate()
    },
    isFieldTouched(field: string) {
      return Boolean(form.touched[field])
    },
    isFieldValid(field: string) {
      return !isError(form.getFieldError(field))
    },
    isFieldDirty(field: string) {
      return !isEqual(
        get(originalValuesRef.current, field),
        toJS(get(form.values, field))
      )
    },
    async validate() {
      return executeValidate.current()
    },
    async validateField(field: string) {
      const registrant = registeredFields.current[field]
      if (!registrant) {
        return Promise.resolve(undefined)
      }
      const errors = await registrant.validate(
        form.getFieldValue(field),
        form.values
      )
      form.setFieldError(field, errors)
      return errors
    },
    reset(values: Values | undefined = undefined) {
      if (values) {
        originalValuesRef.current = toJS(values)
      }

      form.setValues(originalValuesRef.current)
      form.setErrors({})
      form.setTouched({})
    },
    resetField(field: string, value: any = undefined) {
      if (value !== undefined) {
        set(originalValuesRef.current, field, toJS(value))
      }

      form.setFieldValue(field, toJS(get(originalValuesRef.current, field)))
    },
    async submit() {
      return executeSubmit.current()
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
    register(field: string, registrant: FieldRegistrant<any, Values>) {
      if (registeredFields.current[field]) {
        warn(
          `Already registered field "${field}". Maybe you used <Field /> with the same "name" prop? Or you forgot to unregister the field?`
        )
      }
      registeredFields.current[field] = registrant
      return () => delete registeredFields.current[field]
    },
  }))

  const [formWithComponents] = useState(() =>
    Object.assign(form, {
      FormContext: withFormProvider(
        form,
        (({ children }) => children) as React.FC<{}>
      ),
      Form: withFormProvider(form, FormComp),
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
