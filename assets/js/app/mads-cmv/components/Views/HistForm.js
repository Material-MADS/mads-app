/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'Hist' View, driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'HistForm' opens a customized form for the 'Hist' visualization component and allows
//        the user to edit its look, feel and behavior in multiple ways.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form } from 'semantic-ui-react';

import Input from '../FormFields/Input';
import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const HistForm = (props) => {

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

  // input managers
  const [colorDisabled, setColorDisabled] = useState(
    !initialValues.colorAssignmentEnabled
  );

  if(initialValues.targetColumns && initialValues.targetColumns.length > 0){
    var hitCounter = 0;
    for(var i = 0; i < initialValues.targetColumns.length; i++){
      hitCounter += columns.some(e => e.value === initialValues.targetColumns[i]) ? 1 : 0;
    }
    if(hitCounter != initialValues.targetColumns.length){ initialValues.targetColumns = []; }
  }

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Field>
        <label>Target columns</label>
        <Field
          name="targetColumns"
          component={MultiSelectDropdown}
          placeholder="Columns"
          search
          options={columns}
        />
      </Form.Field>
      <Form.Field>
        <label>Number of bins</label>
        <Field
          name="bins"
          component="input"
          type="number"
          placeholder="bins"
          parse={(value) => Number(value)}
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
  form: 'Scatter',
})(HistForm);
//-------------------------------------------------------------------------------------------------
