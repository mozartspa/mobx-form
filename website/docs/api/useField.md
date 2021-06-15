---
sidebar_position: 2
---

# useField

Hook to easily manage a single field.

```typescript
import { useField } from "@mozartspa/mobx-form"
```

## Type

```typescript
function useField(name: string, options: UseFieldOptions = {}): UseFieldResult
```

## UseFieldOptions

Configuration to pass to `useField()`

### form

```typescript
form?: Form<Values> | undefined
```

The form instance this field should be bound to. If not specified, it will be used the form instance available in FormContext.

---

### format

```typescript
format?: (value: T) => any
```

A function that takes the value from the form values and formats the value to give to the input (that will be exposed by `UseFieldResult.input.value`). Common use cases include converting javascript Date values into a localized date string. Almost always used in conjunction with [parse](#parse).

---

### parse

```typescript
parse?: (value: any) => T
```

A function that takes the value from the input and converts the value into the value you want stored as this field's value in the form. Common usecases include converting strings into Numbers or parsing localized dates into actual javascript Date objects. Almost always used in conjuction with [format](#format).

---

### parseOnBlur

```typescript
parseOnBlur?: (value: any) => T
```

The same as [parse](#parse) but it is called only when the field is blurred.

---

### validate

```typescript
validate?: (value: T, values: Values) => (string | string[] | undefined) | Promise<string | string[] | undefined>
```

A function that receives the value of the field and the values of the form, and it should return a value of type `string | string[] | undefined`.

- `string` in case of a single error message
- `string[]` in case of multiple error messages
- `undefined` means no error

The function can be _async_.

In case it throws an error, the message of the error will be used as the error of the field.

---

### validateDebounce

```typescript
validateDebounce?: boolean | number | { wait?: number; leading?: boolean }
```

Value that tells if validation debounce should be active and how:

- `false`: debounce will not be active (as per default)
- `true`: debounce will be active, with default values for `wait` (300) and `leading` (false)
- a `number`: debounce will be active with `wait` as the number you passed, and `leading` false
- a `{ wait?: number; leading?: boolean }` object: debounce will be active with the values you passed

---

### validateOnChange

```typescript
validateOnChange?: boolean
```

Whether or not to validate the field every time the field's value changes. `false` by default.

---

### validateOnBlur

```typescript
validateOnBlur?: boolean
```

Whether or not to validate the field when the field is blurred. `false` by default.

---

### validateOnChangeFields

```typescript
validateOnChangeFields?: string[]
```

Array of field names that should trigger validation of this field whenever they change. If you pass a value that is **not** `undefined`, [validateOnChange](#validateonchange) is automatically considered `true` unless you set it to `false`.
