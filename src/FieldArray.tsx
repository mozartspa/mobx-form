import { Observer } from "mobx-react-lite"
import React, { ReactElement } from "react"
import { UseFieldArrayOptions } from "./types"
import { useFieldArray, UseFieldArrayResult } from "./useFieldArray"

export type FieldArrayRenderProps<T = any, Values = any> = UseFieldArrayResult<
  T,
  Values
>

export type FieldArrayProps<
  T = any,
  Values = any
> = UseFieldArrayOptions<Values> & {
  name: keyof Values & string
  children: (props: FieldArrayRenderProps<T, Values>) => ReactElement
}

export function FieldArray<T = any, Values = any>(
  props: FieldArrayProps<T, Values>
) {
  const { name, children, ...options } = props
  const fieldArray = useFieldArray<T, Values>(name, options)

  return <Observer>{() => children(fieldArray)}</Observer>
}
