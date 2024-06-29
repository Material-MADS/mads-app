/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors:Yoshiki Hasukawa (Student Developer and Component Design) [2024]
//　　　　　 Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'FeatureEngineering' View,
//              driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'FeatureEngineering Form' opens a customized form for the
//        'FeatureEngineering' visualization component and allows the user to edit its look,
//        feel and behavior in multiple ways.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components, 3rd party
//             lodash lib
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState } from 'react';
import { Field, reduxForm, Label, change } from 'redux-form';
import { Button, Dropdown, Form, Popup } from 'semantic-ui-react';

import SemanticDropdown from '../FormFields/Dropdown';
import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import Input from '../FormFields/Input';
import inputTrad from '../FormFields/inputTraditional';

import { getDropdownOptions } from './FormUtils';

// import _, { values } from 'lodash';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods and Variables that manages various individual form fields that requires
// some form of attention to its content
//-------------------------------------------------------------------------------------------------

//=======================


//=======================
const setSubmitButtonDisable = (disableState) => {
  if (disableState) { $(".ui.positive.button").prop('disabled', true); }
  else{ $(".ui.positive.button").prop('disabled', false); }
}
//=======================

const validate = (values, props) => {
  const errors = {}

  // Make sure the correct dataset is loaded
  const descriptorColumns = values.descriptorColumns;
  const targetColumns = values.targetColumns;
  const testDescriptorColumns = descriptorColumns ? descriptorColumns.map(e => props.columns.some(column => column.value === e)) : [];
  const testTargetColumns = targetColumns ? targetColumns.map(e => props.columns.some(column => column.value === e)) : [];
  if (testDescriptorColumns && testDescriptorColumns.some(e => !e)) {
    values.descriptorColumns = []
  }
  if (testTargetColumns && testTargetColumns.some(e => !e)) {
    values.targetColumns =  []
  }

  // Validate each Form
  if (!values.descriptorColumns) {
    errors.descriptorColumns = 'Required';
  }
  if (values.descriptorColumns && values.descriptorColumns.length === 0) {
    errors.descriptorColumns = 'Required';
  }
  if (!values.targetColumns) {
    errors.targetColumns = 'Required';
  }
  if (values.targetColumns && values.targetColumns.length === 0) {
    errors.targetColumns = 'Required';
  }
  if (!values.firstOrderDescriptors) {
    errors.targetColumns = 'Required';
  }
  if (values.firstOrderDescriptors && values.firstOrderDescriptors.length === 0) {
    errors.firstOrderDescriptors = 'Required';
  }
  setSubmitButtonDisable(errors.descriptorColumns || errors.targetColumns || errors.firstOrderDescriptors)

  return errors
}
//=======================

const getAvailableColumns = (columns, selected) => {
  return columns.filter(column => !selected.includes(column.value));
}



//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const FeatureEngineeringForm = (props) => {

  // parameters and such
  const {
    handleSubmit,
    initialValues,
    defaultOptions,
    pristine,
    reset,
    submitting,
    colorTags,
    columns,
  } = props;


  initialValues.options = {...defaultOptions, ...(initialValues.options) };
  const [descriptorColumns, setDescriptorColumns] = useState(initialValues.descriptorColumns);
  const [targetColumns, setTargetColumns] = useState(initialValues.targetColumns);

  const firstOrderDescriptors = ["x", '1/(x)', '(x)^2', '1/(x)^2', '(x)^3', '1/(x)^3', 'sqrt(x)', '1/sqrt(x)', 'exp(x)', '1/exp(x)', 'ln(x)', '1/ln(x)'];

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>

      <Form.Field>
        <label>Base Descriptor Columns<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='select discriptors to generate First Order Descriptors' size='small' /></label>
        <Field
          name="descriptorColumns"
          placeholder="Descriptor Columns"
          component={MultiSelectDropdown}
          options={getAvailableColumns(columns, targetColumns)}
          onChange={(newVal) => {setDescriptorColumns(newVal)}}
          search
        />
      </Form.Field>

      <Form.Field>
        <label>Target Columns<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='select targets for the dataset' size='small' /></label>
        <Field
          name="targetColumns"
          placeholder="Target Columns"
          component={MultiSelectDropdown}
          options={getAvailableColumns(columns, descriptorColumns)}
          onChange={(newVal) => {setTargetColumns(newVal)}}
          search
        />
      </Form.Field>
      <hr />

      <Form.Field>
        <label>First Order Descriptors<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='select first order descriptor you want to generate' size='small' /></label>
        <Field
          name="firstOrderDescriptors"
          placeholder="First Order Descriptors"
          component={MultiSelectDropdown}
          options={getDropdownOptions(firstOrderDescriptors)}
          search
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

    </Form>
  );
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Exporting and sharing this ReduxForm Module
//-------------------------------------------------------------------------------------------------
export default reduxForm({
  form: 'FeatureEngineering',
  validate
})(FeatureEngineeringForm);
//-------------------------------------------------------------------------------------------------
