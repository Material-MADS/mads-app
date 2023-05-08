/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
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
import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

import $ from "jquery";

import { fillObjectWithMissingKeys, getRGBAColorStrFromAnyColor } from './VisCompUtils';

import noImg from './images/noimage.jpg';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "Empty TensorFlow View",
  border: {
    color: "black",
    style: "solid",
    size: 1,
  },
  extent: { width: undefined, height: undefined },
};

const annotationMemory = {};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Returns the previous value
//-------------------------------------------------------------------------------------------------
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
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

  // Make sure that older versions of TensorFlow loads without any problem and that empty values will not cause any problems
  // if(!internalOptions.cssFilters) { internalOptions["cssFilters"] = {} }
  // if(originalOptions){
  //   fillObjectWithMissingKeys(originalOptions.cssFilters, internalOptions.cssFilters);
  //   if(!internalOptions.skImg) { internalOptions["skImg"] = {} }
  //   fillObjectWithMissingKeys(originalOptions.skImg, internalOptions.skImg);
  //   if(!internalOptions.imgData && data.data){ internalOptions.imgData = data.data; }
  // }


  // Create the VizComp based on the incomming parameters
  const createChart = async () => {
    $(rootNode.current).empty();

    $(rootNode.current).append(`
      <div>
        <div id="outputContainer` + id + `" style="
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
    outputContainer.html("<img width='200' src='https://www.gstatic.com/devrel-devsite/prod/v879bd73e331fb6980fc7788d2be5a42c1a77b1509d63bf8e1d8e3cc58aa142c0/tensorflow/images/lockup.svg' /></br> New CADS Component Under Development");

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
