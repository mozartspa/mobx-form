import { act } from "@testing-library/react"
import * as React from "react"
import waitForExpect from "wait-for-expect"
import { Field } from "../src"
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
  let renderSurnameCount = 0

  const result = renderForm(
    () => {
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
                  {field.error?.message}
                </div>
              )
            }}
          </Field>
          <Field name="surname">
            {(field) => {
              renderSurnameCount++
              return (
                <div>
                  <input
                    type="text"
                    {...field.input}
                    data-testid="surname-input"
                  />
                  {field.error?.message}
                </div>
              )
            }}
          </Field>
          <Field name="preferences.color">
            {(field) => (
              <div>
                <input type="text" {...field.input} data-testid="color-input" />
                {field.error?.message}
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
                {field.isTouched && field.error?.message}
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
                {field.isTouched && field.error?.message}
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
    renderSurnameCount() {
      return renderSurnameCount
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

    act(() => {
      form().setFieldValue("name", "jean")
    })

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
    act(() => {
      form().setFieldValue("name", "jean")
      form().setFieldValue("preferences.color", "red")
      form().setFieldValue("friends.0.name", "robin")
      form().setFieldValue("friends.0.age", 42)
    })

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

  it("rerenders only the input", async () => {
    const { form, renderCount, renderNameCount, renderSurnameCount } =
      renderTestForm()

    expect(renderCount()).toBe(1)
    expect(renderNameCount()).toEqual(1)
    expect(renderSurnameCount()).toEqual(1)

    act(() => {
      form().setFieldValue("name", "jean")
    })

    await wait(200) // waiting for validation

    expect(renderCount()).toEqual(1)
    expect(renderNameCount()).toEqual(2)
    expect(renderSurnameCount()).toEqual(1)
  })

  it("handles field touched", () => {
    const { form } = renderTestForm()

    act(() => {
      form().setFieldTouched("name", true)
      form().setFieldTouched("surname", false)
      form().setFieldTouched("preferences.color") // true if not specified
      form().setFieldTouched("friends.0.name", true)
    })

    expect(form().isFieldTouched("name")).toBe(true)
    expect(form().isFieldTouched("surname")).toBe(false)
    expect(form().isFieldTouched("preferences.color")).toBe(true)
    expect(form().isFieldTouched("friends.0.name")).toBe(true)
    expect(form().isFieldTouched("friends.0.surname")).toBe(false)
  })

  it("setTouched", () => {
    const { form } = renderTestForm()

    act(() => {
      form().setTouched({
        name: true,
        surname: false,
        "preferences.color": true,
        "friends.0.name": true,
      })
    })

    expect(form().isFieldTouched("name")).toBe(true)
    expect(form().isFieldTouched("surname")).toBe(false)
    expect(form().isFieldTouched("preferences.color")).toBe(true)
    expect(form().isFieldTouched("friends.0.name")).toBe(true)
    expect(form().isFieldTouched("friends.0.surname")).toBe(false)
  })

  it("handles field errors", () => {
    const { form } = renderTestForm()

    act(() => {
      form().setFieldError("name", "Empty name")
      form().setFieldError("surname", ["Empty surname", "Another error"])
      form().setFieldError("preferences.color", "Not a nice color")
      form().setFieldError("friends.0.name", "Is it a name?")
    })

    expect(form().getFieldError("name")).toEqual({ message: "Empty name" })
    expect(form().getFieldError("surname")).toEqual({
      message: "Empty surname",
    })
    expect(form().getFieldErrors("surname")).toEqual([
      { message: "Empty surname" },
      { message: "Another error" },
    ])
    expect(form().getFieldError("preferences.color")).toEqual({
      message: "Not a nice color",
    })
    expect(form().getFieldError("friends.0.name")).toEqual({
      message: "Is it a name?",
    })
    expect(form().getFieldError("friends.0.surname")).toEqual(undefined)

    // undefined clear errors
    act(() => {
      form().setFieldError("name", undefined)
    })
    expect(form().getFieldError("name")).toBe(undefined)
    expect(form().getFieldErrors("name")).toBe(undefined)

    // [] clear errors
    act(() => {
      form().setFieldError("name", "New error")
      form().setFieldError("name", [])
    })
    expect(form().getFieldError("name")).toBe(undefined)
    expect(form().getFieldErrors("name")).toBe(undefined)
  })

  it("setErrors", () => {
    const { form } = renderTestForm()

    act(() => {
      form().setErrors({
        name: "Empty name",
        surname: ["Empty surname", "Another error"],
        "preferences.color": "Not a nice color",
        "friends.0.name": "Is it a name?",
      })
    })

    expect(form().getFieldError("name")).toEqual({ message: "Empty name" })
    expect(form().getFieldError("surname")).toEqual({
      message: "Empty surname",
    })
    expect(form().getFieldErrors("surname")).toEqual([
      { message: "Empty surname" },
      { message: "Another error" },
    ])
    expect(form().getFieldError("preferences.color")).toEqual({
      message: "Not a nice color",
    })
    expect(form().getFieldError("friends.0.name")).toEqual({
      message: "Is it a name?",
    })
    expect(form().getFieldError("friends.0.surname")).toEqual(undefined)
  })

  it("addFieldError", () => {
    const { form } = renderTestForm()

    expect(form().getFieldError("name")).toBe(undefined)

    // single error
    act(() => {
      form().addFieldError("name", "Empty name")
    })
    expect(form().getFieldError("name")).toEqual({ message: "Empty name" })

    // multiple errors
    const expectedErrors = [
      { message: "Empty name" },
      { message: "Another error" },
    ]
    act(() => {
      form().addFieldError("name", "Another error")
    })
    expect(form().getFieldError("name")).toEqual({ message: "Empty name" })
    expect(form().getFieldErrors("name")).toEqual(expectedErrors)

    // undefined do nothing
    act(() => {
      form().addFieldError("name", undefined)
    })
    expect(form().getFieldErrors("name")).toEqual(expectedErrors)

    // [] do nothing
    act(() => {
      form().addFieldError("name", [])
    })
    expect(form().getFieldErrors("name")).toEqual(expectedErrors)
  })

  it("isFieldValid", () => {
    const { form } = renderTestForm()

    expect(form().isFieldValid("name")).toBe(true)

    // single error
    act(() => {
      form().setFieldError("name", "Empty name")
    })
    expect(form().isFieldValid("name")).toBe(false)

    // multiple errors
    act(() => {
      form().setFieldError("name", ["Empty name", "Another error"])
    })
    expect(form().isFieldValid("name")).toBe(false)

    // undefined means no error
    act(() => {
      form().setFieldError("name", undefined)
    })
    expect(form().isFieldValid("name")).toBe(true)

    // [] means no error
    act(() => {
      form().setFieldError("name", [])
    })
    expect(form().isFieldValid("name")).toBe(true)

    // "" means no error
    act(() => {
      form().setFieldError("name", "")
    })
    expect(form().isFieldValid("name")).toBe(true)
  })

  it("isValid", () => {
    const { form } = renderTestForm()

    // it is considered valid at init
    expect(form().isValid).toBe(true)

    // errors make it mark as not vlid
    act(() => {
      form().setErrors({
        name: "any error",
      })
    })
    expect(form().isValid).toBe(false)

    // undefined means no error
    act(() => {
      form().setErrors({
        name: undefined,
      })
    })
    expect(form().isValid).toBe(true)

    // [] means no error
    act(() => {
      form().setErrors({
        name: [],
      })
    })
    expect(form().isValid).toBe(true)

    // "" means no error
    act(() => {
      form().setErrors({
        name: "",
      })
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
      act(() => {
        form().setFieldValue("name", "jane")
      })

      expect(form().isDirty).toBe(true)
    })

    it("dirty if changing a nested field", () => {
      const { form } = renderTestForm()
      act(() => {
        form().setFieldValue("preferences.color", "orange")
      })

      expect(form().isDirty).toBe(true)
    })

    it("dirty if changing a nested field in list", () => {
      const { form } = renderTestForm()
      act(() => {
        form().setFieldValue("friends.0.name", "buzz")
      })

      expect(form().isDirty).toBe(true)
    })

    it("not dirty if changing with same values", () => {
      const { form } = renderTestForm()
      act(() => {
        form().setFieldValue("friends", [{ name: "bax", age: 23 }])
      })

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
      act(() => {
        form().setFieldValue("name", "jane")
      })

      expect(form().isFieldDirty("name")).toBe(true)
    })

    it("dirty if changing a nested field", () => {
      const { form } = renderTestForm()
      act(() => {
        form().setFieldValue("preferences.color", "orange")
      })

      expect(form().isFieldDirty("preferences.color")).toBe(true)
    })

    it("dirty if changing a nested field in list", () => {
      const { form } = renderTestForm()
      act(() => {
        form().setFieldValue("friends.0.name", "buzz")
      })

      expect(form().isFieldDirty("friends.0.name")).toBe(true)
    })

    it("not dirty if changing with same values", () => {
      const { form } = renderTestForm()
      act(() => {
        form().setFieldValue("friends", [{ name: "bax", age: 23 }])
      })

      expect(form().isFieldDirty("friends")).toBe(false)
    })

    it("dirty if changing a branch of the values", () => {
      const { form } = renderTestForm()
      act(() => {
        form().setFieldValue("friends", [{ name: "bax", age: 99 }])
      })

      expect(form().isFieldDirty("friends")).toBe(true)
    })
  })
})

describe("useForm submit", () => {
  it("should happen when form is valid", async () => {
    const submit = jest.fn(() => Promise.resolve())
    const { form } = renderTestForm({ onSubmit: submit })

    expect(form().isValid).toBe(true)

    await act(async () => {
      await form().submit()
    })

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

    await act(async () => {
      await form().submit()
    })

    expect(form().isValid).toBe(false)
    expect(submit).toBeCalledTimes(0)
  })

  it("should consider the form errors returned by onSubmit", async () => {
    const submit = jest.fn(() => Promise.resolve({ name: "Error" }))
    const { form } = renderTestForm({ onSubmit: submit })

    expect(form().isValid).toBe(true)

    const errors = await act(async () => {
      return await form().submit()
    })

    expect(errors).toEqual({ name: [{ message: "Error" }] })
    expect(form().isValid).toBe(false)
    expect(form().getFieldError("name")).toEqual({ message: "Error" })
  })

  it("handleSubmit should prevent default event", async () => {
    const preventDefault = jest.fn()
    const submit = jest.fn(() => Promise.resolve())

    const { form } = renderTestForm({ onSubmit: submit })

    await act(async () => {
      await form().handleSubmit({ preventDefault } as any)
    })

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

    await act(async () => {
      await form().submit()
    })

    expect(submit).toBeCalledTimes(1)

    rerender({
      onSubmit: submit2,
    })

    await act(async () => {
      await form().submit()
    })

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

    await act(async () => {
      await form().submit()
    })

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

    await act(async () => {
      await form().submit()
    })

    expect(failedSubmit).toBeCalledTimes(1)

    rerender({
      onFailedSubmit: failedSubmit2,
      onValidate: () => ({ name: "Error" }),
    })

    await act(async () => {
      await form().submit()
    })

    expect(failedSubmit).toBeCalledTimes(1)
    expect(failedSubmit2).toBeCalledTimes(1)
  })

  it("should touch all fields, even if not present in the initialValues", async () => {
    const { form } = renderForm(
      () => (
        <>
          <Field name="field1">{() => <span />}</Field>
          <Field name="field2">{() => <span />}</Field>
          <Field name="field3">{() => <span />}</Field>
        </>
      ),
      {
        initialValues: {
          field1: "foo",
        },
      }
    )

    await act(async () => {
      await form().submit()
    })

    expect(form().isFieldTouched("field1")).toBe(true)
    expect(form().isFieldTouched("field2")).toBe(true)
    expect(form().isFieldTouched("field3")).toBe(true)
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

    act(() => {
      form().setFieldValue("name", "jean")
    })

    expect(onValidate).toBeCalledTimes(1)

    rerender({ onValidate: onValidate2, validateOnChange: true })

    act(() => {
      form().setFieldValue("name", "jean2")
    })

    expect(onValidate).toBeCalledTimes(1)
    expect(onValidate2).toBeCalledTimes(1)
  })

  it("validateOnChange by default", () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form } = renderTestForm({ onValidate })

    act(() => {
      form().setFieldValue("name", "jean")
    })

    expect(onValidate).toBeCalledTimes(1)
  })

  it("validateOnChange = false does not trigger validation on change", () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form } = renderTestForm({ onValidate, validateOnChange: false })

    act(() => {
      form().setFieldValue("name", "jean")
    })

    expect(onValidate).toBeCalledTimes(0)
  })

  it("validateOnChange can be changed later", async () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form, rerender } = renderTestForm({
      onValidate,
      validateOnChange: false,
    })

    act(() => {
      form().setFieldValue("name", "jean")
    })
    await wait(100) // wait for validation

    expect(onValidate).toBeCalledTimes(0)

    rerender({ onValidate, validateOnChange: true })

    act(() => {
      form().setFieldValue("name", "jean2")
    })
    await wait(100) // wait for validation

    expect(onValidate).toBeCalledTimes(1)
  })

  it("validateOnBlur turned off by default", () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form } = renderTestForm({ onValidate })

    act(() => {
      form().setFieldTouched("name", true)
    })

    expect(onValidate).toBeCalledTimes(0)
  })

  it("validateOnBlur = false does not trigger validation on blur", () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form } = renderTestForm({ onValidate, validateOnBlur: false })

    act(() => {
      form().setFieldTouched("name", true)
    })

    expect(onValidate).toBeCalledTimes(0)
  })

  it("validateOnBlur = true does trigger validation on blur", () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form } = renderTestForm({ onValidate, validateOnBlur: true })

    act(() => {
      form().setFieldTouched("name", true)
    })

    expect(onValidate).toBeCalledTimes(1)
  })

  it("validateOnBlur can be changed later", () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form, rerender } = renderTestForm({
      onValidate,
      validateOnBlur: false,
    })

    act(() => {
      form().setFieldTouched("name", true)
    })

    expect(onValidate).toBeCalledTimes(0)

    rerender({ onValidate, validateOnBlur: true })

    act(() => {
      form().setFieldTouched("surname", true)
    })

    expect(onValidate).toBeCalledTimes(1)
  })

  it("validateOnChange and validateOnBlur work together", () => {
    const onValidate = jest.fn(() => Promise.resolve({}))
    const { form } = renderTestForm({
      onValidate,
      validateOnChange: true,
      validateOnBlur: true,
    })

    act(() => {
      form().setFieldValue("name", "jean")
    })

    expect(onValidate).toBeCalledTimes(1)

    act(() => {
      form().setFieldTouched("name", true)
    })

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

    await act(async () => {
      form().setFieldValue("name", "jean")
      await wait(100)
    })

    await act(async () => {
      form().setFieldValue("name", "jean2")
      await wait(10)
    })

    expect(onValidate).toBeCalledTimes(2)
    expect(form().getFieldError("name")).toEqual({ message: "Error 1" })

    await wait(500)

    expect(onValidate).toBeCalledTimes(2)
    expect(form().getFieldError("name")).toEqual({ message: "Error 1" })
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
      act(() => {
        form().setFieldValue("name", `jean${i}`)
      })
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
      act(() => {
        form().setFieldValue("name", `jean${i}`)
      })
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
      act(() => {
        form().setFieldValue("name", `jean${i}`)
      })
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
      act(() => {
        form().setFieldValue("name", `jean${i}`)
      })
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
      act(() => {
        form().setFieldValue("name", `jean${i}`)
      })
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

describe("useForm reset", () => {
  it("should reset values and clear errors and touches", () => {
    const { form } = renderTestForm({
      initialValues: { a: "foo", b: 11 },
    })

    act(() => {
      form().setFieldValue("a", "bar")
      form().setFieldTouched("a")
      form().setFieldError("a", "invalid")
    })

    act(() => {
      form().reset()
    })

    expect(form().values).toEqual({ a: "foo", b: 11 })
    expect(form().touched).toEqual({})
    expect(form().errors).toEqual({})
  })

  it("should reset with the specified values", () => {
    const { form } = renderTestForm({
      initialValues: { a: "foo", b: 11 },
    })

    act(() => {
      form().setFieldValue("a", "bar")
      form().setFieldTouched("a")
      form().setFieldError("a", "invalid")
    })

    act(() => {
      form().reset({ other: "thing" })
    })

    expect(form().values).toEqual({ other: "thing" })
    expect(form().touched).toEqual({})
    expect(form().errors).toEqual({})
  })
})

describe("useForm resetField", () => {
  it("should reset the value and clean errors and touches of that field", () => {
    const { form } = renderTestForm({
      initialValues: { a: "foo", b: 11 },
    })

    act(() => {
      form().setFieldValue("a", "bar")
      form().setFieldTouched("a", true)
      form().setFieldError("a", "invalid a")
    })

    act(() => {
      form().setFieldValue("b", 12)
      form().setFieldTouched("b", true)
      form().setFieldError("b", "invalid b")
    })

    act(() => {
      form().resetField("a")
    })

    expect(form().values).toEqual({ a: "foo", b: 12 })
    expect(form().touched).toEqual({ b: true })
    expect(form().errors).toEqual({ b: [{ message: "invalid b" }] })
  })

  it("should reset the field with the specified value", () => {
    const { form } = renderTestForm({
      initialValues: { a: "foo", b: 11 },
    })

    act(() => {
      form().setFieldValue("a", "bar")
      form().setFieldTouched("a", true)
      form().setFieldError("a", "invalid a")
    })

    act(() => {
      form().setFieldValue("b", 12)
      form().setFieldTouched("b", true)
      form().setFieldError("b", "invalid b")
    })

    act(() => {
      form().resetField("a", "other")
    })

    expect(form().values).toEqual({ a: "other", b: 12 })
    expect(form().touched).toEqual({ b: true })
    expect(form().errors).toEqual({ b: [{ message: "invalid b" }] })
  })
})

describe("useForm getFieldResetValue", () => {
  it("should return the reset value", () => {
    const { form } = renderTestForm({
      initialValues: { a: "foo" },
    })

    expect(form().getFieldResetValue("a")).toEqual("foo")

    act(() => {
      form().setFieldValue("a", "bar")
    })

    expect(form().getFieldResetValue("a")).toEqual("foo")

    act(() => {
      form().resetField("a", "bar")
    })

    expect(form().getFieldResetValue("a")).toEqual("bar")
  })
})

describe("useForm values", () => {
  it("values reference should change only when an observable value changes", () => {
    const { form } = renderTestForm({
      initialValues: { a: "foo", b: 11 },
    })

    const values1 = form().values
    const observableValues1 = form().observableValues

    act(() => {
      form().setFieldValue("a", "bar")
    })

    const values2 = form().values
    const observableValues2 = form().observableValues

    act(() => {
      form().setFieldValue("a", "bar") // same value
    })

    const values3 = form().values
    const observableValues3 = form().observableValues

    expect(values1).not.toEqual(values2)
    expect(values2).toEqual(values3) // should not change when value is the same
    expect(observableValues1).toBe(observableValues2) // observableValues should have a stable reference
    expect(observableValues2).toBe(observableValues3) // observableValues should have a stable reference
  })

  it("can be used as dependency in useEffect", () => {
    const effectFn = jest.fn()
    const { form, rerender } = renderForm(
      (form) => {
        const { values } = form

        React.useEffect(effectFn, [values])

        return null
      },
      {
        initialValues: { name: "jack", nested: { list: [1, 2, 3] } },
        validateOnChange: false,
      }
    )

    expect(effectFn).toBeCalledTimes(1)

    act(() => {
      form().setFieldValue("name", "beez")
    })

    expect(effectFn).toBeCalledTimes(2)

    act(() => {
      form().setFieldValue("name", "beez") // same value
    })

    expect(effectFn).toBeCalledTimes(2) // should not be called again

    act(() => {
      rerender()
    })

    expect(effectFn).toBeCalledTimes(2) // should not be called again

    act(() => {
      form().setFieldValue("nested.list.1", 4)
    })

    expect(effectFn).toBeCalledTimes(3)
  })
})

describe("useForm freeze", () => {
  it("when freezed `reset`, `resetField`, `setFieldValue` and `setValues` do not work", () => {
    const { form } = renderTestForm({
      initialValues: { a: "foo", b: 1 },
    })

    form().freeze()
    expect(form().isFreezed).toBe(true)

    form().reset({ a: "joe", b: 2 })
    expect(form().values).toEqual({ a: "foo", b: 1 })

    form().resetField("a", "joe")
    expect(form().getFieldValue("a")).toBe("foo")

    form().setFieldValue("a", "bar")
    expect(form().getFieldValue("a")).toBe("foo")

    form().setValues({ a: "joe", b: 2 })
    expect(form().values).toEqual({ a: "foo", b: 1 })

    form().unfreeze()
    expect(form().isFreezed).toBe(false)

    form().setFieldValue("a", "bar")
    expect(form().getFieldValue("a")).toBe("bar") // here it should work
  })
})
