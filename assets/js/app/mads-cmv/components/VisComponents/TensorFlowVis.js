/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'TensorFlow' module
// ------------------------------------------------------------------------------------------------
// Notes: 'TensorFlow' is a component that makes it easy to build and deploy Machine Learning
//        models.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party jquery, internal support methods fr. VisCompUtils
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import * as tf from '@tensorflow/tfjs';
import $ from "jquery";

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "Empty TensorFlow Component",
  extent: { width: undefined, height: undefined },
};

let tfFromCDNAlreadyLoaded = false;
let mobilenetFromCDNLoaded = false;
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// TensorFlow Mode Options / Settings
//-------------------------------------------------------------------------------------------------

// === WEB CAM OBJECT DETECTION ===
const camObjDetect = {};
camObjDetect["STATUS"] = undefined;
camObjDetect["VIDEO"] = undefined;
camObjDetect["ENABLE_CAM_BUTTON"] = undefined;
camObjDetect["RESET_BUTTON"] = undefined;
camObjDetect["TRAIN_BUTTON"] = undefined;
camObjDetect["tfError"] = undefined;
camObjDetect["MOBILE_NET_INPUT_WIDTH"] = 224;
camObjDetect["MOBILE_NET_INPUT_HEIGHT"] = 224;
camObjDetect["STOP_DATA_GATHER"] = -1;
camObjDetect["CLASS_NAMES"] = [];
camObjDetect["mobilenet"] = undefined;
camObjDetect["gatherDataState"] = camObjDetect.STOP_DATA_GATHER;
camObjDetect["videoPlaying"] = false;
camObjDetect["trainingDataInputs"] = [];
camObjDetect["trainingDataOutputs"] = [];
camObjDetect["examplesCount"] = [];
camObjDetect["predict"] = false;
camObjDetect["model"] = undefined;

// Loads the MobileNet model and warms it up so ready for use.
camObjDetect["loadMobileNetFeatureModel"] = async function () {
  const URL = 'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';
  camObjDetect.mobilenet = await tf.loadGraphModel(URL, {fromTFHub: true});
  camObjDetect.STATUS.innerText = 'MobileNet v3 loaded successfully!';

  // Warm up the model by passing zeros through it once.
  tf.tidy(function () {
    let answer = camObjDetect.mobilenet.predict(tf.zeros([1, camObjDetect.MOBILE_NET_INPUT_HEIGHT, camObjDetect.MOBILE_NET_INPUT_WIDTH, 3]));
    console.log(answer.shape);
  });
};

// Check if getUserMedia is supported for webcam access.
camObjDetect["hasGetUserMedia"] = function () {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

// Enable the webcam with video constraints applied.
camObjDetect["enableCam"] = function () {
  if (camObjDetect.hasGetUserMedia()) {
    // getUsermedia parameters.
    const constraints = {
      video: true,
      width: 640,
      height: 480
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      camObjDetect.VIDEO.srcObject = stream;
      camObjDetect.VIDEO.addEventListener('loadeddata', function() {
        camObjDetect.videoPlaying = true;
        camObjDetect.ENABLE_CAM_BUTTON.classList.add('removed');
      });
      camObjDetect.tfError.innerText = "";
    })
    .catch(error => camObjDetect.tfError.innerText = "No Webcam Connected" );
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }
};

// Handle Data Gather for button mouseup/mousedown.
camObjDetect["gatherDataForClass"] = function () {
  let classNumber = parseInt(this.getAttribute('data-1hot'));
  camObjDetect.gatherDataState = (camObjDetect.gatherDataState === camObjDetect.STOP_DATA_GATHER) ? classNumber : camObjDetect.STOP_DATA_GATHER;
  camObjDetect.dataGatherLoop();
};

// Calculate Features on current frame
camObjDetect["calculateFeaturesOnCurrentFrame"] = function () {
  return tf.tidy(function() {
    // Grab pixels from current VIDEO frame.
    let videoFrameAsTensor = tf.browser.fromPixels(camObjDetect.VIDEO);
    // Resize video frame tensor to be 224 x 224 pixels which is needed by MobileNet for input.
    let resizedTensorFrame = tf.image.resizeBilinear(
        videoFrameAsTensor,
        [camObjDetect.MOBILE_NET_INPUT_HEIGHT, camObjDetect.MOBILE_NET_INPUT_WIDTH],
        true
    );

    let normalizedTensorFrame = resizedTensorFrame.div(255);

    return camObjDetect.mobilenet.predict(normalizedTensorFrame.expandDims()).squeeze();
  });
};

// When a button used to gather data is pressed, record feature vectors along with class type to arrays.
camObjDetect["dataGatherLoop"] = function () {
  // Only gather data if webcam is on and a relevent button is pressed.
  if (camObjDetect.videoPlaying && camObjDetect.gatherDataState !== camObjDetect.STOP_DATA_GATHER) {
    // Ensure tensors are cleaned up.
    let imageFeatures = camObjDetect.calculateFeaturesOnCurrentFrame();

    camObjDetect.trainingDataInputs.push(imageFeatures);
    camObjDetect.trainingDataOutputs.push(camObjDetect.gatherDataState);

    // Intialize array index element if currently undefined.
    if (camObjDetect.examplesCount[camObjDetect.gatherDataState] === undefined) {
      camObjDetect.examplesCount[camObjDetect.gatherDataState] = 0;
    }
    // Increment counts of examples for user interface to show.
    camObjDetect.examplesCount[camObjDetect.gatherDataState]++;

    camObjDetect.STATUS.innerText = '';
    for (let n = 0; n < camObjDetect.CLASS_NAMES.length; n++) {
      camObjDetect.STATUS.innerText += ' ' + camObjDetect.CLASS_NAMES[n] + ' data count: ' + camObjDetect.examplesCount[n] + '. ';
    }

    window.requestAnimationFrame(camObjDetect.dataGatherLoop);
  }
};

// Once data collected actually perform the transfer learning.
camObjDetect["trainAndPredict"] = async function () {
  camObjDetect.predict = false;
  tf.util.shuffleCombo(camObjDetect.trainingDataInputs, camObjDetect.trainingDataOutputs);
  camObjDetect.STATUS.innerText += " TRAINING & LEARNING...";

  let outputsAsTensor = tf.tensor1d(camObjDetect.trainingDataOutputs, 'int32');
  let oneHotOutputs = tf.oneHot(outputsAsTensor, camObjDetect.CLASS_NAMES.length);
  let inputsAsTensor = tf.stack(camObjDetect.trainingDataInputs);

  let results = await camObjDetect.model.fit(inputsAsTensor, oneHotOutputs, {
    shuffle: true,
    batchSize: 5,
    epochs: 10,
    callbacks: {onEpochEnd: camObjDetect.logProgress}
  });

  outputsAsTensor.dispose();
  oneHotOutputs.dispose();
  inputsAsTensor.dispose();

  camObjDetect.predict = true;
  camObjDetect.predictLoop();
};

// Log training progress.
camObjDetect["logProgress"] = function (epoch, logs) {
  console.log('Data for epoch ' + epoch, logs);
  camObjDetect.STATUS.innerText += "..";
};

// Make live predictions from webcam once trained.
camObjDetect["predictLoop"] = function () {
  if (camObjDetect.predict) {
    tf.tidy(function() {
      let imageFeatures = camObjDetect.calculateFeaturesOnCurrentFrame();
      let prediction = camObjDetect.model.predict(imageFeatures.expandDims()).squeeze();
      let highestIndex = prediction.argMax().arraySync();
      let predictionArray = prediction.arraySync();
      camObjDetect.STATUS.innerText = 'Prediction: ' + camObjDetect.CLASS_NAMES[highestIndex] + ' with ' + Math.floor(predictionArray[highestIndex] * 100) + '% confidence';
    });

    window.requestAnimationFrame(camObjDetect.predictLoop);
  }
};

// Purge data and start over. Note this does not dispose of the loaded MobileNet model and MLP head tensors as you will need to reuse them to train a new model.
camObjDetect["reset"] = function () {
  camObjDetect.predict = false;
  camObjDetect.examplesCount.splice(0);
  for (let i = 0; i < camObjDetect.trainingDataInputs.length; i++) {
    camObjDetect.trainingDataInputs[i].dispose();
  }
  camObjDetect.trainingDataInputs.splice(0);
  camObjDetect.trainingDataOutputs.splice(0);
  camObjDetect.STATUS.innerText = 'No data collected';
  camObjDetect.tfError.innerText = "";

  console.log('Tensors in memory: ' + tf.memory().numTensors);
};
// ===================================

// === IMAGE CLASSIFICATION ===
const imgClassify = {};
imgClassify["fileInput"] = undefined;
imgClassify["image"] = undefined;
imgClassify["description"] = undefined;
imgClassify["sections"] = undefined;
imgClassify["loader"] = undefined;
imgClassify["model"] = undefined;

// Get the image from file input and display on page
imgClassify["getImage"] = async function () {

  console.log(imgClassify.fileInput.files[0]);

  // Check if an image has been found in the input
  if (!imgClassify.fileInput.files[0]) throw new Error("Image not found");
  const file = imgClassify.fileInput.files[0];

  // Get the data url form the image
  const reader = new FileReader();

  // When reader is ready display image.
  reader.onload = function (event) {
    // Ge the data url
    const dataUrl = event.target.result;

    // Create image object
    const imageElement = new Image();
    imageElement.src = dataUrl;

    // When image object is loaded
    imageElement.onload = function () {
      // Set <img /> attributes
      imgClassify.image.setAttribute("src", this.src);
      imgClassify.image.setAttribute("width", this.width);
      imgClassify.image.style.maxWidth = "50%";

      // Classify image
      imgClassify.classifyImage();
    };
  };

  // Get data url
  reader.readAsDataURL(file);
};

imgClassify["classifyImage"] = function () {
  imgClassify.model.classify(imgClassify.image).then(function (predictions) {
    console.log("Predictions: ");
    console.log(predictions);
    imgClassify.displayDescription(predictions);
  });
};

imgClassify["displayDescription"] = function (predictions) {
  const result = predictions.sort((a, b) => a > b)[0];

  if (result.probability > 0.2) {
    const probability = Math.round(result.probability * 100);

    // Display result
    imgClassify.description.innerText = `${probability}% sure this is a ${result.className.replace(
      ",",
      " or"
    )} ❤️`;
  } else {
    imgClassify.description.innerText = "I am not sure what I should recognize 😢";
  }
};

imgClassify["loadMobileNet"] = function () {
  if(mobilenetFromCDNLoaded){
    // Async loading
    mobilenet.load().then(function (m) {
      // Save model
      imgClassify.model = m;

      // Hide loading and display image selection
      imgClassify.sections.show();
      imgClassify.loader.hide();

      // When user uploads a new image, display the new image on the webpage
      imgClassify.fileInput.addEventListener("change", imgClassify.getImage);
    });
  }
  else{
    setTimeout(() => {
      imgClassify.loadMobileNet();
    }, 500);
  }
};

imgClassify["loadMobileNetModelFromCDN"] = function (FILE_URL, async = true) {
  let scriptEle = document.createElement("script");

  scriptEle.setAttribute("src", FILE_URL);
  scriptEle.setAttribute("type", "text/javascript");
  scriptEle.setAttribute("async", async);

  document.body.appendChild(scriptEle);

  // success event
  scriptEle.addEventListener("load", (loadedFile) => {
    mobilenetFromCDNLoaded = true;
  });
   // error event
  scriptEle.addEventListener("error", (ev) => {
    console.log("Error on loading file", ev);
  });
}

imgClassify["loadTFFromCDN"] = function (FILE_URL, async = true) {
  let scriptEle = document.createElement("script");

  scriptEle.setAttribute("src", FILE_URL);
  scriptEle.setAttribute("type", "text/javascript");
  scriptEle.setAttribute("async", async);

  document.body.appendChild(scriptEle);

  // success event
  scriptEle.addEventListener("load", (loadedModel) => {
    tfFromCDNAlreadyLoaded = true;
    imgClassify.loadMobileNetModelFromCDN("https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet", true);
  });
   // error event
  scriptEle.addEventListener("error", (ev) => {
    console.log("Error on loading file", ev);
  });
}
// ===================================
//-------------------------------------------------------------------------------------------------



//-------------------------------------------------------------------------------------------------
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default function TensorFlow({
  data,
  mappings,
  options,
  colorTags,
  originalOptions,
  id,
}) {
  // Initiation of the VizComp
  const rootNode = useRef(null);
  const uid = "id"+id;
  let internalOptions = {...defaultOptions, ...options};

  if(!tfFromCDNAlreadyLoaded){
    imgClassify.loadTFFromCDN("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.0.1", true);
  }

  // Create the VizComp based on the incomming parameters
  const createChart = async () => {
    $(rootNode.current).empty();
    camObjDetect.CLASS_NAMES = [];

    $(rootNode.current).append(`
      <div class="tfBody">
        <div className="main" id="outputContainer` + id + `" style="
          position: relative;
          border: solid black 1px;
          padding: 10px;
          font-weight: bold;
          font-size: 20px;
          width: ` + internalOptions.extent.width + `;
        ">
        </div>
      </div>`
    );

    var outputContainer = $(rootNode.current).find("#outputContainer" + id);
    const whatTFMode = internalOptions.tfMode || "Not Selected";

    if(whatTFMode == 'WebCam Object Detection'){
      const TFModeArgs_NoOfClasses = parseInt(internalOptions.modeArgs.arg1) || 2;
      let classButtonsHtmlStr = "";
      for(var i = 0; i < TFModeArgs_NoOfClasses; i++){
        classButtonsHtmlStr += '<button class="tfbutton dataCollector" data-1hot="' + i + '" data-name="Class ' + (i+1) + '">Gather Class ' + (i+1) + ' Data</button>';
      }

      outputContainer.html(`
        <img src="https://ww2.freelogovectors.net/wp-content/uploads/2018/07/tensorflow-logo.png" alt="TensorFlow Logo" width="100" />
        <h1 class="tfh1">Mode: ` + whatTFMode + `</h1>
        <p id="status` + id + `">Awaiting TF.js load</p>
        <video class="tfvideo" id="webcam` + id + `" autoplay></video>

        <div>
          <button class="tfbutton" id="enableCam` + id + `">Enable Webcam</button>`
            + classButtonsHtmlStr + `
          <button class="tfbutton" id="train` + id + `">Train &amp; Predict!</button>
          <button class="tfbutton" id="reset` + id + `">Reset</button>
        </div>

        <p id="tfError` + id + `" style="color: red;"></p>

        <ol class="tfol">
          <li>First enable webcam and allow access when asked.</li>
          <li>Now find an object, point cam at it, click and hold gather class 1 data button to gather at least 30 samples.</li>
          <li>Repeat for class 2 with a different object of interest. Get similar number of samples.</li>
          <li>Click train and predict and wait while the model is trained live in your browser. No data is sent to server.</li>
          <li>Once trained you will see live predictions appear above the video for what it thinks it sees.</li>
        </ol>
      `);

      camObjDetect.STATUS = $(rootNode.current).find('#status' + id)[0];
      camObjDetect.VIDEO = $(rootNode.current).find('#webcam' + id)[0];
      camObjDetect.ENABLE_CAM_BUTTON = $(rootNode.current).find('#enableCam' + id)[0];
      camObjDetect.RESET_BUTTON = $(rootNode.current).find('#reset' + id)[0];
      camObjDetect.TRAIN_BUTTON = $(rootNode.current).find('#train' + id)[0];
      camObjDetect.tfError = $(rootNode.current).find('#tfError' + id)[0];

      camObjDetect.ENABLE_CAM_BUTTON.addEventListener('click', camObjDetect.enableCam);
      camObjDetect.TRAIN_BUTTON.addEventListener('click', camObjDetect.trainAndPredict);
      camObjDetect.RESET_BUTTON.addEventListener('click', camObjDetect.reset);

      // Just add more buttons in HTML to allow classification of more classes of data!
      let dataCollectorButtons = document.querySelectorAll('button.dataCollector');
      for (let i = 0; i < dataCollectorButtons.length; i++) {
        dataCollectorButtons[i].addEventListener('mousedown', camObjDetect.gatherDataForClass);
        dataCollectorButtons[i].addEventListener('mouseup', camObjDetect.gatherDataForClass);
        // For mobile.
        dataCollectorButtons[i].addEventListener('touchend', camObjDetect.gatherDataForClass);

        // Populate the human readable names for classes.
        camObjDetect.CLASS_NAMES.push(dataCollectorButtons[i].getAttribute('data-name'));
      }

      camObjDetect.loadMobileNetFeatureModel();

      camObjDetect.model = tf.sequential();
      camObjDetect.model.add(tf.layers.dense({inputShape: [1024], units: 128, activation: 'relu'}));
      camObjDetect.model.add(tf.layers.dense({units: camObjDetect.CLASS_NAMES.length, activation: 'softmax'}));

      camObjDetect.model.summary();

      // Compile the model with the defined optimizer and specify a loss function to use.
      camObjDetect.model.compile({
        // Adam changes the learning rate over time which is useful.
        optimizer: 'adam',
        // Use the correct loss function. If 2 classes of data, must use binaryCrossentropy. Else categoricalCrossentropy is used if more than 2 classes.
        loss: (camObjDetect.CLASS_NAMES.length === 2) ? 'binaryCrossentropy': 'categoricalCrossentropy',
        // As this is a classification problem you can record accuracy in the logs too!
        metrics: ['accuracy']
      });
    }

    else if(whatTFMode == 'Image Classification'){
      outputContainer.html(`
        <img src="https://ww2.freelogovectors.net/wp-content/uploads/2018/07/tensorflow-logo.png" alt="TensorFlow Logo" width="100" />
        <h1 class="tfh1">Mode: ` + whatTFMode + `</h1>
        <main class="tfmain">
          <div class="loader">
            <h2>Loading ...</h2>
          </div>

          <section class="file-section any-section">
            <div class="file-group">
              <label for="file-input">Upload a picture</label>
              <input type="file" id="file-input` + id + `" />
            </div>
          </section>

          <section class="tfsection image-section any-section">
            <img src="" id="tfimage` + id + `" />
            <div id="prediction` + id + `" class="image-prediction"></div>
          </section>

        </main>
      `);

      imgClassify.fileInput = $(rootNode.current).find('#file-input' + id)[0];
      imgClassify.image = $(rootNode.current).find('#tfimage' + id)[0];
      imgClassify.sections = $(rootNode.current).find('.any-section');
      imgClassify.loader = $(rootNode.current).find('.loader');
      imgClassify.description = $(rootNode.current).find('#prediction' + id)[0];

      console.log(imgClassify.image);

      imgClassify.sections.hide();
      imgClassify.loader.show();

      imgClassify.loadMobileNet();
    }

    else{
      outputContainer.html(`
        <img src="https://ww2.freelogovectors.net/wp-content/uploads/2018/07/tensorflow-logo.png" alt="TensorFlow Logo" width="400" />
      `);
    }



    // var thisImg = $(rootNode.current).find('#CadsWSUserImage' + id).on('load', function () {
    //   thisImg.off('load');
    //   var drawingContainer = $(rootNode.current).find("#drawingContainer" + id);
    //   var borderSizeAddOn = internalOptions.border.size * 2;
    //   drawingContainer.css({'width': (thisImg.width() + borderSizeAddOn) + "px", 'height': (thisImg.height() + borderSizeAddOn) + "px"});
    //   $(rootNode.current).find('#CadsWSUserImageTitle' + id).text(internalOptions.title);
    //   $(rootNode.current).find('#CadsWSUserImageCaption' + id).width(thisImg.width()).text(internalOptions.caption);

    //   const viewWrapperCustomButton_SaveImg = $(rootNode.current).parent().parent().find('#saveImg' + id);
    //   viewWrapperCustomButton_SaveImg.off('click');
    //   const viewWrapperCustomButton_AnnotateImg = $(rootNode.current).parent().parent().find('#annotateImg' + id);
    //   viewWrapperCustomButton_AnnotateImg.off('click');
    //   viewWrapperCustomButton_AnnotateImg.css('margin-right', '20px;');
    //   const viewWrapperCustomButton_AnnotationType = $(rootNode.current).parent().parent().find('#annotateBrushType' + id);
    //   viewWrapperCustomButton_AnnotationType.off('change');
    //   viewWrapperCustomButton_AnnotationType.hide();
    //   const viewWrapperCustomButton_AnnotationColor = $(rootNode.current).parent().parent().find('#annotationColor' + id);
    //   viewWrapperCustomButton_AnnotationColor.off('change');
    //   viewWrapperCustomButton_AnnotationColor.hide();
    //   const viewWrapperCustomButton_AnnotationSize = $(rootNode.current).parent().parent().find('#annotationSize' + id);
    //   viewWrapperCustomButton_AnnotationSize.off('change');
    //   viewWrapperCustomButton_AnnotationSize.hide();
    //   const viewWrapperCustomButton_AnnotationOpacity = $(rootNode.current).parent().parent().find('#annotationOpacity' + id);
    //   viewWrapperCustomButton_AnnotationOpacity.off('change');
    //   viewWrapperCustomButton_AnnotationOpacity.hide();
    //   const viewWrapperCustomButton_AnnotationReset = $(rootNode.current).parent().parent().find('#annotateImgReset' + id);
    //   viewWrapperCustomButton_AnnotationReset.off('click');
    //   viewWrapperCustomButton_AnnotationReset.hide();

    //   // Annotation Feature
    //   let annotateData = { uid: uid, lastMouse: {x: 0, y: 0}, imgData: [], lineData: {}, gco: "", toolType: 0, brushColor: "#ff0000", brushOpacity: 1, brushSize: 2 }
    //   if(annotationMemory[uid] && typeof annotationMemory[uid][0] !== 'string' ){
    //     annotateData = annotationMemory[uid];
    //   }

    //   var drawSurface = $(rootNode.current).find("#drawSurface" + id);
    //   drawSurface.off('mouseup');
    //   drawSurface[0].setAttribute("width", thisImg.width() + "px");
    //   drawSurface[0].setAttribute("height", thisImg.height() + "px");
    //   drawSurface[0].setAttribute("annodata", JSON.stringify(annotateData));

    //   viewWrapperCustomButton_SaveImg.on( "click", function () { saveBase64AsFile(activeImgSrc, (filenamePrefix + internalOptions.title), thisImg[0], drawSurface[0], (internalOptions.cssFilters.isEnabled ? cssFilters : undefined)); });
    //   viewWrapperCustomButton_AnnotateImg.on( "click", function (e) {
    //     if(annotationEnabled){
    //       viewWrapperCustomButton_AnnotateImg.css("background-color", '');
    //       viewWrapperCustomButton_AnnotationColor.hide();
    //       viewWrapperCustomButton_AnnotationSize.hide();
    //       viewWrapperCustomButton_AnnotationType.hide();
    //       viewWrapperCustomButton_AnnotationOpacity.hide();
    //       viewWrapperCustomButton_AnnotationReset.hide();
    //     }
    //     else{
    //       viewWrapperCustomButton_AnnotateImg.css("background-color", "green");
    //       viewWrapperCustomButton_AnnotationColor.show();
    //       viewWrapperCustomButton_AnnotationSize.show();
    //       viewWrapperCustomButton_AnnotationType.show();
    //       viewWrapperCustomButton_AnnotationOpacity.show();
    //       viewWrapperCustomButton_AnnotationReset.show();
    //     }
    //     annotationEnabled = !annotationEnabled;
    //   });
    //   viewWrapperCustomButton_AnnotationType.on('change', function (e) {
    //     const annodata = JSON.parse(drawSurface[0].getAttribute("annodata"));
    //     annodata.toolType = e.target.value;
    //     drawSurface[0].setAttribute("annodata", JSON.stringify(annodata));
    //   });
    //   viewWrapperCustomButton_AnnotationColor.on('change', function (e) {
    //     const annodata = JSON.parse(drawSurface[0].getAttribute("annodata"));
    //     annodata.brushColor = e.target.value;
    //     drawSurface[0].setAttribute("annodata", JSON.stringify(annodata));
    //   });
    //   viewWrapperCustomButton_AnnotationSize.on('change', function (e) {
    //     const annodata = JSON.parse(drawSurface[0].getAttribute("annodata"));
    //     annodata.brushSize = e.target.value;
    //     drawSurface[0].setAttribute("annodata", JSON.stringify(annodata));
    //   });
    //   viewWrapperCustomButton_AnnotationOpacity.on('change', function (e) {
    //     const annodata = JSON.parse(drawSurface[0].getAttribute("annodata"));
    //     annodata.brushOpacity = e.target.value;
    //     drawSurface[0].setAttribute("annodata", JSON.stringify(annodata));
    //   });
    //   viewWrapperCustomButton_AnnotationReset.on('click', function (e) {
    //     var ctx = drawSurface[0].getContext("2d");
    //     ctx.clearRect(0,0,thisImg.width(),thisImg.height());
    //     const annodata = JSON.parse(drawSurface[0].getAttribute("annodata"));
    //     annodata.imgData = [];
    //     drawSurface[0].setAttribute("annodata", JSON.stringify(annodata));
    //     annotationMemory[uid].imgData = annodata.imgData;
    //   });

    //   drawSurface.on('mousedown', onMouseDown);
    //   if(annotationMemory[uid]){
    //     redrawPreviousImg(drawSurface[0], annotateData.imgData);
    //   }
    // }).attr("src", activeImgSrc);
  };

   // Clear away the VizComp
   const clearChart = () => {
    /* Called when component is deleted */
    // delete annotationMemory[uid];
  };

  // Only called at init and set our final exit function
  useEffect(() => {
    return () => { clearChart(); };
  }, []);

  // Recreate the chart if the data and settings change
  useEffect(() => {
    createChart();
  }, [data, options]);

  // Add the VizComp to the DOM
  return (
    <div>
      <div ref={rootNode} />
    </div>
  );
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
TensorFlow.propTypes = {
  data: PropTypes.shape({ }),
  mappings: PropTypes.shape({}),
  options: PropTypes.shape({
    title: PropTypes.string,
    border: PropTypes.shape({
      color: PropTypes.string,
      style: PropTypes.string,
      size: PropTypes.number,
    }),
    extent: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number,
    }),
  }),
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
TensorFlow.defaultProps = {
  data: {},
  mappings: {},
  options: defaultOptions,
  colorTags: [],
};
//-------------------------------------------------------------------------------------------------
