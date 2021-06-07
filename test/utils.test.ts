import { buildObjectPaths } from "../src/utils"

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
