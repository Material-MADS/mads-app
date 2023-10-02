/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'Clustering' View, driven by
//              ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'ClusteringForm' opens a customized form for a 'Clustering' view of the 'BarChart'
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
import SemCheckbox from '../FormFields/Checkbox';
import Input from '../FormFields/Input';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods that manages various individual form fields that requires some form of
// attention to its content
//-------------------------------------------------------------------------------------------------

//=======================
// const getDropdownOptions = (list) => list.map((i) => ({ key: i, text: i, value: i }));
//=======================

//=======================
const setSubmitButtonDisable = (disableState) => {
  if (disableState) { $(".ui.positive.button").prop('disabled', true); }
  else{ $(".ui.positive.button").prop('disabled', false); }
}
//=======================

//=======================
const errors = {};
const errorValidate = (value, values, props, fieldName) => {
  if (values.featureColumns) {
    if (values.featureColumns[0]) {
      const testColumn = values.featureColumns[0];
      if(testColumn && !props.columns.some(e => e.value === testColumn)){
        values.featureColumns = [];
      }
    }
  }

  let error = undefined;

  if(values.visType != "Bar Chart"){
    // Make sure the correct dataset is loaded
    const testColumn = (values.mappings && values.mappings.x) ? values.mappings.x : undefined;
    if(testColumn && !props.columns.some(e => e.value === testColumn)){
      if(values.mappings){
        if(values.mappings && values.mappings.y){ values.mappings.y = undefined; }
        if(values.mappings && values.mappings.x){ values.mappings.x = undefined; }
      }
      if(values.mappings && values.mappings.color){ values.mappings.color = undefined; }
    }

    //Is required
    if(!value || _.isEmpty(value)){
      error = 'Required';
    }

    setSubmitButtonDisable(!value || error || (Object.values(errors)).includes(true));
  }
  else{
    setSubmitButtonDisable(false);
  }

  return error;
}
//=======================
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const ClusteringForm = (props) => {

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

  const methods = ['KMeans', 'GMM'];
  const visualTypes = ['Scatter Plot', 'Bar Chart'];

  // input managers
  const [colorDisabled, setColorDisabled] = useState(!initialValues.colorAssignmentEnabled);
  if(!initialValues.visType){ initialValues.visType = "Scatter Plot" };
  const [fieldsAreShowing, toggleVisibleFields] = useState(initialValues.visType != visualTypes[1]);

  const getDropdownOptions = (list) =>
    list.map((i) => ({ key: i, text: i, value: i }));

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>

      <Form.Field>
        <label>Visualization Type:</label>
        <Field
          name="visType"
          component={SemanticDropdown}
          placeholder="Visualization Type"
          search
          options={getDropdownOptions(visualTypes)}
          onChange={(e, data) => {
            toggleVisibleFields(data != visualTypes[1]);
          }}
        />
      </Form.Field>
      <hr />

      {!fieldsAreShowing && <div>
        <Form.Field>
          <label>Method:</label>
          <Field
            name="method"
            component={SemanticDropdown}
            placeholder="Method"
            search
            options={getDropdownOptions(methods)}
          />
        </Form.Field>
      </div>}

      <Form.Field>
        <label>Number of clusters</label>
        <Field
          name="numberOfClusters"
          component="input"
          type="number"
          placeholder="bins"
          max="10"
          parse={(value) => Number(value)}
        />
      </Form.Field>
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

      {fieldsAreShowing && <div>

        <Form.Field>
          <label>X:</label>
          <Field
            name="mappings.x"
            component={SemanticDropdown}
            placeholder="X"
            search
            validate={[ errorValidate ]}
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
            validate={[ errorValidate ]}
            options={columns}
          />
        </Form.Field>
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
  form: 'clustering',
})(ClusteringForm);
//-------------------------------------------------------------------------------------------------
