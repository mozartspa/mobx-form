import { fireEvent, render } from "@testing-library/react"
import * as React from "react"
import waitForExpect from "wait-for-expect"
import { Field, FieldRenderProps, FieldScope, UseFormResult } from "../src"
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
    expect(field.isTouched).toBe(false)
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
    let injectedField: FieldRenderProps | undefined = undefined
    const format = (value: any) => (value === "" ? "no value" : value)

    const { form, getByTestId } = renderTestForm(() => (
      <Field name="name" format={format}>
        {(field) =>
          (injectedField = field) && (
            <input {...field.input} data-testid="name-input" />
          )
        }
      </Field>
    ))

    form().setFieldValue("name", "")

    // <input/> value should be formatted
    const input = getByTestId("name-input") as HTMLInputElement
    expect(input.value).toEqual("no value")

    // `value` of Field should be formatted as well
    const field = injectedField!
    expect(field.value).toEqual("no value")

    // form value should not be formatted
    expect(form().getFieldValue("name")).toEqual("")
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

  it("parse value also when using `setValue`", () => {
    let injectedField: FieldRenderProps | undefined = undefined
    const parse = (value: any) => (value === "" ? "no value" : value)

    const { form } = renderTestForm(() => (
      <Field name="name" parse={parse}>
        {(field) =>
          (injectedField = field) && (
            <input {...field.input} data-testid="name-input" />
          )
        }
      </Field>
    ))

    const field = injectedField!

    field.setValue("")

    expect(field.value).toEqual("no value")
    expect(form().getFieldValue("name")).toEqual("no value")
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

  it("parse value before submit", async () => {
    const onSubmit = jest.fn()

    const parse = (value: any) =>
      value ? `*${String(value).replace(/\*/g, "")}*` : value

    const { form } = renderTestForm(
      () => (
        <Field name="name" parse={parse}>
          {(field) => <input {...field.input} data-testid="name-input" />}
        </Field>
      ),
      {
        initialValues: {
          name: "Jack",
        },
        onSubmit,
      }
    )

    expect(form().getFieldValue("name")).toEqual("Jack")

    await form().submit()

    expect(onSubmit).toBeCalledWith({ name: "*Jack*" })
    expect(form().getFieldValue("name")).toEqual("*Jack*")
  })

  it("parseOnBlur value before submit", async () => {
    const onSubmit = jest.fn()

    const parse = (value: any) =>
      value ? `*${String(value).replace(/\*/g, "")}*` : value

    const { form } = renderTestForm(
      () => (
        <Field name="name" parseOnBlur={parse}>
          {(field) => <input {...field.input} data-testid="name-input" />}
        </Field>
      ),
      {
        initialValues: {
          name: "Jack",
        },
        onSubmit,
      }
    )

    expect(form().getFieldValue("name")).toEqual("Jack")

    await form().submit()

    expect(onSubmit).toBeCalledWith({ name: "*Jack*" })
    expect(form().getFieldValue("name")).toEqual("*Jack*")
  })

  it("parseOnBlur takes precedence over parse on before submit", async () => {
    const onSubmit = jest.fn()

    const parse = (value: any) =>
      value ? `*${String(value).replace(/\*/g, "")}*` : value

    const parseOnBlur = (value: any) =>
      value ? `**${String(value).replace(/\*/g, "")}**` : value

    const { form } = renderTestForm(
      () => (
        <Field name="name" parse={parse} parseOnBlur={parseOnBlur}>
          {(field) => <input {...field.input} data-testid="name-input" />}
        </Field>
      ),
      {
        initialValues: {
          name: "Jack",
        },
        onSubmit,
      }
    )

    expect(form().getFieldValue("name")).toEqual("Jack")

    await form().submit()

    expect(onSubmit).toBeCalledWith({ name: "**Jack**" })
    expect(form().getFieldValue("name")).toEqual("**Jack**")
  })

  it("reset to initial value", () => {
    let injectedField: FieldRenderProps | undefined = undefined

    const { form } = renderTestForm(
      () => (
        <Field name="name">
          {(field) => (injectedField = field) && <input {...field.input} />}
        </Field>
      ),
      {
        initialValues: {
          name: "Bob",
        },
      }
    )

    const field = injectedField!
    field.setValue("Jack")

    expect(form().getFieldValue("name")).toEqual("Jack")
    expect(form().isFieldDirty("name")).toBe(true)
    expect(field.isDirty).toBe(true)

    field.reset()

    expect(form().getFieldValue("name")).toEqual("Bob")
    expect(form().isFieldDirty("name")).toBe(false)
    expect(field.isDirty).toBe(false)
  })

  it("reset to new value", () => {
    let injectedField: FieldRenderProps | undefined = undefined

    const { form } = renderTestForm(
      () => (
        <Field name="name">
          {(field) => (injectedField = field) && <input {...field.input} />}
        </Field>
      ),
      {
        initialValues: {
          name: "Bob",
        },
      }
    )

    const field = injectedField!

    field.reset("Jack")

    expect(form().getFieldValue("name")).toEqual("Jack")
    expect(form().isFieldDirty("name")).toBe(false)
    expect(field.isDirty).toBe(false)
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
      expect(field.error).toEqual({ message: "Error!" })
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
      expect(field.error).toEqual({ message: "Uh oh!" })
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

    expect(error).toEqual([{ message: "Name already taken" }])
    expect(injectedField!.error).toEqual(error![0])
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

    expect(error).toEqual([{ message: "Name already taken" }])
    expect(field.error).toEqual(error![0])
  })

  it("validateOnChange is off by default", async () => {
    let injectedField: FieldRenderProps | undefined = undefined
    const validate = jest.fn(() => Promise.resolve("Error!"))

    renderForm(
      () => (
        <Field name="name" validate={validate}>
          {(field) => (injectedField = field) && <span />}
        </Field>
      ),
      {
        initialValues: { name: "jack" },
        validateOnChange: false,
        validateOnBlur: false,
      }
    )

    const field = injectedField!
    field.setValue("Jim")

    expect(validate).toBeCalledTimes(0)
  })

  it("validateOnChange", async () => {
    let injectedField: FieldRenderProps | undefined = undefined
    const validate = jest.fn(() => Promise.resolve("Error!"))

    renderForm(
      () => (
        <Field name="name" validate={validate} validateOnChange={true}>
          {(field) => (injectedField = field) && <span />}
        </Field>
      ),
      {
        initialValues: { name: "jack" },
        validateOnChange: false,
        validateOnBlur: false,
      }
    )

    const field = injectedField!
    field.setValue("Jim")

    expect(validate).toBeCalledTimes(1)

    await waitForExpect(() => {
      expect(field.error).toEqual({ message: "Error!" })
    })
  })

  it("validateOnChange with validateOnChangeFields = [] should occur only when field value is changed", async () => {
    const validate = jest.fn(() => Promise.resolve("Error!"))

    const { form } = renderForm(
      () => (
        <Field
          name="name"
          validate={validate}
          validateOnChange={true}
          validateOnChangeFields={[]}
        >
          {() => <span />}
        </Field>
      ),
      {
        initialValues: { name: "chuck", surname: "norris" },
        validateOnChange: false,
        validateOnBlur: false,
      }
    )

    form().setFieldValue("surname", "chan")

    expect(validate).toBeCalledTimes(0)

    form().setFieldValue("name", "jackie")

    expect(validate).toBeCalledTimes(1)

    await waitForExpect(() => {
      expect(validate).toBeCalledTimes(1)
      expect(form().getFieldError("name")).toEqual({ message: "Error!" })
    })
  })

  it("validateOnChange with validateOnChangeFields referencing other fields should occur when they change", async () => {
    const validate = jest.fn(() => Promise.resolve("Error!"))

    const { form } = renderForm(
      () => (
        <Field
          name="name"
          validate={validate}
          validateOnChange={true}
          validateOnChangeFields={["surname"]}
        >
          {() => <span />}
        </Field>
      ),
      {
        initialValues: { name: "chuck", surname: "norris", age: 36 },
        validateOnChange: false,
        validateOnBlur: false,
      }
    )

    form().setFieldValue("age", 40)

    expect(validate).toBeCalledTimes(0)

    form().setFieldValue("name", "jackie")

    expect(validate).toBeCalledTimes(1)

    form().setFieldValue("surname", "chan")

    expect(validate).toBeCalledTimes(2)

    await waitForExpect(() => {
      expect(form().getFieldError("name")).toEqual({ message: "Error!" })
    })
  })

  it("validateOnChange can be undefined when validateOnChangeFields is set", async () => {
    const validate = jest.fn(() => Promise.resolve("Error!"))

    const { form } = renderForm(
      () => (
        <Field
          name="name"
          validate={validate}
          validateOnChangeFields={["surname"]}
        >
          {() => <span />}
        </Field>
      ),
      {
        initialValues: { name: "chuck", surname: "norris", age: 36 },
        validateOnChange: false,
        validateOnBlur: false,
      }
    )

    form().setFieldValue("age", 40)

    expect(validate).toBeCalledTimes(0)

    form().setFieldValue("name", "jackie")

    expect(validate).toBeCalledTimes(1)

    form().setFieldValue("surname", "chan")

    expect(validate).toBeCalledTimes(2)

    await waitForExpect(() => {
      expect(form().getFieldError("name")).toEqual({ message: "Error!" })
    })
  })

  it("validateOnChange should use the latest validateOnChangeFields value", async () => {
    const validate = jest.fn(() => Promise.resolve("Error!"))

    function renderNameField(validateOnChangeFields?: string[]) {
      return (
        <Field
          name="name"
          validate={validate}
          validateOnChangeFields={validateOnChangeFields}
        >
          {() => <span />}
        </Field>
      )
    }

    const { form, rerender } = renderForm(() => renderNameField(), {
      initialValues: { name: "chuck", surname: "norris" },
      validateOnChange: false,
      validateOnBlur: false,
    })

    form().setFieldValue("name", "jackie")

    expect(validate).toBeCalledTimes(0)

    rerender({
      ui: () => renderNameField(["surname"]),
      validateOnChange: false,
      validateOnBlur: false,
    })

    form().setFieldValue("name", "bill")

    expect(validate).toBeCalledTimes(1)

    form().setFieldValue("surname", "murray")

    expect(validate).toBeCalledTimes(2)
  })

  it("validateOnChangeFields should respect <FieldScope />", async () => {
    const validate = jest.fn(() => Promise.resolve("Error!"))

    const { form } = renderForm(
      () => (
        <FieldScope name="preferences">
          <Field
            name="color"
            validate={validate}
            validateOnChangeFields={["dish"]}
          >
            {() => <span />}
          </Field>
        </FieldScope>
      ),
      {
        initialValues: {
          preferences: { color: "blue", dish: "pizza", other: "" },
        },
        validateOnChange: false,
        validateOnBlur: false,
      }
    )

    form().setFieldValue("preferences.other", "foo")

    expect(validate).toBeCalledTimes(0)

    form().setFieldValue("preferences.dish", "pasta")

    expect(validate).toBeCalledTimes(1)

    form().setFieldValue("preferences.color", "orange")

    expect(validate).toBeCalledTimes(2)
  })

  it("validateOnBlur is off by default", async () => {
    const validate = jest.fn(() => Promise.resolve("Error!"))

    const { getByTestId } = renderForm(
      () => (
        <Field name="name" validate={validate}>
          {(field) => (
            <input type="text" {...field.input} data-testid="name-input" />
          )}
        </Field>
      ),
      {
        initialValues: { name: "jack" },
        validateOnChange: false,
        validateOnBlur: false,
      }
    )

    const nameInput = getByTestId("name-input")

    fireEvent.blur(nameInput)

    expect(validate).toBeCalledTimes(0)
  })

  it("validateOnBlur", async () => {
    let injectedField: FieldRenderProps | undefined = undefined
    const validate = jest.fn(() => Promise.resolve("Error!"))

    const { getByTestId } = renderForm(
      () => (
        <Field name="name" validate={validate} validateOnBlur={true}>
          {(field) =>
            (injectedField = field) && (
              <input type="text" {...field.input} data-testid="name-input" />
            )
          }
        </Field>
      ),
      {
        initialValues: { name: "jack" },
        validateOnChange: false,
        validateOnBlur: false,
      }
    )

    const nameInput = getByTestId("name-input")

    fireEvent.blur(nameInput)

    expect(validate).toBeCalledTimes(1)

    await waitForExpect(() => {
      expect(injectedField!.error).toEqual({ message: "Error!" })
    })
  })

  it("should merge errors of multiple <Field/> on same field", async () => {
    let injectedField: FieldRenderProps | undefined = undefined
    let injectedField2: FieldRenderProps | undefined = undefined
    const validate = jest.fn(() => Promise.resolve("Error1"))
    const validate2 = jest.fn(() => Promise.resolve("Error2"))

    const { form } = renderForm(
      () => (
        <>
          <Field name="name" validate={validate}>
            {(field) =>
              (injectedField = field) && (
                <input type="text" {...field.input} data-testid="name-input" />
              )
            }
          </Field>
          <Field name="name" validate={validate2}>
            {(field) =>
              (injectedField2 = field) && (
                <input type="text" {...field.input} data-testid="name-input2" />
              )
            }
          </Field>
        </>
      ),
      {
        initialValues: { name: "jack" },
        validateOnChange: false,
      }
    )

    await form().validate()

    expect(validate).toBeCalledTimes(1)
    expect(validate2).toBeCalledTimes(1)

    expect(form().getFieldErrors("name")).toEqual([
      { message: "Error1" },
      { message: "Error2" },
    ])
    expect(injectedField!.errors).toEqual([
      { message: "Error1" },
      { message: "Error2" },
    ])
    expect(injectedField2!.errors).toEqual([
      { message: "Error1" },
      { message: "Error2" },
    ])
  })

  it("validate prop accepts an array of validators", async () => {
    let injectedField: FieldRenderProps | undefined = undefined

    const required = (value: any) =>
      value == null || value === "" ? "Required" : undefined
    const notJack = (value: any) =>
      value === "jack" ? "Name already taken" : undefined

    const { form } = renderForm(
      () => (
        <Field name="name" validate={[required, notJack]}>
          {(field) => (injectedField = field) && <span />}
        </Field>
      ),
      {
        initialValues: { name: "" },
      }
    )

    const field = injectedField!
    await field.validate()

    expect(field.error).toEqual({ message: "Required" })

    form().setFieldValue("name", "jack")
    await field.validate()

    expect(field.error).toEqual({ message: "Name already taken" })

    form().setFieldValue("name", "philip")
    await field.validate()

    expect(field.error).toBeUndefined()
  })
})
