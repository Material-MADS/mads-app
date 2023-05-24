/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
//          Yoshiki Hasukawa
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'GaussianProcess' View, driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'GaussianProcessForm' opens a customized form for the 'GaussianProcess' visualization component and allows
//        the user to edit its look, feel and behavior in multiple ways.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components, 3rd party
//             lodash & various color palettes, Internal Form Utilities Support functions
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState } from 'react';
import { Field, reduxForm, Label, FieldArray } from 'redux-form';
import { Form, Button } from 'semantic-ui-react';

import SemanticDropdown from '../FormFields/Dropdown';
import Input from '../FormFields/Input';

import _ from 'lodash';
import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";


//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods that manages various individual form fields that requires some form of
// attention to its content
//-------------------------------------------------------------------------------------------------

//=======================
const getDropdownOptions = (list) => list.map((i) => ({ key: i, text: i, value: i }));

//=======================

//=======================
const setSubmitButtonDisable = (disableState) => {
  if (disableState) { $(".ui.positive.button").prop('disabled', true); }
  else{ $(".ui.positive.button").prop('disabled', false); }
}
//=======================

//=======================
const validate = (values, props) => {
  const errors = {};
  if (!values.information) {
    errors.information = 'Required'
  }

  if (!values.targetColumn) {
    errors.targetColumn = 'Required'
  }

  if (!values.featureColumns || !values.featureColumns.length) {
    errors.featureColumns = { _error: 'At least one feature columns must be entered'}
  } else {
    const featureArrayErrors = [];
    values.featureColumns.forEach((feature, featureIndex) => {
      const featureErrors = {};
      if (!feature || !feature.column) {
        featureErrors.column = 'Required';
        featureArrayErrors[featureIndex] = featureErrors;
      }
      if (!feature || !feature.greater) {
        featureErrors.greater = 'Required';
        featureArrayErrors[featureIndex] = featureErrors;
      }
      if (!feature || !feature.less) {
        featureErrors.less = 'Required';
        featureArrayErrors[featureIndex] = featureErrors;
      }
    })
    if(featureArrayErrors.length) {
      errors.featureColumns = featureArrayErrors
    }
    
  }
  setSubmitButtonDisable(errors.information || errors.targetColumn || errors.featureColumns)
  return errors
}

//=======================
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const GaussianProcessForm = (props) => {
  // parameters and such
  const {
    handleSubmit,
    initialValues,
    pristine,
    reset,
    submitting,
    columns,
    targetId,
    colorTags,
  } = props;
  const cTags = colorTags.map((c) => ({
    text: c.color,
    value: c.id,
    props: { style: '' },
  }));

  const methods = ['Prediction', 'Standard Devision', 'Expected Improvement'];

  // input managers

  const [featuresAreShowing, setFeatureAreShowing] = useState(
    initialValues.featuresAreShowing
  );

  const renderFeature = ({ fields, meta: { touched, error, warning }}) => (
    <>
      {fields.map((feature, index) =>
        <Form.Group widths="equal" key={index}>
          <label>feature{index + 1}:</label>
          <Field
            name={`${feature}.column`}
            component={SemanticDropdown}
            placeholder={`feature column ${index + 1}`}
            options={columns}
          />
          <Field
            fluid
            name={`${feature}.greater`}
            component={Input}
            type="number"
            placeholder="greater than"
            label="greater than"
           
          />
          <Field
            fluid
            name={`${feature}.less`}
            component={Input}
            type="number"
            placeholder="less than"
            label="less than"
          />
        </Form.Group>
      )}
      <Form.Field>
        <Button type="button" onClick={() => fields.push()}>Add Feature</Button>
        <Button type="button" onClick={() => fields.pop()}>Remove Feature</Button>
      </Form.Field>
      <Form.Field>
        {true &&
          ((error && <i style={{ color: '#9f3a38', fontWeight: 'bold' }}>{error}</i>) ||
            (warning && <i style={{ color: '#e07407', fontWeight: 'bold' }}>{warning}</i>))}  
      </Form.Field>
    </>
  )


  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>

      <Form.Field>
        <label>Information:</label>
        <Field
          name="information"
          component={SemanticDropdown}
          placeholder="information"
          options={getDropdownOptions(methods)}
        />
      </Form.Field>

      <hr />

      <Form.Field>
        <label>Feature Columns:</label>
        <FieldArray 
          name="featureColumns"
          component={renderFeature}
        />
      </Form.Field>

      <hr />

      <Form.Field>
        <label>Target Column</label>
        <Field
          name="targetColumn"
          component={SemanticDropdown}
          placeholder="target column"
          options={columns}
        />
      </Form.Field>
      
      <hr />
      
      <Form.Group widths="equal">
        <label>Extent:</label>

        <Field
          fluid
          name="options.extent.width"
          component={Input}
          placeholder="Width"
        />
        <Field
          fluid
          name="options.extent.height"
          component={Input}
          placeholder="Height"
        />
      </Form.Group>

      <input
        type="hidden"
        name="options.camera"
      />


    </Form>
  );
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Exporting and sharing this ReduxForm Module
//-------------------------------------------------------------------------------------------------
export default reduxForm({
  form: 'GaussianProcess',
  validate,
})(GaussianProcessForm);
//-------------------------------------------------------------------------------------------------


