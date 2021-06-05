import { useMemo } from "react"
import { Form } from "./types"
import { useFormContext } from "./useFormContext"

export type FieldConverter<M = any, F = any> = {
  valueToInput: (value: M) => F
  inputToValue: (value: F) => M
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
    onChange: (event: React.ChangeEvent<any>) => void
  }
  readonly name: string
  readonly value: T
  readonly touched: boolean
  readonly error: string
  form: Form<any>
  setValue: (value: T) => void
  setTouched: (isTouched?: boolean) => void
  setError: (error: string) => void
}

export function useField<T = any>(
  name: string,
  options: UseFieldOptions = {}
): UseFieldResult<T> {
  const { defaultValue = "", converter } = options

  const form = useFormContext()
  const onBlur = useMemo(() => form.handleBlur(name), [name, form])
  const onChange = useMemo(() => {
    if (converter) {
      return (event: React.ChangeEvent<any>) => {
        const value = event.target.value
        form.setFieldValue(name, converter.inputToValue(value))
      }
    } else {
      return form.handleChange(name)
    }
  }, [name, converter, form])

  return {
    input: {
      name,
      get value(): T {
        const value = form.getFieldValue(name)
        return converter
          ? converter.valueToInput(value)
          : value == null
          ? defaultValue
          : value
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
