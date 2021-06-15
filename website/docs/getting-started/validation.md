---
sidebar_position: 3
---

# Validation

Complex validation behaviors can be achieved combining the Form-level validation and the Field-level validation, controlling when each of those should occur.

## Form-level validation

Pass a `onValidate` function to `useForm()`:

```typescript
const form = useForm({
  initialValues: { name: "", email: "" },
  onValidate: (values) => {
    let errors: FormErrors = {}
    if (values.name.length === 0) {
      errors.name = "Name is required."
    }
    if (values.email.length === 0) {
      errors.email = "Email is required."
    }
    return errors
  },
})
```

`onValidate` receives the values of the form and should return an object whose keys are the field names (with **dot notation**) and the value is `string | string[] | undefined`:

- `string` in case of a single error message
- `string[]` in case of multiple error messages
- `undefined` means no error

For example:

```typescript
onValidate: (values) => {
  return {
    name: undefined,
    email: [
      "Email is not a valid email",
      "Email should be a maximum of 20 characters long",
    ],
  }
}
```

In this case, `name` has no errors and `email` has 2 errors.

:::note

You can use any **validation library** you prefer (as **[yup](https://www.npmjs.com/package/yup)**, **[zod](https://www.npmjs.com/package/zod)**, or **[joi](https://www.npmjs.com/package/joi)**). Then you should convert the errors provided by your validation library into an object whose keys are the field names (with **dot notation**) and the value is `string | string[] | undefined`.

:::

### Async validation

`onValidate` can be an async function:

```typescript
onValidate: async (values) => {
  // Call an API, for example
  const errors = await MyApi.fetchErrors(values)
  return errors
}
```

### Debouncing

In case of async validation (that calls an API, for example), it would be convenient to debounce the validation in order to avoid calling the API too frequently. Pass a `validateDebounce` prop to `useForm()`:

```typescript {3}
const form = useForm({
  // ...
  validateDebounce: true,
  onValidate: async (values) => {
    // Call an API, for example
    const errors = await MyAPI.fetchErrors(values)
    return errors
  },
})
```

`validateDebounce` is of type: `boolean | number | { wait?: number; leading?: boolean }`

If you pass:

- `false`: debounce will not be active (as per default)
- `true`: debounce will be active, with default values for `wait` (300) and `leading` (false)
- a `number`: debounce will be active with `wait` as the number you passed, and `leading` false
- a `{ wait?: number; leading?: boolean }` object: debounce will be active with the values you passed

### When does form validation run?

- When you submit the form.
- When a field value changes - if `validateOnChange` is `true` (**true** by default).
- When a `blur` event occurs - if `validateOnBlur` is `true` (**false** by default).
- When you imperatively ask for it - with `form.validate()`.

`validateOnChange` and `validateOnBlur` are two booleans you can pass to `useForm()`:

```typescript {3,4}
const form = useForm({
  // ...
  validateOnChange: false,
  validateOnBlur: true,
  // ...
})
```

In this case, validation will run when a `blur` event occurs and when the form is submitted.

## Field-level validation

Pass a `validate` function to `useField()` or `<Field/>`:

```typescript {3-11,18-20}
useField("email", {
  // ...
  validate: (value, values) => {
    if (value.length === 0) {
      return "Email is required"
    } else if (value.length > 20) {
      return "Email should be a maximum of 20 characters long"
    } else {
      return undefined
    }
  },
})

// or

<Field
  name="email"
  validate={(value, values) => {
    // your validation function
  }}
>
  {(field) => (/* ... */)}
</Field>
```

`validate` receives the value of the field and the values of the form, and it should return a value of type `string | string[] | undefined`.

- `string` in case of a single error message
- `string[]` in case of multiple error messages
- `undefined` means no error

### Async validation

`validate` can be an async function:

```typescript
useField("email", {
  // ...
  validate: async (value, values) => {
    // Call an API, for example
    const error = await MyAPI.fetchIsEmailValid(value)
    return error
  },
})
```

### Debouncing

Similarly to [form validation](#debouncing) you can pass a `validateDebounce` value.

### When does field validation run?

- When the form validation runs, also field-level validations run - errors will be merged
- When the field value changes - if `validateOnChange` is `true` (**false** by default).
- When other field values change - if `validateOnChangeFields` is passed.
- When the field `blur` event occurs - if `validateOnBlur` is `true` (**false** by default).
- When you imperatively ask for it - with `field.validate()`.

`validateOnChange` and `validateOnBlur` are two booleans you can pass to `useField()` (or to `<Field />`):

```typescript {3,4}
const field = useField("email", {
  // ...
  validateOnChange: true,
  validateOnBlur: false,
  // ...
})
```

:::note

Field level's `validateOnChange` and `validateOnBlur` are independent from Form level's `validateOnChange` and `validateOnBlur`. You can mix them to achieve different behaviors of validation.

For example you can turn off `validateOnChange` and `validateOnBlur` on the form, and turn on only `validateOnChange` on a specific field. The result will be that the whole form validation will run only on submit, and the validation of that specific field will run while changing the value of the field.

:::

### `validateOnChangeFields`

In case your form validation is turned off (form `validateOnChange` is `false`) **but** you want your field be validated every time other fields change, then you should use the `validateOnChangeFields` options:

```typescript
useField("confirmEmail", {
  validateOnChangeFields: ["email"],
  validate: (value, values) => {
    if (value !== values.email) {
      return "Confirm email should be equal to email"
    } else {
      return undefined
    }
  },
})
```

In this way, while the user is typing into the `email` field, the error appears in the `confirmEmail` field, complaining that the two emails are not equal.

:::note

If you pass a `validateOnChangeFields` value that is **not** `undefined`, field's `validateOnChange` is automatically considered `true` unless you set it to `false`.

:::
