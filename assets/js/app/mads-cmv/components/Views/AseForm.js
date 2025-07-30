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
import React, { useState,useCallback } from 'react';
import { Field, reduxForm, Label, change } from 'redux-form';
import { Button, Form, Popup } from 'semantic-ui-react';

import SemanticDropdown from '../FormFields/Dropdown';
import Input from '../FormFields/Input';
import inputTrad from '../FormFields/inputTraditional';
import DropzoneField from '../FormFields/DropzoneField';
// import SemCheckbox from '../FormFields/Checkbox';

import { getDropdownOptions } from './FormUtils';

// import _, { values } from 'lodash';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods and Variables that manages various individual form fields that requires
// some form of attention to its content
//-------------------------------------------------------------------------------------------------

//=======================
const cads_component_templateOpts = ['Create', 'Edit your files'];

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
const AseForm = (props) => {

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
  const mergedInitialValues = {
    ...initialValues,
    options: {
      ...defaultOptions,
      ...(initialValues.options || {}),
    },
  };

  const [currentChoice, setValue] = useState(
    mergedInitialValues.options.something
  );
  const [usePBC, setUsePBC] = useState(
    mergedInitialValues.options.usePBC || false
  );
  

  const onSomeChange = (event) => {
    setValue(event);
  };
  const onPBCChange = (event) => {
    setUsePBC(event.target.checked);
  };


  if (!mergedInitialValues.options.anotherThing) {
    mergedInitialValues.options.anotherThing = 1;
  }

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>

      <Form.Field>
        <label>Select<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Bla bla bla' size='small' /></label>
        <Field
          name="options.something"
          placeholder="Create or Edit"
          component={SemanticDropdown}
          options={getDropdownOptions(cads_component_templateOpts)}
          onChange={onSomeChange}
        />
      </Form.Field>

      {(currentChoice === cads_component_templateOpts[0]) && (
        <div>
          <Form.Group widths="equal" style={{ paddingTop: "6px" }}>
            <Form.Field>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
                <label htmlFor="usePBC">Use Periodic Boundary Conditions (PBC)</label>
                <Field
                  name = "options.pbc"
                  id="usePBC"
                  component="input"
                  type = "checkbox"
                  onChange={onPBCChange}
                />
              </div>
            </Form.Field>

            {usePBC && (
              <div style={{ marginTop: "1em" }}>
                <label>
                  a:<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Bla bla bla' size='small' />
                  <Field type="number" name="options.cell.a" component="input" />
                </label>
                <label>
                  b:<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Bla bla bla' size='small' />
                  <Field type="number" name="options.cell.b" component="input" />
                </label>
                <label>
                  c:<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Bla bla bla' size='small' />
                  <Field type="number" name="options.cell.c" component="input" />
                </label>
                <label>
                  α:<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Bla bla bla' size='small' />
                  <Field type="number" name="options.cell.alpha" component="input" />
                </label>
                <label>
                  β:<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Bla bla bla' size='small' />
                  <Field type="number" name="options.cell.beta" component="input" />
                </label>
                <label>
                  γ:<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Bla bla bla' size='small' />
                  <Field type="number" name="options.cell.gamma" component="input" />
                </label>
              </div>
            )}
          </Form.Group>
        </div>
      )}

      {(currentChoice == cads_component_templateOpts[1]) && <div>
        <label style={{fontWeight: "bold", textDecoration: "underline"}}>File upload:</label>
        <Form.Group widths="equal" style={{paddingTop: "6px"}}>
          <Form.Field>
            <Field
              name="options.diff"
              component={DropzoneField}
            />
          </Form.Field>
        </Form.Group>
      </div>}

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
  form: 'ASE',
})(AseForm);
//-------------------------------------------------------------------------------------------------
