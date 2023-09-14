/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'Custom' View, driven by ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'CustomForm' opens a customized form for the 'CustomVC' visualization component and allows
//        the user to edit its look, feel and behavior in multiple ways.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components, 3rd party
//             jquery & various color palettes, Internal Form Utilities Support functions
=================================================================================================*/

//*** TODO: This is yet not implemented into the application and is still under construction

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState } from 'react';
import { Field, reduxForm, Label } from 'redux-form';
import { Button, Form } from 'semantic-ui-react';

// import MultiSelectDropdown from '../FormFields/MultiSelectDropdown';
// import SemanticDropdown from '../FormFields/Dropdown';
// import SemCheckbox from '../FormFields/Checkbox';
import Input from '../FormFields/Input';
// import _ from 'lodash';

// import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";
// import { cmMax, colorMapOptions } from './FormUtils';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods and Variables that manages various individual form fields that requires
// some form of attention to its content
//-------------------------------------------------------------------------------------------------

//=======================
// const getDropdownOptions = (list) => list.map((i) => ({ key: i, text: i, value: i }));
//=======================

//=======================
// const setSubmitButtonDisable = (disableState) => {
//   if (disableState) { $(".ui.positive.button").prop('disabled', true); }
//   else{ $(".ui.positive.button").prop('disabled', false); }
// }
//=======================

// const errors = {};
// const errorValidate = (value, values, props, fieldName) => {
//   let error = undefined;

//   // Clean away possible leftover from a previous PCA render
//   if(values.options && values.options.axisTitles && values.options.axisTitles[0] == "PC 1"){
//     values.options.axisTitles = [];
//   }

//   // Make sure the correct dataset is loaded
//   const testColumn = values.targetColumn || (values.options?(values.options.axisTitles?values.options.axisTitles[0]:undefined):undefined)
//   if(testColumn && !props.columns.some(e => e.value === testColumn)){
//     if(values.featureColumns){ values.featureColumns = undefined; }
//     if(values.targetColumn){ values.targetColumn = undefined; }
//     if(values.options && values.options.axisTitles){ values.options.axisTitles = []; }
//     if (fieldName.toLowerCase().includes("column") || fieldName.toLowerCase().includes("axistitles")){     value = undefined; }
//     if(values.mappings && values.mappings.color){ values.mappings.color = undefined; }
//     if(values.mappings && values.mappings.size){ values.mappings.size = undefined; }
//   }

//   //Is required
//   if ((values.method && ((values.method == "PCA" && fieldName.toLowerCase().includes("column")) || (values.method == "Manual" && fieldName.toLowerCase().includes("axistitles")))) ||
//       ((values.colorAssignmentEnabled && fieldName == "mappings.color") || (values.sizeAssignmentEnabled && fieldName == "mappings.size"))){
//     if(!value || _.isEmpty(value)){
//       error = 'Required';
//     }
//     else { errors[fieldName] = false; }
//   }

//   //Must be at least 3
//   if(values.method && values.method == "PCA" && fieldName == "featureColumns"){
//     if(value && value.length < 3){
//       error = 'At least three(3) featured columns have to be selected for 3D PCA to work';
//     }
//   }

//   errors[fieldName] = (error != undefined);
//   setSubmitButtonDisable(!value || error || (Object.values(errors)).includes(true));

//   return error;
// }
//=======================

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const CustomForm = (props) => {

  // parameters and such
  const {
    handleSubmit,
    // initialValues,
    // pristine,
    // reset,
    // submitting,
    columns,
    // targetId,
    colorTags,
  } = props;
  // const cTags = colorTags.map((c) => ({
  //   text: c.color,
  //   value: c.id,
  //   props: { style: '' },
  // }));

  // const methods = ['Manual', 'PCA'];
  // const preprocMethods = ['StandardScaling', 'Normalization'];

  // input managers
  // const [fieldsAreShowing, toggleVisibleFields] = useState(
  //   initialValues.method != methods[1]
  // );

  // const [colorDisabled, setColorDisabled] = useState(
  //   !initialValues.colorAssignmentEnabled
  // );

  // const [sizeDisabled, setSizeDisabled] = useState(
  //   !initialValues.sizeAssignmentEnabled
  // );

  // const [preprocDisabled, setPreprocDisabled] = useState(
  //   !initialValues.preprocessingEnabled
  // );

  // const [currentCMVal, setValue] = useState(
  //   initialValues.options.colorMap
  // );

  // const onCMChange = (event) => {
  //   setValue(event);
  // };

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>

      <Form.Field>
        <label>PLACEHOLDER:</label>
        <Field
          name="ph"
          component={Input}
          placeholder="Placeholder"
        />
      </Form.Field>

      {/* <Form.Field>
        <label>Method:</label>
        <Field
          name="method"
          component={SemanticDropdown}
          placeholder="Method"
          options={getDropdownOptions(methods)}
          onChange={(e, data) => {
            toggleVisibleFields(data != methods[1]);
          }}
        />
      </Form.Field> */}

      {/* These Form Fields are for the PCA method */}
      {/* {!fieldsAreShowing && <div>
        <Form.Field>
          <label>Feature columns</label>
          <Field
            name="featureColumns"
            component={MultiSelectDropdown}
            placeholder="Columns"
            options={columns}
            validate={[ errorValidate ]}
          />
        </Form.Field>

        <Form.Field>
          <label>Target column</label>
          <Field
            name="targetColumn"
            component={SemanticDropdown}
            placeholder="Column"
            validate={[ errorValidate ]}
            options={columns}
          />
        </Form.Field>

        <Form.Field>
          <label>Apply Data Preprocessing:</label>
          <Field
            name="preprocessingEnabled"
            component={SemCheckbox}
            toggle
            onChange={(e, data) => {
              setPreprocDisabled(!data);
            }}
          />
        </Form.Field>

        {!preprocDisabled && <div>
          <Form.Field>
            <label>Preprocessing Method:</label>
            <Field
              name="preprocMethod"
              component={SemanticDropdown}
              placeholder="Preprocessing Method"
              options={getDropdownOptions(preprocMethods)}
              disabled={preprocDisabled}
            />
          </Form.Field>
        </div>}
      </div>} */}

      {/* {fieldsAreShowing && <div>
        <Form.Field>
          <label>X:</label>
          <Field
            name="options.axisTitles[0]"
            component={SemanticDropdown}
            placeholder="X"
            options={columns}
            validate={[ errorValidate ]}
          />
        </Form.Field>
        <Form.Field>
          <label>Y:</label>
          <Field
            name="options.axisTitles[1]"
            component={SemanticDropdown}
            placeholder="Y"
            options={columns}
            validate={[ errorValidate ]}
          />
        </Form.Field>
        <Form.Field>
          <label>Z:</label>
          <Field
            name="options.axisTitles[2]"
            component={SemanticDropdown}
            placeholder="Z"
            options={columns}
            validate={[ errorValidate ]}
          />
        </Form.Field>
      </div>} */}

      <hr />
      {/* <Form.Field>
        <label>Color Assignment:</label>
        <Field
          name="colorAssignmentEnabled"
          component={SemCheckbox}
          toggle
          onChange={(e, data) => {
            setColorDisabled(!data);
          }}
        />
      </Form.Field> */}

      {/* {!colorDisabled && <div>
        <Form.Field>
          <label>Color Mapping Column:</label>
          <Field
            name="mappings.color"
            component={SemanticDropdown}
            placeholder="Color Mapping Column"
            options={columns}
            disabled={colorDisabled}
            validate={[ errorValidate ]}
          />
        </Form.Field>

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
      </div>} */}

      <hr />
      {/* <Form.Field>
        <label>Size Assignment:</label>
        <Field
          name="sizeAssignmentEnabled"
          component={SemCheckbox}
          toggle
          onChange={(e, data) => {
            setSizeDisabled(!data);
          }}
        />
      </Form.Field> */}

      {/* {!sizeDisabled && <div>
        <Form.Field>
          <label>Size Mapping Column:</label>
          <Field
            name="mappings.size"
            component={SemanticDropdown}
            placeholder="Size Mapping Column"
            options={columns}
            disabled={sizeDisabled}
            validate={[ errorValidate ]}
          />
        </Form.Field>
      </div>} */}

      <hr />
      {/* <Form.Group widths="equal">
        <label>Marker:</label>
        {colorDisabled && <Form.Field>
            <label>Color:</label>
            <Field
              fluid
              name="options.marker.color"
              component={Input}
              placeholder="Marker Color"
            />
          </Form.Field> }
          {sizeDisabled && <Form.Field>
          <label>Size:</label>
          <Field
            fluid
            name="options.marker.size"
            component={Input}
            placeholder="Marker Size"
          />
        </Form.Field> }
        <Form.Field>
          <label>Opacity:</label>
          <Field
            fluid
            name="options.marker.opacity"
            component={Input}
            placeholder="Marker Opacity"
          />
        </Form.Field>
      </Form.Group> */}

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

      {/* <input
        type="hidden"
        name="options.camera"
      /> */}

    </Form>
  );
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Exporting and sharing this ReduxForm Module
//-------------------------------------------------------------------------------------------------
export default reduxForm({
  form: 'Custom',
})(CustomForm);
//-------------------------------------------------------------------------------------------------
