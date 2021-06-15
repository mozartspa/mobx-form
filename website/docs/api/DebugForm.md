---
sidebar_position: 7
---

# <DebugForm />

Component to be used only for development purposes that shows the state of the form.

```typescript
import { DebugForm } from "@mozartspa/mobx-form"
```

## Props

### form

```typescript
form?: Form<Values> | undefined
```

The form instance whose state should be shown. If not specified, it will be used the form instance available in FormContext.

---

### showAll

```typescript
showAll?: boolean
```

Whether or not to show all the state of the form.

### showValues

```typescript
showValues?: boolean
```

Whether or not to show the values of the form.

---

### showErrors

```typescript
showErrors?: boolean
```

Whether or not to show the errors of the form.

---

### showTouched

```typescript
showTouched?: boolean
```

Whether or not to show the _touched_ state of the form.

---

### showInfo

```typescript
showInfo?: boolean
```

Whether or not to show the `isDirty`, `isValid`, `isValidating` and `isSubmitting` state of the form.
