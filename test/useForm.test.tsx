import * as React from "react"
import { FormConfig } from "../src"
import { renderForm } from "./__helpers/renderForm"

const InitialValues = {
  name: "bill",
  surname: "murray",
}

function renderTestForm(props: FormConfig = {}) {
  let renderNameCount = 0

  const result = renderForm(
    (form) => {
      const { Field } = form
      return (
        <>
          <Field name="name">
            {(field) => {
              renderNameCount++
              return (
                <div>
                  <input
                    type="text"
                    {...field.input}
                    data-testid="name-input"
                  />
                  {field.touched && field.error}
                </div>
              )
            }}
          </Field>
          <Field name="surname">
            {(field) => (
              <div>
                <input
                  type="text"
                  {...field.input}
                  data-testid="surname-input"
                />
                {field.touched && field.error}
              </div>
            )}
          </Field>
          <button type="submit" data-testid="submit-button">
            Submit
          </button>
        </>
      )
    },
    {
      initialValues: InitialValues,
      ...props,
    }
  )

  return {
    ...result,
    renderNameCount() {
      return renderNameCount
    },
  }
}

describe("useForm", () => {
  it("has initial values", () => {
    const { form } = renderTestForm()

    expect(form().values).toEqual(InitialValues)
  })

  it("does not change initial values", () => {
    const { form } = renderTestForm()
    form().setFieldValue("name", "jean")

    expect(form().values.name).toEqual("jean")
    expect(InitialValues.name).toEqual("bill")
  })

  it("values don't change when initialValues change", () => {
    const { form, rerender } = renderTestForm()

    expect(form().values).toEqual(InitialValues)

    rerender({ initialValues: { name: "donald", surname: "duck" } })

    expect(form().values).toEqual(InitialValues)
  })

  it("handleChange", () => {
    const { form, getByTestId } = renderTestForm()
    form().setFieldValue("name", "jean")

    expect(form().values.name).toEqual("jean")

    const input = getByTestId("name-input") as HTMLInputElement

    expect(input.value).toEqual("jean")
  })

  it("rerenders only the input", () => {
    const { form, renderCount, renderNameCount } = renderTestForm()

    expect(renderCount()).toBe(1)
    expect(renderNameCount()).toEqual(1)

    form().setFieldValue("name", "jean")

    expect(renderCount()).toEqual(1)
    expect(renderNameCount()).toEqual(2)
  })

  it("uses latest onValidate", () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const onValidate2 = jest.fn(() => Promise.resolve({}))
    const { form, rerender } = renderTestForm({ onValidate })

    form().setFieldValue("name", "jean")

    expect(onValidate).toBeCalledTimes(1)

    rerender({ onValidate: onValidate2 })

    form().setFieldValue("name", "jean2")

    expect(onValidate).toBeCalledTimes(1)
    expect(onValidate2).toBeCalledTimes(1)
  })
})
