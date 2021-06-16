---
sidebar_position: 4
---

# Submit

## When does form submission run?

The form is submitted when:

- `<Form />` exposed by `useForm()` is used and it receives a form submit event.
- `form.submit()` is called.
- `form.handleSubmit(event)` is called passing a form submit event.

## What happens during form submission?

When a form is submitted:

- All the fields in the form values are _touched_.
- Form validation runs.
- If there are errors: those errors are set, submission stops, and `onFailedSubmit` callback is called.
- Otherwise `onSubmit` callback is called with the validated values of the form.
- If `onSubmit` returns form errors, those errors are set to the form.

## Example

Let's see an example:

```typescript
import React from "react"
import { observer } from "mobx-react-lite"
import { useField, useForm } from "@mozartspa/mobx-form"

const App = observer(() => {
  const form = useForm({
    initialValues: {
      name: "",
    },
    onValidate: (values) => {
      return {
        name: values.name === "" ? "Name is required" : undefined,
      }
    },
    onSubmit: async (values) => {
      // Call API passing form values
      const apiErrors = await MyAPI.updateMyModel(values)

      // Convert API errors to a FormError shape:
      // (object whose keys are field names and value is `string | string[] | undefined`).
      // This function should be written by you, considering the shape of your API errors.
      const formErrors = convertApiErrorsToFormErrors(apiErrors)
      return formErrors
    },
    onFailedSubmit: () => {
      // Uh-oh. Validation failed before submitting.
      // Here we have the chance to show the user a notification.
    },
  })

  const nameField = useField("name", { form })

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <label>Name</label>
        <input type="text" {...nameField.input} />
        {nameField.isTouched && nameField.error}
      </div>
      <button type="submit">Submit</button>
    </form>
  )
})

export default App
```

When we press the submit button, the form submission starts.

In case we have not filled in the name field:

- `onValidate` returns a form error
- this error is set to the form
- submission stops
- `onFailedSubmit` is called

Instead, if we have filled in the name field, `onSubmit` is called and:

- if our API returns some api errors:
  - these errors are converted to a FormError shape, and returned by `onSubmit`
  - these converted errors are set to the form
  - the user sees these errors in the form
- otherwise everyone is happy, and this form made its job!
