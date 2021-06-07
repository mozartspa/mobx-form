import * as React from "react"
import { Field, FieldRenderProps, FieldScope } from "../src"
import { renderForm } from "./__helpers/renderForm"

describe("<FieldScope />", () => {
  it("prefixes field names underneath it", () => {
    let injectedField: FieldRenderProps | undefined = undefined

    renderForm(
      () => (
        <FieldScope name="nested">
          <Field name="name">
            {(field) => ((injectedField = field), (<span />))}
          </Field>
        </FieldScope>
      ),
      {
        initialValues: {
          nested: {
            name: "jane",
          },
        },
      }
    )

    const field = injectedField!

    expect(field.name).toBe("nested.name")
    expect(field.value).toBe("jane")
  })
})
