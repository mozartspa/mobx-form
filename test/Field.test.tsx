import { render } from "@testing-library/react"
import * as React from "react"
import { Field, FieldRenderProps, FormConfig, UseFormResult } from "../src"
import { renderForm } from "./__helpers/renderForm"

const InitialValues = { name: "murray" }

function renderTestForm(
  ui?: (form: UseFormResult<any>) => React.ReactNode,
  props: FormConfig = {}
) {
  return renderForm(ui, {
    initialValues: InitialValues,
    ...props,
  })
}

describe("<Field />", () => {
  it("exposes render props to its children", () => {
    let injectedField: FieldRenderProps | undefined = undefined

    const { form } = renderTestForm((form) => (
      <form.Field name="name">
        {(field) => ((injectedField = field), (<span />))}
      </form.Field>
    ))

    const field = injectedField!
    expect(field.form).toBe(form())
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

    const { form } = renderTestForm(() => (
      <>
        <Field name="name">
          {(field) => ((injectedField = field), (<span />))}
        </Field>
      </>
    ))

    render(
      <Field name="name" form={form()}>
        {(field) => ((injectedField2 = field), (<span />))}
      </Field>
    )

    const field = injectedField!
    const field2 = injectedField2!
    expect(field.form).toBe(form())
    expect(field2.form).toBe(form())
  })
})
