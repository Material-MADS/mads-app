/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
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
const validate = (values) => {
  const errors = {
    mappings: {},
  };
  if (values.mappings) {
    if (!values.mappings.measures) {
      errors.mappings["measures"] = 'Required';
    }
    if (values.mappings.measures && values.mappings.measures.length === 0) {
      errors.mappings["measures"] = 'Required';
    }
    if (!values.mappings.dimension) {
      errors.mappings["dimension"] = 'Required';
    }
  }
  else {
    errors.mappings["measures"] = 'Required';
    errors.mappings["dimension"] = 'Required';
  }

  setSubmitButtonDisable( errors.mappings.measures || errors.mappings.dimension );

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

//=======================
const barTypeOptions = ['Vertical', 'Horizontal'];
const measureCalcMethodOpts = ['Total', 'Mean', 'Median', 'Max', 'Min'];
const legendPosOpts = ['top_left', 'top_center', 'top_right', 'left', 'center', 'right', 'bottom_left', 'bottom_center', 'bottom_right'];

const getCurrentlyAvailableColumns = function(type, columns, tvEnabled, tvGrLabel, tvGrMembers, tvSplCol, dataset){
  var dimList = [...columns];

  if(tvEnabled){
    if(type == "D"){
      if(tvGrMembers && tvGrMembers.length > 0){
        dimList = dimList.filter(c => !tvGrMembers.includes(c.key));
        const tvGrNameStr = (tvGrLabel && tvGrLabel != "") ? tvGrLabel : "Unnamed Transpose Group containing (" + tvGrMembers.map(c => `${c.key},`).join('') + ")"
        dimList.push({key: tvGrNameStr, text: tvGrNameStr, value: tvGrNameStr})
        if(tvSplCol && tvSplCol != ""){
          dimList = dimList.filter(c => c.key != tvSplCol);
        }
      }
    }
    else if(type == "M"){
      if(tvGrMembers && tvGrMembers.length > 0){
        dimList = dimList.filter(c => !tvGrMembers.includes(c.key));
        if(tvSplCol && tvSplCol != ""){
          dimList = dimList.filter(c => c.key != tvSplCol);
          const tvColSplit = dataset.main.data.map(a => ({key: a[tvSplCol].toString(), text: a[tvSplCol].toString(), value: a[tvSplCol].toString()}));
          dimList = [...dimList, ...tvColSplit];
        }
      }
    }
    else if (type == "S"){
      if(tvGrMembers && tvGrMembers.length > 0){
        dimList = dimList.filter(c => !tvGrMembers.includes(c.key));
      }
    }
  }

  let seen = new Set();
  var hasDuplicates = dimList.some(function(currentObject) { return seen.size === seen.add(currentObject.name).size; });
  if(hasDuplicates){ dimList = ([...new Set(dimList.map(r => r.key))]).map(v => ({key: v, text: v, value: v}))}

  return dimList;
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
    dataset,
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

  const onCMChange = (newVal) => {
    setValue(newVal);
  };

  const [tvEnabled, toggleTVEnabled] = useState( initialValues.options.transposeEnabled );
  const [tvGrMembers, setTVGrMembers] = useState( initialValues.options.transposeGroup );
  const onTVGrChange = (newVal) => {  setTVGrMembers(newVal); };
  const [tvGrLabel, settvGrLabel] = useState( initialValues.options.transposeGroupLabel );
  const onTVGrLabelChange = (newVal) => { settvGrLabel(newVal); };
  const [tvSplCol, setTVSplCol] = useState( initialValues.options.transposeSplitColumn );
  const onTVSplChange = (newVal) => { setTVSplCol(newVal); };

  const [dimensionHasDuplicates, setDHDValue] = useState( initialValues.options.dimHasDupli );
  if(!initialValues.options.valCalcMethod){ initialValues.options.valCalcMethod = false };
  if(!initialValues.options.dimHasDupli){ initialValues.options.dimHasDupli = false };
  const onDimChange = (newVal) => {
    let dimData = [];
    if(tvEnabled && newVal == tvGrLabel){
      dimData = [...tvGrMembers];
    }
    else{
      dimData = dataset.main.data.map(a => a[newVal]);
    }
    const hasDupli = ((new Set(dimData)).size !== dimData.length);
    setDHDValue(hasDupli);
    props.change('options.dimHasDupli', hasDupli);
    props.change('options.valCalcMethod', hasDupli ? "Mean" : false);
  };

  if(!initialValues.options.barType){ initialValues.options.barType = "Vertical" };

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>

      <Form.Field width={4}>
        <label>Enable Transpose View  <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='This allows to engage with the data in a custom transposed state for better control of how to visualize the data.' size='small' />:</label>
        <Field
          name="options.transposeEnabled"
          component={SemCheckbox}
          toggle
          onChange={(e, data) => { toggleTVEnabled(data); props.change('mappings.measures', []);}}
        />
      </Form.Field>
      {tvEnabled && <div>
        <Form.Field>
          <label>Transpose Group Members <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Select Columns from the original data and group them for a transposed view.' size='small' />:</label>
          <Field
            name="options.transposeGroup"
            component={MultiSelectDropdown}
            placeholder="Transpose Group"
            search
            options={columns}
            onChange={onTVGrChange}
          />
        </Form.Field>
        <Form.Field>
          <label>Transpose Group Label <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='A collective name for the columns chosen above for the Transpose view (e.g. "Years", "Names" etc.' size='small' />:</label>
          <Field
            fluid
            name="options.transposeGroupLabel"
            component={Input}
            placeholder="Transpose Group Label"
            onChange={onTVGrLabelChange}
          />
        </Form.Field>
        <Form.Field>
          <label>Transpose Split Column <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='The column that will be split up into Transpose "rows" in the new view and available as measure columns. If this column contains duplicate values, the measuremnts will need to be calculated accordingly.' size='small' /></label>
          <Field
            name="options.transposeSplitColumn"
            component={SemanticDropdown}
            placeholder="Transpose Split Column"
            search
            onChange={onTVSplChange}
            options={getCurrentlyAvailableColumns("S", columns, tvEnabled, tvGrLabel, tvGrMembers, tvSplCol, dataset)}
          />
        </Form.Field>
      </div>}

      <hr />
      <Form.Field>
        <label>Dimension <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='This has to be a list of unique categorical values of string type (if numerical in nature it will be treated as strings) (If not unique, then some form of average of the measurements will be calculated in order to get one measurement per dimension)' size='small' /></label>
        <Field
          name="mappings.dimension"
          component={SemanticDropdown}
          placeholder="Dimension"
          search
          options={getCurrentlyAvailableColumns("D", columns, tvEnabled, tvGrLabel, tvGrMembers, tvSplCol, dataset)}
          onChange={onDimChange}
        />
      </Form.Field>
      {dimensionHasDuplicates && <div>
        <Form.Field>
        <label>Value Calculation Method <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Since your Dimension category value is not unique we need to do some calculations on those measurements which fall into the same category. Pick the one you prefer.' size='small' /></label>
        <Field
          name="options.valCalcMethod"
          component={SemanticDropdown}
          options={getDropdownOptions(measureCalcMethodOpts)}
        />
        </Form.Field>
      </div>}

      <input
        type="hidden"
        name="options.dimHasDupli"
      />

      <Form.Field>
        <label>Mesures  <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='One or many lists of numerical measurements for the selected dimension' size='small' /></label>
        <Field
          name="mappings.measures"
          component={MultiSelectDropdown}
          placeholder="Mesures"
          search
          warn={[ tooBig ]}
          options={getCurrentlyAvailableColumns("M", columns, tvEnabled, tvGrLabel, tvGrMembers, tvSplCol, dataset)}
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
        <label>Bar Direction:</label>
        <Field
          name="options.barType"
          component={SemanticDropdown}
          options={getDropdownOptions(barTypeOptions)}
        />
      </Form.Field>

      <Form.Field>
        <label>Legend Location:</label>
        <Field
          name="options.legendLocation"
          component={SemanticDropdown}
          placeholder="top_right"
          options={getDropdownOptions(legendPosOpts)}
        />
      </Form.Field>

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
  validate,
})(BarForm);
//-------------------------------------------------------------------------------------------------
