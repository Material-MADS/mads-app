import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form, Label, Input } from 'semantic-ui-react';

import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import SemanticDropdown from '../FormFields/Dropdown';
import SemanticInput from '../FormFields/Input';

const WorkspaceNameForm = (props) => {
  const { handleSubmit, pristine, reset, submitting } = props;

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Field>
        <label>Workspace Name</label>
        <Field
          name="name"
          component={SemanticInput}
          placeholder="Enter workspace name..."
          // search
          // trigger={<Label color={data.color}/>}
          // options={cTags}
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
  form: 'WorkspaceName',
  validate,
})(WorkspaceNameForm);
