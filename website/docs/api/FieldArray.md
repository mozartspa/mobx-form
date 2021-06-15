---
sidebar_position: 5
---

# <FieldArray />

Component that is a thin wrapper around [useFieldArray](useFieldArray).

```typescript
import { FieldArray } from "@mozartspa/mobx-form"
```

## Props

It has the same props as [UseFieldArrayOptions](useFieldArray#usefieldarrayoptions), plus:

### name

```typescript
name: string
```

The name of the field.

---

### children

```typescript
children: (props: UseFieldArrayResult) => ReactElement
```

A function that receives an [array field](useFieldArray#usefieldarrayresult) instance and returns a ReactElement.
