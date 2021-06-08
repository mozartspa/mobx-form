import { DependencyList, useMemo, useRef, useState } from "react"
import { FormErrors, ValidateDebounce } from "./types"

export const isString = (obj: any): obj is string =>
  Object.prototype.toString.call(obj) === "[object String]"

export const isFunction = (func: any): func is Function =>
  func instanceof Function

export const isObject = (obj: any): obj is Object =>
  obj !== null && typeof obj === "object"

export function buildObjectPaths<TObject, TValue>(
  object: TObject,
  value: TValue,
  parentKey: string = "",
  response: any = {}
): Record<keyof TObject & string, TValue> {
  for (let k of Object.keys(object)) {
    const path = parentKey + k
    response[path] = value

    const val = (object as any)[k]
    if (isObject(val)) {
      buildObjectPaths(val, value, path + ".", response)
    }
  }

  return response
}

export function getValueForCheckbox(
  currentValue: string | any[],
  checked: boolean,
  valueProp: any
) {
  // eslint-disable-next-line eqeqeq
  if (valueProp == "true" || valueProp == "false") {
    return !!checked
  }

  if (checked && valueProp) {
    return Array.isArray(currentValue)
      ? currentValue.concat(valueProp)
      : [valueProp]
  }
  if (!Array.isArray(currentValue)) {
    return !currentValue
  }
  const index = currentValue.indexOf(valueProp)
  if (index < 0) {
    return currentValue
  }
  return currentValue.slice(0, index).concat(currentValue.slice(index + 1))
}

export function getSelectedValues(options: any[]) {
  return Array.from(options)
    .filter((el) => el.selected)
    .map((el) => el.value)
}

export function useCounter() {
  const [counter] = useState(() => {
    let counter = 0
    const getValue = () => {
      return ++counter
    }
    const isLastValue = (value: number) => {
      return value === counter
    }
    return {
      getValue,
      isLastValue,
    }
  })

  return counter
}

export function useLatestValue<T>(getValue: () => T, deps?: DependencyList) {
  const value = useMemo(getValue, deps)
  const ref = useRef(value)
  ref.current = value
  return ref
}

export function isError(error: string | string[] | undefined) {
  if (error == null || error === "") {
    return false
  }
  if (Array.isArray(error) && error.length === 0) {
    return false
  }
  return true
}

export function getDebounceValues(
  debounce: ValidateDebounce,
  defaultWait = 300,
  defaultLeading = false
) {
  if (!debounce) {
    return false
  }

  if (typeof debounce === "number") {
    return {
      wait: debounce,
      leading: defaultLeading,
    }
  }

  if (typeof debounce === "boolean") {
    return {
      wait: defaultWait,
      leading: defaultLeading,
    }
  }

  const { wait = defaultWait, leading = defaultLeading } = debounce

  return {
    wait,
    leading,
  }
}

export const warn: typeof console.warn = (...args) => {
  console && console.warn && console.warn(...args)
}

export const logError: typeof console.error = (...args) => {
  console && console.error && console.error(...args)
}

export function mergeErrors(errors: FormErrors[]) {
  return errors.reduce((acc, err) => {
    if (err) {
      Object.keys(err).forEach((path) => {
        const curr = acc[path]
        const mess = err[path]

        if (mess == null) {
          return
        }

        if (curr == null) {
          acc[path] = mess
        } else if (Array.isArray(curr)) {
          acc[path] = [...curr].concat(mess)
        } else {
          acc[path] = [curr].concat(mess)
        }
      })
    }
    return acc
  }, {} as FormErrors)
}
