import { render } from "@testing-library/react"
import { observer } from "mobx-react-lite"
import * as React from "react"
import { FormConfig, useForm, UseFormResult } from "../src"

const initialValues = {
  name: "bill",
  surname: "murray",
}

type Values = typeof initialValues

function renderForm(props: FormConfig<Values> = {}) {
  let formHook: UseFormResult<Values> | undefined = undefined
  let renderCount = 0
  let renderNameCount = 0

  const Form = observer(() => {
    const form = useForm(initialValues, props)

    formHook = form
    renderCount++

    const { Form, Field } = form

    return (
      <Form>
        <Field name="name">
          {(field) => {
            renderNameCount++
            return (
              <div>
                <input type="text" {...field.input} data-testid="name-input" />
                {field.meta.touched && field.meta.error}
              </div>
            )
          }}
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

  return Object.assign(result, {
    form: formHook!,
    renderCount: () => renderCount,
    renderNameCount: () => renderNameCount,
  })
}

describe("useForm", () => {
  it("has initial values", () => {
    const { form } = renderForm()

    expect(form.values).toEqual(initialValues)
  })

  it("does not change initial values", () => {
    const { form } = renderForm()
    form.setFieldValue("name", "jean")

    expect(form.values.name).toEqual("jean")
    expect(initialValues.name).toEqual("bill")
  })

  it("handleChange", () => {
    const { form, getByTestId } = renderForm()
    form.handleChange("name")("jean")

    expect(form.values.name).toEqual("jean")

    const input = getByTestId("name-input") as HTMLInputElement

    expect(input.value).toEqual("jean")
  })

  it("rerenders only the input", () => {
    const { form, renderCount, renderNameCount } = renderForm()

    expect(renderCount()).toBe(1)
    expect(renderNameCount()).toEqual(1)

    form.handleChange("name")("jean")

    expect(renderCount()).toEqual(1)
    expect(renderNameCount()).toEqual(2)
  })
})
