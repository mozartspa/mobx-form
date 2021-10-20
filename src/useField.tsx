import debounce from "debounce-promise"
import { reaction } from "mobx"
import { useLocalObservable } from "mobx-react-lite"
import React, { useCallback, useEffect, useMemo } from "react"
import { FieldScopeContext } from "./FieldScope"
import {
  FieldError,
  FieldErrorInput,
  FieldValidate,
  Form,
  UseFieldOptions,
} from "./types"
import { FormContext } from "./useFormContext"
import {
  composeValidators,
  getDebounceValues,
  getSelectedValues,
  getValueForCheckbox,
  useCounter,
  useImmediateRef,
} from "./utils"

function defaultFormat(value: any) {
  return value == null ? "" : value
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
  readonly isTouched: boolean
  readonly error: FieldError | undefined
  readonly errors: FieldError[] | undefined
  readonly isValid: boolean
  readonly isDirty: boolean
  readonly isValidating: boolean
  form: Form<Values>
  setValue: (value: T) => void
  setTouched: (isTouched?: boolean) => void
  setError: (error: FieldErrorInput | undefined) => void
  addError: (error: FieldError) => void
  validate: () => Promise<FieldError[] | undefined>
  reset: (value?: T) => void
}

export function useField<T = any, Values = any>(
  name: string,
  options: UseFieldOptions<T, Values> = {}
): UseFieldResult<T, Values> {
  const {
    format = defaultFormat,
    parse,
    parseOnBlur,
    validate,
    validateDebounce = false,
    validateOnChangeFields,
    validateOnChange,
    validateOnBlur,
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
  name = fieldPrefix + name

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
  const debouncedValidator = useMemo(
    () => {
      const doValidate: FieldValidate<T, Values> = async (value, values) => {
        state.setValidating(true)
        const validationId = counter.getValue()

        const validator = Array.isArray(validate)
          ? composeValidators(...validate)
          : validate

        let errors: FieldErrorInput | undefined
        try {
          errors = validator ? await validator(value, values) : undefined
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
    },
    // elint does not understand the usage of `debounceValues`
    /* eslint-disable react-hooks/exhaustive-deps */
    [
      validate,
      debounceValues && debounceValues.wait,
      debounceValues && debounceValues.leading,
    ] /* eslint-enable react-hooks/exhaustive-deps */
  )

  // handle onBeforeSubmit
  const formatRef = useImmediateRef(format)
  const parseRef = useImmediateRef(parse)
  const parseOnBlurRef = useImmediateRef(parseOnBlur)
  const handleBeforeSubmit = useCallback(() => {
    // Before submit, the field value is updated in case
    // `parse` or `parseOnBlur` is passed. This ensures that
    // the submitted value is parsed correctly.
    // `parseOnBlur` takes precedence over `parse`.
    if (parseRef.current || parseOnBlurRef.current) {
      let value = form.getFieldValue(name)
      if (formatRef.current) {
        value = formatRef.current(value)
      }
      if (parseOnBlurRef.current) {
        value = parseOnBlurRef.current(value)
      } else if (parseRef.current) {
        value = parseRef.current(value)
      }
      form.setFieldValue(name, value)
    }
  }, [form, name])

  // register to the form
  useEffect(() => {
    const disposer = form.register(name, {
      validate: validate ? debouncedValidator : undefined,
      onBeforeSubmit: handleBeforeSubmit,
    })
    return disposer
  }, [form, name, validate, debouncedValidator, handleBeforeSubmit])

  // validateOnChange
  useEffect(() => {
    // validate only if explicitely turned on or `validateOnChangeFields` is set.
    if (validateOnChange !== true && !validateOnChangeFields) {
      return
    }

    // whenever this field or fields in `validateOnChangeFields` change,
    // then run validation.
    return reaction(
      () => {
        const fieldNames = [
          name,
          ...(validateOnChangeFields || []).map(
            (fieldName) => `${fieldPrefix}${fieldName}`
          ),
        ]
        return fieldNames.map((fieldName) => form.getFieldValue(fieldName))
      },
      () => {
        form.validateField(name)
      }
    )
  }, [form, name, fieldPrefix, validateOnChange, validateOnChangeFields])

  // blur callback
  const onBlur = useCallback(() => {
    if (parseOnBlur) {
      form.setFieldValue(name, parseOnBlur(form.getFieldValue(name)))
    }
    form.setFieldTouched(name, true)

    // maybe validateOnBlur
    if (validateOnBlur) {
      form.validateField(name)
    }
  }, [form, name, parseOnBlur, validateOnBlur])

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
      const value = form.getFieldValue(name)
      return format ? format(value) : value
    },
    get isTouched() {
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
    get isDirty() {
      return form.isFieldDirty(name)
    },
    form,
    setValue(value: T) {
      form.setFieldValue(name, parse ? parse(value) : value)
    },
    setTouched(isTouched = true) {
      form.setFieldTouched(name, isTouched)
    },
    setError(error: FieldErrorInput | undefined) {
      form.setFieldError(name, error)
    },
    addError(error: FieldError) {
      form.addFieldError(name, error)
    },
    validate() {
      return form.validateField(name)
    },
    reset(value?: T) {
      form.resetField(name, value)
    },
    get isValidating() {
      return state.isValidating
    },
  }
}
