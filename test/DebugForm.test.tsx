import * as React from "react"
import { DebugForm, Form, useForm } from "../src"
import { renderForm } from "./__helpers/renderForm"

describe("<DebugForm />", () => {
  it("should render", () => {
    renderForm(() => <DebugForm />, {
      initialValues: {
        name: "wow",
      },
    })
  })

  it("should use the form passed as prop", () => {
    let form2: Form

    const { getByTestId } = renderForm(
      () => {
        form2 = useForm({ initialValues: { foo: "bar" } })

        return (
          <div data-testid="output">
            <DebugForm form={form2} />
          </div>
        )
      },
      {
        initialValues: {
          name: "wow",
        },
      }
    )

    const output = getByTestId("output")
    expect(output.innerHTML).toMatchInlineSnapshot(`
      "<pre>{
        \\"values\\": {
          \\"foo\\": \\"bar\\"
        }
      }</pre>"
    `)
  })
})
