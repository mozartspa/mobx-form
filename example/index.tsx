import { observer } from "mobx-react-lite"
import * as React from "react"
import "react-app-polyfill/ie11"
import * as ReactDOM from "react-dom"
import { useForm } from "../."

const App = observer(() => {
  const form = useForm(
    {
      username: "",
      password: "",
    },
    {
      onSubmit: (values) => {
        console.log("submitted", values)
      },
      onValidate: async ({ username, password }) => {
        let errors = {} as Record<string, string>
        if (username === "") {
          errors.username = "Username cannot be blank."
        }
        if (password === "") {
          errors.password = "Password cannot be blank."
        }
        return errors
      },
    }
  )

  const { Form, Field } = form

  return (
    <div>
      <Form debug>
        <Field name="username">
          {(field) => (
            <div>
              <input type="text" autoComplete="username" {...field.input} />
              {field.meta.touched && field.meta.error}
            </div>
          )}
        </Field>
        <Field name="password">
          {(field) => (
            <div>
              <input
                type="password"
                autoComplete="current-password"
                {...field.input}
              />
              {field.meta.touched && field.meta.error}
            </div>
          )}
        </Field>
        <button type="submit">Login</button>
      </Form>
    </div>
  )
})

ReactDOM.render(<App />, document.getElementById("root"))
