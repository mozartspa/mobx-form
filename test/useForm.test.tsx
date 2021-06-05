import { render } from "@testing-library/react"
import { observer } from "mobx-react-lite"
import * as React from "react"
import { FormConfig, useForm, UseFormResult } from "../src"

const InitialValues = {
  name: "bill",
  surname: "murray",
}

type Values = typeof InitialValues
type Props = FormConfig<Values> & { initialValues?: Values }

function renderForm(props: Props = {}) {
  let formHook: UseFormResult<Values> | undefined = undefined
  let renderCount = 0
  let renderNameCount = 0

  const Form = observer((props: Props = {}) => {
    const { initialValues = InitialValues, ...formProps } = props
    const form = useForm(initialValues, formProps)

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

  const result = render(<Form {...props} />)
  const originalRerender = result.rerender

  return Object.assign(result, {
    form: formHook!,
    renderCount: () => renderCount,
    renderNameCount: () => renderNameCount,
    rerender: (props: Props = {}) => {
      originalRerender(<Form {...props} />)
    },
  })
}

describe("useForm", () => {
  it("has initial values", () => {
    const { form } = renderForm()

    expect(form.values).toEqual(InitialValues)
  })

  it("does not change initial values", () => {
    const { form } = renderForm()
    form.setFieldValue("name", "jean")

    expect(form.values.name).toEqual("jean")
    expect(InitialValues.name).toEqual("bill")
  })

  it("values don't change when initialValues change", () => {
    const { form, rerender } = renderForm()

    expect(form.values).toEqual(InitialValues)

    rerender({ initialValues: { name: "donald", surname: "duck" } })

    expect(form.values).toEqual(InitialValues)
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
