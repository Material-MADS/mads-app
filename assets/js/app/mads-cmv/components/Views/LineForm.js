/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'Line' View,
//              driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'LineForm' opens a customized form for the 'LineChart' visualization component and allows
//        the user to edit its look, feel and behavior in multiple ways.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components, 3rd party
//             color palettes, Internal Form Utilities Support functions
=================================================================================================*/

// parameters and such
  // input managers
  // The form itself, as being displayed in the DOM

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form, Popup } from 'semantic-ui-react';

import Input from '../FormFields/Input';
import SemanticDropdown from '../FormFields/Dropdown';
import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import SemCheckbox from '../FormFields/Checkbox';

import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";

import { cmMax, colorMapOptions, getDropdownOptions } from './FormUtils';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods that manages various individual form fields that requires some form of
// attention to its content
//-------------------------------------------------------------------------------------------------

//=======================
const setSubmitButtonDisable = (disableState) => {
  if (disableState) { $(".ui.positive.button").prop('disabled', true); }
  else{ $(".ui.positive.button").prop('disabled', false); }
}
//=======================

//=======================
const validate = (values, props) => {
  if (values.mappings) {
    if (values.mappings.xData) {
      const testColumn = values.mappings.xData;
      if(testColumn && !props.columns.some(e => e.value === testColumn)){
        values.mappings.xData = undefined;
        values.mappings.yData = undefined;
        values.options.axisLabels = undefined;
        values.options.XAxisLabel = undefined;
        values.options.YAxisLabel = undefined;
        values.options.legendLabel = undefined;
        values.options.title = undefined;
      }
    }
  }

  const errors = {
    mappings: {},
  };
  if (values.mappings) {
    if (!values.mappings.yData) {
      errors.mappings["yData"] = 'Required';
    }
    if (values.mappings.yData && values.mappings.yData.length === 0) {
      errors.mappings["yData"] = 'Required';
    }
    if (!values.mappings.xData) {
      errors.mappings["xData"] = 'Required';
    }
  }
  else {
    errors.mappings["yData"] = 'Required';
    errors.mappings["xData"] = 'Required';
  }

  setSubmitButtonDisable( errors.mappings.yData || errors.mappings.xData );

  return errors;
};
//=======================

//=======================
const tooBig = (value, values) => {
  if (value && (value.length > parseInt(cmMax[values.options.colorMap].replace(/[^0-9a-z]/gi, '')))) {
    return 'The color map below does not have enough colors for your requested list of measures, so we might be forced to pick another for you when drawing the chart...';
  }
  return;
}
//=======================


//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const LineForm = (props) => {

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
    dataset,
  } = props;

  const cTags = colorTags.map((c) => ({
    text: c.color,
    value: c.id,
    props: { style: '' },
  }));

  initialValues.options.XAxisLabel = (initialValues.options.axisLabels && initialValues.options.axisLabels.length == 2) ? initialValues.options.axisLabels[0] : initialValues.options.XAxisLabel;
  initialValues.options.YAxisLabel = (initialValues.options.axisLabels && initialValues.options.axisLabels.length == 2) ? initialValues.options.axisLabels[1] : initialValues.options.YAxisLabel;

  // input managers
  const [currentCMVal, setValue] = useState(
    initialValues.options.colorMap
  );

  const onCMChange = (newVal) => {
    setValue(newVal);
  };

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>

      <Form.Field>
        <label>X-Axis:</label>
        <Field
          name="mappings.xData"
          component={SemanticDropdown}
          placeholder="X-Axis"
          search
          options={columns}
        />
      </Form.Field>

      <Form.Field>
        <label>Y-Axis <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content='One column, or many (if data is of same type), of numerical data' size='small' />:</label>
        <Field
          name="mappings.yData"
          component={MultiSelectDropdown}
          placeholder="Y-Axis"
          search
          warn={[ tooBig ]}
          options={columns}
        />
      </Form.Field>

      <hr />
      <Form.Field>
        <label>Title <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content='The Chart title. If none is provided, one will be created from the data information' size='small' />:</label>
        <Field
          fluid
          name="options.title"
          component={Input}
          placeholder="Chart Title"
        />
      </Form.Field>
      <Form.Group widths="equal">
        <label>Labels:</label>
        <Form.Field>
          <label>X Axis <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content='The X Axis Label. If none is provided, the x-axis column name will be used' size='small' />:</label>
          <Field
            fluid
            name="options.XAxisLabel"
            component={Input}
            placeholder="X Axis Label"
          />
        </Form.Field>

        <Form.Field>
        <label>Y Axis <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content='The Y Axis Label. If none is provided, the first y-axis column name will be used' size='small' />:</label>
          <Field
            fluid
            name="options.YAxisLabel"
            component={Input}
            placeholder="Y Axis Label"
          />
        </Form.Field>

        <Form.Field>
          <label>Legend <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content='If multiple lines are displayed, what will be the collective Label for them? (Time, Temp, Value, Price, Day etc?)' size='small' />:</label>
          <Field
            fluid
            name="options.legendLabel"
            component={Input}
            placeholder="Legend Label"
          />
        </Form.Field>
      </Form.Group>

      <hr />
      <Form.Group widths="equal">
        <label>Extent:</label>

        <Field
          fluid
          name="options.extent.width"
          component={Input}
          placeholder="Width"
          label="Width"
        />
        <Field
          fluid
          name="options.extent.height"
          component={Input}
          placeholder="Height"
          label="Height"
        />
      </Form.Group>

      <Form.Field>
        <label>Color Palette (if number of bins exceed number of colors available in the palette, default palette will be used)</label>
        <Field
          name="options.colorMap"
          component={SemanticDropdown}
          placeholder="Color Map"
          options={colorMapOptions}
          onChange={onCMChange}
        />
      </Form.Field>
      <div>
        {(cmMax[currentCMVal] == "256") ? allPal[currentCMVal+cmMax[currentCMVal]].map((color, index) => (
           <span key={color.toString()+"_"+index} style={{display: 'inline-block', width: '2px', height: '20px', backgroundColor: ("#"+color.toString(16).slice(0, -2).padStart(6, '0'))}}></span>
        )) : allPal[currentCMVal+cmMax[currentCMVal]].map((color, index) => (
           <div key={color.toString()+"_"+index} style={{display: 'inline-block', width: '20px', height: '20px', backgroundColor: ("#"+color.toString(16).slice(0, -2).padStart(6, '0'))}}></div>
        ))}
        <div style={{padingLeft: 10}}>(Max Colors: {cmMax[currentCMVal].replace(/[^0-9a-z]/gi, '')})</div>
      </div>

      <hr />
      <Form.Group widths="equal">
        <label>Styles:</label>
        <Form.Field>
          <label>Enable Different Line Styles <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content='Such as Solid, Dotted, Dashed etc.' size='small' />:</label>
          <Field
            name="options.lineStylesEnabled"
            component={SemCheckbox}
            toggle
          />
        </Form.Field>

        <Form.Field>
          <label>Enable Data point Markers <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content='Draw a circle at each data point in the line.' size='small' />:</label>
          <Field
            name="options.lineMarkersEnabled"
            component={SemCheckbox}
            toggle
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
  form: 'Line',
  validate,
})(LineForm);
//-------------------------------------------------------------------------------------------------
