import { Observer } from "mobx-react-lite"
import React, { ReactElement } from "react"
import { useFieldArray } from "./useFieldArray"

export type FieldArrayRenderProps = ReturnType<typeof useFieldArray>

export type FieldArrayProps = {
  name: string
  children: (props: FieldArrayRenderProps) => ReactElement
}

export const FieldArray: React.FC<FieldArrayProps> = ({ name, children }) => {
  const fieldArray = useFieldArray(name)

  return <Observer>{() => children(fieldArray)}</Observer>
}
