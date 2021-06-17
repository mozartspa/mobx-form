---
sidebar_position: 1
---

# Create a Form

Let's start with a minimal example, then we'll iterate over it in order to arrive to a final concrete example. In this way, we have the chance to understand how each piece connects to each other.

## Minimal example

Not exactly what you would use in a real project, but it gives an overall look:

```typescript
import React from "react"
import { observer } from "mobx-react-lite"
import { useField, useForm } from "@mozartspa/mobx-form"

const App = observer(() => {
  const form = useForm({
    initialValues: {
      name: "",
    },
    onSubmit: (values) => {
      console.log("submitted values", values)
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

Few things to note:

- We import `useForm` and `useField` from the package `@mozartspa/mobx-form`.
- We wrap our component with [`observer()`](https://mobx.js.org/react-integration.html), since we're using MobX.
- `useForm()` gives us back a stable reference to our form instance.
- `useField()` gives us back a reference to a specific field of our form. We pass it the `form` instance, to make it know which form it should be bound to. It's required here, but in other examples we'll leverage the React Context.
- With `onSubmit={form.handleSubmit}` we let our form instance handle the onSubmit event.
- `{...nameField.input}` gives the input the necessary props to be a controlled input: `name`, `value`, `onChange`, `onBlur`.
- With `{nameField.isTouched && nameField.error}` we display the possible error only after the user _touched_ the input. Anyway, in this case there's no input validation.

## `<Form />` component

In the previous example we did not use any fancy component, just only HTML. It's a great thing, but we can do better using the `<Form />` component provided by `useForm()`. Let's see how it looks:

```typescript {17,20,27}
import React from "react"
import { observer } from "mobx-react-lite"
import { useField, useForm } from "@mozartspa/mobx-form"

const App = observer(() => {
  const form = useForm({
    initialValues: {
      name: "",
    },
    onSubmit: (values) => {
      console.log("submitted values", values)
    },
  })

  const nameField = useField("name", { form })

  const { Form } = form

  return (
    <Form>
      <div>
        <label>Name</label>
        <input type="text" {...nameField.input} />
        {nameField.isTouched && nameField.error}
      </div>
      <button type="submit">Submit</button>
    </Form>
  )
})

export default App
```

The `<Form />` component:

- is already bound to our `form` instance (after all, it's the `form` instance that gives it to us);
- handles `onSubmit` and `onReset` events automatically;
- creates a React Context (FormContext) that children can use.

Note: the `Form` component is exposed by our `form` instance, we're not importing it.

## `<Field />` component

In this case we have just one field, but thinking a more complex form we should go with many `useField` hooks. To make things easier, we can use the `<Field />` component, exposed by the library. Let's use it:

```typescript {3,19-27}
import React from "react"
import { observer } from "mobx-react-lite"
import { Field, useForm } from "@mozartspa/mobx-form"

const App = observer(() => {
  const form = useForm({
    initialValues: {
      name: "",
    },
    onSubmit: (values) => {
      console.log("submitted values", values)
    },
  })

  const { Form } = form

  return (
    <Form>
      <Field name="name">
        {(field) => (
          <div>
            <label>Name</label>
            <input type="text" {...field.input} />
            {field.isTouched && field.error}
          </div>
        )}
      </Field>
      <button type="submit">Submit</button>
    </Form>
  )
})

export default App
```

The `<Field />` component:

- is a thin wrapper around `useField`;
- requires a `name` prop with the name of the field;
- requires `children` prop to be a function the receives as input the `field` instance (exactly the same returned by `useField`);
- uses the FormContext created by `<Form />` to understand which form instance it belongs to.

## Custom Input component

Thanks to the `<Field />` component, it's easy to create a custom input:

```typescript {5-9,11-21,27,38-39}
import React from "react"
import { observer } from "mobx-react-lite"
import { Field, useForm } from "@mozartspa/mobx-form"

type InputProps = {
  name: string
  label?: string
  type?: string
}

const Input = ({ name, label, type }: InputProps) => (
  <Field name={name}>
    {(field) => (
      <div>
        <label>{label}</label>
        <input type={type} {...field.input} />
        {field.isTouched && field.error}
      </div>
    )}
  </Field>
)

const App = observer(() => {
  const form = useForm({
    initialValues: {
      name: "",
      age: 36,
    },
    onSubmit: (values) => {
      console.log("submitted values", values)
    },
  })

  const { Form } = form

  return (
    <Form>
      <Input name="name" label="Your name" />
      <Input name="age" type="number" label="Your age" />
      <button type="submit">Submit</button>
    </Form>
  )
})

export default App
```

Here we have also added an `age` field of type `number`. The conversion between `string` to `number` is automatically managed by the library, because our custom input supports a `type` prop that we specified to be `number` for the field `age`. In this way, it will be rendered as `<input type="number" value="36" name="age" />` in the HTML, letting the library to understand that the value should be converted to a number while updating the form values.

### Using `useField`

The custom component can be written using only the `useField` hook. Remember: `<Field />` is just a thin wrapper around `useField`. Let's change it:

```typescript {11-21}
import React from "react"
import { observer } from "mobx-react-lite"
import { useField, useForm } from "@mozartspa/mobx-form"

type InputProps = {
  name: string
  label?: string
  type?: string
}

const Input = observer(({ name, label, type }: InputProps) => {
  const field = useField(name)

  return (
    <div>
      <label>{label}</label>
      <input type={type} {...field.input} />
      {field.isTouched && field.error}
    </div>
  )
})

const App = observer(() => {
  const form = useForm({
    initialValues: {
      name: "",
      age: 36,
    },
    onSubmit: (values) => {
      console.log("submitted values", values)
    },
  })

  const { Form } = form

  return (
    <Form>
      <Input name="name" label="Your name" />
      <Input name="age" type="number" label="Your age" />
      <button type="submit">Submit</button>
    </Form>
  )
})

export default App
```

Few things to note:

- Our custom component is wrapped with `observer()`, because we're accessing directly the values of `field`, and they are MobX observables. Without it, our component would not re-render every time something changes.
- The `<Field />` component didn't need the `observer()` wrapper, because under the hood it was already using it.
- We didn't pass the `form` instance to the `useField` hook. Because, if not explicitely set, `useField` uses the React Context created by `<Form />` to get access to the `form` instance.

### Using `splitFieldProps`

In the previous example, our custom input component accepts only 3 props: `name`, `label` and `type`. It's enough in this case, because we are not using any option that `useField()` (or `<Field />`) can receive. Indeed `useField()` accepts, as second argument, a long list of options, many of them about validation (see [useField API reference](../api/useField) for more details).

In order to make our custom input component more versatile, we should make it accept a long list of options related to `useField`, that our component will pass to `useField()`. This is boring and error prone.

For this reason, we can use the `splitFieldProps` function which takes some props and splits them in:

- `name` of the field
- `useField` options
- other unknown props

Here is how it should be used:

```typescript {4-5,10,16-17,19}
import React from "react"
import { observer } from "mobx-react-lite"
import {
  FieldComponentProps,
  splitFieldProps,
  useField,
  useForm,
} from "@mozartspa/mobx-form"

type InputProps = FieldComponentProps & {
  label?: string
  type?: string
}

const Input = observer((props: InputProps) => {
  const [name, fieldOptions, rest] = splitFieldProps(props)
  const field = useField(name, fieldOptions)

  const { label, type } = rest

  return (
    <div>
      <label>{label}</label>
      <input type={type} {...field.input} />
      {field.isTouched && field.error}
    </div>
  )
})

const App = observer(() => {
  const form = useForm({
    initialValues: {
      name: "",
      age: 36,
    },
    onSubmit: (values) => {
      console.log("submitted values", values)
    },
  })

  const { Form } = form

  return (
    <Form>
      <Input name="name" label="Your name" />
      <Input name="age" type="number" label="Your age" />
      <button type="submit">Submit</button>
    </Form>
  )
})

export default App
```

Few things to note:

- We updated the definition of `type InputProps` merging it with `FieldComponentProps`: it contains all the options that `useField` can accept (`name` prop included).
- We use `splitFieldProps` to split our props into `name`, `fieldOptions` and `rest`.
- We pass `name` and `fieldOptions` to `useField()`
- We extract from `rest` the 2 specific props of our component: `label` and `type`.

## Debugging the state of the form instance

During development it would be nice to know the internal state of our `form` instance. For this reason, there is a `debug` prop available on the `<Form />` component.

Let's apply it:

```typescript {37}
import React from "react"
import { observer } from "mobx-react-lite"
import { Field, useForm } from "@mozartspa/mobx-form"

type InputProps = {
  name: string
  label?: string
  type?: string
}

const Input = ({ name, label, type }: InputProps) => (
  <Field name={name}>
    {(field) => (
      <div>
        <label>{label}</label>
        <input type={type} {...field.input} />
        {field.isTouched && field.error}
      </div>
    )}
  </Field>
)

const App = observer(() => {
  const form = useForm({
    initialValues: {
      name: "",
      age: 36,
    },
    onSubmit: (values) => {
      console.log("submitted values", values)
    },
  })

  const { Form } = form

  return (
    <Form debug>
      <Input name="name" label="Your name" />
      <Input name="age" type="number" label="Your age" />
      <button type="submit">Submit</button>
    </Form>
  )
})

export default App
```

If you **run the code** and edit the age field (setting it to `40` for example), you should see something like this below the form:

```
{
  "values": {
    "name": "",
    "age": 40
  },
  "errors": {},
  "touched": {
    "age": true
  },
  "isDirty": true,
  "isValid": true,
  "isValidating": false,
  "isSubmitting": false
}
```

This is the state of our form, exposed by our `form` instance. `age` is actually a number (it does not have double quotes). Great!

Another thing: have you noticed that `"touched"` object? It contains the field names that triggered an `onBlur` event. It's a useful information in order to display the field error only when the user already interacted with the input. More on this in the [Validation](validation) section.
