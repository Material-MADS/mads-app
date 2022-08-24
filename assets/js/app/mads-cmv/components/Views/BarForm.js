/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'Bar' View,
//              driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'BarForm' opens a customized form for the 'BarChart' visualization component and allows
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
import { Form } from 'semantic-ui-react';

import Input from '../FormFields/Input';
import SemanticDropdown from '../FormFields/Dropdown';
import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';

import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";

import { cmMax, colorMapOptions } from './FormUtils';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods that manages various individual form fields that requires some form of
// attention to its content
//-------------------------------------------------------------------------------------------------

//=======================
const tooBig = (value, values) => {
  if (value && (parseInt(value) > parseInt(cmMax[values.options.colorMap].replace(/[^0-9a-z]/gi, '')))) {
    return 'The color map below does not have enough colors for your requested bins, so we might be forced to pick another for you when drawing the chart...';
  }
  return;
}
//=======================

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const BarForm = (props) => {

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
  const [currentCMVal, setValue] = useState(
    initialValues.options.colorMap
  );

  const onCMChange = (event) => {
    setValue(event);
  };

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Field>
        <label>Dimension</label>
        <Field
          name="mappings.dimension"
          component={SemanticDropdown}
          placeholder="Dimension"
          search
          options={columns}
        />
      </Form.Field>

      <Form.Field>
        <label>Mesures</label>
        <Field
          name="mappings.measures"
          component={SemanticDropdown}
          placeholder="Mesures"
          search
          options={columns}
        />
      </Form.Field>

      <Form.Field>
        <label>Filter</label>
        <Field
          name="filter"
          component={MultiSelectDropdown}
          placeholder="ColorTags"
          search
          // trigger={<Label color={data.color}/>}
          options={cTags}
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
    </Form>
  );
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Exporting and sharing this ReduxForm Module
//-------------------------------------------------------------------------------------------------
export default reduxForm({
  form: 'Bar',
})(BarForm);
//-------------------------------------------------------------------------------------------------
