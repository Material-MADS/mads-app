/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'Save Model', driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'Save Model' opens a customized form for saving a ML model and reapply again at a
//        later time.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form, Label, Input } from 'semantic-ui-react';

import SemanticInput from '../FormFields/Input';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods that manages various individual form fields that requires some form of
// attention to its content
//-------------------------------------------------------------------------------------------------

//=======================
const validate = (values) => {
  const errors = {};
  if (!values.name) {
    errors.name = 'Required';
  }
  return errors;
};
//=======================
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const ModelNameForm = (props) => {

  // parameters and such
  const { handleSubmit, pristine, reset, submitting } = props;

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Field>
        <label>Model Name</label>
        <Field
          name="name"
          component={SemanticInput}
          placeholder="Enter Model name..."
        />
      </Form.Field>
    </Form>
  );
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Exporting and sharing this ReduxForm Module
//-------------------------------------------------------------------------------------------------
export default reduxForm({
  form: 'ModelName',
  validate,
})(ModelNameForm);
//-------------------------------------------------------------------------------------------------
