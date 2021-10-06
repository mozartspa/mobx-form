/* Taken from package dset@3.1.0
 *
 * The multiple assignment `t = t[k] = ...` was replaced by distinct assignments: `t[k] = ...` and then `t = t[k]`.
 * Without this fix, dset does not work correctly if used with mobx when having deep proxied observables.
 * The reason behind is not fully explained.
 */

export function dset<T extends object, V>(
  obj: T,
  keys: string | ArrayLike<string | number>,
  value: V
): void

// eslint-disable-next-line no-redeclare
export function dset(obj: any, keys: any, val: any): void {
  keys.split && (keys = keys.split("."))
  var i = 0,
    l = keys.length,
    t = obj,
    x,
    k
  for (; i < l; ) {
    k = keys[i++]
    if (k === "__proto__" || k === "constructor" || k === "prototype") continue
    t[k] =
      i === l
        ? val
        : (x = t[k]) != null
        ? x
        : keys[i] * 0 !== 0 || !!~keys[i].indexOf(".")
        ? {}
        : []
    t = t[k]
  }
}
