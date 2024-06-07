/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors:Yoshiki Hasukawa (Student Developer and Component Design) [2024]
//　　　　　 Mikael Nicander Kuwahara (Lead Developer) [2021-]
// __________________________________________________________________________________________________
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
import React, { useState, useRef } from 'react';
import { Field, reduxForm, Label, change } from 'redux-form';
import { Button, Form, Popup, ButtonGroup } from 'semantic-ui-react';

import SemanticDropdown from '../FormFields/Dropdown';
import Input from '../FormFields/Input';
import SemButtonGroup from '../FormFields/ButtonGroup';
import SemCheckbox from '../FormFields/Checkbox';

import { getDropdownOptions } from './FormUtils';

// import _, { values } from 'lodash';

//-------------------------------------------------------------------------------------------------


//=======================

//=======================
const setSubmitButtonDisable = (disableState) => {
  if (disableState) { $(".ui.positive.button").prop('disabled', true); }
  else{ $(".ui.positive.button").prop('disabled', false); }
}
//=======================

const machineLearningModel = ['Linear', 'Support Vector Machines', 'Random Forest'];
const temperature = [10, 50, 100, 500, 1000];

//=======================
const validate = (values) => {
  // console.log(values)
  const errors = {};

  if (!values.machineLearningModel) {
    errors.machineLearningModel = 'Required';
    errors.iterations = 'Model is Requred';
  } else {
      if (values.machineLearningModel === 'Random Forest') {
        if (!values.iterations || values.iterations < 50 || values.iterations > 100) {
          errors.iterations = 'The value must be between 50 and 100 (Random Forest)'
        }
      } else if (values.machineLearningModel === 'Linear' || values.machineLearningModel === 'Support Vector Machines') {
        if (!values.iterations || values.iterations < 100 || values.iterations > 1000) {
          errors.iterations = 'The value must be between 100 and 1000 (Linear, Support Vector Machines)'
        }
      }
    }

  if (values.temperature === 0) {
    errors.temperature = 'Required';
  }

  if (values.descriptorsList && values.descriptorsList.length === 0) {
    errors.descriptorsList = 'Required';
  }

  if (!values.targetColumn) {
    errors.targetColumn = 'Required';
  }

  setSubmitButtonDisable( errors.machineLearningModel || errors.iterations || errors.temperature || errors.descriptorsList || errors.targetColumn);

  return errors;
};
//=======================

//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const MonteCatForm = (props) => {

  // parameters and such
  const {
    handleSubmit,
    initialValues,
    defaultOptions,
    columns,
    pristine,
    reset,
    submitting,
    colorTags,
    change,
  } = props;


  initialValues.options = {...defaultOptions, ...(initialValues.options) };

  const fileInputRef = useRef(null);
  
  const [iterationsMin, setIterationsMin] = useState(null);
  const [iterationsMax, setIterationsMax] = useState(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    // console.log(file);
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => {
        const text = e.target.result;
        props.change('descriptorsList', text.split(/\r\n|\n|\r/).filter(Boolean));
        props.change('descriptorsFileName', `${file.name}`);
      };
    }
  };

  const changeModel = (e) => {
    if (e === 'Random Forest') {
      setIterationsMin(50);
      setIterationsMax(100);
    } else {
      setIterationsMin(100);
      setIterationsMax(1000);
    }
  }
  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>

      <Form.Group >
        <Form.Field width={6}>
        <label>Macine Learning Model<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Select machine learning model to run MonteCat' size='small' />:</label>
          <Field
            name="machineLearningModel"
            component={SemanticDropdown}
            placeholder="Models"
            options={getDropdownOptions(machineLearningModel)}
            onChange={(e) => {changeModel(e)}}
          />
        </Form.Field>
        <Form.Field width={12}>
          <label>Iterations<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Enter the number of iterations for the model, limited to 50-100 for RandomForest, 100-1000 for Linear and Support Vector Machines' size='small' />:</label>
          <Field 
            name="iterations"
            component={Input}
            type='number'
            step={1}
            min={iterationsMin}
            max={iterationsMax}
          />
        </Form.Field>
      </Form.Group>

      <hr />

      <Form.Group widths="equal">
        <Form.Field>
            <label>Temperature<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Temperature parameter used to tune the Acceptance Probability curve behavior' size='small' />:</label>
            <Field 
              name="temperature"
              component={SemButtonGroup}
              buttonList = {temperature}
            />
          </Form.Field>
          <Form.Field>
            <label>Random Seed<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='A specific random seed value can be selected by the user if reproducibility is desired. If not, the outcome will be randomized.' size='small' />:</label>
            <Field 
              name="randomSeed"
              component={SemCheckbox}
              toggle
            />
          </Form.Field>
      </Form.Group>

      <hr />

      <Form.Group>
        <Form.Field width={4}>
          <label>Descriptors<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='----------------' size='small' />:</label>
          <Button type="button" onClick={handleClick} style={{width: '100%'}}>Load File</Button>
          <input type="file" ref={fileInputRef} accept=".csv" onChange={handleFileChange} style={{ display: 'none' }}/>
          <input
            type="hidden"
            name="descriptorsList"
          />
        </Form.Field>
        <Form.Field width={12} style={{marginTop: 'auto'}}>
          <Field 
            name='descriptorsFileName'
            component={Input}
            readOnly
            style={{width: '100%'}}
          />
        </Form.Field>
      </Form.Group>

      <hr />

      <Form.Field>
        <label>Target Column</label>
        <Field
          name="targetColumn"
          component={SemanticDropdown}
          placeholder="target column"
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
  form: 'MonteCat',
  validate,
})(MonteCatForm);
//-------------------------------------------------------------------------------------------------