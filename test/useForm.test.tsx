import * as React from "react"
import waitForExpect from "wait-for-expect"
import { FormConfig } from "../src/types"
import { renderForm } from "./__helpers/renderForm"
import { wait } from "./__helpers/wait"

const InitialValues = {
  name: "bill",
  surname: "murray",
  preferences: {
    color: "blue",
  },
  friends: [
    {
      name: "bax",
      age: 23,
    },
  ],
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
          <Field name="preferences.color">
            {(field) => (
              <div>
                <input type="text" {...field.input} data-testid="color-input" />
                {field.touched && field.error}
              </div>
            )}
          </Field>
          <Field name="friends.0.name">
            {(field) => (
              <div>
                <input
                  type="text"
                  {...field.input}
                  data-testid="friend-name-input"
                />
                {field.touched && field.error}
              </div>
            )}
          </Field>
          <Field name="friends.0.age">
            {(field) => (
              <div>
                <input
                  type="number"
                  {...field.input}
                  data-testid="friend-age-input"
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

  it("setFieldValue", () => {
    const { form, getByTestId } = renderTestForm()
    form().setFieldValue("name", "jean")
    form().setFieldValue("preferences.color", "red")
    form().setFieldValue("friends.0.name", "robin")
    form().setFieldValue("friends.0.age", 42)

    expect(form().values.name).toEqual("jean")
    expect(form().values.preferences.color).toEqual("red")
    expect(form().values.friends[0].name).toEqual("robin")
    expect(form().values.friends[0].age).toEqual(42)

    function getInputValue(testId: string) {
      const input = getByTestId(testId) as HTMLInputElement
      return input.value
    }

    expect(getInputValue("name-input")).toEqual("jean")
    expect(getInputValue("color-input")).toEqual("red")
    expect(getInputValue("friend-name-input")).toEqual("robin")
    expect(getInputValue("friend-age-input")).toEqual("42")
  })

  it("rerenders only the input", () => {
    const { form, renderCount, renderNameCount } = renderTestForm()

    expect(renderCount()).toBe(1)
    expect(renderNameCount()).toEqual(1)

    form().setFieldValue("name", "jean")

    expect(renderCount()).toEqual(1)
    expect(renderNameCount()).toEqual(2)
  })

  it("handles field touched", () => {
    const { form } = renderTestForm()

    form().setFieldTouched("name", true)
    form().setFieldTouched("surname", false)
    form().setFieldTouched("preferences.color") // true if not specified
    form().setFieldTouched("friends.0.name", true)

    expect(form().isFieldTouched("name")).toBe(true)
    expect(form().isFieldTouched("surname")).toBe(false)
    expect(form().isFieldTouched("preferences.color")).toBe(true)
    expect(form().isFieldTouched("friends.0.name")).toBe(true)
    expect(form().isFieldTouched("friends.0.surname")).toBe(false)
  })

  it("setTouched", () => {
    const { form } = renderTestForm()

    form().setTouched({
      name: true,
      surname: false,
      "preferences.color": true,
      "friends.0.name": true,
    })

    expect(form().isFieldTouched("name")).toBe(true)
    expect(form().isFieldTouched("surname")).toBe(false)
    expect(form().isFieldTouched("preferences.color")).toBe(true)
    expect(form().isFieldTouched("friends.0.name")).toBe(true)
    expect(form().isFieldTouched("friends.0.surname")).toBe(false)
  })

  it("handles field errors", () => {
    const { form } = renderTestForm()

    form().setFieldError("name", "Empty name")
    form().setFieldError("surname", ["Empty surname", "Another error"])
    form().setFieldError("preferences.color", "Not a nice color")
    form().setFieldError("friends.0.name", "Is it a name?")

    expect(form().getFieldError("name")).toEqual("Empty name")
    expect(form().getFieldError("surname")).toEqual("Empty surname")
    expect(form().getFieldErrors("surname")).toEqual([
      "Empty surname",
      "Another error",
    ])
    expect(form().getFieldError("preferences.color")).toEqual(
      "Not a nice color"
    )
    expect(form().getFieldError("friends.0.name")).toEqual("Is it a name?")
    expect(form().getFieldError("friends.0.surname")).toEqual(undefined)

    // undefined clear errors
    form().setFieldError("name", undefined)
    expect(form().getFieldError("name")).toBe(undefined)
    expect(form().getFieldErrors("name")).toBe(undefined)

    // [] clear errors
    form().setFieldError("name", "New error")
    form().setFieldError("name", [])
    expect(form().getFieldError("name")).toBe(undefined)
    expect(form().getFieldErrors("name")).toEqual([])
  })

  it("setErrors", () => {
    const { form } = renderTestForm()

    form().setErrors({
      name: "Empty name",
      surname: ["Empty surname", "Another error"],
      "preferences.color": "Not a nice color",
      "friends.0.name": "Is it a name?",
    })

    expect(form().getFieldError("name")).toEqual("Empty name")
    expect(form().getFieldError("surname")).toEqual("Empty surname")
    expect(form().getFieldErrors("surname")).toEqual([
      "Empty surname",
      "Another error",
    ])
    expect(form().getFieldError("preferences.color")).toEqual(
      "Not a nice color"
    )
    expect(form().getFieldError("friends.0.name")).toEqual("Is it a name?")
    expect(form().getFieldError("friends.0.surname")).toEqual(undefined)
  })

  it("addFieldError", () => {
    const { form } = renderTestForm()

    expect(form().getFieldError("name")).toBe(undefined)

    // single error
    form().addFieldError("name", "Empty name")
    expect(form().getFieldError("name")).toEqual("Empty name")

    // multiple errors
    const expectedErrors = ["Empty name", "Another error"]
    form().addFieldError("name", "Another error")
    expect(form().getFieldError("name")).toEqual("Empty name")
    expect(form().getFieldErrors("name")).toEqual(expectedErrors)

    // undefined do nothing
    form().addFieldError("name", undefined)
    expect(form().getFieldErrors("name")).toEqual(expectedErrors)

    // [] do nothing
    form().addFieldError("name", [])
    expect(form().getFieldErrors("name")).toEqual(expectedErrors)
  })

  it("isFieldValid", () => {
    const { form } = renderTestForm()

    expect(form().isFieldValid("name")).toBe(true)

    // single error
    form().setFieldError("name", "Empty name")
    expect(form().isFieldValid("name")).toBe(false)

    // multiple errors
    form().setFieldError("name", ["Empty name", "Another error"])
    expect(form().isFieldValid("name")).toBe(false)

    // undefined means no error
    form().setFieldError("name", undefined)
    expect(form().isFieldValid("name")).toBe(true)

    // [] means no error
    form().setFieldError("name", [])
    expect(form().isFieldValid("name")).toBe(true)

    // "" means no error
    form().setFieldError("name", "")
    expect(form().isFieldValid("name")).toBe(true)
  })

  it("isValid", () => {
    const { form } = renderTestForm()

    // it is considered valid at init
    expect(form().isValid).toBe(true)

    // errors make it mark as not vlid
    form().setErrors({
      name: "any error",
    })
    expect(form().isValid).toBe(false)

    // undefined means no error
    form().setErrors({
      name: undefined,
    })
    expect(form().isValid).toBe(true)

    // [] means no error
    form().setErrors({
      name: [],
    })
    expect(form().isValid).toBe(true)

    // "" means no error
    form().setErrors({
      name: "",
    })
    expect(form().isValid).toBe(true)
  })

  describe("isDirty", () => {
    it("not dirty at init", () => {
      const { form } = renderTestForm()

      expect(form().isDirty).toBe(false)
    })

    it("dirty if changing a field", () => {
      const { form } = renderTestForm()
      form().setFieldValue("name", "jane")

      expect(form().isDirty).toBe(true)
    })

    it("dirty if changing a nested field", () => {
      const { form } = renderTestForm()
      form().setFieldValue("preferences.color", "orange")

      expect(form().isDirty).toBe(true)
    })

    it("dirty if changing a nested field in list", () => {
      const { form } = renderTestForm()
      form().setFieldValue("friends.0.name", "buzz")

      expect(form().isDirty).toBe(true)
    })

    it("not dirty if changing with same values", () => {
      const { form } = renderTestForm()
      form().setFieldValue("friends", [{ name: "bax", age: 23 }])

      expect(form().isDirty).toBe(false)
    })
  })

  describe("isFieldDirty", () => {
    it("not dirty at init", () => {
      const { form } = renderTestForm()

      expect(form().isFieldDirty("name")).toBe(false)
    })

    it("dirty if changing a field", () => {
      const { form } = renderTestForm()
      form().setFieldValue("name", "jane")

      expect(form().isFieldDirty("name")).toBe(true)
    })

    it("dirty if changing a nested field", () => {
      const { form } = renderTestForm()
      form().setFieldValue("preferences.color", "orange")

      expect(form().isFieldDirty("preferences.color")).toBe(true)
    })

    it("dirty if changing a nested field in list", () => {
      const { form } = renderTestForm()
      form().setFieldValue("friends.0.name", "buzz")

      expect(form().isFieldDirty("friends.0.name")).toBe(true)
    })

    it("not dirty if changing with same values", () => {
      const { form } = renderTestForm()
      form().setFieldValue("friends", [{ name: "bax", age: 23 }])

      expect(form().isFieldDirty("friends")).toBe(false)
    })

    it("dirty if changing a branch of the values", () => {
      const { form } = renderTestForm()
      form().setFieldValue("friends", [{ name: "bax", age: 99 }])

      expect(form().isFieldDirty("friends")).toBe(true)
    })
  })
})

describe("useForm submit", () => {
  it("should happen when form is valid", async () => {
    const submit = jest.fn(() => Promise.resolve())
    const { form } = renderTestForm({ onSubmit: submit })

    expect(form().isValid).toBe(true)

    await form().submit()

    expect(submit).toBeCalledTimes(1)
  })

  it("should not happen when form is invalid", async () => {
    const submit = jest.fn(() => Promise.resolve())
    const { form } = renderTestForm({
      onSubmit: submit,
      onValidate: () => {
        return {
          name: "Error",
        }
      },
    })

    await form().submit()

    expect(form().isValid).toBe(false)
    expect(submit).toBeCalledTimes(0)
  })

  it("should consider the form errors returned by onSubmit", async () => {
    const submit = jest.fn(() => Promise.resolve({ name: "Error" }))
    const { form } = renderTestForm({ onSubmit: submit })

    expect(form().isValid).toBe(true)

    const errors = await form().submit()

    expect(errors).toEqual({ name: "Error" })
    expect(form().isValid).toBe(false)
    expect(form().getFieldError("name")).toEqual("Error")
  })

  it("handleSubmit should prevent default event", async () => {
    const preventDefault = jest.fn()
    const submit = jest.fn(() => Promise.resolve())

    const { form } = renderTestForm({ onSubmit: submit })

    form().handleSubmit({ preventDefault } as any)

    await waitForExpect(() => {
      expect(preventDefault).toBeCalledTimes(1)
      expect(submit).toBeCalledTimes(1)
    })
  })

  it("uses latest onSubmit callback", async () => {
    const submit = jest.fn(() => Promise.resolve())
    const submit2 = jest.fn(() => Promise.resolve())
    const { form, rerender } = renderTestForm({
      onSubmit: submit,
    })

    await form().submit()

    expect(submit).toBeCalledTimes(1)

    rerender({
      onSubmit: submit2,
    })

    await form().submit()

    expect(submit).toBeCalledTimes(1)
    expect(submit2).toBeCalledTimes(1)
  })

  it("onFailedSubmit should be called instead of onSubmit if form is invalid", async () => {
    const submit = jest.fn(() => Promise.resolve())
    const failedSubmit = jest.fn()
    const { form } = renderTestForm({
      onSubmit: submit,
      onFailedSubmit: failedSubmit,
      onValidate: () => ({ name: "Error" }),
    })

    await form().submit()

    expect(submit).toBeCalledTimes(0)
    expect(failedSubmit).toBeCalledTimes(1)
  })

  it("uses latest onFailedSubmit callback", async () => {
    const failedSubmit = jest.fn()
    const failedSubmit2 = jest.fn()
    const { form, rerender } = renderTestForm({
      onFailedSubmit: failedSubmit,
      onValidate: () => ({ name: "Error" }),
    })

    await form().submit()

    expect(failedSubmit).toBeCalledTimes(1)

    rerender({
      onFailedSubmit: failedSubmit2,
      onValidate: () => ({ name: "Error" }),
    })

    await form().submit()

    expect(failedSubmit).toBeCalledTimes(1)
    expect(failedSubmit2).toBeCalledTimes(1)
  })
})

describe("useForm validation", () => {
  it("uses latest onValidate callback", () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const onValidate2 = jest.fn(() => Promise.resolve({}))
    const { form, rerender } = renderTestForm({
      onValidate,
      validateOnChange: true,
    })

    form().setFieldValue("name", "jean")

    expect(onValidate).toBeCalledTimes(1)

    rerender({ onValidate: onValidate2, validateOnChange: true })

    form().setFieldValue("name", "jean2")

    expect(onValidate).toBeCalledTimes(1)
    expect(onValidate2).toBeCalledTimes(1)
  })

  it("validateOnChange by default", () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form } = renderTestForm({ onValidate })

    form().setFieldValue("name", "jean")

    expect(onValidate).toBeCalledTimes(1)
  })

  it("validateOnChange = false does not trigger validation on change", () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form } = renderTestForm({ onValidate, validateOnChange: false })

    form().setFieldValue("name", "jean")

    expect(onValidate).toBeCalledTimes(0)
  })

  it("validateOnChange can be changed later", () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form, rerender } = renderTestForm({
      onValidate,
      validateOnChange: false,
    })

    form().setFieldValue("name", "jean")

    expect(onValidate).toBeCalledTimes(0)

    rerender({ onValidate, validateOnChange: true })

    form().setFieldValue("name", "jean2")

    expect(onValidate).toBeCalledTimes(1)
  })

  it("validateOnBlur turned off by default", () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form } = renderTestForm({ onValidate })

    form().setFieldTouched("name", true)

    expect(onValidate).toBeCalledTimes(0)
  })

  it("validateOnBlur = false does not trigger validation on blur", () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form } = renderTestForm({ onValidate, validateOnBlur: false })

    form().setFieldTouched("name", true)

    expect(onValidate).toBeCalledTimes(0)
  })

  it("validateOnBlur = true does trigger validation on blur", () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form } = renderTestForm({ onValidate, validateOnBlur: true })

    form().setFieldTouched("name", true)

    expect(onValidate).toBeCalledTimes(1)
  })

  it("validateOnBlur can be changed later", () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form, rerender } = renderTestForm({
      onValidate,
      validateOnBlur: false,
    })

    form().setFieldTouched("name", true)

    expect(onValidate).toBeCalledTimes(0)

    rerender({ onValidate, validateOnBlur: true })

    form().setFieldTouched("surname", true)

    expect(onValidate).toBeCalledTimes(1)
  })

  it("validateOnChange and validateOnBlur work together", () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form } = renderTestForm({
      onValidate,
      validateOnChange: true,
      validateOnBlur: true,
    })

    form().setFieldValue("name", "jean")

    expect(onValidate).toBeCalledTimes(1)

    form().setFieldTouched("name", true)

    expect(onValidate).toBeCalledTimes(2)
  })

  it("only last validation result is used", async () => {
    let n = 0
    const onValidate = jest.fn(async () => {
      const count = n
      n++
      await wait(500 - count * 500)
      return {
        name: `Error ${count}`,
      }
    })

    const { form } = renderTestForm({
      onValidate,
      validateOnChange: true,
    })

    form().setFieldValue("name", "jean")

    await wait(100)

    form().setFieldValue("name", "jean2")

    await wait(10)

    expect(onValidate).toBeCalledTimes(2)
    expect(form().getFieldError("name")).toEqual("Error 1")

    await wait(500)

    expect(onValidate).toBeCalledTimes(2)
    expect(form().getFieldError("name")).toEqual("Error 1")
  })
})

describe("useForm validation debounce", () => {
  it("debounce is off by default", () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form } = renderTestForm({
      onValidate,
      validateOnChange: true,
    })

    for (let i = 0; i < 3; i++) {
      form().setFieldValue("name", `jean${i}`)
      expect(onValidate).toBeCalledTimes(i + 1)
    }
  })

  it("validationDebounce is true - has no leading by default", async () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form } = renderTestForm({
      onValidate,
      validateOnChange: true,
      validateDebounce: true,
    })

    for (let i = 0; i < 3; i++) {
      form().setFieldValue("name", `jean${i}`)
      expect(onValidate).toBeCalledTimes(0)
    }

    await wait(350)

    expect(onValidate).toBeCalledTimes(1)
  })

  it("validationDebounce with custom wait - has no leading by default", async () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form } = renderTestForm({
      onValidate,
      validateOnChange: true,
      validateDebounce: 500,
    })

    for (let i = 0; i < 3; i++) {
      form().setFieldValue("name", `jean${i}`)
      expect(onValidate).toBeCalledTimes(0)
      await wait(100)
    }

    await wait(450)

    expect(onValidate).toBeCalledTimes(1)
  })

  it("validationDebounce with custom wait and leading", async () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form } = renderTestForm({
      onValidate,
      validateOnChange: true,
      validateDebounce: { wait: 500, leading: true },
    })

    for (let i = 0; i < 3; i++) {
      form().setFieldValue("name", `jean${i}`)
      expect(onValidate).toBeCalledTimes(1)
      await wait(100)
    }

    await wait(450)
    expect(onValidate).toBeCalledTimes(2)
  })

  it("validationDebounce with custom wait and leading while rerendering", async () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form, rerender } = renderTestForm({
      onValidate,
      validateOnChange: true,
      validateDebounce: { wait: 500, leading: true },
    })

    for (let i = 0; i < 3; i++) {
      form().setFieldValue("name", `jean${i}`)
      expect(onValidate).toBeCalledTimes(1)
      rerender({
        onValidate,
        validateOnChange: true,
        validateDebounce: { wait: 500, leading: true },
      })
      await wait(100)
    }

    await wait(450)
    expect(onValidate).toBeCalledTimes(2)
  })
})
