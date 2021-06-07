import { useRef, useState } from "react"

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

export function useLatestValue<T>(getValue: () => T) {
  const value = getValue()
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
