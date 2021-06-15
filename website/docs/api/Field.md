---
sidebar_position: 5
---

# <Field />

Component that is a thin wrapper around [useField](useField).

```typescript
import { Field } from "@mozartspa/mobx-form"
```

## Props

It has the same props as [UseFieldOptions](useField#usefieldoptions), plus:

### name

```typescript
name: string
```

The name of the field.

---

### children

```typescript
children: (props: UseFieldResult) => ReactElement
```

A function that receives a [field](useField#usefieldresult) instance and returns a ReactElement.
