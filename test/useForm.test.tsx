import { render } from "@testing-library/react"
import { observer } from "mobx-react-lite"
import * as React from "react"
import { FormConfig, useForm, UseFormResult } from "../src"

const InitialModel = {
  name: "bill",
  surname: "murray",
}

type ModelType = typeof InitialModel

function renderForm(props: FormConfig<ModelType> = {}) {
  let formHook: UseFormResult<ModelType> | undefined = undefined

  const Form = observer(() => {
    const form = useForm(InitialModel, props)

    formHook = form

    const { Form, Field } = form

    return (
      <Form>
        <Field name="name">
          {(field) => (
            <div>
              <input type="text" {...field.input} data-testid="name-input" />
              {field.meta.touched && field.meta.error}
            </div>
          )}
        </Field>
        <Field name="surname">
          {(field) => (
            <div>
              <input type="text" {...field.input} data-testid="surname-input" />
              {field.meta.touched && field.meta.error}
            </div>
          )}
        </Field>
        <button type="submit" data-testid="submit-button">
          Submit
        </button>
      </Form>
    )
  })

  const result = render(<Form />)

  return Object.assign(result, { form: formHook! })
}

describe("useForm", () => {
  it("has initial values", () => {
    const { form } = renderForm()

    expect(form.model).toEqual(InitialModel)
  })

  it("handleChange", () => {
    const { form, getByTestId } = renderForm()
    form.handleChange("name")("jean")

    expect(form.model.name).toEqual("jean")

    const input = getByTestId("name-input") as HTMLInputElement

    expect(input.value).toEqual("jean")
  })
})
