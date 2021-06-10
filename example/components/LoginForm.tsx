import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { Alert, Button, Form as BSForm, Spinner } from "react-bootstrap"
import { Field, useForm } from "../../dist"
import { FormErrors } from "../../src/types"

const initialValues = {
  username: "",
  password: "",
}

export const LoginForm = observer(() => {
  const [isLoggedIn, setLoggedIn] = useState<boolean | undefined>(undefined)

  const { Form, isSubmitting } = useForm({
    initialValues,
    onSubmit: async ({ username, password }) => {
      // fake api call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (username === "bill" && password === "murray") {
        setLoggedIn(true)
        return
      } else {
        setLoggedIn(false)
      }

      return {
        password: "Invalid credentials",
      }
    },
    onValidate: ({ username, password }) => {
      let errors: FormErrors = {}

      if (username === "") {
        errors.username = "Username cannot be blank."
      }
      if (password === "") {
        errors.password = "Password cannot be blank."
      }

      return errors
    },
  })

  return (
    <Form debug>
      {isLoggedIn === true && (
        <Alert
          variant="success"
          onClose={() => setLoggedIn(undefined)}
          dismissible
        >
          <Alert.Heading>You did it! 🎉</Alert.Heading>
          You're logged in now.
        </Alert>
      )}
      {isLoggedIn === false && (
        <Alert
          variant="danger"
          onClose={() => setLoggedIn(undefined)}
          dismissible
        >
          <Alert.Heading>Uh oh, wrong credentials</Alert.Heading>
          Hint: try with <strong>bill</strong> and <strong>murray</strong>.
        </Alert>
      )}
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
      <Button type="submit" className="mb-4" disabled={isSubmitting}>
        {isSubmitting && (
          <Spinner as="span" animation="border" size="sm" className="mr-2" />
        )}
        Submit form
      </Button>
    </Form>
  )
})
