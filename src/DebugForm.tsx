import { observer } from "mobx-react-lite"
import React from "react"
import { Form } from "./types"
import { FormContext } from "./useFormContext"

export type DebugFormProps = {
  form?: Form | undefined
  showAll?: boolean
  showValues?: boolean
  showErrors?: boolean
  showTouched?: boolean
  showInfo?: boolean
}

export const DebugForm = observer((props: DebugFormProps) => {
  const formContext = React.useContext(FormContext) as Form | undefined
  const form = props.form || formContext

  if (!form) {
    throw new Error(
      `Missing FormContext. Did you use "<FormProvider />" or the "<Form />" provided by "useForm()"?` +
        `Alternatively, you can use the "form" prop to specify which form instance to bind this component to.`
    )
  }

  const {
    showAll = false,
    showValues = true,
    showErrors = showAll,
    showTouched = showAll,
    showInfo = showAll,
  } = props

  const {
    values,
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
