import * as React from "react"
import * as ReactDOM from "react-dom"
import { SimpleForm } from "./__helpers/SimpleForm"

describe("it", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div")
    ReactDOM.render(<SimpleForm />, div)
    ReactDOM.unmountComponentAtNode(div)
  })
})
