---
sidebar_position: 2
---

# Nested and array fields

A good form library should adapt to the shape of your data structure, not viceversa. And this is no exception.

## Nested fields

Let's take a form data structure with nested fields (and deeply nested fields):

```typescript {4-11}
const initialValues = {
  name: "",
  age: 36,
  preferences: {
    color: "blue",
    dish: "pizza",
    place: {
      street: "",
      city: "",
      state: "",
    },
  },
}
```

We can reference these fields using the **dot notation**:

- `preferences.color`
- `preferences.dish`
- `preferences.place.street`
- `preferences.place.city`
- `preferences.place.state`

Here is the complete example:

```typescript {49-53}
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
        <label>{label || name}</label>
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
      preferences: {
        color: "blue",
        dish: "pizza",
        place: {
          street: "",
          city: "",
          state: "",
        },
      },
    },
    onSubmit: (values) => {
      console.log("submitted values", values)
    },
  })

  const { Form } = form

  return (
    <Form debug>
      <Input name="name" />
      <Input name="age" type="number" />
      <Input name="preferences.color" />
      <Input name="preferences.dish" />
      <Input name="preferences.place.street" />
      <Input name="preferences.place.city" />
      <Input name="preferences.place.state" />
      <button type="submit">Submit</button>
    </Form>
  )
})

export default App
```

## Array fields

In case you have arrays in your data structure:

```typescript {3-13}
const initialValues = {
  preferences: {
    dishes: ["pizza", "pasta"],
    places: [
      {
        street: "City Life",
        city: "Milan, Italy",
      },
      {
        street: "Carrer del Moll",
        city: "Palma, Mallorca, Spain",
      },
    ],
  },
}
```

You can also use the **dot notation**, with a **number** as key:

- `preferences.dishes.0`
- `preferences.dishes.1`
- `preferences.places.0.street`
- `preferences.places.0.city`
- `preferences.places.1.street`
- `preferences.places.1.city`

:::note

Other form libraries supports the dot notation with brackets. This is **not supported**:

`preferences.dishes[0]` ❌ incorrect

`preferences.dishes.0` ✅ correct

:::

### `<FieldArray/>`

If you have arrays, probably you want the user to be able to add or remove items. To make your life easier, use the `<FieldArray/>` component:

```typescript {1,31-60}
import { Field, FieldArray, useForm } from "@mozartspa/mobx-form"

// ...

const App = observer(() => {
  const form = useForm({
    initialValues: {
      preferences: {
        dishes: ["pizza", "pasta"],
        places: [
          {
            street: "City Life",
            city: "Milan, Italy",
          },
          {
            street: "Carrer del Moll",
            city: "Palma, Mallorca, Spain",
          },
        ],
      },
    },
    onSubmit: (values) => {
      console.log("submitted values", values)
    },
  })

  const { Form } = form

  return (
    <Form>
      <FieldArray name="preferences.dishes">
        {(fields) => (
          <div>
            {fields.names.map((name, index) => (
              <Input key={index} name={name} />
            ))}
            <button type="button" onClick={() => fields.push("")}>
              Add dish
            </button>
          </div>
        )}
      </FieldArray>
      <FieldArray name="preferences.places">
        {(fields) => (
          <div>
            {fields.names.map((name, index) => (
              <div key={index}>
                <Input name={`${name}.street`} />
                <Input name={`${name}.city`} />
              </div>
            ))}
            <button
              type="button"
              onClick={() => fields.push({ street: "", city: "" })}
            >
              Add place
            </button>
          </div>
        )}
      </FieldArray>
      <button type="submit">Submit</button>
    </Form>
  )
})

export default App
```

Few things to note:

- `<FieldArray/>` is very similar to `<Field/>`, but it exposes useful properties to manage arrays.
- `fields.names` is an array of field names; in the _dishes_ example: `["preferences.dishes.0", "preferences.dishes.1"]`.
- `fields.push()` adds a new item to the array

### useFieldArray

`<FieldArray />` is just a thin wrapper around its hook: `useFieldArray`.

The same example can be written with `useFieldArray`:

```typescript {1,27-28,34-55}
import { Field, useFieldArray, useForm } from "@mozartspa/mobx-form"

// ...

const App = observer(() => {
  const form = useForm({
    initialValues: {
      preferences: {
        dishes: ["pizza", "pasta"],
        places: [
          {
            street: "City Life",
            city: "Milan, Italy",
          },
          {
            street: "Carrer del Moll",
            city: "Palma, Mallorca, Spain",
          },
        ],
      },
    },
    onSubmit: (values) => {
      console.log("submitted values", values)
    },
  })

  const dishesField = useFieldArray("preferences.dishes", { form })
  const placesField = useFieldArray("preferences.places", { form })

  const { Form } = form

  return (
    <Form debug>
      <div>
        {dishesField.names.map((name, index) => (
          <Input key={index} name={name} />
        ))}
        <button type="button" onClick={() => dishesField.push("")}>
          Add dish!
        </button>
      </div>
      <div>
        {placesField.names.map((name, index) => (
          <div key={index}>
            <Input name={`${name}.street`} />
            <Input name={`${name}.city`} />
          </div>
        ))}
        <button
          type="button"
          onClick={() => placesField.push({ street: "", city: "" })}
        >
          Add place
        </button>
      </div>
      <button type="submit">Submit</button>
    </Form>
  )
})

export default App
```

## FieldScope

In the previous example we wrote:

```typescript {3-4}
{
  placesField.names.map((name, index) => (
    <div key={index}>
      <Input name={`${name}.street`} />
      <Input name={`${name}.city`} />
    </div>
  ))
}
```

In this case we are concatenating the name of the array field (_"preferences.places.0"_, _"preferences.places.1"_, _..._) with the name of the subfields (_"street"_ and _"city"_). To avoid this, we can use the `<FieldScope />` component:

```typescript {3-6}
{
  placesField.names.map((name, index) => (
    <div key={index}>
      <FieldScope name={name}>
        <Input name="street" />
        <Input name="city" />
      </FieldScope>
    </div>
  ))
}
```

`<FieldScope />` is very useful when you have an entire component that manages a subset of your form, for example:

```typescript {1-6,13}
const PlaceInput = ({ name }) => (
  <FieldScope name={name}>
    <Input name="street" />
    <Input name="city" />
  </FieldScope>
)

// ...

// then, in your form:

{
  placesField.names.map((name, index) => <PlaceInput key={index} name={name} />)
}
```
