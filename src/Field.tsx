import { Observer } from "mobx-react-lite"
import React, { ReactElement } from "react"
import { UseFieldOptions } from "./types"
import { useField, UseFieldResult } from "./useField"

export type FieldRenderProps = UseFieldResult

export type FieldProps = UseFieldOptions & {
  name: string
  children: (props: FieldRenderProps) => ReactElement
}

export const Field: React.FC<FieldProps> = ({ name, children, ...options }) => {
  const field = useField(name, options)

  return <Observer>{() => children(field)}</Observer>
}
