/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the ReduxForm for the 'ActionPanel' feature/module saving new workspace
// ------------------------------------------------------------------------------------------------
// Notes: 'ActionPanel' is a part of the analysis page that provides us with possibilities that
//        allows us to edit and save the current workspace.
// ------------------------------------------------------------------------------------------------
// References: React, redux-form & semantic-ui-react Libs together with used FormFields
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form, Label, Input } from 'semantic-ui-react';

import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import SemanticDropdown from '../FormFields/Dropdown';
import SemanticInput from '../FormFields/Input';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Form Module
//-------------------------------------------------------------------------------------------------
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
        />
      </Form.Field>
    </Form>
  );
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The Form content validation controller method
//-------------------------------------------------------------------------------------------------
const validate = (values) => {
  const errors = {};
  if (!values.name) {
    errors.name = 'Required';
  }
  return errors;
};
//-------------------------------------------------------------------------------------------------

export default reduxForm({
  form: 'WorkspaceName',
  validate,
})(WorkspaceNameForm);
