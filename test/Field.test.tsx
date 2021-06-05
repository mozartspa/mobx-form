import { render } from "@testing-library/react"
import { observer } from "mobx-react-lite"
import * as React from "react"
import {
  Field,
  FieldRenderProps,
  FormConfig,
  useForm,
  UseFormResult,
} from "../src"
import { Form } from "../src/types"

const initialValues = { name: "murray" }

function renderForm(
  ui: (form: UseFormResult<any>) => React.ReactNode,
  props: FormConfig = {}
) {
  let formHook: Form | undefined = undefined
  let renderCount = 0

  const MyForm = observer((props: FormConfig = {}) => {
    const form = useForm({ initialValues, ...props })

    formHook = form
    renderCount++

    const { Form } = form

    return <Form>{ui(form)}</Form>
  })

  const { rerender, ...rest } = render(<MyForm {...props} />)

  return {
    getForm() {
      return formHook
    },
    getRenderCount() {
      return renderCount
    },
    ...rest,
    rerender(props: FormConfig = {}) {
      return rerender(<MyForm {...props} />)
    },
  }
}

describe("<Field />", () => {
  it("exposes render props to its children", () => {
    let injectedField: FieldRenderProps | undefined = undefined

    const { getForm } = renderForm((form) => (
      <form.Field name="name">
        {(field) => ((injectedField = field), (<span />))}
      </form.Field>
    ))

    const field = injectedField!
    expect(field.form).toBe(getForm())
    expect(field.name).toEqual("name")
    expect(field.value).toEqual("murray")
    expect(field.touched).toBe(false)
    expect(field.error).toBeUndefined()

    const input = field.input
    expect(input.name).toEqual("name")
    expect(input.value).toEqual("murray")
  })

  it("uses FormContext or the form passed as prop", () => {
    let injectedField: FieldRenderProps | undefined = undefined
    let injectedField2: FieldRenderProps | undefined = undefined

    const { getForm } = renderForm(() => (
      <>
        <Field name="name">
          {(field) => ((injectedField = field), (<span />))}
        </Field>
      </>
    ))

    render(
      <Field name="name" form={getForm()}>
        {(field) => ((injectedField2 = field), (<span />))}
      </Field>
    )

    const field = injectedField!
    const field2 = injectedField2!
    expect(field.form).toBe(getForm())
    expect(field2.form).toBe(getForm())
  })
})
