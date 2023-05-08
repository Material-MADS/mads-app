/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'ImageView' module
// ------------------------------------------------------------------------------------------------
// Notes: 'ImageView' is a visualization component that displays any basic image file based on a
//        range of available properties.
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
  title: "Empty Image View",
  caption: "No Image Loaded",
  imgManip: "None",
  border: {
    color: "black",
    style: "solid",
    size: 1,
  },
  extent: { width: undefined, height: undefined },
  pad: 0,
  cssFilters: {
    isEnabled: false,
    grayscaleVal: 0,
    blurVal: 0,
    brightnessVal: 100,
    contrastVal: 100,
    hueRotateVal: 0,
    invertVal: 0,
    opacityVal: 100,
    saturateVal: 100,
    sepiaVal: 0,
  },
  skImg: {
    isEnabled: false,
  },
};

const annotationMemory = {};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Takes an internal image url and returns the image as base64
//-------------------------------------------------------------------------------------------------
function toDataUrl(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
      var reader = new FileReader();
      reader.onloadend = function() {
          callback(reader.result);
      }
      reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}
let noImg64 = noImg;
toDataUrl(noImg, function(theBase64) {
  noImg64 = theBase64;
});
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
// Save the image file to the local computer
//-------------------------------------------------------------------------------------------------
function saveBase64AsFile(base64, fileName, image, annotation, cssFilters) {
  const annodata = JSON.parse(annotation.getAttribute("annodata"));

  if(annodata.imgData.length > 0 || cssFilters != undefined){
    var fna = "", fnf = "";
    var imgCanvas = document.createElement("canvas");
    var imgContext = imgCanvas.getContext("2d");

    imgCanvas.width = image.naturalWidth;
    imgCanvas.height = image.naturalHeight;

    if(cssFilters != undefined){
      imgContext.filter = 'grayscale(' + cssFilters.grayscaleVal + '%) blur(' + cssFilters.blurVal + 'px) brightness(' + cssFilters.brightnessVal + '%) contrast(' + cssFilters.contrastVal + '%) hue-rotate(' + cssFilters.hueRotateVal + 'deg) invert(' + cssFilters.invertVal + '%) saturate(' + cssFilters.saturateVal + '%) sepia(' + cssFilters.sepiaVal + '%) opacity(' + cssFilters.opacityVal + '%)';
      fnf = "(CSS Filtered) ";
    }

    imgContext.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);

    if( annodata.imgData.length > 0){
      imgContext.filter = 'grayscale(0%) blur(0px) brightness(100%) contrast(100%) hue-rotate(0deg) invert(0%) saturate(100%) sepia(0%) opacity(100%)';
      imgContext.drawImage(annotation, 0, 0, image.naturalWidth, image.naturalHeight);
      fna = "(Annotated) ";
    }

    base64 = imgCanvas.toDataURL("image/png");
    fileName = fnf + fna + fileName;
  }

  const link = document.createElement("a");
  link.setAttribute("href", base64);
  link.setAttribute("target", "_blank");
  link.setAttribute("download", fileName);
  link.click();
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default function ImageView({
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

  let annotationEnabled = false;

  if(!annotationMemory[uid]){
    if(internalOptions.annotation && internalOptions.annotation.length > 0){
      annotationMemory[uid] = { uid: uid, lastMouse: {x: 0, y: 0}, imgData: [], lineData: {}, gco: "", toolType: 0, brushColor: "#ffff00", brushOpacity: 1, brushSize: 4 }
      annotationMemory[uid].imgData = internalOptions.annotation;
    }
  }

  // Make sure that older versions of imageView loads without any problem and that empty values will not cause any problems
  if(!internalOptions.cssFilters) { internalOptions["cssFilters"] = {} }
  if(originalOptions){
    fillObjectWithMissingKeys(originalOptions.cssFilters, internalOptions.cssFilters);
    if(!internalOptions.skImg) { internalOptions["skImg"] = {} }
    fillObjectWithMissingKeys(originalOptions.skImg, internalOptions.skImg);
    if(!internalOptions.imgData && data.data){ internalOptions.imgData = data.data; }
  }

  //=== BEGIN: ANNOTATION EVENT HANDLERS & METHODS ================================================================
  const onMouseDown = function(e){
    if(e.which === 1 && annotationEnabled){
        const annodata = JSON.parse(e.target.getAttribute("annodata"));
        var drawSurface = $(e.target);
        var ctx = drawSurface[0].getContext("2d");

        annodata.lastMouse = {x: (e.offsetX || e.clientX - $(e.target).offset().left), y: (e.offsetY || e.clientY - $(e.target).offset().top)};

        if(ctx.globalCompositeOperation != "destination-out"){
          annodata.gco = ctx.globalCompositeOperation;
        }

        if(parseFloat(annodata.toolType) == 1){
            ctx.globalCompositeOperation = "destination-out";
            ctx.strokeStyle = "rgba(0,0,0,1)";
        }
        else{
            ctx.globalCompositeOperation = annodata.gco;
            ctx.strokeStyle = getRGBAColorStrFromAnyColor(annodata.brushColor, parseFloat(annodata.brushOpacity));
        }

        ctx.lineWidth = parseInt(annodata.brushSize);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        annodata.lineData = {color: annodata.brushColor, opacity: annodata.brushOpacity, size: annodata.brushSize, points: [annodata.lastMouse]};
        drawSurface[0].setAttribute("annodata", JSON.stringify(annodata));
        drawSurface.on('mousemove', onMouseMove);
        drawSurface.on('mouseup', onMouseUp);
        e.stopPropagation();
    }
  };

  const onMouseMove = function(e){
    const annodata = JSON.parse(e.target.getAttribute("annodata"));
    var drawSurface = $(e.target);
    var ctx = drawSurface[0].getContext("2d");

    var currentMouse= {x: (e.offsetX || e.clientX - $(e.target).offset().left), y: (e.offsetY || e.clientY - $(e.target).offset().top)};

    ctx.beginPath();
    ctx.moveTo(annodata.lastMouse.x, annodata.lastMouse.y);
    ctx.lineTo(currentMouse.x, currentMouse.y);
    ctx.stroke();
    ctx.closePath();

    annodata.lastMouse = currentMouse;
    annodata.lineData.points.push(annodata.lastMouse);
    drawSurface[0].setAttribute("annodata", JSON.stringify(annodata));
  };

  const onMouseUp = function(e){
    const annodata = JSON.parse(e.target.getAttribute("annodata"));
    var drawSurface = $(e.target);

    drawSurface.off('mousemove');
    drawSurface.off('mouseup');
    annodata.imgData.push(annodata.lineData);
    drawSurface[0].setAttribute("annodata", JSON.stringify(annodata));

    annotationMemory[annodata.uid] = annodata;
    options["annotation"] = annodata.imgData;
  };

  const redrawPreviousImg = function(theDrawSurface, theImgData){
    var ctx = theDrawSurface.getContext("2d");
    for(var i = 0; i <  theImgData.length; i++){
      ctx.strokeStyle = getRGBAColorStrFromAnyColor(theImgData[i].color, parseFloat(theImgData[i].opacity));
      ctx.lineWidth = parseInt(theImgData[i].size);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      var thePnts = theImgData[i].points;
      for(var n = 0; n < thePnts.length - 1; n++){
        ctx.beginPath();
        ctx.moveTo(thePnts[n].x, thePnts[n].y);
        ctx.lineTo(thePnts[n+1].x, thePnts[n+1].y);
        ctx.stroke();
        ctx.closePath();
      }
    }
  };
  //=== END: ANNOTATION EVENT HANDLERS & METHODS ================================================================

  // Create the VizComp based on the incomming parameters
  const createChart = async () => {
    $(rootNode.current).empty();

    let activeImgSrc = noImg64;
    let filenamePrefix = "";
    if(internalOptions.skImg.isEnabled){
      if(data.origin){
        if(data.manipVer != ""){
          filenamePrefix = "(SciKit-Image Processed) ";
          activeImgSrc = data.manipVer;
        }
        else{
          activeImgSrc = data.origin;
        }
      }
    }
    else if(internalOptions.imgData){
      data = {};
      activeImgSrc = internalOptions.imgData;
    }

    if(activeImgSrc == noImg64){
      internalOptions = {...internalOptions, ...defaultOptions};
    }

    const cssFilters = internalOptions.cssFilters.isEnabled ? internalOptions.cssFilters : {grayscaleVal: 0, blurVal: 0, brightnessVal: 100, contrastVal: 100, hueRotateVal: 0, invertVal: 0, opacityVal: 100, saturateVal: 100, sepiaVal: 0,};
    $(rootNode.current).append(`
      <div>
        <figure>
          <label id="CadsWSUserImageTitle` + id + `" style="font-weight: bold; font-size: 16px;"></label></br>
          <div id="drawingContainer` + id + `" style="
            position: relative;
            border: ` + internalOptions.border.style + ` ` + internalOptions.border.color + ` ` + internalOptions.border.size + `px;
            width: ` + internalOptions.extent.width + `;
            height: 280;
          ">
            <img id="CadsWSUserImage` + id + `"
              src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
              style="
                position:absolute;
                padding: ` + internalOptions.pad + `px;
                filter: grayscale(` + cssFilters.grayscaleVal + `%) blur(` + cssFilters.blurVal + `px) brightness(` + cssFilters.brightnessVal + `%) contrast(` + cssFilters.contrastVal + `%) hue-rotate(` + cssFilters.hueRotateVal + `deg) invert(` + cssFilters.invertVal + `%) saturate(` + cssFilters.saturateVal + `%) sepia(` + cssFilters.sepiaVal + `%) opacity(` + cssFilters.opacityVal + `%);
              "
              width="` + internalOptions.extent.width + `"
            />
            <canvas id="drawSurface` + id + `" style="position: absolute;"></canvas>
          </div>
          <figcaption id="CadsWSUserImageCaption` + id + `"style="font-style: italic; font-size: 12px; font-weight: lighter; text-align: center;"></figcaption>
        </figure>
      </div>`
    );

    var thisImg = $(rootNode.current).find('#CadsWSUserImage' + id).on('load', function () {
      thisImg.off('load');
      var drawingContainer = $(rootNode.current).find("#drawingContainer" + id);
      var borderSizeAddOn = internalOptions.border.size * 2;
      drawingContainer.css({'width': (thisImg.width() + borderSizeAddOn) + "px", 'height': (thisImg.height() + borderSizeAddOn) + "px"});
      $(rootNode.current).find('#CadsWSUserImageTitle' + id).text(internalOptions.title);
      $(rootNode.current).find('#CadsWSUserImageCaption' + id).width(thisImg.width()).text(internalOptions.caption);

      const viewWrapperCustomButton_SaveImg = $(rootNode.current).parent().parent().find('#saveImg' + id);
      viewWrapperCustomButton_SaveImg.off('click');
      const viewWrapperCustomButton_AnnotateImg = $(rootNode.current).parent().parent().find('#annotateImg' + id);
      viewWrapperCustomButton_AnnotateImg.off('click');
      viewWrapperCustomButton_AnnotateImg.css('margin-right', '20px;');
      const viewWrapperCustomButton_AnnotationType = $(rootNode.current).parent().parent().find('#annotateBrushType' + id);
      viewWrapperCustomButton_AnnotationType.off('change');
      viewWrapperCustomButton_AnnotationType.hide();
      const viewWrapperCustomButton_AnnotationColor = $(rootNode.current).parent().parent().find('#annotationColor' + id);
      viewWrapperCustomButton_AnnotationColor.off('change');
      viewWrapperCustomButton_AnnotationColor.hide();
      const viewWrapperCustomButton_AnnotationSize = $(rootNode.current).parent().parent().find('#annotationSize' + id);
      viewWrapperCustomButton_AnnotationSize.off('change');
      viewWrapperCustomButton_AnnotationSize.hide();
      const viewWrapperCustomButton_AnnotationOpacity = $(rootNode.current).parent().parent().find('#annotationOpacity' + id);
      viewWrapperCustomButton_AnnotationOpacity.off('change');
      viewWrapperCustomButton_AnnotationOpacity.hide();
      const viewWrapperCustomButton_AnnotationReset = $(rootNode.current).parent().parent().find('#annotateImgReset' + id);
      viewWrapperCustomButton_AnnotationReset.off('click');
      viewWrapperCustomButton_AnnotationReset.hide();

      // Annotation Feature
      let annotateData = { uid: uid, lastMouse: {x: 0, y: 0}, imgData: [], lineData: {}, gco: "", toolType: 0, brushColor: "#ff0000", brushOpacity: 1, brushSize: 2 }
      if(annotationMemory[uid] && typeof annotationMemory[uid][0] !== 'string' ){
        annotateData = annotationMemory[uid];
      }

      var drawSurface = $(rootNode.current).find("#drawSurface" + id);
      drawSurface.off('mouseup');
      drawSurface[0].setAttribute("width", thisImg.width() + "px");
      drawSurface[0].setAttribute("height", thisImg.height() + "px");
      drawSurface[0].setAttribute("annodata", JSON.stringify(annotateData));

      viewWrapperCustomButton_SaveImg.on( "click", function () { saveBase64AsFile(activeImgSrc, (filenamePrefix + internalOptions.title), thisImg[0], drawSurface[0], (internalOptions.cssFilters.isEnabled ? cssFilters : undefined)); });
      viewWrapperCustomButton_AnnotateImg.on( "click", function (e) {
        if(annotationEnabled){
          viewWrapperCustomButton_AnnotateImg.css("background-color", '');
          viewWrapperCustomButton_AnnotationColor.hide();
          viewWrapperCustomButton_AnnotationSize.hide();
          viewWrapperCustomButton_AnnotationType.hide();
          viewWrapperCustomButton_AnnotationOpacity.hide();
          viewWrapperCustomButton_AnnotationReset.hide();
        }
        else{
          viewWrapperCustomButton_AnnotateImg.css("background-color", "green");
          viewWrapperCustomButton_AnnotationColor.show();
          viewWrapperCustomButton_AnnotationSize.show();
          viewWrapperCustomButton_AnnotationType.show();
          viewWrapperCustomButton_AnnotationOpacity.show();
          viewWrapperCustomButton_AnnotationReset.show();
        }
        annotationEnabled = !annotationEnabled;
      });
      viewWrapperCustomButton_AnnotationType.on('change', function (e) {
        const annodata = JSON.parse(drawSurface[0].getAttribute("annodata"));
        annodata.toolType = e.target.value;
        drawSurface[0].setAttribute("annodata", JSON.stringify(annodata));
      });
      viewWrapperCustomButton_AnnotationColor.on('change', function (e) {
        const annodata = JSON.parse(drawSurface[0].getAttribute("annodata"));
        annodata.brushColor = e.target.value;
        drawSurface[0].setAttribute("annodata", JSON.stringify(annodata));
      });
      viewWrapperCustomButton_AnnotationSize.on('change', function (e) {
        const annodata = JSON.parse(drawSurface[0].getAttribute("annodata"));
        annodata.brushSize = e.target.value;
        drawSurface[0].setAttribute("annodata", JSON.stringify(annodata));
      });
      viewWrapperCustomButton_AnnotationOpacity.on('change', function (e) {
        const annodata = JSON.parse(drawSurface[0].getAttribute("annodata"));
        annodata.brushOpacity = e.target.value;
        drawSurface[0].setAttribute("annodata", JSON.stringify(annodata));
      });
      viewWrapperCustomButton_AnnotationReset.on('click', function (e) {
        var ctx = drawSurface[0].getContext("2d");
        ctx.clearRect(0,0,thisImg.width(),thisImg.height());
        const annodata = JSON.parse(drawSurface[0].getAttribute("annodata"));
        annodata.imgData = [];
        drawSurface[0].setAttribute("annodata", JSON.stringify(annodata));
        annotationMemory[uid].imgData = annodata.imgData;
      });

      drawSurface.on('mousedown', onMouseDown);
      if(annotationMemory[uid]){
        redrawPreviousImg(drawSurface[0], annotateData.imgData);
      }
    }).attr("src", activeImgSrc);
  };

   // Clear away the VizComp
   const clearChart = () => {
    /* Called when component is deleted */
    delete annotationMemory[uid];
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
ImageView.propTypes = {
  data: PropTypes.shape({ }),
  mappings: PropTypes.shape({}),
  options: PropTypes.shape({
    title: PropTypes.string,
    caption: PropTypes.string,
    pad: PropTypes.number,
    border: PropTypes.shape({
      color: PropTypes.string,
      style: PropTypes.string,
      size: PropTypes.number,
    }),
    cssFilters: PropTypes.shape({
      isEnabled: PropTypes.bool,
      grayscaleVal: PropTypes.number,
      blurVal: PropTypes.number,
      brightnessVal: PropTypes.number,
      contrastVal: PropTypes.number,
      hueRotateVal: PropTypes.number,
      invertVal: PropTypes.number,
      opacityVal: PropTypes.number,
      saturateVal: PropTypes.number,
      sepiaVal: PropTypes.number,
    }),
    skImg: PropTypes.shape({
      isEnabled: PropTypes.bool,
    }),
    imgManip: PropTypes.string,
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
ImageView.defaultProps = {
  data: {},
  mappings: {},
  options: defaultOptions,
  colorTags: [],
};
//-------------------------------------------------------------------------------------------------
