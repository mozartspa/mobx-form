import { useField } from "./useField"

export type UseFieldArrayOptions = {
  validateOnChange?: boolean
}

export function useFieldArray<T>(
  name: string,
  options: UseFieldArrayOptions = {}
) {
  const { validateOnChange = true } = options

  const field = useField(name)
  const { meta, form } = field

  function update<TResult>(fn: (array: T[]) => TResult) {
    const result = fn(ensureArray())
    if (validateOnChange) {
      form.validate()
    }
    return result
  }

  const ensureArray = (): T[] => {
    if (!Array.isArray(meta.value)) {
      form.setFieldValue(name, [])
      return form.getFieldValue(name)
    } else {
      return meta.value
    }
  }

  const getLength = () => (Array.isArray(meta.value) ? meta.value.length : 0)

  const forEach = (iterator: (name: string, index: number) => void): void => {
    const len = getLength()
    for (let i = 0; i < len; i++) {
      iterator(`${name}[${i}]`, i)
    }
  }

  const map = (iterator: (name: string, index: number) => any): any[] => {
    const len = getLength()
    const results: any[] = []
    for (let i = 0; i < len; i++) {
      results.push(iterator(`${name}[${i}]`, i))
    }
    return results
  }

  const push = (...items: T[]) => {
    return update((array) => array.push(...items))
  }

  const pop = () => {
    return update((array) => array.pop())
  }

  const clear = () => {
    return update((array) => array.splice(0, array.length))
  }

  const insertAt = (index: number, item: T) => {
    update((array) => array.splice(index, 0, item))
  }

  const removeAt = (index: number) => {
    return update((array) => array.splice(index, 1)[0])
  }

  const remove = (item: T) => {
    const index = ensureArray().indexOf(item)
    if (index !== -1) {
      removeAt(index)
    }
  }

  const setValue = (value: T[]) => {
    form.setFieldValue(name, value)
  }

  const fields = {
    name,
    get value(): T[] {
      return form.getFieldValue(name) || []
    },
    get length() {
      return getLength()
    },
    forEach,
    map,
    push,
    pop,
    insertAt,
    removeAt,
    remove,
    clear,
    setValue,
  }

  return {
    fields,
    form,
  }
}
