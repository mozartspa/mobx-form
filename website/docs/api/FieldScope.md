---
sidebar_position: 6
---

# <FieldScope />

Component to create a field scope: any `useField(name)` or `useFieldArray(name)` instances used inside of FieldScope will inherit this field's name as a parent.

See [Field scoping](../getting-started/nested-array-fields.md#fieldscope) for more information.

```typescript
import { FieldScope } from "@mozartspa/mobx-form"
```

## Props

## name

```typescript
name: string
```

The name of the field scope.

---

## children

```typescript
children: ReactNode
```

Any React node.
