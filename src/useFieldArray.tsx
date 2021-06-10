import { Form, UseFieldArrayOptions } from "./types"
import { useField } from "./useField"

export type UseFieldArrayResult<T = any, Values = any> = {
  readonly name: string
  readonly names: string[]
  readonly value: T[]
  readonly form: Form<Values>
  setValue: (value: T[]) => void
  push: (...items: T[]) => void
  pop: () => T | undefined
  unshift: (...items: T[]) => void
  insertAt: (index: number, item: T) => void
  removeAt: (index: number) => T | undefined
  remove: (item: T) => void
  clear: () => void
}

export function useFieldArray<T = any, Values = any>(
  name: keyof Values & string,
  options: UseFieldArrayOptions<Values> = {}
): UseFieldArrayResult<T, Values> {
  const { form } = options

  const field = useField(name, { form })

  const getValue = (): T[] => {
    if (!Array.isArray(field.value)) {
      return []
    } else {
      return field.value
    }
  }

  const push = (...items: T[]) => {
    return field.setValue([...getValue(), ...items])
  }

  const pop = () => {
    const value = getValue()
    const item = value.length > 0 ? value[value.length - 1] : undefined
    field.setValue(value.slice(0, -1))
    return item
  }

  const unshift = (...items: T[]) => {
    return field.setValue([...items, ...getValue()])
  }

  const clear = () => {
    field.setValue([])
  }

  const insertAt = (index: number, item: T) => {
    const copy = [...getValue()]
    copy.splice(index, 0, item)
    field.setValue(copy)
  }

  const removeAt = (index: number) => {
    const copy = [...getValue()]
    const item = copy.splice(index, 1)[0]
    field.setValue(copy)
    return item
  }

  const remove = (item: T) => {
    const index = getValue().indexOf(item)
    if (index !== -1) {
      removeAt(index)
    }
  }

  return {
    form: field.form,
    name,
    get value() {
      return getValue()
    },
    get names() {
      return getValue().map((_, index) => `${name}.${index}`)
    },
    setValue(value) {
      field.setValue(value)
    },
    push,
    pop,
    unshift,
    clear,
    insertAt,
    removeAt,
    remove,
  }
}
