import faker from "faker"
import { observer } from "mobx-react-lite"
import React from "react"
import { Button, Card, Col, Form as BSForm, Spinner } from "react-bootstrap"
import { FieldRenderProps, FieldScope, useForm } from "../../dist"

type TextInputProps = {
  field: FieldRenderProps
  label?: string
  type?: string
}

const TextInput = observer((props: TextInputProps) => {
  const { field, label = field.name, type = "text" } = props

  return (
    <BSForm.Group>
      <BSForm.Label>{label}</BSForm.Label>
      <BSForm.Control
        type={type}
        {...field.input}
        isInvalid={field.touched && !field.isValid}
      />
      {field.touched && field.error && (
        <BSForm.Control.Feedback type="invalid">
          {field.error}
        </BSForm.Control.Feedback>
      )}
    </BSForm.Group>
  )
})

export const ArrayForm = observer(() => {
  const { Form, Field, FieldArray, isSubmitting } = useForm({
    initialValues: {
      name: "",
      age: 36,
      friends: [],
    },
    onSubmit: async () => {
      // fake api call
      await new Promise((resolve) => setTimeout(resolve, 1500))
    },
  })

  return (
    <Form debug>
      <Field name="name">
        {(field) => <TextInput field={field} label="My name" />}
      </Field>
      <Field name="age">
        {(field) => <TextInput field={field} label="My age" type="number" />}
      </Field>

      <FieldArray name="friends">
        {(field) => (
          <Card>
            <Card.Header>Friends</Card.Header>
            <Card.Body>
              {field.fields.map((name, index) => (
                <FieldScope key={index} name={name}>
                  <BSForm.Row>
                    <Col md="6">
                      <Field name="name">
                        {(field) => <TextInput field={field} label="Name" />}
                      </Field>
                    </Col>
                    <Col md="6">
                      <Field name="age">
                        {(field) => (
                          <TextInput field={field} label="Age" type="number" />
                        )}
                      </Field>
                    </Col>
                  </BSForm.Row>
                </FieldScope>
              ))}
              <Button
                variant="secondary"
                onClick={() => {
                  field.fields.push({
                    name: faker.name.findName(),
                    age: faker.datatype.number({ min: 1, max: 99 }),
                  })
                }}
              >
                Add friend
              </Button>
            </Card.Body>
          </Card>
        )}
      </FieldArray>

      <Button type="submit" className="mb-4 mt-4" disabled={isSubmitting}>
        {isSubmitting && (
          <Spinner as="span" animation="border" size="sm" className="mr-2" />
        )}
        Submit form
      </Button>
    </Form>
  )
})
