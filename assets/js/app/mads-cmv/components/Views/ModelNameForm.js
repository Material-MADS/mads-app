import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form, Label, Input } from 'semantic-ui-react';

import SemanticInput from '../FormFields/Input';

const ModelNameForm = (props) => {
  const { handleSubmit, pristine, reset, submitting } = props;

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Field>
        <label>Model Name</label>
        <Field
          name="name"
          component={SemanticInput}
          placeholder="Enter workspace name..."
        />
      </Form.Field>
    </Form>
  );
};

const validate = (values) => {
  const errors = {};
  if (!values.name) {
    errors.name = 'Required';
  }
  return errors;
};

export default reduxForm({
  form: 'ModelName',
  validate,
})(ModelNameForm);
