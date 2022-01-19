/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Settings Configuration Form for the 'ImageView' View, driven by
//              ReduxForm
// ------------------------------------------------------------------------------------------------
// Notes: 'ImageViewForm' opens a customized form for the 'ImageView' visualization component and
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
import { Button, Form } from 'semantic-ui-react';

import SemanticDropdown from '../FormFields/Dropdown';
import Input from '../FormFields/Input';
import inputTrad from '../FormFields/inputTraditional';

import _ from 'lodash';

import noImg from '../VisComponents/images/noimage.jpg';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods and Variables that manages various individual form fields that requires
// some form of attention to its content
//-------------------------------------------------------------------------------------------------

//=======================
const styles = ['none', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset'];

let fileName = "";

const getDropdownOptions = (list) => list.map((i) => ({ key: i, text: i, value: i }));
//=======================

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const ImageViewForm = (props) => {

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


  // input managers
  const fileChange = e => {
    var file = e.target.files[0]; // File object
    var reader = new FileReader();

    reader.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        props.change('imgData', evt.target.result);
        $('#imgThumb').attr("src", evt.target.result);
        props.change('imgStr', "[IMAGE FILE LOADED]");

        if(!currentImgTitle || currentImgTitle == fileName || currentImgTitle == "Untitled Image"){
          props.change('options.title', file.name);
        }
        if(!currentImgCapt || currentImgCapt == "fetched from online server" || currentImgCapt == "Rendered from Base64 String"){
          props.change('options.caption', "loaded from local machine");
        }

        fileName = file.name;
      }
    };
    reader.readAsDataURL(file);
  };

  const onISChange = (event) => {
    $('#imgThumb').attr("src", event);
    props.change('imgData', event);

    if(event.indexOf(";base64") == -1){
      if(!currentImgTitle || currentImgTitle == fileName || currentImgTitle == "Untitled Image"){
        props.change('options.title', event.substring(event.lastIndexOf('/')+1));
      }
      if(!currentImgCapt || currentImgCapt == "loaded from local machine" || currentImgCapt == "Rendered from Base64 String"){
        props.change('options.caption', "fetched from online server");
      }
      try {
        fileName = event.substring(event.lastIndexOf('/')+1);
      } catch (error) { }
    }
    else{
      if(!currentImgTitle || currentImgTitle == fileName){
        props.change('options.title', "Untitled Image");
      }
      if(!currentImgCapt || currentImgCapt == "loaded from local machine" || currentImgCapt == "fetched from online server"){
        props.change('options.caption', "Rendered from Base64 String");
      }
      try {
        fileName = event.substring(0, 100);
      } catch (error) { }
    }
  };

  setTimeout(function() {
    if(initialValues.imgData != undefined && $('#imgThumb').attr("src") == noImg){
      $('#imgThumb').attr("src", initialValues.imgData);
      try {
        fileName = initialValues.imgData.substring(initialValues.imgData.lastIndexOf('/')+1);
      } catch (error) { }
    }
  });

  const [currentImgTitle, setImgTitle] = useState(
    initialValues.options.title
  );

  const onImgTitleChange = (event) => {
    setImgTitle(event);
  };

  const [currentImgCapt, setImgCapt] = useState(
    initialValues.options.caption
  );

  const onImgCaptChange = (event) => {
    setImgCapt(event);
  };

  // The form itself, as being displayed in the DOM
  return (
    <Form onSubmit={handleSubmit}>

      <Form.Group>
        <Form.Field width={12}>
          <label>Image: (Paste online URL, (Base64 text),  or Load local Image File <Button as="label" htmlFor="file" type="button" color="blue" style={{fontSize: "14px", padding: "4px", fontWeight: "bold", height: "22px", marginLeft: "5px"}}>Load File</Button>)</label>
          <Field
            fluid
            name="imgStr"
            component={Input}
            onChange={onISChange}
          />
          <input type="file" id="file" style={{ display: "none" }} onChange={fileChange} />
          <input
            type="hidden"
            name="imgData"
          />
        </Form.Field>
        <Form.Field width={4}>
          <img width="100%" id="imgThumb" src={noImg} />
        </Form.Field>
      </Form.Group>

      <hr />

      <Form.Group widths="equal">
        <label>Border:</label>
        <Form.Field>
          <label>Color:</label>
          <Field
            fluid
            name="options.border.color"
            component={inputTrad}
            type="color"
          />
        </Form.Field>
        <Form.Field>
          <label>Size:</label>
          <Field
            fluid
            name="options.border.size"
            component={inputTrad}
            type="number"
          />
        </Form.Field>
        <Form.Field>
          <label>Style:</label>
          <Field
          name="options.border.style"
          component={SemanticDropdown}
          placeholder="Style"
          options={getDropdownOptions(styles)}
        />
        </Form.Field>
      </Form.Group>

      <hr />

      <Form.Field>
        <label>Image Title:</label>
        <Field
          fluid
          name="options.title"
          component={Input}
          placeholder="Image Name"
          onChange={onImgTitleChange}
        />
      </Form.Field>
      <Form.Field>
          <label>Image Caption:</label>
          <Field
            fluid
            name="options.caption"
            component={Input}
            placeholder="Image Caption"
            onChange={onImgCaptChange}
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
  form: 'ImageView',
})(ImageViewForm);
//-------------------------------------------------------------------------------------------------
