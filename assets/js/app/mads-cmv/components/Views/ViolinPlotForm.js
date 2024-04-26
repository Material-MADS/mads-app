/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'GapMinder' View, driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'GapMinderForm' opens a customized form for the 'GapMinder' visualization component and allows
//        the user to edit its look, feel and behavior in multiple ways.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components, 3rd party
//             lodash & various color palettes, Internal Form Utilities Support functions
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState } from 'react';
import { Field, reduxForm, Label } from 'redux-form';
import { Form, Popup } from 'semantic-ui-react';

import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
import SemanticDropdown from '../FormFields/Dropdown';
import SemCheckbox from '../FormFields/Checkbox';
import Input from '../FormFields/Input';
import inputTrad from '../FormFields/inputTraditional';

import _ from 'lodash';
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
const errors = {};
const errorValidate = (value, values, props, fieldName) => {
  let error = undefined;

  //Is required
  if ((values.numDataAxis)){
    if(!value || _.isEmpty(value)){
      error = 'Required';
    }
    else { errors[fieldName] = false; }
  }

  errors[fieldName] = (error != undefined);
  setSubmitButtonDisable(!value || error || (Object.values(errors)).includes(true));

  return error;
}
//=======================

//=======================
const plotOrientations = ['Vertical', 'Horizontal'];
//=======================

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// is It Numerical
// Check if the grouping column is numerical at initiation of the form
//-------------------------------------------------------------------------------------------------
function isItNumerical(data, grCol){
  var retres = false;
  if(!(grCol == undefined || grCol == 'noneAtAll') ){
    var grColData = data.map(a => (a[grCol]))
    var grColDataType = typeof grColData[0];
    let grColDataUniques = [... new Set(grColData)];
    if(grColDataType == 'number' && grColDataUniques.length > 10){ retres = true; };
  }

  return retres;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const ViolinPlotForm = (props) => {

  // parameters and such
  const {
    handleSubmit,
    initialValues,
    pristine,
    reset,
    submitting,
    columns,
    targetId,
    dataset,
  } = props;

  if(!initialValues.options.plotOrientation){ initialValues.options.plotOrientation = "Vertical" };
  if(!initialValues.options.splitEnabled){ initialValues.options.splitEnabled = false };
  if(!initialValues.options.numOfCats){ initialValues.options.numOfCats = 4 };

  const [currentCMVal, setValue] = useState( initialValues.options.colorMap );
  const onCMChange = (event) => { setValue(event); };

  const [isNumericalCat, setIsNumericalCat] = useState( isItNumerical(dataset.main.data, initialValues.options.category) );

  const [isCategorizing, setIsGrouping] = useState( !(initialValues.options.category == undefined || initialValues.options.category=='noneAtAll') );
  const onCatChanged = (event) => {
    setIsGrouping(event!='noneAtAll');
    if(event != 'noneAtAll'){
      var catColData = dataset.main.data.map(a => (a[event]))
      var catColDataType = typeof catColData[0];
      let catColDataUniques = [... new Set(catColData)];
      setIsNumericalCat(catColDataType == 'number' && catColDataUniques.length > 10);
    }
  };

  const [isSplit, setIsSplitting] = useState( !(initialValues.options.groupCol == undefined || initialValues.options.groupCol=='noneAtAll') );
  const onGroupChanged = (event) => { setIsSplitting(event!='noneAtAll'); };


  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>

      <Form.Field>
        <label>Plot Title:</label>
        <Field
          fluid
          name="options.title"
          component={Input}
          placeholder="Plot Title"
        />
      </Form.Field>

      <Form.Field>
        <label>Numerical Data Axis:</label>
        <Field
          name="options.numDataAxis"
          component={SemanticDropdown}
          placeholder="Numerical Data Column"
          options={columns}
          validate={[ errorValidate ]}
        />
      </Form.Field>

      <Form.Field style={{paddingTop: '10px'}}>
        <label>Primary Category Column:</label>
        <Field
          name="options.category"
          component={SemanticDropdown}
          placeholder="None"
          options={getDropdownOptions(columns, true, "None")}
          onChange={onCatChanged}
        />
      </Form.Field>

      {isNumericalCat && <div>
        <Form.Field style={{width: '250px'}}>
          <label>Number of categories (ranges) <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='The grouping category has numerical data, so it should be slimmed down into a set number of ranges.' size='small' />:</label>
          <Field
            fluid
            name="options.numOfCats"
            component={inputTrad}
            type="number"
            placeholder="4"
            step={1}
            min={1}
          />
        </Form.Field>
      </div> }

      {isCategorizing && <div>
        <Form.Field style={{paddingTop: '10px'}}>
          <label>Secondary Category Column:</label>
          <Field
            name="options.groupCol"
            component={SemanticDropdown}
            placeholder="None"
            options={getDropdownOptions(columns, true, "None")}
            onChange={onGroupChanged}
          />
        </Form.Field>

        {isSplit && <div>
          <Form.Field>
            <label>Split Secondary Category in One Plot:</label>
            <Field
              name="options.splitEnabled"
              component={SemCheckbox}
              toggle
            />
          </Form.Field>
        </div> }
      </div> }

      <hr />

      <Form.Field>
        <label>Plot Orientation:</label>
        <Field
          name="options.plotOrientation"
          component={SemanticDropdown}
          options={getDropdownOptions(plotOrientations)}
        />
      </Form.Field>

      <hr />

      <Form.Field>
        <label>Color Palette</label>
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

      <Form.Field>
        <label>Personal Colors(Manual) <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Type the color names you wish to use with space or comma between.' size='small' />:</label>
        <Field
          fluid
          name="options.manualColors"
          component={Input}
          placeholder="Manual Colors"
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
  form: 'ViolinPlot',
})(ViolinPlotForm);
//-------------------------------------------------------------------------------------------------
