import * as React from "react"
import { DebugForm } from "../src"
import { renderForm } from "./__helpers/renderForm"

describe("<DebugForm />", () => {
  it("should render", () => {
    renderForm(() => <DebugForm />, {
      initialValues: {
        name: "wow",
      },
    })
  })
})
