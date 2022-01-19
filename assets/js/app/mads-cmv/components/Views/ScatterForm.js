/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'Scatter' View, driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'ScatterForm' opens a customized form for the 'Scatter' visualization component and allows
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

import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import SemanticDropdown from '../FormFields/Dropdown';
import SemCheckbox from '../FormFields/Checkbox';
import Input from '../FormFields/Input';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const ScatterForm = (props) => {
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

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Field>
        <label>Filter</label>
        <Field
          name="filter"
          component={MultiSelectDropdown}
          placeholder="ColorTags"
          search
          options={cTags}
        />
      </Form.Field>

      <Form.Field>
        <label>X:</label>
        <Field
          name="mappings.x"
          component={SemanticDropdown}
          placeholder="X"
          search
          options={columns}
        />
      </Form.Field>
      <Form.Field>
        <label>Y:</label>
        <Field
          name="mappings.y"
          component={SemanticDropdown}
          placeholder="Y"
          search
          options={columns}
        />
      </Form.Field>

      <Form.Field>
        <label>Color assignment:</label>
        <Field
          name="colorAssignmentEnabled"
          component={SemCheckbox}
          toggle
          onChange={(e, data) => {
            setColorDisabled(!data);
          }}
        />
      </Form.Field>

      <Form.Field>
        <label>Color:</label>
        <Field
          name="mappings.color"
          component={SemanticDropdown}
          placeholder="Color"
          search
          options={columns}
          disabled={colorDisabled}
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
})(ScatterForm);
//-------------------------------------------------------------------------------------------------
