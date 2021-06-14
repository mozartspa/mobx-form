import { observer } from "mobx-react-lite"
import React from "react"
import { Button, Form as BSForm, Spinner } from "react-bootstrap"
import { Field, useForm } from "../../dist"

export const PerformantForm = observer(() => {
  const { Form, isSubmitting, values } = useForm({
    initialValues: {
      count: 5,
    },
    onSubmit: async () => {
      // fake api call
      await new Promise((resolve) => setTimeout(resolve, 1500))
    },
    validateOnBlur: false,
    validateOnChange: false,
    validateDebounce: true,
  })

  const count = Math.max(0, values.count ?? 0)

  return (
    <Form debug>
      <Field
        name="count"
        validate={(value) =>
          value < 0 ? "Please, specify a positive number" : undefined
        }
      >
        {(field) => (
          <BSForm.Group>
            <BSForm.Label>How many fields?</BSForm.Label>
            <BSForm.Control
              type="number"
              {...field.input}
              isInvalid={!field.isValid}
            />
            {field.error && (
              <BSForm.Control.Feedback type="invalid">
                {field.error}
              </BSForm.Control.Feedback>
            )}
          </BSForm.Group>
        )}
      </Field>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <Field
            key={i}
            name={`field${i}`}
            validateOnChangeFields={[]}
            validateDebounce={true}
            validate={(value) =>
              value && value.length < 8
                ? "Please, insert at least 8 characters."
                : !value
                ? `Field ${i + 1} is required.`
                : undefined
            }
          >
            {(field) => (
              <BSForm.Group>
                <BSForm.Label>Field {i}</BSForm.Label>
                <BSForm.Control
                  type="text"
                  {...field.input}
                  isInvalid={(field.isDirty || field.touched) && !field.isValid}
                />
                {(field.isDirty || field.touched) && field.error && (
                  <BSForm.Control.Feedback type="invalid">
                    {field.error}
                  </BSForm.Control.Feedback>
                )}
              </BSForm.Group>
            )}
          </Field>
        ))}
      <Button type="submit" className="mb-4" disabled={isSubmitting}>
        {isSubmitting && (
          <Spinner as="span" animation="border" size="sm" className="mr-2" />
        )}
        Submit form
      </Button>
    </Form>
  )
})
