---
sidebar_position: 1
---
# Overview

**@mozartspa/mobx-react** is a high performance, hook-based forms library for React, powered by MobX.

## Features

- Form level and Field level validation with built-in async debouncing
- Supports multiple error messages per field
- Deeply nested form values (arrays, you're welcome)
- Format and parse values (to support advanced scenarios)
- Powered by [MobX](https://mobx.js.org/)
- Built with React hooks
- Written in Typescript
- It's only [~7kB gzipped](https://bundlephobia.com/package/@mozartspa/mobx-form)

## Motivation

Why another form library? Simple, I have not found _easy to use_ form libraries that leveraged the high performance of mobx. The mostly used form libraries don't use MobX underneath, and they struggle between performance and ease of use. With MobX you can have both.

## Installation

```bash
yarn add @mozartspa/mobx-form
```

Then install the peer-dependencies: [mobx](https://github.com/mobxjs/mobx) and [mobx-react-lite](https://github.com/mobxjs/mobx/tree/main/packages/mobx-react-lite)

```bash
yarn add mobx mobx-react-lite
```

## Getting started

A minimal example, not exactly what you would use in a real project, but it gives an overall look:

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
        {nameField.touched && nameField.error}
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
- `useField()` gives us back a stable reference to a specific field of our form. We pass it the `form` instance, to make it know which form it should be bound to. It's required here, but in other examples we'll leverage the React Context.
- With `onSubmit={form.handleSubmit}` we let our form instance handle the onSubmit event.
- `{...nameField.input}` gives the input the necessary props to be a controlled input: `name`, `value`, `onChange`, `onBlur`.
- With `{nameField.touched && nameField.error}` we display the possible error only after the user _touched_ the input. Anyway, in this case there's no input validation.
