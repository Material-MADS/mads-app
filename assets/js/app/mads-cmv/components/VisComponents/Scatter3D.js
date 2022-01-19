/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'Scatter3D' module
// ------------------------------------------------------------------------------------------------
// Notes: 'Scatter3D' is a visualization component that displays a classic 3D Scatter Plot in
//        various ways based on a range of available properties, and is rendered with the help of the
//        Plotly library.
// ------------------------------------------------------------------------------------------------
// References: React, redux & prop-types Libs, 3rd party lodash, jquery and Plotly libs with
//             Bokeh color palettes
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useEffect, useRef } from "react";
import { useSelector } from 'react-redux'
import PropTypes from "prop-types";

import _ from 'lodash';
import $ from "jquery";
import Plotly from 'plotly.js-dist-min';

import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";

// Dev and Debug declarations
window.Plotly = Plotly;

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "Scatter 3D",
  extent: { width: 450, height: 450 },
  camera: {
    eye: {x: 1.25, y: 1.25, z: 1.25},
    up: {x: 0, y: 0, z: 1},
    center: {x: 0, y: 0, z: 0},
  },
  axisTitles: ['x', 'y', 'z'],
  margin: { l: 10, r: 10, b: 10, t: 30, pad: 2 },
  modebar: { orientation: 'h'},
  displayModeBar: 'hover',
  modeBarButtonsToRemove: [], //[toImage, zoom3d, pan3d, orbitRotation, tableRotation, resetCameraDefault3d, resetCameraLastSave3d, hoverClosest3d]
  displaylogo: true,
  marker: {
    size: 4,
    color: 'red',
    opacity: 0.8,
  },
  colorMap: 'Category20c',
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Get Chart Data
// Support Method that extracts and prepare the provided data for the VisComp
//-------------------------------------------------------------------------------------------------
function getChartData(data, options) {
  const params = Object.assign({}, defaultOptions, options, _.isEmpty(data)?{marker: {size: 1, color: 'transparent', opacity: 0}}:{});
  data = _.isEmpty(data)?{x: [0.1, 0.2], y: [0.1, 0.2], z: [0.1, 0.2]}:data;
  let uniques = [... new Set(data.gr)];
  var cm = (allPal[(params.colorMap + uniques.length)] != undefined) ? allPal[(params.colorMap + uniques.length)] : allPal[(params.colorMap + '_' + uniques.length)];

  let colors = [];
  if(uniques.length <= 20){
    if(cm != undefined){
      colors = cm.slice(0, uniques.length);
    }
    else{
      colors = allPal[(defaultOptions.colorMap + '_' + uniques.length)];
      params.colorMap = defaultOptions.colorMap;
    }
  }
  else if(uniques.length > 20 && uniques.length <= 256){
    if(allPal[(params.colorMap + '256')] != undefined){
      cm = allPal[(params.colorMap + '256')];
    }
    else{
      cm = allPal.Magma256;
      internalOptions.colorMap = 'Magma';
    }
    if(uniques.length > 20 && uniques.length < 256){
      const step = Math.floor(256/angles.length);
      for(let i = 0; i < uniques.length; i++) {
        colors.push(cm[i*step]);
      };
    }
    else{ colors = cm; }
  }
  else{
    colors = undefined;
  }

  let styles = undefined;
  if(colors !== undefined){
    styles = uniques.map((grCatName, index) => { return {target: grCatName, value: {marker: {color: ("#"+colors[index].toString(16).slice(0, -2).padStart(6, '0'))}}} });
  }

  var cData = [{
    type: 'scatter3d',
    mode: 'markers',
    transforms: [{
      type: "groupby",
      groups: data.gr,
      styles: styles,
    }],
    x: data.x,
    y: data.y,
    z: data.z,
    marker: {
      size: params.marker.size,
      color: params.marker.color,
      opacity: params.marker.opacity,
    },
  },];

  return cData;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Get Chart Layout
// Support Method that extracts and prepare the provided layout settings for the VisComp
//-------------------------------------------------------------------------------------------------
function getChartLayout(data, options, currentDataSourceName) {
  const params = Object.assign({}, defaultOptions, options);

  var axisTitleAddon = ["", "", ""];
  if(currentDataSourceName != "" && data.x){
    if(data.evr && params.axisTitles[0].substr(0,4) == "PC 1"){
      (data.evr).forEach((item, index) => axisTitleAddon[index]=(" (" + ((item*100).toFixed(2)) + "%)"));
      params.title = "3D PCA plot from " + data.noOfFeat + " features <br>of the " + currentDataSourceName + " dataset";
    }
    else{
      params.title = "<span style='color:blue;'>" + params.axisTitles[0] + "<span style='color:red;'> vs. </span>" + params.axisTitles[1] + "<span style='color:red;'> vs. </span>" + params.axisTitles[2] + "<br><span style='color:purple; font-weight: bold;'>(by " + currentDataSourceName + ")</span></span>";
    }
  }

  var cLayout = {
    autosize: true,
    width: params.extent.width,
    height: params.extent.height,
    title: {
      text: params.title,
    },
    scene: {
      xaxis: {
        title: (params.axisTitles[0] || defaultOptions.axisTitles[0]) + axisTitleAddon[0],
        nticks: _.isEmpty(data)?10:undefined,
      },
      yaxis: {
        title: (params.axisTitles[1] || defaultOptions.axisTitles[1]) + axisTitleAddon[1],
        nticks: _.isEmpty(data)?10:undefined,
      },
      zaxis: {
        title: (params.axisTitles[2] || defaultOptions.axisTitles[2]) + axisTitleAddon[2],
        nticks: _.isEmpty(data)?10:undefined,
      },
      camera: {
        eye: params.camera.eye,
        up: params.camera.up,
        center: params.camera.center,
      },
    },
    modebar: {
      orientation: params.modebar.orientation,
    },
    margin: {
      l: params.margin.l,
      r: params.margin.r,
      b: params.margin.b,
      t: params.margin.t,
      pad: params.margin.pad,
    },
  };

  return cLayout;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Get Chart Configuration
// Support Method that extracts and prepare the provided Option Parameters for the VisComp
//-------------------------------------------------------------------------------------------------
function getChartConfig(options) {
  const params = Object.assign({}, defaultOptions, options);

  var cConfig = {
    displayModeBar: params.displayModeBar,
    modeBarButtonsToRemove: params.modeBarButtonsToRemove,
    modeBarButtonsToAdd: [],
    displaylogo: params.displaylogo,
  };

  return cConfig;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Returns the previous value (Not used or fully implemented)
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
export default function Scatter3D({
  data,
  mappings,
  options,
  colorTags,
}) {

  // Initiation of the VizComp
  const rootNode = useRef(null);
  let internalData = data;
  let internalOptions = options;

  let currentDataSourceName = "";
  try {
    const availableDataSources = useSelector((state) => state.dataSources);
    currentDataSourceName = (availableDataSources.items.find(item => availableDataSources.selectedDataSource == item.id)).name;
  } catch (error) { /*Just ignore and move on*/ }

  // Clear away all data if requested
  useEffect(() => {
    if(internalData.resetRequest){
      internalOptions.title = "Scatter 3D";
      internalOptions.axisTitles = ['x', 'y', 'z'];
      delete internalData.resetRequest;
    }
  }, [internalData])

  // Create the VizComp based on the incomming parameters
  const createChart = async () => {
    internalOptions.colorMap = internalOptions.colorMap || defaultOptions.colorMap;
    let sData = getChartData(internalData, internalOptions);
    let layout = getChartLayout(internalData, internalOptions, currentDataSourceName);
    let config = getChartConfig(internalOptions);

    $(rootNode.current).append('<img id="Scatter3DLoadingGif" src="https://miro.medium.com/max/700/1*CsJ05WEGfunYMLGfsT2sXA.gif" width="300" />');
    $(function(){
      Plotly.react(rootNode.current, sData, layout, config).then(function() {
        $( "#Scatter3DLoadingGif" ).remove();
      });

      (rootNode.current).on('plotly_relayout', function(internalData){ internalOptions["camera"] = (rootNode.current).layout.scene.camera});
    });
  };

  // Clear away the VizComp
  const clearChart = () => { };

  // Recreate the chart if the data and settings change
  useEffect(() => {
    createChart();
    return () => {
      clearChart();
    };
  }, [data, mappings, options, colorTags]);

  // Add the VizComp to the DOM
  return (
    <div id="container">
      <div ref={rootNode} />
    </div>
  );
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
Scatter3D.propTypes = {
  data: PropTypes.shape({ }),
  mappings: PropTypes.shape({
    x: PropTypes.string,
    y: PropTypes.string,
    z: PropTypes.string,
    color: PropTypes.string,
  }),
  options: PropTypes.shape({
    title: PropTypes.string,
    selectionColor: PropTypes.string,
    nonselectionColor: PropTypes.string,
    chartColors: PropTypes.arrayOf(PropTypes.string),
    extent: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number.isRequired,
    }),
  }),
  colorTags: PropTypes.arrayOf(PropTypes.object),
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
Scatter3D.defaultProps = {
  data: {},
  mappings: {},
  options: defaultOptions,
  colorTags: [],
};
//-------------------------------------------------------------------------------------------------
