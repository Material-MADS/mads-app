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
import { Button, Form, Popup } from 'semantic-ui-react';

import SemanticDropdown from '../FormFields/Dropdown';
import Input from '../FormFields/Input';
import inputTrad from '../FormFields/inputTraditional';
import SemCheckbox from '../FormFields/Checkbox';

import _, { values } from 'lodash';

import noImg from '../VisComponents/images/noimage.jpg';
import blockedImg from '../VisComponents/images/blockedImg.png';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Form Support Methods and Variables that manages various individual form fields that requires
// some form of attention to its content
//-------------------------------------------------------------------------------------------------

//=======================
const styles = ['none', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset'];
const imgManipOpts = ['None', 'Grayscale (CSS3 filters)', 'Grayscale (SciKit-Image)'];
const colorTints = ['Red', 'Green', 'Blue', 'Yellow', 'Pink', 'Cyan'];
const erosionOpts = ['Erosion', 'Holes', 'Peaks'];
const ridgeDetectOpts = ['Meijering', 'Hessian'];
const ragVersionOpts = ['Threshold 1', 'Threshold 2', 'Merging'];
const thresholdingVersionOpts = ['Multi-Otsu', 'Binary'];

let fileName = "";
let imageSize = {w: 0, h: 0};

const getDropdownOptions = (list) => list.map((i) => ({ key: i, text: i, value: i }));
const getDropdownOptionsWBkgColor = (list) => list.map((i) => ({ key: i, text: i, value: i, style: {backgroundColor: i.toLowerCase()} }));

//=======================

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Save the image file to the local computer
//-------------------------------------------------------------------------------------------------
function getBase64Image(img) {
  let retVal = "none";

  if(img.src.indexOf("http") != -1 || img.src.indexOf("/svg+xml;") != -1){
    var canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    retVal = canvas.toDataURL("image/png");
  }

  return retVal;
}
//-------------------------------------------------------------------------------------------------


const setSubmitButtonDisable = (disableState) => {
  if (disableState) { $(".ui.positive.button").prop('disabled', true); }
  else{ $(".ui.positive.button").prop('disabled', false); }
}

//-------------------------------------------------------------------------------------------------
// The ReduxForm Module for this specific view and Visualisation Component
//-------------------------------------------------------------------------------------------------
const ImageViewForm = (props) => {

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
  initialValues.options.cssFilters = {...defaultOptions.cssFilters, ...(initialValues.options.cssFilters) };
  initialValues.options.skImg = {...defaultOptions.skImg, ...(initialValues.options.skImg) };

  // Make sure that older versions of imageView loads without any problem and that empty values will not cause any problems
  if(!initialValues.options.imgData && initialValues.data && initialValues.data.data){ initialValues.options.imgData = initialValues.data.data; }

  // input managers
  const fileChange = e => {
    var file = e.target.files[0]; // File object
    var reader = new FileReader();

    reader.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        props.change('options.imgData', evt.target.result);
        $('#imgThumb').attr("src", evt.target.result);
        $('#imgPreview').attr("src", evt.target.result);
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
    $('#imgPreview').attr("src", event);
    props.change('options.imgData', event);

    if(event.indexOf(";base64") == -1){
      if(event == ""){
        props.change('options.title', "");
        props.change('options.caption', "");
      }
      else{
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
    if(initialValues.options.imgData != undefined && $('#imgThumb').attr("src") == noImg){
      $('#imgThumb').attr("src", initialValues.options.imgData);
      $('#imgPreview').attr("src", initialValues.options.imgData);
      try {
        fileName = initialValues.options.imgData.substring(initialValues.options.imgData.lastIndexOf('/')+1);
        if(currentImgTitle != "" && fileName.indexOf(".png") == -1 && fileName.indexOf(".jpg") == -1 && fileName.indexOf(".jpeg") == -1 && fileName.indexOf(".gif") == -1){
          fileName = currentImgTitle;
        }
      } catch (error) { }
    }
  });

  // CSS Filters and SciKit Image Processing --------------------------------------------
  const [cssFilterEnabled, toggleCSSFilterEnabled] = useState( initialValues.options.cssFilters.isEnabled );
  const [grayscaleValue, setGrayscaleValue] = useState( parseInt(initialValues.options.cssFilters.grayscaleVal) );
  const [blurValue, setBlurValue] = useState( parseInt(initialValues.options.cssFilters.blurVal) );
  const [brightnessValue, setBrightnessValue] = useState( parseInt(initialValues.options.cssFilters.brightnessVal) );
  const [contrastValue, setContrastValue] = useState( parseInt(initialValues.options.cssFilters.contrastVal) );
  const [hueRotateValue, setHueRotateValue] = useState( parseInt(initialValues.options.cssFilters.hueRotateVal) );
  const [invertValue, setInvertValue] = useState( parseInt(initialValues.options.cssFilters.invertVal) );
  const [saturateValue, setSaturateValue] = useState( parseInt(initialValues.options.cssFilters.saturateVal) );
  const [sepiaValue, setSepiaValue] = useState( parseInt(initialValues.options.cssFilters.sepiaVal) );
  const [opacityValue, setOpacityValue] = useState( parseInt(initialValues.options.cssFilters.opacityVal));
  // ----------------------------------------------------------------------------------------

  // SciKit Image Processing --------------------------------------------
  const [skImgEnabled, toggleSKImgEnabled] = useState( initialValues.options.skImg.isEnabled );
  const [skImgGrayscaleEnabled, toggleSKImgGrayscaleEnabled] = useState( initialValues.options.skImg.grayscaleEnabled );

  const [skImgRotateEnabled, toggleSKImgRotateEnabled] = useState( initialValues.options.skImg.rotateEnabled );
  if(!initialValues.options.skImg.rotateAngle){ initialValues.options.skImg.rotateAngle = 0 };
  if(!initialValues.options.skImg.rotateResizeEnable){ initialValues.options.skImg.rotateResizeEnable = false };

  const [skImgEdgeDetectEnabled, toggleSKImgEdgeDetectEnabled] = useState( initialValues.options.skImg.edgeDetectEnabled );
  if(!initialValues.options.skImg.edgeDetectSigma){ initialValues.options.skImg.edgeDetectSigma = 1.0 };

  const [skImgColorTintEnabled, toggleSKImgColorTintEnabled] = useState( initialValues.options.skImg.colorTintEnabled );
  if(!initialValues.options.skImg.colorTintColor){ initialValues.options.skImg.colorTintColor = "Red" };

  const [skImgInvertEnabled, toggleSKImgInvertEnabled] = useState( initialValues.options.skImg.invertEnabled );

  const [skImgGammaChangeEnabled, toggleSKImgGammaChangeEnabled] = useState( initialValues.options.skImg.gammaChangeEnabled );
  if(!initialValues.options.skImg.gammaValue){ initialValues.options.skImg.gammaValue = 1.0 };

  const [skImgEnhanceContrastEnabled, toggleSKImgEnhanceContrastEnabled] = useState( initialValues.options.skImg.enhanceContrastEnabled );
  if(!initialValues.options.skImg.enhanceContrastClipLimitValue){ initialValues.options.skImg.enhanceContrastClipLimitValue = 0.05 };

  const [skImgSharpenEnabled, toggleSKImgSharpenEnabled] = useState( initialValues.options.skImg.sharpenEnabled );
  if(!initialValues.options.skImg.sharpenRadiusValue){ initialValues.options.skImg.sharpenRadiusValue = 3 };
  if(!initialValues.options.skImg.sharpenAmountValue){ initialValues.options.skImg.sharpenAmountValue = 1 };

  const [skImgDenoiseEnabled, toggleSKImgDenoiseEnabled] = useState( initialValues.options.skImg.denoiseEnabled );

  const [skImgErosionEnabled, toggleSKImgErosionEnabled] = useState( initialValues.options.skImg.erosionEnabled );
  if(!initialValues.options.skImg.erosionOpt){ initialValues.options.skImg.erosionOpt = "Erosion" };

  const [skImgHueSatValEnabled, toggleSKImgHueSatValEnabled] = useState( initialValues.options.skImg.hueSatValEnabled );
  if(!initialValues.options.skImg.HSV_HueValue){ initialValues.options.skImg.HSV_HueValue = 0 }else{ $("#hueValDisp").text(initialValues.options.skImg.HSV_HueValue); };
  if(!initialValues.options.skImg.HSV_SaturationValue){ initialValues.options.skImg.HSV_SaturationValue = 0 }else{ $("#satValDisp").text(initialValues.options.skImg.HSV_SaturationValue); };
  if(!initialValues.options.skImg.HSV_ValueValue){ initialValues.options.skImg.HSV_ValueValue = 0; }else{ $("#valValDisp").text(initialValues.options.skImg.HSV_ValueValue); };

  const [skImgRegionMaxFilterEnabled, toggleSKImgRegionMaxFilterEnabled] = useState( initialValues.options.skImg.regionMaxFilterEnabled );

  const [skImgConvexHullEnabled, toggleSKImgConvexHullEnabled] = useState( initialValues.options.skImg.convexHullEnabled );

  const [skImgRidgeDetectionEnabled, toggleSKImgRidgeDetectionEnabled] = useState( initialValues.options.skImg.ridgeDetectionEnabled );
  if(!initialValues.options.skImg.ridgeDetectionFilter){ initialValues.options.skImg.ridgeDetectionFilter = "Meijering" };

  const [skImgSwirlEnabled, toggleSKImgSwirlEnabled] = useState( initialValues.options.skImg.swirlEnabled );
  if(!initialValues.options.skImg.swirlStrengthValue){ initialValues.options.skImg.swirlStrengthValue = 0 };
  if(!initialValues.options.skImg.swirlRadiusValue){ initialValues.options.skImg.swirlRadiusValue = 0 };

  const [skImgRAGThresholdEnabled, toggleSKImgRAGThresholdEnabled] = useState( initialValues.options.skImg.ragThresholdEnabled );
  if(!initialValues.options.skImg.ragThresholdVersion){ initialValues.options.skImg.ragThresholdVersion = "Threshold 1" };

  const [skImgThresholdingEnabled, toggleSKImgThresholdingEnabled] = useState( initialValues.options.skImg.thresholdingEnabled );
  if(!initialValues.options.skImg.thresholdingVersion){ initialValues.options.skImg.thresholdingVersion = "Multi-Otsu" };

  const [skImgCVSegmentationEnabled, toggleSKImgCVSegmentationEnabled] = useState( initialValues.options.skImg.CVSegmentationEnabled );

  const [skImgSwitchColorEnabled, toggleSKImgSwitchColorEnabled] = useState( initialValues.options.skImg.switchColorEnabled );
  if(!initialValues.options.skImg.switchColorFromColor){ initialValues.options.skImg.switchColorFromColor = "#ffffff" };
  if(!initialValues.options.skImg.switchColorToColor){ initialValues.options.skImg.switchColorToColor = "#000000" };

  const [skImgFlipEnabled, toggleSKImgFlipEnabled] = useState( initialValues.options.skImg.flipEnabled );
  if(!initialValues.options.skImg.flipHorizontallyEnabled){ initialValues.options.skImg.flipHorizontallyEnabled = false };
  if(!initialValues.options.skImg.flipVerticallyEnabled){ initialValues.options.skImg.flipVerticallyEnabled = false };

  const [skImgCircleFrameEnabled, toggleSKImgCircleFrameEnabled] = useState( initialValues.options.skImg.circleFrameEnabled );
  const [circleFrameCenterH, setCircleFrameCenterH] = useState( parseInt(initialValues.options.skImg.circleFrameCenterH) );
  const [circleFrameCenterV, setCircleFrameCenterV] = useState( parseInt(initialValues.options.skImg.circleFrameCenterV) );
  const [circleFrameRadius, setCircleFrameRadius] = useState( parseInt(initialValues.options.skImg.circleFrameRadius) );

  const [skImgSkeletonizeEnabled, toggleSKImgSkeletonizeEnabled] = useState( initialValues.options.skImg.skeletonizeEnabled );

  const [skImgObjectDetectionEnabled, toggleSKImgObjectDetectionEnabled] = useState( initialValues.options.skImg.objectDetectionEnabled );
  // ----------------------------------------------------------------------------------------


  const [currentImgTitle, setImgTitle] = useState( initialValues.options.title );
  const [currentImgCapt, setImgCapt] = useState( initialValues.options.caption );

  const onImgTitleChange = (event) => { setImgTitle(event); };
  const onImgCaptChange = (event) => { setImgCapt(event); };

  const imageHasLoaded = (event) => {
    if(event.target.src != blockedImg){
      setSubmitButtonDisable(false);
      props.change('options.backupBlob', (initialValues.options.skImg.isEnabled ? getBase64Image($('#imgThumb')[0]) : "none"));
      imageSize = {w: $('#imgThumb')[0].naturalWidth, h: $('#imgThumb')[0].naturalHeight}
      props.change('options.skImg.circleFrameCenterH', ((parseInt(initialValues.options.skImg.circleFrameCenterH) == -1 || initialValues.options.skImg.circleFrameCenterH > imageSize.w) ? parseInt(imageSize.w/2) : parseInt(initialValues.options.skImg.circleFrameCenterH)));
      props.change('options.skImg.circleFrameCenterV', ((parseInt(initialValues.options.skImg.circleFrameCenterV) == -1 || initialValues.options.skImg.circleFrameCenterV > imageSize.h) ? parseInt(imageSize.h/2) : parseInt(initialValues.options.skImg.circleFrameCenterV)));
      props.change('options.skImg.circleFrameRadius', ((parseInt(initialValues.options.skImg.circleFrameRadius) == -1) ? parseInt(Math.min(imageSize.w, imageSize.h)/2) : parseInt(initialValues.options.skImg.circleFrameRadius)));
    }
    else{
      props.change('options.title', "");
      props.change('options.caption', "");
    }
  };

  const imageHasNotLoaded = (event) => {
    var failedSrc = event.target.src;
    $('#imgThumb').attr("src", blockedImg);
    setSubmitButtonDisable(true);
  }


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
            name="options.imgData"
          />
        </Form.Field>
        <Form.Field width={4}>
          <img width="100%" id="imgThumb" src={noImg} crossOrigin="anonymous" onLoad={imageHasLoaded} onError={imageHasNotLoaded}/>
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

      <Form.Group>
        <Form.Field width={4}>
          <label>Enable SciKit Image Processing:</label>
          <Field
            name="options.skImg.isEnabled"
            component={SemCheckbox}
            toggle
            onChange={(e, data) => { toggleSKImgEnabled(data); props.change('options.backupBlob', (data ? getBase64Image($('#imgThumb')[0]) : "none")); }}
          />
        </Form.Field>
        {skImgEnabled && <div>
          <Form.Field>
            <label>Apply to current (and not original) <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content='This will not affect any duplicates made from this component. A duplicate will only apply the current settings.' size='small' />:</label>
            <Field
              name="options.skImg.applyToCurrentEnable"
              component={SemCheckbox}
              toggle
            />
          </Form.Field>
        </div>}
      </Form.Group>

      {skImgEnabled && <div>
        <Form.Group>
          <Form.Field width={3}>
            <label>Grayscale:</label>
            <Field
              name="options.skImg.grayscaleEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgGrayscaleEnabled(data); }}
            />
          </Form.Field>
          <Form.Field width={3}>
            <label>Rotate:</label>
            <Field
              name="options.skImg.rotateEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgRotateEnabled(data); }}
            />
            {skImgRotateEnabled && <div>
              <Form.Field>
                <label>Angle:</label>
                <Field
                  fluid
                  name="options.skImg.rotateAngle"
                  component={inputTrad}
                  type="number"
                  min={-360}
                  max={360}
                />
              </Form.Field>
              <Form.Field>
                <label>Resize?</label>
                <Field
                  name="options.skImg.rotateResizeEnable"
                  component={SemCheckbox}
                  toggle
                />
              </Form.Field>
            </div>}
          </Form.Field>
          <Form.Field width={3}>
            <label>Edge Detect <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content='Canny edge detection algorithm' size='small' />:</label>
            <Field
              name="options.skImg.edgeDetectEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgEdgeDetectEnabled(data); }}
            />
            {skImgEdgeDetectEnabled && <div>
              <Form.Field>
                <label>Sigma:</label>
                <Field
                  fluid
                  name="options.skImg.edgeDetectSigma"
                  component={inputTrad}
                  type="number"
                  step={0.1}
                />
              </Form.Field>
            </div>}
          </Form.Field>
          <Form.Field width={3}>
            <label>Color Tint:</label>
            <Field
              name="options.skImg.colorTintEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgColorTintEnabled(data); }}
            />
            {skImgColorTintEnabled && <div>
              <Field
                styleMaker={(selVal) => { return {backgroundColor: selVal.toLowerCase()}; }}
                name="options.skImg.colorTintColor"
                component={SemanticDropdown}
                placeholder='Red'
                options={getDropdownOptionsWBkgColor(colorTints)}
              />
            </div>}
          </Form.Field>
          <Form.Field width={3}>
            <label>Invert Colors:</label>
            <Field
              name="options.skImg.invertEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgInvertEnabled(data); }}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group>
          <Form.Field width={3}>
            <label>Gamma Change:</label>
            <Field
              name="options.skImg.gammaChangeEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgGammaChangeEnabled(data); }}
            />
            {skImgGammaChangeEnabled && <div>
              <Form.Field>
                <label>Gamma <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content='Lower than 1 = Lighter, Higher than 1 = Darker' size='small' />:</label>
                <Field
                  fluid
                  name="options.skImg.gammaValue"
                  component={inputTrad}
                  type="number"
                  step={0.01}
                />
              </Form.Field>
            </div>}
          </Form.Field>
          <Form.Field width={3}>
            <label>Enhance Contrast:</label>
            <Field
              name="options.skImg.enhanceContrastEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgEnhanceContrastEnabled(data); }}
            />
            {skImgEnhanceContrastEnabled && <div>
              <Form.Field>
                <label>Clip Limit <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content='Value Between 0 and 1. The highet, the stronger contrast.' size='small' />:</label>
                <Field
                  fluid
                  name="options.skImg.enhanceContrastClipLimitValue"
                  component={inputTrad}
                  type="number"
                  step={0.01}
                />
              </Form.Field>
            </div>}
          </Form.Field>
          <Form.Field width={3}>
            <label>Sharpen:</label>
            <Field
              name="options.skImg.sharpenEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgSharpenEnabled(data); }}
            />
            {skImgSharpenEnabled && <div>
              <Form.Field>
                <label>Radius <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content='Determines how many pixels should be included to enhance the contrast.' size='small' />:</label>
                <Field
                  fluid
                  name="options.skImg.sharpenRadiusValue"
                  component={inputTrad}
                  type="number"
                  step={0.1}
                  min={0}
                />
              </Form.Field>
              <Form.Field>
                <label>Amount <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content='Details will be amplified with this factor. The factor could be 0 or negative. Typically, it is a small positive number, e.g. 1.0' size='small' />:</label>
                <Field
                  fluid
                  name="options.skImg.sharpenAmountValue"
                  component={inputTrad}
                  type="number"
                  step={0.1}
                />
              </Form.Field>
            </div>}
          </Form.Field>
          <Form.Field width={3}>
            <label>Denoise:</label>
            <Field
              name="options.skImg.denoiseEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgDenoiseEnabled(data); }}
            />
          </Form.Field>
          <Form.Field width={4}>
            <label>Erosion, Holes & Peaks:</label>
            <Field
              name="options.skImg.erosionEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgErosionEnabled(data); }}
            />
            {skImgErosionEnabled && <div>
              <Field
                styleMaker={(selVal) => { return {backgroundColor: selVal.toLowerCase()}; }}
                name="options.skImg.erosionOpt"
                component={SemanticDropdown}
                options={getDropdownOptionsWBkgColor(erosionOpts)}
              />
            </div>}
          </Form.Field>
        </Form.Group>
        <Form.Group>
          <Form.Field width={3}>
            <label>HSV:</label>
            <Field
              name="options.skImg.hueSatValEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgHueSatValEnabled(data); }}
            />
            {skImgHueSatValEnabled && <div>
              <Form.Field>
                <label>Hue: <span id="hueValDisp">0</span></label>
                <Field
                  id='gurka'
                  fluid
                  name="options.skImg.HSV_HueValue"
                  component={inputTrad}
                  type="range"
                  step={0.1}
                  min={-1}
                  max={1}
                  onChange={(e, data) => { $("#hueValDisp").text(data); }}
                />
              </Form.Field>
              <Form.Field>
                <label>Saturation: <span id="satValDisp">0</span></label>
                <Field
                  fluid
                  name="options.skImg.HSV_SaturationValue"
                  component={inputTrad}
                  type="range"
                  step={0.1}
                  min={-1}
                  max={1}
                  onChange={(e, data) => { $("#satValDisp").text(data); }}
                />
              </Form.Field>
              <Form.Field>
                <label>Value: <span id="valValDisp">0</span></label>
                <Field
                  fluid
                  name="options.skImg.HSV_ValueValue"
                  component={inputTrad}
                  type="range"
                  step={0.1}
                  min={-10}
                  max={10}
                  onChange={(e, data) => { $("#valValDisp").text(data); }}
                />
              </Form.Field>
            </div>}
          </Form.Field>
          <Form.Field width={3}>
            <label>Regional Maxima Filter:</label>
            <Field
              name="options.skImg.regionMaxFilterEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgRegionMaxFilterEnabled(data); }}
            />
          </Form.Field>
          <Form.Field width={3}>
            <label>Convex Hull <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>🛈</span>} content='The convex hull of a binary image is the set of pixels included in the smallest convex polygon that surround all white pixels in the input.' size='small' />:</label>
            <Field
              name="options.skImg.convexHullEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgConvexHullEnabled(data); }}
            />
          </Form.Field>
          <Form.Field width={3}>
            <label>Ridge Detection:</label>
            <Field
              name="options.skImg.ridgeDetectionEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgRidgeDetectionEnabled(data); }}
            />
            {skImgRidgeDetectionEnabled && <div>
              <Field
                styleMaker={(selVal) => { return {backgroundColor: selVal.toLowerCase()}; }}
                name="options.skImg.ridgeDetectionFilter"
                component={SemanticDropdown}
                options={getDropdownOptionsWBkgColor(ridgeDetectOpts)}
              />
            </div>}
          </Form.Field>
          <Form.Field width={3}>
            <label>Swirl:</label>
            <Field
              name="options.skImg.swirlEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgSwirlEnabled(data); }}
            />
            {skImgSwirlEnabled && <div>
              <Form.Field>
                <label>Strength:</label>
                <Field
                  fluid
                  name="options.skImg.swirlStrengthValue"
                  component={inputTrad}
                  type="number"
                  step={0.1}
                  min={0}
                />
              </Form.Field>
              <Form.Field>
                <label>Radius:</label>
                <Field
                  fluid
                  name="options.skImg.swirlRadiusValue"
                  component={inputTrad}
                  type="number"
                  step={0.1}
                  min={0}
                />
              </Form.Field>
            </div>}
          </Form.Field>
        </Form.Group>
        <Form.Group>
          <Form.Field width={3}>
            <label>RAG:</label>
            <Field
              name="options.skImg.ragThresholdEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgRAGThresholdEnabled(data); }}
            />
            {skImgRAGThresholdEnabled && <div>
              <Field
                styleMaker={(selVal) => { return {backgroundColor: selVal.toLowerCase()}; }}
                name="options.skImg.ragThresholdVersion"
                component={SemanticDropdown}
                options={getDropdownOptionsWBkgColor(ragVersionOpts)}
              />
            </div>}
          </Form.Field>
          <Form.Field width={3}>
            <label>Thresholding:</label>
            <Field
              name="options.skImg.thresholdingEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgThresholdingEnabled(data); }}
            />
            {skImgThresholdingEnabled && <div>
              <Field
                styleMaker={(selVal) => { return {backgroundColor: selVal.toLowerCase()}; }}
                name="options.skImg.thresholdingVersion"
                component={SemanticDropdown}
                options={getDropdownOptionsWBkgColor(thresholdingVersionOpts)}
              />
            </div>}
          </Form.Field>
          <Form.Field width={3}>
            <label>Chan-Vese Segmentation:</label>
            <Field
              name="options.skImg.CVSegmentationEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgCVSegmentationEnabled(data); }}
            />
          </Form.Field>
          <Form.Field width={3}>
            <label>Switch Color:</label>
            <Field
              name="options.skImg.switchColorEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgSwitchColorEnabled(data); }}
            />
            {skImgSwitchColorEnabled && <div>
              <Form.Field>
                <label>From Color:</label>
                <Field
                  fluid
                  name="options.skImg.switchColorFromColor"
                  component={inputTrad}
                  type="color"
                />
              </Form.Field>
              <Form.Field>
                <label>To Color:</label>
                <Field
                  fluid
                  name="options.skImg.switchColorToColor"
                  component={inputTrad}
                  type="color"
                />
              </Form.Field>
            </div>}
          </Form.Field>
          <Form.Field width={3}>
            <label>Flip:</label>
            <Field
              name="options.skImg.flipEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgFlipEnabled(data); }}
            />
            {skImgFlipEnabled && <div>
              <Form.Field>
                <label>Horizontally:</label>
                <Field
                  name="options.skImg.flipHorizontallyEnabled"
                  component={SemCheckbox}
                  toggle
                />
              </Form.Field>
              <Form.Field>
                <label>Vertically:</label>
                <Field
                  name="options.skImg.flipVerticallyEnabled"
                  component={SemCheckbox}
                  toggle
                />
              </Form.Field>
            </div>}
          </Form.Field>
        </Form.Group>
        <Form.Group>
         <Form.Field width={3}>
            <label>Circle Frame:</label>
            <Field
              name="options.skImg.circleFrameEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgCircleFrameEnabled(data); }}
            />
            {skImgCircleFrameEnabled && <div>
              <Form.Field>
                <label>Center Horiz: <span style={{marginLeft: "20px", color: "#0066b2", border: "#0066b2 solid 1px", cursor: "pointer"}} onClick={(e) => { var newVal = parseInt(imageSize.w/2); setCircleFrameCenterH(newVal); props.change('options.skImg.circleFrameCenterH', newVal); }}>Reset</span></label>
                <Field
                  fluid
                  name="options.skImg.circleFrameCenterH"
                  component={inputTrad}
                  type="number"
                  step={1}
                  min={0}
                  max={parseInt(imageSize.w)}
                  onChange={(e, data) => { setCircleFrameCenterH(data); }}
                />
              </Form.Field>
              <Form.Field>
                <label>Center Vert: <span style={{marginLeft: "20px", color: "#0066b2", border: "#0066b2 solid 1px", cursor: "pointer"}} onClick={(e) => { var newVal = parseInt(imageSize.h/2); setCircleFrameCenterV(newVal); props.change('options.skImg.circleFrameCenterV', newVal); }}>Reset</span></label>
                <Field
                  fluid
                  name="options.skImg.circleFrameCenterV"
                  component={inputTrad}
                  type="number"
                  step={1}
                  min={0}
                  max={parseInt(imageSize.h)}
                  onChange={(e, data) => { setCircleFrameCenterV(data); }}
                />
              </Form.Field>
              <Form.Field>
                <label>Radius: <span style={{marginLeft: "20px", color: "#0066b2", border: "#0066b2 solid 1px", cursor: "pointer"}} onClick={(e) => { var newVal = parseInt(Math.min(imageSize.w, imageSize.h)/2); setCircleFrameRadius(newVal); props.change('options.skImg.circleFrameRadius', newVal); }}>Reset</span></label>
                <Field
                  fluid
                  name="options.skImg.circleFrameRadius"
                  component={inputTrad}
                  type="number"
                  step={1}
                  min={0}
                  onChange={(e, data) => { setCircleFrameRadius(data); }}
                />
              </Form.Field>
            </div>}
          </Form.Field>
          <Form.Field width={3}>
            <label>Skeletonize:</label>
            <Field
              name="options.skImg.skeletonizeEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgSkeletonizeEnabled(data); }}
            />
          </Form.Field>
          <Form.Field width={3}>
            <label>Object Detection:</label>
            <Field
              name="options.skImg.objectDetectionEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgObjectDetectionEnabled(data); }}
            />
          </Form.Field>
        </Form.Group>
      </div>}

      <hr />

{/* ***** SciKit Image Above *****
========================================================================================================================================================================================================================================================
***** CSS FiltersBelow *****       */}

      <Form.Group>
        <Form.Field width={12}>
          <label>Enable CSS Image Filter:</label>
          <Field
            name="options.cssFilters.isEnabled"
            component={SemCheckbox}
            toggle
            onChange={(e, data) => { toggleCSSFilterEnabled(data); }}
          />
        </Form.Field>
        <Form.Field width={4}>
          <img width="100%" id="imgPreview" src={noImg} style={{
              visibility: (cssFilterEnabled ? "visible" : "hidden"),
              maxHeight: (cssFilterEnabled ? "none" : "0px"),
              filter: "grayscale(" + grayscaleValue + "%) blur(" + blurValue + "px) brightness(" + brightnessValue + "%) contrast(" + contrastValue + "%) hue-rotate(" + hueRotateValue + "deg) invert(" + invertValue + "%) saturate(" + saturateValue + "%) sepia(" + sepiaValue + "%) opacity(" + opacityValue + "%)"
            }} />
        </Form.Field>
      </Form.Group>

      {cssFilterEnabled && <div>
        <Form.Group>
          <Form.Field width={4}>
            <label>Grayscale (0-100%):</label>
            <Field
              fluid
              name="options.cssFilters.grayscaleVal"
              component={inputTrad}
              style={{width: "100%"}}
              type="range"
              min="0"
              max="100"
              onChange={(e, data) => { setGrayscaleValue(data); }}
            />
            <span style={{display: "inline-block", width: "50px"}}>{grayscaleValue + "%"}</span><span style={{marginLeft: "20px", color: "#0066b2", border: "#0066b2 solid 1px", cursor: "pointer"}} onClick={(e) => { setGrayscaleValue(0); props.change('options.cssFilters.grayscaleVal', 0); }}>Reset</span>
          </Form.Field>
          <Form.Field width={4}>
            <label>Contrast (0-300%):</label>
            <Field
              fluid
              name="options.cssFilters.contrastVal"
              component={inputTrad}
              style={{width: "100%"}}
              type="range"
              min="0"
              max="300"
              onChange={(e, data) => { setContrastValue(data); }}
            />
            <span style={{display: "inline-block", width: "50px"}}>{contrastValue + "%"}</span><span style={{marginLeft: "20px", color: "#0066b2", border: "#0066b2 solid 1px", cursor: "pointer"}} onClick={(e) => { setContrastValue(100); props.change('options.cssFilters.contrastVal', 100); }}>Reset</span>
          </Form.Field>
          <Form.Field width={4}>
            <label>Hue Rotate (0-360 ):</label>
            <Field
              fluid
              name="options.cssFilters.hueRotateVal"
              component={inputTrad}
              style={{width: "100%"}}
              type="range"
              min="0"
              max="360"
              onChange={(e, data) => { setHueRotateValue(data); }}
            />
            <span style={{display: "inline-block", width: "50px"}}>{hueRotateValue + "°"}</span><span style={{marginLeft: "20px", color: "#0066b2", border: "#0066b2 solid 1px", cursor: "pointer"}} onClick={(e) => { setHueRotateValue(0); props.change('options.cssFilters.hueRotateVal', 0); }}>Reset</span>
          </Form.Field>
          <Form.Field width={4}>
            <label>Brightness (0-500%):</label>
            <Field
              fluid
              name="options.cssFilters.brightnessVal"
              component={inputTrad}
              style={{width: "100%"}}
              type="range"
              min="0"
              max="500"
              onChange={(e, data) => { setBrightnessValue(data); }}
            />
            <span style={{display: "inline-block", width: "50px"}}>{brightnessValue + "%"}</span><span style={{marginLeft: "20px", color: "#0066b2", border: "#0066b2 solid 1px", cursor: "pointer"}} onClick={(e) => { setBrightnessValue(100); props.change('options.cssFilters.brightnessVal', 100); }}>Reset</span>
          </Form.Field>
        </Form.Group>

        <Form.Group>
          <Form.Field width={4}>
            <label>Invert (0-100%):</label>
            <Field
              fluid
              name="options.cssFilters.invertVal"
              component={inputTrad}
              style={{width: "100%"}}
              type="range"
              min="0"
              max="100"
              onChange={(e, data) => { setInvertValue(data); }}
            />
            <span style={{display: "inline-block", width: "50px"}}>{invertValue + "%"}</span><span style={{marginLeft: "20px", color: "#0066b2", border: "#0066b2 solid 1px", cursor: "pointer"}} onClick={(e) => { setInvertValue(0); props.change('options.cssFilters.invertVal', 0); }}>Reset</span>
          </Form.Field>
          <Form.Field width={4}>
            <label>Saturate (0-300%):</label>
            <Field
              fluid
              name="options.cssFilters.saturateVal"
              component={inputTrad}
              style={{width: "100%"}}
              type="range"
              min="0"
              max="300"
              onChange={(e, data) => { setSaturateValue(data); }}
            />
            <span style={{display: "inline-block", width: "50px"}}>{saturateValue + "%"}</span><span style={{marginLeft: "20px", color: "#0066b2", border: "#0066b2 solid 1px", cursor: "pointer"}} onClick={(e) => { setSaturateValue(100); props.change('options.cssFilters.saturateVal', 100); }}>Reset</span>
          </Form.Field>
          <Form.Field width={4}>
            <label>Sepia (0-100%):</label>
            <Field
              fluid
              name="options.cssFilters.sepiaVal"
              component={inputTrad}
              style={{width: "100%"}}
              type="range"
              min="0"
              max="100"
              onChange={(e, data) => { setSepiaValue(data); }}
            />
            <span style={{display: "inline-block", width: "50px"}}>{sepiaValue + "%"}</span><span style={{marginLeft: "20px", color: "#0066b2", border: "#0066b2 solid 1px", cursor: "pointer"}} onClick={(e) => { setSepiaValue(0); props.change('options.cssFilters.sepiaVal', 0); }}>Reset</span>
          </Form.Field>
          <Form.Field width={4} >
            <label>Blur (0-100 px):</label>
            <Field
              fluid
              name="options.cssFilters.blurVal"
              component={inputTrad}
              style={{width: "100%"}}
              type="range"
              min="0"
              max="100"
              onChange={(e, data) => { setBlurValue(data); }}
            />
            <span style={{display: "inline-block", width: "50px"}}>{blurValue + "px"}</span><span style={{marginLeft: "20px", color: "#0066b2", border: "#0066b2 solid 1px", cursor: "pointer"}} onClick={(e) => { setBlurValue(0); props.change('options.cssFilters.blurVal', 0); }}>Reset</span>
          </Form.Field>
        </Form.Group>

        <Form.Group>
          <Form.Field width={4}>
            <label>Opacity (0-100%):</label>
            <Field
              fluid
              name="options.cssFilters.opacityVal"
              component={inputTrad}
              style={{width: "100%"}}
              type="range"
              min="0"
              max="100"
              onChange={(e, data) => { setOpacityValue(data); }}
            />
            <span style={{display: "inline-block", width: "50px"}}>{opacityValue + "%"}</span><span style={{marginLeft: "20px", color: "#0066b2", border: "#0066b2 solid 1px", cursor: "pointer"}} onClick={(e) => { setOpacityValue(100); props.change('options.cssFilters.opacityVal', 100); }}>Reset</span>
          </Form.Field>
        </Form.Group>
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
  form: 'ImageView',
})(ImageViewForm);
//-------------------------------------------------------------------------------------------------
