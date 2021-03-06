import {
  buildObjectPaths,
  composeValidators,
  mergeErrors,
  mergeFieldErrors,
} from "../src/utils"

describe("buildObjectPaths", () => {
  it("works", () => {
    const obj = {
      name: "bill",
      surname: "murray",
      empty: null,
      noValue: undefined,
      preferences: {
        color: "blue",
      },
      friends: [
        {
          name: "bax",
          age: 23,
        },
      ],
    }

    const paths = buildObjectPaths(obj, true)

    expect(paths).toEqual({
      name: true,
      surname: true,
      empty: true,
      noValue: true,
      preferences: true,
      "preferences.color": true,
      friends: true,
      "friends.0": true,
      "friends.0.name": true,
      "friends.0.age": true,
    })
  })
})

describe("mergeFieldErrors", () => {
  it("works", () => {
    const result = mergeFieldErrors(
      "Name error",
      { message: "Too old" },
      [],
      ["Not a color", { message: "Not good" }],
      ["Missing age", "Nope"]
    )

    expect(result).toEqual([
      { message: "Name error" },
      { message: "Too old" },
      { message: "Not a color" },
      { message: "Not good" },
      { message: "Missing age" },
      { message: "Nope" },
    ])
  })

  it("returns undefined in case of no error", () => {
    const result = mergeFieldErrors("", undefined, [], [""])

    expect(result).toBeUndefined()
  })

  it("always returns an array in case of error", () => {
    const result = mergeFieldErrors("Name error")

    expect(result).toEqual([{ message: "Name error" }])
  })

  it("keeps `args` field of error", () => {
    const result = mergeFieldErrors({
      message: "Name error",
      args: { foo: "foo", bar: 1 },
    })

    expect(result).toEqual([
      { message: "Name error", args: { foo: "foo", bar: 1 } },
    ])
  })
})

describe("mergeErrors", () => {
  it("works", () => {
    const result = mergeErrors([
      {
        name: "Name error",
        surname: undefined,
        age: ["Too old", "Not good"],
        "preferences.color": "Not a color",
      },
      {
        name: "Name error2",
        surname: "Surname error",
        age: "Missing age",
        "preferences.color": ["Not a color2"],
      },
      {
        "friends.0.name": "Friend name error",
      },
      {
        "friends.0.name": ["Friend name error2", "Friend name error3"],
      },
      {
        "friends.0.name": [{ message: "Friend name error4", args: { foo: 1 } }],
      },
    ])

    expect(result).toEqual({
      name: [{ message: "Name error" }, { message: "Name error2" }],
      surname: [{ message: "Surname error" }],
      age: [
        { message: "Too old" },
        { message: "Not good" },
        { message: "Missing age" },
      ],
      "preferences.color": [
        { message: "Not a color" },
        { message: "Not a color2" },
      ],
      "friends.0.name": [
        { message: "Friend name error" },
        { message: "Friend name error2" },
        { message: "Friend name error3" },
        { message: "Friend name error4", args: { foo: 1 } },
      ],
    })
  })
})

describe("composeValidators", () => {
  it("calls all the validators if none return an error", async () => {
    const syncValidator = jest.fn(() => undefined)
    const asyncValidator = jest.fn(async () => undefined)
    const validator = composeValidators(syncValidator, asyncValidator)

    expect(validator).toBeDefined()

    const error = await validator!({}, {})

    expect(syncValidator).toHaveBeenCalledTimes(1)
    expect(asyncValidator).toHaveBeenCalledTimes(1)
    expect(error).toBeUndefined()
  })

  it("returns the error returned by the first failed validator", async () => {
    const v1 = jest.fn(() => undefined)
    const v2 = jest.fn(() => "ouch!")
    const v3 = jest.fn(() => "ouch!")
    const validator = composeValidators(v1, v2, v3)

    const error = await validator!({}, {})

    expect(v1).toHaveBeenCalledTimes(1)
    expect(v2).toHaveBeenCalledTimes(1)
    expect(v3).toHaveBeenCalledTimes(0)
    expect(error).toBe("ouch!")
  })

  it("all validators receive the same args", async () => {
    const v1 = jest.fn(() => undefined)
    const v2 = jest.fn(() => undefined)

    const validator = composeValidators(v1, v2)

    const value = "foo"
    const values = { foo: value, bar: "bar" }

    await validator!(value, values)

    expect(v1).toHaveBeenCalledWith(value, values)
    expect(v2).toHaveBeenCalledWith(value, values)
  })

  it("accepts undefined validators", async () => {
    const v1 = jest.fn(() => "ouch!")

    const validator = composeValidators(undefined, v1)

    const error = await validator!({}, {})

    expect(error).toBe("ouch!")
  })

  it("returns undefined if it receives only undefined validators", async () => {
    const validator1 = composeValidators()
    const validator2 = composeValidators(undefined, undefined)

    expect(validator1).toBeUndefined()
    expect(validator2).toBeUndefined()
  })
})
