/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Shotaro Okamoto [2025]
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
import React from 'react';
import { Field, reduxForm, } from 'redux-form';
import { Form, Popup } from 'semantic-ui-react';


import DropzoneField from '../FormFields/DropzoneField';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods and Variables that manages various individual form fields that requires
// some form of attention to its content
//-------------------------------------------------------------------------------------------------


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
const AseForm = (props) => {

  // parameters and such
  const {
    handleSubmit,
    initialValues,
  } = props;

  initialValues.options.something="Upload";

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>      

      <div>
        <label style={{fontWeight: "bold", textDecoration: "underline"}}>File upload:</label>
        <Popup 
          trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} 
          content={
            <div>
              <p>Please drag and drop or select the atomic structure file you want to load.</p>
              <p>
                For the list of supported file formats, please check the 
                <a href="https://ase-lib.org/ase/io/io.html" target="_blank" rel="noopener noreferrer">
                  ASE documentation
                </a>.
              </p>
            </div>
          }
          size='small' 
          hoverable
        />
        <Form.Group widths="equal" style={{paddingTop: "6px"}}>
          <Form.Field>
            <Field
              name="options.upload"
              component={DropzoneField}
            />
          </Form.Field>

        </Form.Group>
      </div>

    </Form>
  );
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Exporting and sharing this ReduxForm Module
//-------------------------------------------------------------------------------------------------
export default reduxForm({
  form: 'ASE',
})(AseForm);
//-------------------------------------------------------------------------------------------------
