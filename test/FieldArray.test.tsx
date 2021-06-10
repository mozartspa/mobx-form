import { render } from "@testing-library/react"
import * as React from "react"
import { FieldArray, FieldArrayRenderProps, UseFormResult } from "../src"
import { FormConfig } from "../src/types"
import { renderForm } from "./__helpers/renderForm"

const InitialValues = { friends: [] }

function renderTestForm(
  ui?: (form: UseFormResult<any>) => React.ReactNode,
  props: FormConfig = {}
) {
  return renderForm(ui, {
    initialValues: InitialValues,
    ...props,
  })
}

describe("<FieldArray />", () => {
  it("exposes render props to its children", () => {
    let injectedField: FieldArrayRenderProps | undefined = undefined

    const { form } = renderTestForm(() => (
      <FieldArray name="friends">
        {(field) => (injectedField = field) && <span />}
      </FieldArray>
    ))

    const field = injectedField!
    expect(field.form).toBe(form())
    expect(field.name).toEqual("friends")
    expect(field.names).toEqual([])
    expect(field.value).toEqual([])
  })

  it("uses FormContext or the form passed as prop", () => {
    let injectedField: FieldArrayRenderProps | undefined = undefined
    let injectedField2: FieldArrayRenderProps | undefined = undefined

    const { form } = renderTestForm(() => (
      <FieldArray name="friends">
        {(field) => (injectedField = field) && <span />}
      </FieldArray>
    ))

    render(
      <FieldArray name="friends" form={form()}>
        {(field) => (injectedField2 = field) && <span />}
      </FieldArray>
    )

    const field = injectedField!
    const field2 = injectedField2!
    expect(field.form).toBe(form())
    expect(field2.form).toBe(form())
  })

  it("update methods work and trigger validation", () => {
    let injectedField: FieldArrayRenderProps | undefined = undefined
    const onValidate = jest.fn(() => ({}))

    renderTestForm(
      () => (
        <FieldArray name="friends">
          {(field) => (injectedField = field) && <span />}
        </FieldArray>
      ),
      {
        validateOnChange: true,
        onValidate,
      }
    )

    const field = injectedField!

    // push
    field.push("a", "b")
    expect(field.value).toEqual(["a", "b"])

    // pop
    const popped = field.pop()
    expect(field.value).toEqual(["a"])
    expect(popped).toEqual("b")

    // unshift
    field.unshift("c", "d")
    expect(field.value).toEqual(["c", "d", "a"])

    // insertAt
    field.insertAt(2, "e")
    expect(field.value).toEqual(["c", "d", "e", "a"])

    // removeAt
    const removedAt = field.removeAt(1)
    expect(field.value).toEqual(["c", "e", "a"])
    expect(removedAt).toEqual("d")

    // remove
    field.remove("a")
    expect(field.value).toEqual(["c", "e"])

    // clear
    field.clear()
    expect(field.value).toEqual([])

    // validation
    expect(onValidate).toBeCalledTimes(7)
  })

  it("names should contain the field paths of the values", () => {
    let injectedField: FieldArrayRenderProps | undefined = undefined

    renderTestForm(
      () => (
        <FieldArray name="friends">
          {(field) => (injectedField = field) && <span />}
        </FieldArray>
      ),
      {
        initialValues: {
          friends: ["a", "b"],
        },
      }
    )

    const field = injectedField!
    expect(field.names).toEqual(["friends.0", "friends.1"])
  })
})
