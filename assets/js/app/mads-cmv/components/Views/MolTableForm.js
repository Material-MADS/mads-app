/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'MolTable' View, driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'MolTableForm' opens a customized form for the 'MolTable' visualization component and allows
//        the user to edit its look, feel and behavior in multiple ways.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form } from 'semantic-ui-react';

import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import Input from '../FormFields/Input';

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
  if (!values.smiles_columns) {
    errors.smiles_columns = 'Required';
  }

  setSubmitButtonDisable( errors.smiles_columns);

  return errors;
};
//=======================

//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const MolTableForm = (props) => {

  // parameters and such
  const {
    handleSubmit,
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

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Field>
        <label>Filter</label>
        <Field
          name="filter"
          component={MultiSelectDropdown}
          placeholder="ColorTags (default: none)"
          search
          options={cTags}
        />
      </Form.Field>

      <Form.Field>
        <label>Columns</label>
        <Field
          name="columns"
          component={MultiSelectDropdown}
          placeholder="Columns (default: all)"
          search
          options={columns}
        ></Field>
      </Form.Field>

      <Form.Field>
        <label>Columns with molecules encoded as SMILES</label>
        <Field
          name="smiles_columns"
          component={MultiSelectDropdown}
          placeholder="Columns"
          search
          options={columns}
        ></Field>
      </Form.Field>

      <hr />
      <h4>Molecules size</h4>
      <Form.Group widths="equal">
        <label>Extent:</label>
        <Field
          fluid
          name="mols_width"
          component={Input}
          placeholder="Width"
        />
        <Field
          fluid
          name="mols_height"
          component={Input}
          placeholder="Height"
        />
      </Form.Group>

      <hr />
      <h4>Table size</h4>
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
  form: 'MolTable',
  validate,
})(MolTableForm);
//-------------------------------------------------------------------------------------------------
