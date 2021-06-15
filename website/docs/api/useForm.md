---
sidebar_position: 1
---

# useForm

Main hook to create a form instance.

```typescript
import { useForm } from "@mozartspa/mobx-form"
```

## Type

```typescript
useForm(config: FormConfig): UseFormResult
```

## FormConfig

Configuration to pass to `useForm()`

### initialValues

```typescript
initialValues?: Values | (() => Values)
```

The initial values of the form. You can pass directly the values or a function that returns the values.

---

### validateOnChange

```typescript
validateOnChange?: boolean
```

If `true`, the form will be validated every time any field changes. By default it is `true`.

---

### validateOnBlur

```typescript
validateOnBlur?: boolean
```

If `true`, the form will be validated every time a `blur` event occurs. By default it is `false`.

---

### onValidate

```typescript
onValidate?: (values: Values) => FormErrors | Promise<FormErrors>
```

Callback that is called to validate the form. It receives the _values_ of the form and it should return an object whose keys are the field names (with **dot notation**) and the value is `string | string[] | undefined`. It can be an _async_ function.

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

### onSubmit

```typescript
onSubmit?: (values: Values) => void | FormErrors | Promise<void | FormErrors>
```

Callback that is called when submitting the form. It receives the values of the form and can return form errors as [onValidate](#onvalidate). If it returns an errors object, these errors will be set to the form.

---

### onFailedSubmit

```typescript
onFailedSubmit?: () => void
```

Callback that is called when trying to submit the form but there are validation errors that prevents the submission to continue. It gives the chance to show a notification to the user saying that there are errors that should be solved.

---

## UseFormResult

It is what `useForm()` returns. It is a `Form` instance with two additional components: `<Form/>` and `<FormContext/>`.

```typescript
type UseFormResult<Values> = Form<Values> & {
  FormContext: React.FC<{}>
  Form: React.FC<FormProps>
}
```

## Form

It's the form instance.

### values

```typescript
values: Values
```

The current values of the form.

---

### errors

```typescript
errors: FormErrors
```

The current errors of the form. It's an object whose keys are the field names (with **dot notation**) and the value is `string | string[] | undefined`.

---

### touched

```typescript
touched: FormTouched
```

The current fields _touched_ by the user. It's an object whose keys are the field names (with **dot notation**) and the value is `boolean | undefined`.

---

### isSubmitting

```typescript
isSubmitting: boolean
```

`true` if the form is submitting.

---

### isValidating

```typescript
isValidating: boolean
```

`true` if the form is validating.

---

### isDirty

```typescript
isDirty: boolean
```

`true` if the values are different from the initialValues.

---

### isValid

```typescript
isValid: boolean
```

`true` if there are errors.

---

### setErrors

```typescript
setErrors(errors: FormErrors): void
```

Sets the errors of the form. `errors` should be an object whose keys are the field names (with **dot notation**) and the value is `string | string[] | undefined`.

---

### setTouched

```typescript
setTouched(touched: FormTouched): void
```

Sets the _touche_ fields of the form. `touched` should be an object whose keys are the field names (with **dot notation**) and the value is `boolean | undefined`.

---

### setValues

```typescript
setValues(values: Values): void
```

Sets the values of the form.

---

### setFieldValue

```typescript
setFieldValue(field: string, value: any): void
```

Sets the value of a field.

---

### setFieldError

```typescript
setFieldError(field: string, message: string | string[] | undefine): void
```

Sets the error of a field.

---

### addFieldError

```typescript
addFieldError(field: string, message: string | string[] | undefine): void
```

Adds an error to a field. It will be merged with the current error of the field.

---

### setFieldTouched

```typescript
setFieldTouched(field: string, isTouched?: boolean): void
```

Sets if a field should be considered _touched_.

---

### getFieldValue

```typescript
getFieldValue(field: string): any
```

Gets the value of a field.

---

### getFieldError

```typescript
getFieldError(field: string): string | undefined
```

Gets the first error of a field, if any.

---

### getFieldErrors

```typescript
getFieldErrors(field: string): string[] | undefined
```

Gets the errors of a field, if any.

---

### isFieldTouched

```typescript
isFieldTouched(field: string): boolean
```

Returns `true` if a field has been _touched_ by the user.

---

### isFieldValid

```typescript
isFieldValid(field: string): boolean
```

Returns `true` if a field has no error.

---

### isFieldDirty

```typescript
isFieldValid(field: string): boolean
```

Returns `true` if the field has a different value than the initial value

---

### validate

```typescript
validate(): Promise<FormErrors>
```

Performs form validation. It returns a Promise that is resolved with the errors.

---

### validateField

```typescript
validateField(field: string): Promise<string | string[] | undefined>
```

Performs field validation. It returns a Promise that is resolved with the errors of the field.

---

### reset

```typescript
reset(values?: Values): void
```

Resets the form values to the initial values. If you pass a value as argument, that value will be used as initial values.

---

### resetField

```typescript
resetField(field: string, value?: any): void
```

Resets the value of the field to the initial value. If you pass a value as second argument, that value will be used as initial value.

---

### submit

```typescript
submit(): Promise<FormErrors>
```

Performs form submission. It returns a Promise that is resolved with the errors of the form.

---

### handleSubmit

```typescript
handleSubmit(e?: React.FormEvent<HTMLFormElement>): Promise<FormErrors>
```

Similar to [submit](#submit) but it can receive a submit event that will be default prevented.

---

### handleReset

```typescript
handleReset(e?: React.SyntheticEvent<any>): void
```

Similar to [reset](#reset) but it can receive a reset event that will be default prevented.

---

### register

```typescript
register: (field: string, registrant: FieldRegistrant<any, Values>) => Disposer
```

Used internally by `useField` in order to register itself to the form.
