import { observer } from "mobx-react-lite"
import React from "react"
import { useFormContext } from "./useFormContext"

export type DebugFormProps = {
  showAll?: boolean
  showValues?: boolean
  showValidValues?: boolean
  showErrors?: boolean
  showTouched?: boolean
  showInfo?: boolean
}

export const DebugForm = observer((props: DebugFormProps) => {
  const form = useFormContext()

  const {
    showAll = false,
    showValues = true,
    showValidValues = showAll,
    showErrors = showAll,
    showTouched = showAll,
    showInfo = showAll,
  } = props

  const {
    values,
    validValues,
    errors,
    touched,
    isDirty,
    isValid,
    isSubmitting,
    isValidating,
  } = form

  let data = {} as any

  if (showValues) {
    data.values = values
  }
  if (showValidValues) {
    data.validValues = validValues
  }
  if (showErrors) {
    data.errors = errors
  }
  if (showTouched) {
    data.touched = touched
  }
  if (showInfo) {
    data = Object.assign(data, {
      isDirty,
      isValid,
      isValidating,
      isSubmitting,
    })
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>
})
