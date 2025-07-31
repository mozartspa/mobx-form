import debounce from "debounce-promise"
import { useCallback } from "react"
import { ValidateDebounce } from "./types"
import { getDebounceValues, useImmediateRef, useLatestValue } from "./utils"

export function useDebounced<T extends (...args: any[]) => any>(
  fn: T | undefined,
  debounceConfig: ValidateDebounce
) {
  const debounceValues = getDebounceValues(debounceConfig)

  const fnRef = useImmediateRef(fn)

  const debouncedRun = useLatestValue(() => {
    const run = (...args: any[]) => fnRef.current?.(...args)

    if (debounceValues) {
      return debounce(run, debounceValues.wait, {
        leading: debounceValues.leading,
      })
    } else {
      return run
    }
  }, [
    debounceValues && debounceValues.wait,
    debounceValues && debounceValues.leading,
  ])

  const stableFn = useCallback(
    ((...args: any[]) => {
      return debouncedRun.current?.(...args)
    }) as T,
    []
  )

  if (!fn) {
    return undefined
  }

  return stableFn
}
