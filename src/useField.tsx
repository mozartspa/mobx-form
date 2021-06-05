import { useMemo } from "react"
import { Form } from "./types"
import { useFormContext } from "./useFormContext"

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
