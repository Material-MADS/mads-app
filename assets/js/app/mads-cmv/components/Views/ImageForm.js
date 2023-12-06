/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
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

// Info Help Images
import info_grayscale from './images/ImageView/info_scikitimg_grayscale.png';
import info_rotate1 from './images/ImageView/info_scikitimg_rotate1.png';
import info_rotate2 from './images/ImageView/info_scikitimg_rotate2.png';
import info_cannyedge1 from './images/ImageView/info_scikitimg_cannyedge1.png';
import info_cannyedge2 from './images/ImageView/info_scikitimg_cannyedge2.png';
import info_colortint from './images/ImageView/info_scikitimg_colortint.png';
import info_invertcolor from './images/ImageView/info_scikitimg_invertcolor.png';
import info_gamma1 from './images/ImageView/info_scikitimg_gamma1.png';
import info_gamma2 from './images/ImageView/info_scikitimg_gamma2.png';
import info_contrast from './images/ImageView/info_scikitimg_contrast.png';
import info_sharpen from './images/ImageView/info_scikitimg_sharpen.png';
import info_denoise from './images/ImageView/info_scikitimg_denoise.png';
import info_erosion from './images/ImageView/info_scikitimg_erosion.png';
import info_hsv from './images/ImageView/info_scikitimg_hsv.png';
import info_regmaxfil from './images/ImageView/info_scikitimg_regmaxfil.png';
import info_convexhull from './images/ImageView/info_scikitimg_convexhull.png';
import info_ridgedetect1 from './images/ImageView/info_scikitimg_ridgedetect1.png';
import info_ridgedetect2 from './images/ImageView/info_scikitimg_ridgedetect2.png';
import info_swirl from './images/ImageView/info_scikitimg_twirl.png';
import info_rag from './images/ImageView/info_scikitimg_rag.png';
import info_thresholding from './images/ImageView/info_scikitimg_thresholding.png';
import info_chanvesesegm from './images/ImageView/info_scikitimg_chanvesesegm.png';
import info_switchcolor from './images/ImageView/info_scikitimg_switchcolor.png';
import info_flip from './images/ImageView/info_scikitimg_flip.png';
import info_circleframe from './images/ImageView/info_scikitimg_circleframe.png';
import info_skeletonize from './images/ImageView/info_scikitimg_skeletonize.png';
import info_objdetect from './images/ImageView/info_scikitimg_objdetect.png';
import info_contourfinding from './images/ImageView/info_scikitimg_contourfinding.png';
import info_florescent from './images/ImageView/info_scikitimg_florescent.png';


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
  if(!initialValues.options.skImg.switchColorExtendRangeValue){ initialValues.options.skImg.switchColorExtendRangeValue = 0 };

  const [skImgFlipEnabled, toggleSKImgFlipEnabled] = useState( initialValues.options.skImg.flipEnabled );
  if(!initialValues.options.skImg.flipHorizontallyEnabled){ initialValues.options.skImg.flipHorizontallyEnabled = false };
  if(!initialValues.options.skImg.flipVerticallyEnabled){ initialValues.options.skImg.flipVerticallyEnabled = false };

  const [skImgCircleFrameEnabled, toggleSKImgCircleFrameEnabled] = useState( initialValues.options.skImg.circleFrameEnabled );
  const [circleFrameCenterH, setCircleFrameCenterH] = useState( parseInt(initialValues.options.skImg.circleFrameCenterH) );
  const [circleFrameCenterV, setCircleFrameCenterV] = useState( parseInt(initialValues.options.skImg.circleFrameCenterV) );
  const [circleFrameRadius, setCircleFrameRadius] = useState( parseInt(initialValues.options.skImg.circleFrameRadius) );

  const [skImgSkeletonizeEnabled, toggleSKImgSkeletonizeEnabled] = useState( initialValues.options.skImg.skeletonizeEnabled );

  const [skImgObjectDetectionEnabled, toggleSKImgObjectDetectionEnabled] = useState( initialValues.options.skImg.objectDetectionEnabled );

  const [skImgContourFindingEnabled, toggleSKImgContourFindingEnabled] = useState( initialValues.options.skImg.contourFindingEnabled );
  if(!initialValues.options.skImg.contourFindingLevel){ initialValues.options.skImg.contourFindingLevel = 0.8 };
  if(!initialValues.options.skImg.contourOnlyEnabled){ initialValues.options.skImg.contourOnlyEnabled = false };
  if(!initialValues.options.skImg.contourPoppingEnabled){ initialValues.options.skImg.contourPoppingEnabled = false };

  const [skImgFlorescentColorsEnabled, toggleSKImgFlorescentColorsEnabled] = useState( initialValues.options.skImg.florescentColorsEnabled );

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
          <label>Enable SciKit Image Processing<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>SciKit Image Library Info</h4>
                <p>
                  When enabled it allows the user to use a wide range of available SciKit Image algorithms directly out of the box without any hassle or additional setup. Just apply one or many with a few clicks and discover the world of image maipulation.<br />
                </p>
                <img src="https://scikit-image.org/_static/img/logo.png" alt="SciKit Image Logo" style={{width: "220px"}} />
              </Popup>
              :
            </label>
          <Field
            name="options.skImg.isEnabled"
            component={SemCheckbox}
            toggle
            onChange={(e, data) => { toggleSKImgEnabled(data); props.change('options.backupBlob', (data ? getBase64Image($('#imgThumb')[0]) : "none")); }}
          />
        </Form.Field>
        {skImgEnabled && <div>
          <Form.Field>
            <label>Apply to current (and not original)
              <Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>}
                size='small'
                wide='very'
              >
                <h4>When Order Matters</h4>
                <p>
                  Sometimes the effects of each algorithm's order matter. Just applying them according to the order of the list below might be fine, but sometimes you want to have more control and change that order by enabling this option, reset the settings and apply a new set on the already manipulated image.<br />
                  Just remember to save intermediate states of an image for later reference, since the workspace only saves the current form setting in total disregard of the image currently being affected in the work flow.
                </p>
              </Popup>
              :
            </label>
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
            <label>Grayscale<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/api/skimage.color.html#skimage.color.rgb2gray" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.color.rgba2rgb</h4>
                <p>
                  This algorithm change all RGB colors into different levels of gray.<br />
                  No Parameters Needed.
                </p>
                <img src={info_grayscale} alt="Grayscale Example" style={{width: "220px"}} />
              </Popup>
              :
              &nbsp;&nbsp;<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://en.wikipedia.org/wiki/Grayscale" target="_blank"><img src="https://en.wikipedia.org/static/images/icons/wikipedia.png" alt="Wikipedia Link" style={{width: "20px"}} /></a></span>} content='Wikipedia Link' size='small' />
            </label>
            <Field
              name="options.skImg.grayscaleEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgGrayscaleEnabled(data); }}
            />
          </Form.Field>
          <Form.Field width={3}>
            <label>Rotate<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/api/skimage.transform.html#rotate" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.transform.rotate</h4>
                <p>
                  This algorithm rotates the image number of degrees (counter clockwise) with the option to make the size fit within the rotation area.<br />
                  <b><u>Parameters:</u></b><br />
                  <b>Angle:</b> Degrees of rotation<br />
                  <b>Resize?:</b> original dimensions or not
                </p>
                <img src={info_rotate1} alt="Rotate 1 Example" style={{width: "220px"}} /><br />
                <img src={info_rotate2} alt="Rotate 2 Example" style={{width: "220px"}} />
              </Popup>
              :
            </label>
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
            <label>Edge Detection<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/api/skimage.feature.html#canny" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.feature.canny</h4>
                <p>
                  The Canny Edge Detection algorithm tries to detect all edges of an image and keep only them in white, while remove all the rest (in black).<br />
                  This edge detection algorithm, among many, is very popular due to its high accuracy.<br />
                  <b><u>Parameters:</u></b><br />
                  <b>Sigma:</b> Standard Deviation of the Gaussian filter. (0-∞, 1 is default. Lower Sigma have higher details while higher Sigma has less details.)
                </p>
                <img src={info_cannyedge1} alt="Canny Edge Detection 1 Example" style={{width: "220px"}} /><br />
                <img src={info_cannyedge2} alt="Canny Edge Detection 2 Example" style={{width: "220px"}} />
              </Popup>
              :
              &nbsp;&nbsp;<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://en.wikipedia.org/wiki/Canny_edge_detector" target="_blank"><img src="https://en.wikipedia.org/static/images/icons/wikipedia.png" alt="Wikipedia Link" style={{width: "20px"}} /></a></span>} content='Wikipedia Link' size='small' />
             </label>
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
                  min={0}
                />
              </Form.Field>
            </div>}
          </Form.Field>
          <Form.Field width={3}>
            <label>Color Tint<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/stable/auto_examples/color_exposure/plot_tinting_grayscale_images.html" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>Color Tinting</h4>
                <p>
                  Tinting images to one of a preset range of colors can only be done on images without an alpha (transparency) channel and images need to be gray. The grayness is applied automatically as long as the image is RGB without alpha.<br />
                  If the image turns all black it is usally due to an illegal transparency channel. In those cases the image need to be pre-processed, either in this tool (apply grayscale in advance) or any other tool, to strip it of the alpha.<br />
                  <b><u>Parameters:</u></b><br />
                  <b>Color:</b> One of six different base colors
                </p>
                <img src={info_colortint} alt="Color Tint Example" style={{width: "220px"}} />
              </Popup>
              :
              &nbsp;&nbsp;<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://en.wikipedia.org/wiki/Tint,_shade_and_tone" target="_blank"><img src="https://en.wikipedia.org/static/images/icons/wikipedia.png" alt="Wikipedia Link" style={{width: "20px"}} /></a></span>} content='Wikipedia Link' size='small' />
             </label>
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
            <label>Invert Colors<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/api/skimage.util.html#invert" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.util.invert</h4>
                <p>
                  Inverts the colors of an image.<br />
                  Color inversion is an effect that flips all colors to their opposite hue on the color wheel.<br />
                  No Parameters Needed
                </p>
                <img src={info_invertcolor} alt="Invert Color Example" style={{width: "220px"}} />
              </Popup>
              :
              &nbsp;&nbsp;<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://en.wikipedia.org/wiki/Color_wheel" target="_blank"><img src="https://en.wikipedia.org/static/images/icons/wikipedia.png" alt="Wikipedia Link" style={{width: "20px"}} /></a></span>} content='Wikipedia Link' size='small' />
             </label>
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
            <label>Gamma Change<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/api/skimage.exposure.html#adjust-gamma" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.exposure.adjust_gamma</h4>
                <p>
                  Gamma correction changes the illumination levels of an image and make it brighter or darker.<br />
                  <b><u>Parameters:</u></b><br />
                  <b>Gamma:</b> Lower than 1 = Lighter, Higher than 1 = Darker
                </p>
                <img src={info_gamma1} alt="Gamma Correction 1 Example" style={{width: "220px"}} /><br />
                <img src={info_gamma2} alt="Gamma Correction 2 Example" style={{width: "220px"}} />
              </Popup>
              :
              &nbsp;&nbsp;<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://en.wikipedia.org/wiki/Gamma_correction" target="_blank"><img src="https://en.wikipedia.org/static/images/icons/wikipedia.png" alt="Wikipedia Link" style={{width: "20px"}} /></a></span>} content='Wikipedia Link' size='small' />
             </label>
            <Field
              name="options.skImg.gammaChangeEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgGammaChangeEnabled(data); }}
            />
            {skImgGammaChangeEnabled && <div>
              <Form.Field>
                <label>Gamma <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Lower than 1 = Lighter, Higher than 1 = Darker' size='small' />:</label>
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
            <label>Enhance Contrast<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/api/skimage.exposure.html#equalize-adapthist" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.exposure.equalize_adapthist</h4>
                <p>
                  Change the contrast between lighter and darker colors in the image.<br />
                  <b><u>Parameters:</u></b><br />
                  <b>Clip Limit:</b> Value Between 0 and 1. The highet, the stronger contrast.
                </p>
                <img src={info_contrast} alt="Contrast Example" style={{width: "220px"}} />
              </Popup>
              :
              &nbsp;&nbsp;<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://en.wikipedia.org/wiki/Contrast_(vision)" target="_blank"><img src="https://en.wikipedia.org/static/images/icons/wikipedia.png" alt="Wikipedia Link" style={{width: "20px"}} /></a></span>} content='Wikipedia Link' size='small' />
             </label>
            <Field
              name="options.skImg.enhanceContrastEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgEnhanceContrastEnabled(data); }}
            />
            {skImgEnhanceContrastEnabled && <div>
              <Form.Field>
                <label>Clip Limit <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Value Between 0 and 1. The highet, the stronger contrast.' size='small' />:</label>
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
            <label>Sharpen<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/api/skimage.filters.html#unsharp-mask" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.filters.unsharp_mask</h4>
                <p>
                  Sharpens blurry parts of an image and make it more crisp<br />
                  <b><u>Parameters:</u></b><br />
                  <b>Radius:</b> Determines how many pixels should be included to enhance the contrast. (Below 1 basically makes no difference))<br />
                  <b>Amount:</b> Details will be amplified with this factor. The factor could be 0 or negative. Typically, it is a small positive number, e.g. 1.0
                </p>
                <img src={info_sharpen} alt="Sharpen Example" style={{width: "220px"}} />
              </Popup>
              :
              &nbsp;&nbsp;<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://en.wikipedia.org/wiki/Unsharp_masking" target="_blank"><img src="https://en.wikipedia.org/static/images/icons/wikipedia.png" alt="Wikipedia Link" style={{width: "20px"}} /></a></span>} content='Wikipedia Link' size='small' />
             </label>
            <Field
              name="options.skImg.sharpenEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgSharpenEnabled(data); }}
            />
            {skImgSharpenEnabled && <div>
              <Form.Field>
                <label>Radius <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Determines how many pixels should be included to enhance the contrast.' size='small' />:</label>
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
                <label>Amount <Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='Details will be amplified with this factor. The factor could be 0 or negative. Typically, it is a small positive number, e.g. 1.0' size='small' />:</label>
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
            <label>Denoise<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/api/skimage.restoration.html#denoise-bilateral" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.restoration.denoise_bilateral</h4>
                <p>
                  Makes a default attempt at denoising the image and remove fireflies and similiar specs that makes the image looks noisy<br />
                  No Parameters Needed
                </p>
                <img src={info_denoise} alt="Denoising Example" style={{width: "220px"}} />
              </Popup>
              :
              &nbsp;&nbsp;<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://en.wikipedia.org/wiki/Image_noise" target="_blank"><img src="https://en.wikipedia.org/static/images/icons/wikipedia.png" alt="Wikipedia Link" style={{width: "20px"}} /></a></span>} content='Wikipedia Link' size='small' />
             </label>
            <Field
              name="options.skImg.denoiseEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgDenoiseEnabled(data); }}
            />
          </Form.Field>
          <Form.Field width={4}>
            <label>Erosion, Holes & Peaks<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/api/skimage.morphology.html#reconstruction" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.morphology.reconstruction</h4>
                <p>
                  Erosion reconstruction is trying to flattening out shadows and highlights in an image and make it less strong in contrasts. Holes and Peaks options enhances shadowy areas or highlighted areas correspondingly.<br />
                  <b><u>Parameters:</u></b><br />
                  <b>Type:</b> Select one of three different approaches, for highlighting either holes (shadows) or peaks (highlights) in the image, or just smoothing out both with erosion.
                </p>
                <img src={info_erosion} alt="Erosion Example" style={{width: "220px"}} />
              </Popup>
              :
              &nbsp;&nbsp;<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://en.wikipedia.org/wiki/Digital_image_processing" target="_blank"><img src="https://en.wikipedia.org/static/images/icons/wikipedia.png" alt="Wikipedia Link" style={{width: "20px"}} /></a></span>} content='Wikipedia Link' size='small' />
             </label>
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
            <label>HSV<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/api/skimage.color.html#rgb2hsv" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.color.rgb2hsv</h4>
                <p>
                  HSV stands for Hue, Saturation and Value, which is way an alternative way of describing colors from e.g. RGB. <br />
                  <b><u>Parameters:</u></b><br />
                  <b>Hue:</b> Hue is the pure pigment from the dominant color family, without tint or shade. The value goes from -1 to 1 and represents the whole scale of colors.<br />
                  <b>Saturation:</b> The intensity of the color. The value goes from -1 to 1 where -1 is the brightest intensity and 1 is basically all gray.<br />
                  <b>Value:</b> represents a lightness value and tells us how light or dark the image is. 0 is no change, while lower is lighter and higher is darker.
                </p>
                <img src={info_hsv} alt="HSV Example" style={{width: "220px"}} />
              </Popup>
              :
              &nbsp;&nbsp;<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://en.wikipedia.org/wiki/HSL_and_HSV" target="_blank"><img src="https://en.wikipedia.org/static/images/icons/wikipedia.png" alt="Wikipedia Link" style={{width: "20px"}} /></a></span>} content='Wikipedia Link' size='small' />
             </label>
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
            <label>Regional Maxima<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/stable/auto_examples/color_exposure/plot_regional_maxima.html" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.morphology.reconstruction</h4>
                <p>
                  Regional maxima are connected components of pixels with a constant intensity value, surrounded by pixels with a lower value. This algorithm tries to find which areas and pixels are within the maxima and set all others to black.<br />
                  No Parameters Needed
                </p>
                <img src={info_regmaxfil} alt="Regional Maxima Filter Example" style={{width: "220px"}} />
              </Popup>
              :
             </label>
            <Field
              name="options.skImg.regionMaxFilterEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgRegionMaxFilterEnabled(data); }}
            />
          </Form.Field>
          <Form.Field width={3}>
            <label>Convex Hull<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/api/skimage.morphology.html#convex-hull-image" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.morphology.convex_hull_image</h4>
                <p>
                  he convex hull of a binary image is the set of pixels included in the smallest convex polygon that surround all white pixels in the input. It will basically replace the image foreground with a white polygon that would contain the foreground a replace the background with black.<br />
                  No Parameters Needed
                </p>
                <img src={info_convexhull} alt="Convex Hull Example" style={{width: "220px"}} />
              </Popup>
              :
              &nbsp;&nbsp;<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://en.wikipedia.org/wiki/Convex_hull" target="_blank"><img src="https://en.wikipedia.org/static/images/icons/wikipedia.png" alt="Wikipedia Link" style={{width: "20px"}} /></a></span>} content='Wikipedia Link' size='small' />
             </label>
            <Field
              name="options.skImg.convexHullEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgConvexHullEnabled(data); }}
            />
          </Form.Field>
          <Form.Field width={3}>
            <label>Ridge Detection<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/auto_examples/edges/plot_ridge_filter.html#sphx-glr-auto-examples-edges-plot-ridge-filter-py" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimagefilters.meijering</h4>
                <p>
                  The available ridge detection algorithms tries to find ridges and edges of an image and extract them, removing all else considered irrelevant.<br />
                  <b><u>Parameters:</u></b><br />
                  <b>Types:</b> Two types of edge detection algorithms, meijering and hessian. First return white ridges with black background the outher return black ridges with white background. Variants in details exists too.
                </p>
                <img src={info_ridgedetect1} alt="Ridge Detection meijering Example" style={{width: "220px"}} /><br />
                <img src={info_ridgedetect2} alt="Ridge Detection hessian Example" style={{width: "220px"}} />
              </Popup>
              :
              &nbsp;&nbsp;<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://en.wikipedia.org/wiki/Ridge_detection" target="_blank"><img src="https://en.wikipedia.org/static/images/icons/wikipedia.png" alt="Wikipedia Link" style={{width: "20px"}} /></a></span>} content='Wikipedia Link' size='small' />
             </label>
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
            <label>Swirl<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/api/skimage.transform.html#swirl" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.transform.swirl</h4>
                <p>
                  Twists and swirls the image into a spiral pattern<br />
                  <b><u>Parameters:</u></b><br />
                  <b>Strength:</b> A value from 0 and upward on how much power the swirl will have. 1 is usually very minor and 30 is often hard core extreme.<br />
                  <b>Radius:</b> How much radius in pixels from the image center that the swirl will effect.
                </p>
                <img src={info_swirl} alt="Swirl Example" style={{width: "220px"}} />
              </Popup>
              :
             </label>
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
            <label>RAG<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/stable/auto_examples/segmentation/plot_rag_mean_color.html" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.segmentation.slic<br />skimage.graph.rag_mean_color</h4>
                <p>
                  RAG stands for Region Adjacency Graph and merges regions which are similar in color. The algorithm construct a RAG and define edges as the difference in mean color and then join regions with similar mean color.<br />
                  <b><u>Parameters:</u></b><br />
                  <b>Types:</b> Three different types of RAG results to choose from.
                </p>
                <img src={info_rag} alt="RAG Example" style={{width: "220px"}} />
              </Popup>
              :
             </label>
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
            <label>Thresholding<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/auto_examples/segmentation/plot_thresholding.html" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.filters.threshold_multiotsu<br />skimage.filters.threshold_otsu</h4>
                <p>
                  In digital image processing, thresholding is the simplest method of segmenting images<br />
                  <b><u>Parameters:</u></b><br />
                  <b>Types:</b> Either classis binary thresholding (black & white) or multi. either in plain black and white or in a few specific colors
                </p>
                <img src={info_thresholding} alt="Thresholding Example" style={{width: "220px"}} />
              </Popup>
              :
              &nbsp;&nbsp;<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://en.wikipedia.org/wiki/Thresholding_(image_processing)" target="_blank"><img src="https://en.wikipedia.org/static/images/icons/wikipedia.png" alt="Wikipedia Link" style={{width: "20px"}} /></a></span>} content='Wikipedia Link' size='small' />
             </label>
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
            <label>Chan-Vese Segmentation<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/api/skimage.segmentation.html#chan-vese" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.segmentation.chan_vese</h4>
                <p>
                  The Chan-Vese algorithm is a very efficent way to segment images<br />
                  No Parameters Needed
                </p>
                <img src={info_chanvesesegm} alt="Chan-Vese Example" style={{width: "220px"}} />
              </Popup>
              :
              &nbsp;&nbsp;<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://en.wikipedia.org/wiki/Image_segmentation" target="_blank"><img src="https://en.wikipedia.org/static/images/icons/wikipedia.png" alt="Wikipedia Link" style={{width: "20px"}} /></a></span>} content='Wikipedia Link' size='small' />
             </label>
            <Field
              name="options.skImg.CVSegmentationEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgCVSegmentationEnabled(data); }}
            />
          </Form.Field>
          <Form.Field width={3}>
            <label>Switch Color<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/stable/user_guide/transforming_image_data.html" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.color</h4>
                <p>
                  Allows for switching out all pixels with one exact color value into another.<br />
                  <b><u>Parameters:</u></b><br />
                  <b>From Color:</b> The color (RGB) value to look for<br />
                  <b>To Color:</b> The color (RGB) value we want to change into<br />
                  <b>Extend Range Value:</b> If you want to affect nearby colors on the RGB scale (0-255) provide a number of how many colors above and below for each R, G and B. (ex. value = 2, affects max 125 colors).
                </p>
                <img src={info_switchcolor} alt="Color switch Example" style={{width: "220px"}} />
              </Popup>
              :
             </label>
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
              <Form.Field>
                <label>Extend Range Value<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}>ⓘ</span>} content='If you want to affect nearby colors on the RGB scale (0-255) provide a number of how many colors above and below for each R, G and B. (ex. value = 2, affects max 125 colors).' size='small' />:</label>
                <Field
                  fluid
                  name="options.skImg.switchColorExtendRangeValue"
                  component={inputTrad}
                  type="number"
                  step={1}
                  min={0}
                  max={255}
                />
              </Form.Field>
            </div>}
          </Form.Field>
          <Form.Field width={3}>
            <label>Flip<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/stable/user_guide/numpy_images.html" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>Flipping</h4>
                <p>
                  This is just flipping the image vertically and/or horizontally<br />
                  <b><u>Parameters:</u></b><br />
                  <b>Horizontally:</b> Flips the image horizontally<br />
                  <b>Vertically:</b> Flips the image vertically
                </p>
                <img src={info_flip} alt="Flip Example" style={{width: "220px"}} />
              </Popup>
              :
             </label>
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
            <label>Circle Frame<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/stable/auto_examples/numpy_operations/plot_camera_numpy.html#sphx-glr-auto-examples-numpy-operations-plot-camera-numpy-py" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>Black Frame Mask</h4>
                <p>
                  This feature calculates a circle overlay on the image and color everything outside the circle balck, creating a circular frame. Good for e.g. focusing on a particular part of an image.<br />
                  <b><u>Parameters:</u></b><br />
                  <b>Center Horiz:</b> Where the center of the circle should be horizontally. default is at the center of the image.<br />
                  <b>Center Vert:</b> Where the center of the circle should be vertically. default is at the center of the image.<br />
                  <b>Radius:</b> The Radius of the circle. default is half of the shortest side of the original image.
                </p>
                <img src={info_circleframe} alt="Circle Frame Example" style={{width: "220px"}} />
              </Popup>
              :
             </label>
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
            <label>Skeletonize<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/api/skimage.morphology.html#skeletonize" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.morphology.skeletonize</h4>
                <p>
                  This algorithm calculates the 'skeleton' of the image foreground object and remove everything else<br />
                  No Parameters needed
                </p>
                <img src={info_skeletonize} alt="Skeletonize Example" style={{width: "220px"}} />
              </Popup>
              :
              &nbsp;&nbsp;<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://en.wikipedia.org/wiki/Morphological_skeleton" target="_blank"><img src="https://en.wikipedia.org/static/images/icons/wikipedia.png" alt="Wikipedia Link" style={{width: "20px"}} /></a></span>} content='Wikipedia Link' size='small' />
             </label>
            <Field
              name="options.skImg.skeletonizeEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgSkeletonizeEnabled(data); }}
            />
          </Form.Field>
          <Form.Field width={3}>
            <label>HOG - Object Detect<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/api/skimage.feature.html#hog" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.feature.hog</h4>
                <p>
                  Analyses the image and return an image that shows the identifaction of the main objects in the original image.<br />
                  No Parameters needed
                </p>
                <img src={info_objdetect} alt="Object Detection Example" style={{width: "220px"}} />
              </Popup>
              :
              &nbsp;&nbsp;<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://en.wikipedia.org/wiki/Object_detection" target="_blank"><img src="https://en.wikipedia.org/static/images/icons/wikipedia.png" alt="Wikipedia Link" style={{width: "20px"}} /></a></span>} content='Wikipedia Link' size='small' />
             </label>
            <Field
              name="options.skImg.objectDetectionEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgObjectDetectionEnabled(data); }}
            />
          </Form.Field>
          <Form.Field width={3}>
            <label>Contour Finding<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/api/skimage.measure.html#find-contours" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.measure.find_contours</h4>
                <p>
                  Find the contours of all shapes in an image. This feature works best when the original image is a JPEG, and works less as expected with a PNG. So make sure your original image is of the proper type. Complex images my take too long to calculate and the browser times out.<br />
                  <b><u>Parameters:</u></b><br />
                  <b>level:</b> Optional, and work often best by default setting, but feel free to play with value, changing it up or down to see if you get any improvements.<br />
                  <b>Show Contours Only:</b> Remove the image and just keep the calculated contours.<br />
                  <b>More Popping Style:</b> Makes the contours more popping in both colors and thickness.
                </p>
                <img src={info_contourfinding} alt="Contour finding Example" style={{width: "220px"}} />
              </Popup>
              :
             </label>
            <Field
              name="options.skImg.contourFindingEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgContourFindingEnabled(data); }}
            />
            {skImgContourFindingEnabled && <div>
              <Form.Field>
                <label>Level:</label>
                <Field
                  fluid
                  name="options.skImg.contourFindingLevel"
                  component={inputTrad}
                  type="number"
                  step={0.05}
                  min={0}
                  max={1}
                />
              </Form.Field>
              <Form.Field>
                <label>Show Contours Only:</label>
                <Field
                  name="options.skImg.contourOnlyEnabled"
                  component={SemCheckbox}
                  toggle
                />
              </Form.Field>
              <Form.Field>
                <label>More Popping Style:</label>
                <Field
                  name="options.skImg.contourPoppingEnabled"
                  component={SemCheckbox}
                  toggle
                />
              </Form.Field>
            </div>}
          </Form.Field>
          <Form.Field width={3}>
            <label>Florescent Colors<Popup
                trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://scikit-image.org/docs/dev/api/skimage.exposure.html#rescale-intensity" target="_blank">ⓘ</a></span>}
                size='small'
                wide='very'
              >
                <h4>skimage.exposure.rescale_intensity</h4>
                <p>
                  This algorith changes the colors to more strong and florescent-feeling ones in order to highlight different parts of the imnage better.<br />
                  No Parameters needed
                </p>
                <img src={info_florescent} alt="Florescent Example" style={{width: "220px"}} />
              </Popup>
              :
              &nbsp;&nbsp;<Popup trigger={<span style={{fontSize: "20px", color: "blue"}}><a className='infohelp' href="https://en.wikipedia.org/wiki/Fluorescence" target="_blank"><img src="https://en.wikipedia.org/static/images/icons/wikipedia.png" alt="Wikipedia Link" style={{width: "20px"}} /></a></span>} content='Wikipedia Link' size='small' />
             </label>
            <Field
              name="options.skImg.florescentColorsEnabled"
              component={SemCheckbox}
              toggle
              onChange={(e, data) => { toggleSKImgFlorescentColorsEnabled(data); }}
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
