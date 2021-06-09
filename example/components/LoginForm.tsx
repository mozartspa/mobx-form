import { observer } from "mobx-react-lite"
import React from "react"
import { Button, Form as BSForm } from "react-bootstrap"
import { useForm } from "../../dist"
import { FormErrors } from "../../src/types"

const initialValues = {
  username: "",
  password: "",
}

export const LoginForm = observer(() => {
  const { Form, Field } = useForm({
    initialValues,
    onSubmit: (values) => {
      console.log("submitted", values)
    },
    onValidate: ({ username, password }) => {
      let errors: FormErrors = {}

      if (username === "") {
        errors.username = "Username cannot be blank."
      }
      if (password === "") {
        errors.password = "Password cannot be blank."
      } else if (username !== "bill" || password !== "murray") {
        errors.password = "Invalid credentials"
      }

      return errors
    },
  })

  return (
    <Form debug>
      <Field name="username">
        {(field) => (
          <BSForm.Group>
            <BSForm.Label>Username</BSForm.Label>
            <BSForm.Control
              type="text"
              {...field.input}
              isInvalid={field.touched && !field.isValid}
            />
            {field.touched && field.error && (
              <BSForm.Control.Feedback type="invalid">
                {field.error}
              </BSForm.Control.Feedback>
            )}
          </BSForm.Group>
        )}
      </Field>
      <Field name="password">
        {(field) => (
          <BSForm.Group>
            <BSForm.Label>Password</BSForm.Label>
            <BSForm.Control
              type="password"
              {...field.input}
              isInvalid={field.touched && !field.isValid}
            />
            {field.touched && field.error && (
              <BSForm.Control.Feedback type="invalid">
                {field.error}
              </BSForm.Control.Feedback>
            )}
          </BSForm.Group>
        )}
      </Field>
      <Button type="submit" className="mb-4">
        Submit form
      </Button>
    </Form>
  )
})
