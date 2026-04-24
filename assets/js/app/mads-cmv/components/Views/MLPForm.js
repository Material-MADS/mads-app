/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'cads_component_template' View,
//              driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'cads_component_template Form' opens a customized form for the
//        'cads_component_template' visualization component and allows the user to edit its look,
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
// import SemCheckbox from '../FormFields/Checkbox';

import { getDropdownOptions } from './FormUtils';
import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import { input } from '@tensorflow/tfjs';

// import _, { values } from 'lodash';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods and Variables that manages various individual form fields that requires
// some form of attention to its content
//-------------------------------------------------------------------------------------------------

//=======================
const cads_component_templateOpts = ['Learning curve', 'True vs Predict'];

//=======================


//=======================
const setSubmitButtonDisable = (disableState) => {
  if (disableState) { $(".ui.positive.button").prop('disabled', true); }
  else{ $(".ui.positive.button").prop('disabled', false); }
}
//=======================


//set errors
//=======================
const validate = (values) => {
  const errors = {};
  if (!values.featureColumns) {
    errors.featureColumns = 'Required';
  };
  if (values.featureColumns && values.targetColumns.length ===0) {
    errors.featureColumns = 'Required';
  };
  if (!values.targetColumns) {
    errors.targetColumns = 'Required';
  };

  setSubmitButtonDisable( errors.mappings.measures || errors.mappings.dimension );

  return errors;
};
//=======================

//-------------------------------------------------------------------------------------------------



//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
// -------------------------------------------------------------------------------------------------
const MLP_Component_Form = (props) => {

  // parameters and such
  const {
    handleSubmit,
    initialValues,
    defaultOptions,
    columns,
    input,
    pristine,
    reset,
    submitting,
    colorTags,
  } = props;

  initialValues.options = {...defaultOptions, ...(initialValues.options) };

  const [currentChoice, setValue] = useState(
    initialValues.options.something
  );

  const onSomeChange = (event) => {
    setValue(event);
  };

  // if(!initialValues.options.anotherThing){ initialValues.options.anotherThing = 1 };

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>

      <Form.Field>
        <label>Graph<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Bla bla bla' size='small' /></label>
        <Field
          name="options.something"
          placeholder="Select Something"
          component={SemanticDropdown}
          options={getDropdownOptions(cads_component_templateOpts)}
          onChange={onSomeChange}
          search
        />
      </Form.Field>

      <hr />

      <Form.Field>
        <label>Feature columns</label>  
        <Field
         name = "featureColumns"
         placeholder='columns'
         options={columns}
         component = {MultiSelectDropdown}
         search
        />
      </Form.Field>

      <Form.Field>
        <label>Target column</label>
        <Field
         name = "targetColumn"
         placeholder='columns'
         component = {SemanticDropdown}
         options = {columns}
         search
        />
      </Form.Field>

       <Form.Field>
        <label>Random state</label>
        <Field
         name = "randomState"
         placeholder='Random state'
         component = {Input}
         options = {input}
         type='number'
         defaultValue={42}
        />
      </Form.Field>



      {/* {(currentChoice == cads_component_templateOpts[0]) && <div>
        <label style={{fontWeight: "bold", textDecoration: "underline"}}>{currentChoice} Parameters:</label>
        <Form.Group widths="equal" style={{paddingTop: "6px"}}>
          <Form.Field>
            <label>Another thing:</label>
            <Field
              name="options.anotherThing"
              component={inputTrad}
              type="number"
              step={1}
              min={0}
              max={10}
            />
          </Form.Field>
        </Form.Group>
      </div>}
      


      {(currentChoice == cads_component_templateOpts[1]) && <div>
        <label style={{fontWeight: "bold", textDecoration: "underline"}}>{currentChoice} Parameters:</label>
        <Form.Group widths="equal" style={{paddingTop: "6px"}}>
          <Form.Field>
            <label>Completely different:</label>
            <Field
              name="options.diff"
              component={inputTrad}
              type="text"
            />
          </Form.Field>
        </Form.Group>
      </div>} */}

      {/* <hr /> */}

      {/* <Form.Field>
        <Field 
         name = "randomState"
         placeholder='random state'
         component = {input}
         defaultValue={42}        
        />
      </Form.Field> */}

      

    </Form>
    
  );
};
// ------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Exporting and sharing this ReduxForm Module
//-------------------------------------------------------------------------------------------------
export default reduxForm({
  form: 'MLP_Component'
})(MLP_Component_Form);
//-------------------------------------------------------------------------------------------------
