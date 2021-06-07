import { render } from "@testing-library/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { FormConfig, useForm, UseFormResult } from "../../src"
import { Form } from "../../src/types"

export function renderForm(
  ui?: (form: UseFormResult<any>) => React.ReactNode,
  props: FormConfig = {}
) {
  let formHook: Form | undefined = undefined
  let renderCount = 0

  const MyForm = observer((props: FormConfig = {}) => {
    const form = useForm(props)

    formHook = form
    renderCount++

    const { Form } = form

    return <Form>{ui ? ui(form) : null}</Form>
  })

  const { rerender, ...rest } = render(<MyForm {...props} />)

  return {
    form() {
      return formHook!
    },
    renderCount() {
      return renderCount
    },
    ...rest,
    rerender(props: FormConfig = {}) {
      return rerender(<MyForm {...props} />)
    },
  }
}
