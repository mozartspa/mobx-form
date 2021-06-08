import debounce from "debounce-promise"
import { useLocalObservable } from "mobx-react-lite"
import React, { useCallback, useEffect, useMemo } from "react"
import { FieldScopeContext } from "./FieldScope"
import { FieldError, FieldValidate, Form, UseFieldOptions } from "./types"
import { FormContext } from "./useFormContext"
import {
  getDebounceValues,
  getSelectedValues,
  getValueForCheckbox,
  useCounter,
} from "./utils"

function defaultParse(value: any) {
  return value == null ? undefined : value
}

export type UseFieldResult<T = any, Values = any> = {
  input: {
    name: string
    readonly value: T
    onBlur: (event: React.FocusEvent) => void
    onChange: (event: React.ChangeEvent<any>) => void
  }
  readonly name: string
  readonly value: T
  readonly touched: boolean
  readonly error: string | undefined
  readonly errors: string[] | undefined
  readonly isValid: boolean
  form: Form<Values>
  setValue: (value: T) => void
  setTouched: (isTouched?: boolean) => void
  setError: (error: FieldError) => void
  addError: (error: FieldError) => void
  validate: () => Promise<void>
  readonly isValidating: boolean
}

export function useField<T = any, Values = any>(
  name: keyof Values & string,
  options: UseFieldOptions<T, Values> = {}
): UseFieldResult<T, Values> {
  const {
    format,
    parse = defaultParse,
    validate,
    validateDebounce = false,
  } = options

  const formContext = React.useContext(FormContext) as Form<Values> | undefined
  const maybeForm = options.form || formContext

  if (!maybeForm) {
    throw new Error(
      `Missing FormContext. Did you use "<FormProvider />" or the "<Form />" provided by "useForm()"?` +
        `Alternatively, you can use the "form" prop to specify which form instance to bind this field to.`
    )
  }

  const form = maybeForm

  // prefix field name with the current scope (if any)
  const fieldPrefix = React.useContext(FieldScopeContext)
  name = (fieldPrefix + name) as keyof Values & string

  // blur callback
  const onBlur = useCallback(() => {
    form.setFieldTouched(name, true)
  }, [form, name])

  // change callback
  const onChange = useCallback(
    (event: React.ChangeEvent<any>) => {
      if (!event || !event.target) {
        // warn somehow?
        return
      }

      const { type, value, checked, options, multiple } = event.target

      let val = undefined
      let parsed

      val = /number|range/.test(type)
        ? ((parsed = parseFloat(value)), isNaN(parsed) ? undefined : parsed)
        : /checkbox/.test(type) // checkboxes
        ? getValueForCheckbox(form.getFieldValue(name), checked, value)
        : !!multiple // <select multiple>
        ? getSelectedValues(options)
        : value

      form.setFieldValue(name, parse ? parse(val) : val)
    },
    [form, name, parse]
  )

  // validating state managed by mobx
  const state = useLocalObservable(() => ({
    isValidating: false,
    setValidating(isValidating: boolean) {
      state.isValidating = isValidating
    },
  }))

  // create debounced validator
  const counter = useCounter()
  const debounceValues = getDebounceValues(validateDebounce)
  const debouncedValidator = useMemo(() => {
    const doValidate: FieldValidate<T, Values> = async (value, values) => {
      state.setValidating(true)
      const validationId = counter.getValue()

      let errors: FieldError
      try {
        errors = validate ? await validate(value, values) : undefined
      } catch (err) {
        errors = err.message
      }

      if (counter.isLastValue(validationId)) {
        state.setValidating(false)
      }
      return errors
    }

    if (debounceValues) {
      return debounce(doValidate, debounceValues.wait, {
        leading: debounceValues.leading,
      }) as FieldValidate<T, Values>
    } else {
      return doValidate
    }
  }, [
    validate,
    debounceValues && debounceValues.wait,
    debounceValues && debounceValues.leading,
  ])

  // standalone validator for this field
  const execValidateCounter = useCounter()
  const executeValidate = useMemo(() => {
    return async () => {
      const validationId = execValidateCounter.getValue()
      const errors = await debouncedValidator(
        form.getFieldValue(name),
        form.values
      )
      if (execValidateCounter.isLastValue(validationId)) {
        form.setFieldError(name, errors)
      }
    }
  }, [debouncedValidator, form, name])

  // register the debounced validator to the form
  useEffect(() => {
    const disposer = form.register(name, {
      validate: debouncedValidator,
    })
    return disposer
  }, [form, name, debouncedValidator])

  return {
    input: {
      name,
      get value(): T {
        const value = form.getFieldValue(name)
        return format ? format(value) : value
      },
      onBlur,
      onChange,
    },
    name,
    get value(): T {
      return form.getFieldValue(name)
    },
    get touched() {
      return form.isFieldTouched(name)
    },
    get error() {
      return form.getFieldError(name)
    },
    get errors() {
      return form.getFieldErrors(name)
    },
    get isValid() {
      return form.isFieldValid(name)
    },
    form,
    setValue(value: T) {
      form.setFieldValue(name, value)
    },
    setTouched(isTouched = true) {
      form.setFieldTouched(name, isTouched)
    },
    setError(error: FieldError) {
      form.setFieldError(name, error)
    },
    addError(error: FieldError) {
      form.addFieldError(name, error)
    },
    validate() {
      return executeValidate()
    },
    get isValidating() {
      return state.isValidating
    },
  }
}
