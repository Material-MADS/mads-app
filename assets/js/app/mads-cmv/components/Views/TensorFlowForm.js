/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'TensorFlow' View, driven by
//              ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'TensorFlowForm' opens a customized form for the 'TensorFlow' visualization component and
//        allows the user to edit its look, feel and behavior in multiple ways.
// ------------------------------------------------------------------------------------------------
// References: React, ReduxForm and semantic-view-ui libs, Needed FormField components, 3rd party
//             lodash lib, Internal default image
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState } from 'react';
import { Field, reduxForm, Label, change } from 'redux-form';
import { Button, Form, Popup } from 'semantic-ui-react';

import SemanticDropdown from '../FormFields/Dropdown';
import Input from '../FormFields/Input';
import inputTrad from '../FormFields/inputTraditional';
import SemCheckbox from '../FormFields/Checkbox';

import _, { values } from 'lodash';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods and Variables that manages various individual form fields that requires
// some form of attention to its content
//-------------------------------------------------------------------------------------------------

//=======================
// const styles = ['none', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset'];
// const imgManipOpts = ['None', 'Grayscale (CSS3 filters)', 'Grayscale (SciKit-Image)'];
// const colorTints = ['Red', 'Green', 'Blue', 'Yellow', 'Pink', 'Cyan'];
// const erosionOpts = ['Erosion', 'Holes', 'Peaks'];
// const ridgeDetectOpts = ['Meijering', 'Hessian'];
// const ragVersionOpts = ['Threshold 1', 'Threshold 2', 'Merging'];
// const thresholdingVersionOpts = ['Multi-Otsu', 'Binary'];

// let fileName = "";
// let imageSize = {w: 0, h: 0};

// const getDropdownOptions = (list) => list.map((i) => ({ key: i, text: i, value: i }));
// const getDropdownOptionsWBkgColor = (list) => list.map((i) => ({ key: i, text: i, value: i, style: {backgroundColor: i.toLowerCase()} }));

//=======================

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Set Submit Button Disabled
//-------------------------------------------------------------------------------------------------
const setSubmitButtonDisable = (disableState) => {
  if (disableState) { $(".ui.positive.button").prop('disabled', true); }
  else{ $(".ui.positive.button").prop('disabled', false); }
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const TensorFlowForm = (props) => {

  // parameters and such
  const {
    handleSubmit,
    initialValues,
    defaultOptions,
    pristine,
    reset,
    submitting,
    colorTags,
  } = props;

  initialValues.options = {...defaultOptions, ...(initialValues.options) };
  // initialValues.options.cssFilters = {...defaultOptions.cssFilters, ...(initialValues.options.cssFilters) };
  // initialValues.options.skImg = {...defaultOptions.skImg, ...(initialValues.options.skImg) };

  // Make sure that older versions of TensorFlow loads without any problem and that empty values will not cause any problems
  // if(!initialValues.options.imgData && initialValues.data && initialValues.data.data){ initialValues.options.imgData = initialValues.data.data; }


  // const [currentImgTitle, setImgTitle] = useState( initialValues.options.title );

  // const onImgTitleChange = (event) => { setImgTitle(event); };


  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>

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
  form: 'TensorFlow',
})(TensorFlowForm);
//-------------------------------------------------------------------------------------------------
