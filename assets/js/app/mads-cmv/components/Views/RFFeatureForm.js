/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'RFFeature' View, driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'RFFeatureForm' opens a customized form for a 'RFFeature' view of the 'BarChart'
//        visualization component and allows the user to edit its look, feel and behavior in
//        multiple ways.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form } from 'semantic-ui-react';

import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import SemanticDropdown from '../FormFields/Dropdown';
import Input from '../FormFields/Input';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const RFFeatureForm = (props) => {

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

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Field>
        <label>Feature columns</label>
        <Field
          name="featureColumns"
          component={MultiSelectDropdown}
          placeholder="Columns"
          search
          options={columns}
        />
      </Form.Field>

      <Form.Field>
        <label>Target column</label>
        <Field
          name="targetColumn"
          component={SemanticDropdown}
          placeholder="Column"
          search
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
    </Form>
  );
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Exporting and sharing this ReduxForm Module
//-------------------------------------------------------------------------------------------------
export default reduxForm({
  form: 'RFFeature',
})(RFFeatureForm);
//-------------------------------------------------------------------------------------------------
