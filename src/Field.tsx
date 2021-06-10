import { Observer } from "mobx-react-lite"
import React, { ReactElement } from "react"
import { UseFieldOptions } from "./types"
import { useField, UseFieldResult } from "./useField"

export type FieldRenderProps<T = any, Values = any> = UseFieldResult<T, Values>

export type FieldProps<T = any, Values = any> = UseFieldOptions<T, Values> & {
  name: string
  children: (props: FieldRenderProps<T, Values>) => ReactElement
}

export function Field<T = any, Values = any>(props: FieldProps<T, Values>) {
  const { name, children, ...options } = props
  const field = useField<T, Values>(name, options)

  return <Observer>{() => children(field)}</Observer>
}
