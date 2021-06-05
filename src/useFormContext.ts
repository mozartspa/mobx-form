import React from "react"
import { Form } from "./types"

export const FormContext = React.createContext<Form | undefined>(undefined)

export function useFormContext<FormValues = any>() {
  const context = React.useContext(FormContext)
  if (!context) {
    throw new Error(
      `Missing FormContext. Did you use "<FormProvider />" or the "<Form />" provided by "useForm()"?`
    )
  }
  return context as Form<FormValues>
}
