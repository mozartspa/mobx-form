---
sidebar_position: 4
---

# useFormContext

Hook to get the [Form](useForm#form) instance from the FormContext.

```typescript
import { useFormContext } from "@mozartspa/mobx-form"

function MyComponent() {
  const form = useFormContext()

  // use the form instance...
}
```

:::warning

In case there is no `form` instance, it throws an error.

:::
