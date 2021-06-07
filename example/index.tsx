import { observer } from "mobx-react-lite"
import * as React from "react"
import "react-app-polyfill/ie11"
import * as ReactDOM from "react-dom"
import { FieldScope, useForm } from "../."
import { FormErrors } from "../src/types"

const initialValues = {
  username: "",
  password: "",
  list: [
    {
      name: "",
      surname: "",
    },
  ],
}

const App = observer(() => {
  const form = useForm({
    initialValues,
    onSubmit: (values) => {
      console.log("submitted", values)
    },
    onValidate: async ({ username, password, list }) => {
      let errors: FormErrors = {}
      if (username === "") {
        errors.username = "Username cannot be blank."
      }
      if (password === "") {
        errors.password = "Password cannot be blank."
      }
      list.forEach((item, index) => {
        if (item.name === "") {
          errors[`list.${index}.name`] = "Name cannot be blank"
        }
        if (item.surname === "") {
          errors[`list.${index}.surname`] = "Surname cannot be blank"
        }
      })

      return errors
    },
  })

  const { Form, Field } = form

  return (
    <div>
      <Form debug>
        <Field name="username">
          {(field) => (
            <div>
              <label>Username</label>
              <input type="text" autoComplete="username" {...field.input} />
              {field.touched && field.error}
            </div>
          )}
        </Field>
        <Field name="password">
          {(field) => (
            <div>
              <label>Password</label>
              <input
                type="password"
                autoComplete="current-password"
                {...field.input}
              />
              {field.touched && field.error}
            </div>
          )}
        </Field>
        <FieldScope name="list.0">
          <Field name="name">
            {(field) => (
              <div>
                <label>Name</label>
                <input type="text" {...field.input} />
                {field.touched && field.error}
              </div>
            )}
          </Field>
          <Field name="surname">
            {(field) => (
              <div>
                <label>Surname</label>
                <input type="text" {...field.input} />
                {field.touched && field.error}
              </div>
            )}
          </Field>
        </FieldScope>
        <button type="submit">Login</button>
      </Form>
    </div>
  )
})

ReactDOM.render(<App />, document.getElementById("root"))
