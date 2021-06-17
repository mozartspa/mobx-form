---
sidebar_position: 8
---

# splitFieldProps

A utility function that takes some props and splits them into:

- name of the field
- options that can be passed to `useField()`
- the rest of the props

It's very useful for creating custom components that receive props that can be passed directly to `useField()` (or `<Field />`).

For example:

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
