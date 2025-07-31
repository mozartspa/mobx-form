import debounce from "debounce-promise"
import get from "dlv"
import { runInAction, toJS } from "mobx"
import { observer, useLocalObservable } from "mobx-react-lite"
import React, { useRef, useState } from "react"
import isEqual from "react-fast-compare"
import { DebugForm } from "./DebugForm"
import { dset as set } from "./dset"
import {
  FieldError,
  FieldErrorInput,
  FieldRegistrant,
  Form,
  FormConfig,
  FormErrors,
  FormErrorsInput,
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
  mergeFieldErrors,
  useCounter,
  useLatestValue,
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

type RegisteredFields<Values> = Record<string, FieldRegistrant<any, Values>[]>

async function validateFieldRegistrants(
  registrants: FieldRegistrant[],
  value: any,
  values: any
): Promise<FieldError[] | undefined> {
  if (registrants.length === 0) {
    return Promise.resolve(undefined)
  } else {
    const errors = await Promise.all(
      registrants.map((reg) => reg.validate?.(value, values))
    )
    return mergeFieldErrors(...errors)
  }
}

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
      return {
        [field]: await validateFieldRegistrants(
          registeredFields.current[field],
          value,
          values
        ),
      }
    }

    const doValidate = async (opts: { includeFieldValidation: boolean }) => {
      runInAction(() => {
        form.isValidating = true
      })

      const validationId = counter.getValue()
      const values = form.values

      let errors: FormErrors
      try {
        errors = mergeErrors(
          await Promise.all([
            onValidate(values),
            ...(opts.includeFieldValidation
              ? Object.keys(registeredFields.current).map((field) =>
                  validateField(field, values)
                )
              : []),
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
      // trigger onBeforeSubmit
      Object.keys(registeredFields.current).map((field) => {
        registeredFields.current[field].forEach((registrant) => {
          registrant.onBeforeSubmit?.()
        })
      })

      const values = form.values

      runInAction(() => {
        form.isSubmitting = true
        form.touched = {
          ...buildObjectPaths(values, true),
          ...buildObjectPaths(registeredFields.current, true, false),
        }
      })

      const errors = await form.validate()
      const isValid = !hasErrors(errors)

      try {
        if (isValid) {
          const maybeErrors = await onSubmit?.(values)
          if (maybeErrors) {
            form.setErrors(maybeErrors)
            return mergeErrors([maybeErrors])
          } else {
            return {}
          }
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
    observableValues: originalValuesRef.current,
    errors: {} as FormErrors,
    touched: {} as FormTouched,
    isSubmitting: false,
    isValidating: false,
    isFreezed: false,
    get values() {
      return toJS(form.observableValues)
    },
    get isDirty() {
      return !isEqual(originalValuesRef.current, form.values)
    },
    get isValid() {
      return !hasErrors(form.errors)
    },
    setErrors(errors: FormErrorsInput) {
      // Optimization, instead of replacing the whole object
      const nextErrors = mergeErrors([errors]) || {}
      const nextErrorsKeys = Object.keys(nextErrors)
      const currErrorKeys = Object.keys(form.errors)

      runInAction(() => {
        nextErrorsKeys.forEach((key) => {
          if (form.errors[key] !== nextErrors[key]) {
            if (nextErrors[key] === undefined) {
              delete form.errors[key]
            } else {
              form.errors[key] = nextErrors[key]
            }
          }
        })
        currErrorKeys.forEach((key) => {
          if (nextErrorsKeys.indexOf(key) === -1) {
            delete form.errors[key]
          }
        })
      })
    },
    setTouched(touched: FormTouched) {
      // Optimization, instead of replacing the whole object
      const nextTouched = touched || {}
      const nextTouchedKeys = Object.keys(nextTouched)
      const currTouchedKeys = Object.keys(form.touched)

      runInAction(() => {
        nextTouchedKeys.forEach((key) => {
          form.touched[key] = nextTouched[key]
        })
        currTouchedKeys.forEach((key) => {
          if (nextTouchedKeys.indexOf(key) === -1) {
            delete form.touched[key]
          }
        })
      })
    },
    setValues(values: Values) {
      if (form.isFreezed) {
        return
      }

      form.observableValues = toJS(values)
    },
    setFieldValue(field: string, value: any) {
      if (form.isFreezed) {
        return
      }

      if (form.getFieldValue(field) !== value) {
        set(form.observableValues, field, value)
        if (optionsRef.current.validateOnChange) {
          executeValidate.current({ includeFieldValidation: false })
        }
      }
    },
    getFieldValue(field: string) {
      return get(form.observableValues, field)
    },
    setFieldError(field: string, message: FieldErrorInput | undefined) {
      const nextErrors = mergeFieldErrors(message)
      if (form.errors[field] !== nextErrors) {
        if (nextErrors === undefined) {
          delete form.errors[field]
        } else {
          form.errors[field] = nextErrors
        }
      }
    },
    addFieldError(field: string, message: FieldErrorInput | undefined) {
      if (message == null) {
        return // do nothing
      }
      form.errors[field] = mergeFieldErrors(form.errors[field], message)
    },
    getFieldError(field: string): FieldError | undefined {
      const err = form.errors[field]
      if (Array.isArray(err)) {
        return err.length > 0 ? err[0] : undefined
      } else {
        return err
      }
    },
    getFieldErrors(field: string): FieldError[] | undefined {
      const err = form.errors[field]
      if (err == null) {
        return undefined
      } else if (Array.isArray(err)) {
        return err
      } else {
        return [err]
      }
    },
    getFieldResetValue(field: string): any {
      return get(originalValuesRef.current, field)
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
        toJS(get(form.observableValues, field))
      )
    },
    async validate() {
      return executeValidate.current({ includeFieldValidation: true })
    },
    async validateField(field: string) {
      const registrants = registeredFields.current[field]
      if (!registrants) {
        return Promise.resolve(undefined)
      }
      const errors = await validateFieldRegistrants(
        registrants,
        form.getFieldValue(field),
        form.values
      )
      form.setFieldError(field, errors)
      return errors
    },
    reset(values: Values | undefined = undefined) {
      if (form.isFreezed) {
        return
      }

      if (values) {
        originalValuesRef.current = toJS(values)
      }

      form.setValues(originalValuesRef.current)
      form.setErrors({})
      form.setTouched({})
    },
    resetField(field: string, value: any = undefined) {
      if (form.isFreezed) {
        return
      }

      if (value !== undefined) {
        set(originalValuesRef.current, field, toJS(value))
      }

      form.setFieldValue(field, toJS(get(originalValuesRef.current, field)))
      delete form.errors[field]
      delete form.touched[field]
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
      registeredFields.current[field] = registeredFields.current[field] || []
      registeredFields.current[field].push(registrant)
      return () => {
        registeredFields.current[field] = registeredFields.current[
          field
        ].filter((o) => o !== registrant)
        if (registeredFields.current[field].length === 0) {
          delete registeredFields.current[field]
        }
      }
    },
    freeze() {
      form.isFreezed = true
    },
    unfreeze() {
      form.isFreezed = false
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
