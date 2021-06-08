import { buildObjectPaths, mergeErrors } from "../src/utils"

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
    ])

    expect(result).toEqual({
      name: ["Name error", "Name error2"],
      surname: "Surname error",
      age: ["Too old", "Not good", "Missing age"],
      "preferences.color": ["Not a color", "Not a color2"],
      "friends.0.name": [
        "Friend name error",
        "Friend name error2",
        "Friend name error3",
      ],
    })
  })
})
