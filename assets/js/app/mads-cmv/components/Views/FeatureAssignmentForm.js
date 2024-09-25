/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors:Yoshiki Hasukawa (Student Developer and Component Design) [2024]
//　　　　　 Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'featureAssignment' 
//              View, driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'featureAssignmentForm' opens a customized form for the
//        'featureAssignmentForm' visualization component and allows the user to edit its
//        look, feel and behavior in multiple ways.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components, 3rd party
//             lodash lib
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import { format } from 'd3';
import React, { useState } from 'react';
import { Field, reduxForm, change, formValueSelector } from 'redux-form';
import { Button, Form, Popup, Label } from 'semantic-ui-react';

import SemanticDropdown from '../FormFields/Dropdown';
import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import Input from '../FormFields/Input';

import { useSelector } from "react-redux";


import { getDropdownOptions } from './FormUtils';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods and Variables that manages various individual form fields that requires
// some form of attention to its content
//-------------------------------------------------------------------------------------------------

//=======================
const conversionMethodList = ['Simple Average', 'Weighted Average (Format A)', 'Weighted Average (Format B)'];
//=======================

//=======================
const setSubmitButtonDisable = (disableState) => {
  if (disableState) { $(".ui.positive.button").prop('disabled', true); }
  else{ $(".ui.positive.button").prop('disabled', false); }
}
//=======================
//=======================
//validate function
const validate = (value, props) => {
  const errors = {}

  // Make sure the correct dataset is loaded
  const catalyst = value.catalyst;
  const target = value.targetColumns;
  const composition  = value.compositionColumns;
  const testCatalyst = catalyst ? catalyst.map(e => props.columns.some(column => column.value === e)) : [];
  const testTarget = target ? target.map(e => props.columns.some(column => column.value === e)) : [];
  const testComposition = composition ? composition.map(e => props.columns.some(column => column.value === e)): [];
  if (testCatalyst && testCatalyst.some(e => !e)) {
    value.catalyst =  []
  }
  if (testTarget && testTarget.some(e => !e)) {
    value.targetColumns =  []
  }
  if (testComposition && testComposition.some(e => !e)) {
    value.compositionColumns = []
  }

  // Validate each Form
  if (value.conversionMethod && value.conversionMethod !== 'Weighted Average (Format B)'  ) {
    value.compositionColumns = []
  }
  if (!value.conversionMethod) {
    errors.conversionMethod = 'Required';
  }

  if (value.catalyst && value.catalyst.length === 0) {
    errors.catalyst = 'Required';
  }

  if ( value.conversionMethod === 'Weighted Average (Format B)' ) {
    if (value.compositionColumns.length === 0) {
      errors.compositionColumns = 'Required'
    } else {
        if (value.compositionColumns.length !== value.catalyst.length) {
      errors.compositionColumns = 'need the same number of elements as Catalyst Columns'
      errors.catalyst = 'need the same number of elements as Catalyst Composition Columns'
    }}
  }

  setSubmitButtonDisable(errors.conversionMethod || errors.catalyst || errors.compositionColumns);

  return errors
};
//=======================

//-------------------------------------------------------------------------------------------------

const getAvailableColumns = (columns, ...selectedList) => {
  const selectedColumns = selectedList.flat()
  return columns.filter(column => !selectedColumns.includes(column.value));
}


//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const FeatureAssignmentForm = (props) => {

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
  
  //feature assign method means conversion method(I changed label of "Conversion Method" into "Feature Assignment method" -> refer to 153rd line)
  const [conversionMethod, setConversionMethod] = useState(initialValues.conversionMethod);

  const [catalyst, setCatalyst] = useState(initialValues.catalyst);
  const [targetColumns, setTargetColumns] = useState(initialValues.targetColumns);
  const [compositionColumns, setCompositonColumns] = useState(initialValues.compositionColumns)

  initialValues.options = {...defaultOptions, ...(initialValues.options) };

  const changeConversionMethod = (e, data) => {
    if (data !== 'Weighted Average (Format B)') {
      setCompositonColumns([]);
    }
    setConversionMethod(data);
  }

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Field >
        <label>Feature Assignment Method<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='How to assign feature columns' size='small' />:</label>
          <Field
            name="conversionMethod"
            component={SemanticDropdown}
            placeholder="Conversion Method"
            options={getDropdownOptions(conversionMethodList)}
            onChange={(e, data) => {changeConversionMethod(e, data)}}
            search
          />
      </Form.Field>

      <hr />

      <Form.Field >
        <label>Catalyst Columns<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Choose catalyst columns for simple average' size='small' />:</label>
          <Field
            name="catalyst"
            component={MultiSelectDropdown}
            placeholder="Catalyst Columns"
            options={getAvailableColumns(columns, targetColumns, compositionColumns)}
            onChange={(newVal) => {setCatalyst(newVal)}}
            search
          />
      </Form.Field>

      {conversionMethod === conversionMethodList[2] && <div>
        <Form.Field>
          <label>Catalyst Composition Columns<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='
          If you use Weighted Average Format B, select catalyst composition columns' size='small' />:</label>
          <Field
            name="compositionColumns"
            component={MultiSelectDropdown}
            placeholder="Catalyst Composition Columns"
            options={getAvailableColumns(columns, catalyst, targetColumns)}
            onChange={(newVal) => setCompositonColumns(newVal)}
            search
          />
        </Form.Field>
        </div>}

      <hr />

      <Form.Field >
        <label>Target<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Choose target if you have target column' size='small' />:</label>
          <Field
            name="targetColumns"
            component={MultiSelectDropdown}
            placeholder="Not Applicable"
            options={getAvailableColumns(columns, catalyst, compositionColumns)}
            onChange={(newVal) => {setTargetColumns(newVal)}}
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
  form: 'featureAssignment',
  validate,
})(FeatureAssignmentForm);
//-------------------------------------------------------------------------------------------------
