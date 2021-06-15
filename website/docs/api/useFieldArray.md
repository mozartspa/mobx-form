---
sidebar_position: 3
---

# useFieldArray

Hook to easily manage a single field whose value is an **array**.

```typescript
import { useFieldArray } from "@mozartspa/mobx-form"
```

## Type

```typescript
function useFieldArray(
  name: string,
  options: UseFieldArrayOptions = {}
): UseFieldArrayResult
```

## UseFieldArrayOptions

Configuration to pass to `useFieldArray()`

### form

```typescript
form?: Form<Values> | undefined
```

The form instance this field should be bound to. If not specified, it will be used the form instance available in FormContext.

---

## UseFieldArrayResult

It is returned by `useFieldArray()` and represents the field instance that gives access to props and methods to easily manage the field.

### name

```typescript
name: string
```

The name of the field.

---

### value

```typescript
value: T[]
```

The array value of the field.

---

### names

```typescript
names: string[]
```

The array of field names (with **dot notation**) of the items contained in the array value of this field value. For example, if the form values are:

```typescript
{
  colors: ["red", "blue", "green"]
}
```

then using `useFieldArray("colors")` you would get:

```typescript
const colorsField = useFieldArray("colors")
colorsField.names // ["colors.0", "colors.1", "colors.2"]
```

---

### form

```typescript
form: Form
```

The [Form](useForm#form) instance this field is bound to.

---

### setValue

```typescript
setValue: (value: T[]) => void
```

Sets the array value of the field.

---

### push

```typescript
push: (...items: T[]) => void
```

Adds items at the end of the array value of the field.

---

### pop

```typescript
pop: () => T | undefined
```

Pops the last item from the array value of the field.

---

### unshift

```typescript
unshift: (...items: T[]) => void
```

Adds items at the beginning of the array value of the field.

---

### insertAt

```typescript
insertAt: (index: number, item: T) => void
```

Inserts an item at specific index into the array value of the field.

---

### removeAt

```typescript
removeAt: (index: number) => T | undefined
```

Removes an item at specific index from the array value of the field.

---

### remove

```typescript
remove: (item: T) => void
```

Removes an item from the array value of the field.

---

### clear

```typescript
clear: () => void
```

Sets the array value of the field to `[]`.
