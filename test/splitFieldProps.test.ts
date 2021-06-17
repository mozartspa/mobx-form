import { splitFieldProps } from "../src"

describe("splitFieldProps", () => {
  it("should split the props into: name, fieldOption and rest", () => {
    const props = {
      name: "name",
      form: { thisIsJustAMock: true } as any,
      format: () => "",
      parse: () => "",
      parseOnBlur: () => "",
      validate: () => undefined,
      validateDebounce: true,
      validateOnBlur: false,
      validateOnChange: true,
      validateOnChangeFields: ["foo"],
      // other props
      foo: "bar",
      bar: () => undefined,
    }

    const [name, fieldOptions, rest] = splitFieldProps(props)

    expect(name).toEqual(props.name)
    expect(fieldOptions).toStrictEqual({
      form: props.form,
      format: props.format,
      parse: props.parse,
      parseOnBlur: props.parseOnBlur,
      validate: props.validate,
      validateDebounce: props.validateDebounce,
      validateOnBlur: props.validateOnBlur,
      validateOnChange: props.validateOnChange,
      validateOnChangeFields: props.validateOnChangeFields,
    })
    expect(rest).toStrictEqual({
      foo: props.foo,
      bar: props.bar,
    })
  })

  it("should return `name` as undefined, if not provided", () => {
    const props = {}

    const [name] = splitFieldProps(props)

    expect(name).toBe(undefined)
  })

  it("should return `fieldOptions` with all undefined values, if not provided", () => {
    const props = {
      name: "name",
    }

    const [, fieldOptions] = splitFieldProps(props)

    expect(Object.values(fieldOptions).every((o) => o === undefined)).toBe(true)
  })

  it("should return `rest` as {}, if not provided", () => {
    const props = {
      name: "name",
    }

    const [, , rest] = splitFieldProps(props)

    expect(rest).toEqual({})
  })
})
