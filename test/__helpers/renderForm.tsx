import { render } from "@testing-library/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useForm, UseFormResult } from "../../src"
import { Form, FormConfig } from "../../src/types"

type UI = (form: UseFormResult<any>) => React.ReactNode

type Props = FormConfig & {
  ui?: UI
}

export function renderForm(ui?: UI, props: FormConfig = {}) {
  let formHook: Form | undefined = undefined
  let renderCount = 0

  const MyForm = observer((props: Props = {}) => {
    const { ui: propUI, ...rest } = props
    const form = useForm(rest)

    formHook = form
    renderCount++

    const { Form } = form
    const renderUI = propUI || ui

    return <Form>{renderUI ? renderUI(form) : null}</Form>
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
    rerender(props: Props = {}) {
      return rerender(<MyForm {...props} />)
    },
  }
}
