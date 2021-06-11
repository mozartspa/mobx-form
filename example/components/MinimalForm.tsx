import { observer } from "mobx-react-lite"
import React from "react"
import { Button, Form as BSForm, Spinner } from "react-bootstrap"
import { useField, useForm } from "../../dist"

export const MinimalForm = observer(() => {
  const form = useForm({
    initialValues: {
      name: "",
    },
    onSubmit: (values) => {
      console.log("submitted values", values)
    },
  })

  const nameField = useField("name", { form })

  const { Form, isSubmitting } = form

  return (
    <Form debug>
      <BSForm.Group>
        <BSForm.Label>Username</BSForm.Label>
        <BSForm.Control
          type="text"
          {...nameField.input}
          isInvalid={nameField.touched && !nameField.isValid}
        />
        {nameField.touched && nameField.error && (
          <BSForm.Control.Feedback type="invalid">
            {nameField.error}
          </BSForm.Control.Feedback>
        )}
      </BSForm.Group>
      <Button type="submit" className="mb-4" disabled={isSubmitting}>
        {isSubmitting && (
          <Spinner as="span" animation="border" size="sm" className="mr-2" />
        )}
        Submit form
      </Button>
    </Form>
  )
})
