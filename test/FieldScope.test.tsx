import { render } from "@testing-library/react"
import { observer } from "mobx-react-lite"
import * as React from "react"
import {
  Field,
  FieldRenderProps,
  FieldScope,
  FormConfig,
  useForm,
  UseFormResult,
} from "../src"
import { Form } from "../src/types"

const initialValues = { name: "murray" }

function renderForm(
  ui: (form: UseFormResult<any>) => React.ReactNode,
  props: FormConfig = {}
) {
  let formHook: Form | undefined = undefined
  let renderCount = 0

  const MyForm = observer((props: FormConfig = {}) => {
    const form = useForm({ initialValues, ...props })

    formHook = form
    renderCount++

    const { Form } = form

    return <Form>{ui(form)}</Form>
  })

  const { rerender, ...rest } = render(<MyForm {...props} />)

  return {
    getForm() {
      return formHook
    },
    getRenderCount() {
      return renderCount
    },
    ...rest,
    rerender(props: FormConfig = {}) {
      return rerender(<MyForm {...props} />)
    },
  }
}

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
