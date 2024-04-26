/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'Cadsies - Custom Mini App' View,
//              driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'Cadsies - Custom Mini App Form' opens a customized form for the
//        'Cadsies - Custom Mini App' visualization component and allows the user to edit its look,
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
import { Button, Form, Popup } from 'semantic-ui-react';

import SemanticDropdown from '../FormFields/Dropdown';
import Input from '../FormFields/Input';
import inputTrad from '../FormFields/inputTraditional';
import SemCheckbox from '../FormFields/Checkbox';

import { getDropdownOptions } from './FormUtils';

// import _, { values } from 'lodash';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods and Variables that manages various individual form fields that requires
// some form of attention to its content
//-------------------------------------------------------------------------------------------------

//=======================
const extentOpts = ['px', 'vw', 'vh', 'em', 'rem'];

//=======================


//=======================
const setSubmitButtonDisable = (disableState) => {
  if (disableState) { $(".ui.positive.button").prop('disabled', true); }
  else{ $(".ui.positive.button").prop('disabled', false); }
}
//=======================


//=======================
const validate = (values) => {
  const errors = {};

  setSubmitButtonDisable( errors.mappings.measures || errors.mappings.dimension );

  return errors;
};
//=======================

//-------------------------------------------------------------------------------------------------



//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const CadsiesForm = (props) => {

  // parameters and such
  const {
    handleSubmit,
    initialValues,
    defaultOptions,
    pristine,
    reset,
    submitting,
    colorTags,
  } = props;

  initialValues.options = {...defaultOptions, ...(initialValues.options) };

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>

      <Form.Field>
        <label>Enable Demo Sample Data:</label>
        <Field
          name="options.enableDemoSampleData"
          component={SemCheckbox}
          toggle
        />
      </Form.Field>

      <hr />

      <Form.Group>
        <label>Extent:</label>
        <Form.Field width={6}>
          <Field
            fluid
            name="options.extent.width"
            component={Input}
            placeholder="Width"
          />
        </Form.Field>
        <Form.Field width={2}>
          <Field
            name="options.extentUnit.width"
            placeholder="px"
            component={SemanticDropdown}
            options={getDropdownOptions(extentOpts)}
          />
        </Form.Field>
        <Form.Field width={6}>
          <Field
            fluid
            name="options.extent.height"
            component={Input}
            placeholder="Height"
          />
        </Form.Field>
        <Form.Field width={2}>
          <Field
            name="options.extentUnit.height"
            placeholder="px"
            component={SemanticDropdown}
            options={getDropdownOptions(extentOpts)}
          />
        </Form.Field>
      </Form.Group>

    </Form>
  );
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Exporting and sharing this ReduxForm Module
//-------------------------------------------------------------------------------------------------
export default reduxForm({
  form: 'Cadsies',
})(CadsiesForm);
//-------------------------------------------------------------------------------------------------
