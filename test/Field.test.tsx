import { fireEvent, render } from "@testing-library/react"
import * as React from "react"
import waitForExpect from "wait-for-expect"
import { Field, FieldRenderProps, UseFormResult } from "../src"
import { FormConfig } from "../src/types"
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

    const { form } = renderTestForm(() => (
      <Field name="name">
        {(field) => (injectedField = field) && <span />}
      </Field>
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
          {(field) => (injectedField = field) && <span />}
        </Field>
      </>
    ))

    render(
      <Field name="surname" form={form()}>
        {(field) => (injectedField2 = field) && <span />}
      </Field>
    )

    const field = injectedField!
    const field2 = injectedField2!
    expect(field.form).toBe(form())
    expect(field2.form).toBe(form())
  })

  it("input value should be an empty string if field value is undefined or null", () => {
    let injectedField: FieldRenderProps | undefined = undefined

    renderTestForm(() => (
      <Field name="name">
        {(field) => (injectedField = field) && <span />}
      </Field>
    ))

    const field = injectedField!
    expect(field.input.value).toEqual("murray")

    field.setValue(undefined)
    expect(field.input.value).toEqual("")

    field.setValue(null)
    expect(field.input.value).toEqual("")
  })

  it("format value", () => {
    const format = (value: any) => (value === "" ? "no value" : value)

    const { form, getByTestId } = renderTestForm(() => (
      <Field name="name" format={format}>
        {(field) => <input {...field.input} data-testid="name-input" />}
      </Field>
    ))

    form().setFieldValue("name", "")

    const input = getByTestId("name-input") as HTMLInputElement
    expect(form().getFieldValue("name")).toEqual("")
    expect(input.value).toEqual("no value")
  })

  it("parse value", () => {
    const parse = (value: any) => (value === "" ? "no value" : value)

    const { form, getByTestId } = renderTestForm(() => (
      <Field name="name" parse={parse}>
        {(field) => <input {...field.input} data-testid="name-input" />}
      </Field>
    ))

    const input = getByTestId("name-input") as HTMLInputElement
    fireEvent.change(input, {
      target: {
        value: "",
      },
    })

    expect(form().getFieldValue("name")).toEqual("no value")
    expect(input.value).toEqual("no value")
  })

  it("format and parse value", () => {
    const format = (value: any) => `${value}`
    const parse = (value: any) => {
      const num = parseInt(value)
      if (isNaN(num)) {
        return 0
      } else {
        return num
      }
    }

    const { form, getByTestId } = renderTestForm(
      () => (
        <Field name="age" format={format} parse={parse}>
          {(field) => <input {...field.input} data-testid="age-input" />}
        </Field>
      ),
      {
        initialValues: {
          age: 37,
        },
      }
    )

    const input = getByTestId("age-input") as HTMLInputElement
    fireEvent.change(input, {
      target: {
        value: "42",
      },
    })

    expect(form().getFieldValue("age")).toEqual(42)
    expect(input.value).toEqual("42")
  })

  it("parseOnBlur value", () => {
    const parse = (value: any) => (value === "" ? "no value" : value)

    const { form, getByTestId } = renderTestForm(() => (
      <Field name="name" parseOnBlur={parse}>
        {(field) => <input {...field.input} data-testid="name-input" />}
      </Field>
    ))

    form().setFieldValue("name", "")

    const input = getByTestId("name-input") as HTMLInputElement
    expect(input.value).toEqual("")

    fireEvent.blur(input)

    expect(input.value).toEqual("no value")
  })
})

describe("<Field /> validation", () => {
  it("field validation is called when validating form", () => {
    const validate = jest.fn(() => Promise.resolve(undefined))
    const { form } = renderTestForm(
      () => (
        <Field name="name" validate={validate}>
          {() => <span />}
        </Field>
      ),
      {
        validateOnChange: true,
      }
    )

    form().setFieldValue("name", "jean")

    expect(validate).toBeCalledTimes(1)
  })

  it("uses latest validate callback", () => {
    const validate = jest.fn(() => Promise.resolve(undefined))
    const validate2 = jest.fn(() => Promise.resolve(undefined))
    const { form, rerender } = renderTestForm(
      () => (
        <Field name="name" validate={validate}>
          {() => <span />}
        </Field>
      ),
      {
        validateOnChange: true,
      }
    )

    form().setFieldValue("name", "jean")

    expect(validate).toBeCalledTimes(1)

    rerender({
      ui: () => (
        <Field name="name" validate={validate2}>
          {() => <span />}
        </Field>
      ),
    })

    form().setFieldValue("name", "jean2")

    expect(validate).toBeCalledTimes(1)
    expect(validate2).toBeCalledTimes(1)
  })

  it("field validation error is merged into errors", async () => {
    let injectedField: FieldRenderProps | undefined = undefined
    const validate = jest.fn(() => Promise.resolve("Error!"))

    renderTestForm(
      () => (
        <Field name="name" validate={validate}>
          {(field) => (injectedField = field) && <span />}
        </Field>
      ),
      {
        validateOnChange: true,
      }
    )

    const field = injectedField!
    field.setValue("jean")

    await waitForExpect(() => {
      expect(field.error).toEqual("Error!")
    })
  })

  it("if validation throws, error message is used as error", async () => {
    let injectedField: FieldRenderProps | undefined = undefined
    const validate = jest.fn(() => Promise.reject(new Error("Uh oh!")))

    renderTestForm(
      () => (
        <Field name="name" validate={validate}>
          {(field) => (injectedField = field) && <span />}
        </Field>
      ),
      {
        validateOnChange: true,
      }
    )

    const field = injectedField!
    field.setValue("jean")

    await waitForExpect(() => {
      expect(field.error).toEqual("Uh oh!")
    })
  })

  it("validateField", async () => {
    let injectedField: FieldRenderProps | undefined = undefined
    const { form } = renderForm(
      () => (
        <Field
          name="name"
          validate={(value) =>
            value === "jack" ? "Name already taken" : undefined
          }
        >
          {(field) => (injectedField = field) && <span />}
        </Field>
      ),
      {
        initialValues: { name: "jack" },
      }
    )

    const error = await form().validateField("name")

    expect(error).toEqual("Name already taken")
    expect(injectedField!.error).toEqual(error)
  })

  it("validateField on field without validation or non-existing returns no error", async () => {
    const { form } = renderForm(() => (
      <Field name="name">{() => <span />}</Field>
    ))

    const error = await form().validateField("name")

    expect(error).toBe(undefined)
    expect(form().getFieldError("name")).toEqual(error)

    const error2 = await form().validateField("non-existing-field")

    expect(error2).toBe(undefined)
    expect(form().getFieldError("non-existing-field")).toEqual(error2)
  })

  it("validate on field", async () => {
    let injectedField: FieldRenderProps | undefined = undefined
    renderForm(
      () => (
        <Field
          name="name"
          validate={(value) =>
            value === "jack" ? "Name already taken" : undefined
          }
        >
          {(field) => (injectedField = field) && <span />}
        </Field>
      ),
      {
        initialValues: { name: "jack" },
      }
    )

    const field = injectedField!
    const error = await field.validate()

    expect(error).toEqual("Name already taken")
    expect(field.error).toEqual(error)
  })
})
