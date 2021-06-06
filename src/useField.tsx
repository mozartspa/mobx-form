import React, { useCallback } from "react"
import { FieldScopeContext } from "./FieldScope"
import { Form } from "./types"
import { FormContext } from "./useFormContext"
import { getSelectedValues, getValueForCheckbox } from "./utils"

function defaultParse(value: any) {
  return value == null ? undefined : value
}

export type UseFieldOptions<T = any, Values = any> = {
  form?: Form<Values> | undefined
  format?: (value: T) => any
  parse?: (value: any) => T
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
  readonly error: string
  form: Form<Values>
  setValue: (value: T) => void
  setTouched: (isTouched?: boolean) => void
  setError: (error: string) => void
}

export function useField<T = any, Values = any>(
  name: keyof Values & string,
  options: UseFieldOptions<T, Values> = {}
): UseFieldResult<T, Values> {
  const { format, parse = defaultParse } = options

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

  const onBlur = useCallback(() => {
    form.setFieldTouched(name, true)
  }, [form, name])

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

      form.setFieldValue(name, format ? format(val) : val)
    },
    [form, name, format]
  )

  return {
    input: {
      name,
      get value(): T {
        const value = form.getFieldValue(name)
        return parse ? parse(value) : value
      },
      onBlur,
      onChange,
    },
    name,
    get value(): T {
      return form.getFieldValue(name)
    },
    get touched() {
      return form.getFieldTouched(name)
    },
    get error() {
      return form.getFieldError(name)
    },
    form,
    setValue(value: T) {
      form.setFieldValue(name, value)
    },
    setTouched(isTouched = true) {
      form.setFieldTouched(name, isTouched)
    },
    setError(error: string) {
      form.setFieldError(name, error)
    },
  }
}
