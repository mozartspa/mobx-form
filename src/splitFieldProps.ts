import { UseFieldOptions } from "./types"

export type FieldComponentProps = UseFieldOptions & { name: string }

type SplitFieldPropsOutput<T extends FieldComponentProps> = [
  T["name"],
  {
    form: T["form"]
    validate: T["validate"]
    validateDebounce: T["validateDebounce"]
    validateOnBlur: T["validateOnBlur"]
    validateOnChange: T["validateOnChange"]
    validateOnChangeFields: T["validateOnChangeFields"]
    format: T["format"]
    parse: T["parse"]
    parseOnBlur: T["parseOnBlur"]
  },
  Omit<
    T,
    | "name"
    | "form"
    | "validate"
    | "validateDebounce"
    | "validateOnBlur"
    | "validateOnChange"
    | "validateOnChangeFields"
    | "format"
    | "parse"
    | "parseOnBlur"
  >
]

export function splitFieldProps<T extends FieldComponentProps>(
  props: T
): SplitFieldPropsOutput<T> {
  const {
    name,
    form,
    validate,
    validateDebounce,
    validateOnBlur,
    validateOnChange,
    validateOnChangeFields,
    format,
    parse,
    parseOnBlur,
    ...rest
  } = props

  return [
    name,
    {
      form,
      validate,
      validateDebounce,
      validateOnBlur,
      validateOnChange,
      validateOnChangeFields,
      format,
      parse,
      parseOnBlur,
    },
    rest,
  ]
}
