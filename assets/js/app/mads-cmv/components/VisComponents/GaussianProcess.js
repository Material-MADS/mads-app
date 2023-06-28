/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
//          Yoshiki Hasukawa
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'GaussianProcess' module
// ------------------------------------------------------------------------------------------------
// Notes: 'GaussianProcess' is a visualization component that displays a 3D surface Plot in
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
import { Card } from 'semantic-ui-react';
import PropTypes from "prop-types";

import _ from 'lodash';
import $ from "jquery";
import Plotly from 'plotly.js-dist-min';

import * as loadingActions from '../../actions/loading';

// Dev and Debug declarations
window.Plotly = Plotly;

//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------

const defaultOptions = {
  title: "Gaussian Process",
  extent: { width: 450, height: 450 },
  camera: {
    eye: {x: 1.25, y: 1.25, z: 1.25},
    up: {x: 0, y: 0, z: 1},
    center: {x: 0, y: 0, z: 0},
  },
  margin: { l: 10, r: 10, b: 10, t: 30, pad: 2 },
  modebar: { orientation: 'h'},
  displayModeBar: 'hover',
  modeBarButtonsToRemove: [], //[toImage, zoom3d, pan3d, orbitRotation, tableRotation, resetCameraDefault3d, resetCameraLastSave3d, hoverClosest3d]
  displaylogo: true,
  colorMap: 'Category20c',
};

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Get Chart Data
// Support Method that extracts and prepare the provided data for the VisComp
//-------------------------------------------------------------------------------------------------
function getChartData(data, options, information, featureColumns, targetColumn) {
  //The number of feature columns is two
  if (_.isEmpty(data)) {
    var cData = [{
      type: 'surface',
      x: [[0.1, 0.2]], 
      y: [[0.1, 0.2]], 
      z: [[0.1, 0.2]],  
    },];
  } else {
    if (information === 'Proposed experimental conditions') {
      var cData = [{
        type: 'table',
        header: {
          values: data.bayesian_optimization.header_values,
          align: "center",
          line: {width: 1, color: 'black'},
          fill: {color: "grey"},
          font: {family: "Arial", size: 13, color: "white"}
        },
        cells: {
          values: data.bayesian_optimization.values,
          align: "center",
          line: {color: "black", width: 1},
          font: {family: "Arial", size: 12, color: ["black"]},
          
        }
      }]
    } else {
      if (featureColumns.length === 1) {
        const x = featureColumns[0].column;
        var cData = [{
          type: 'scatter',
          x: data.feature_columns[x],
          y: data[targetColumn][information],
          mode: 'lines'
        }]
      }
      else if (featureColumns.length === 2){
        const x = featureColumns[0].column;
        const y = featureColumns[1].column;
        var cData = [{
          type: 'surface',
          x: data.feature_columns[x],
          y: data.feature_columns[y],
          z: data[targetColumn][information],
        }]
      }
      else {
        let dimensions = [];
        Object.keys(data.feature_columns).forEach(key => {
          dimensions.push({label: key, values: data.feature_columns[key]});
        })
        dimensions.push({label: information, values: data[targetColumn][information]});
        var cData = [{
          type: 'parcoords',
          dimensions: dimensions,
        }];
      }
    }
  }
  return cData;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Get Chart Layout
// Support Method that extracts and prepare the provided layout settings for the VisComp
//-------------------------------------------------------------------------------------------------
function getChartLayout(data, options, currentDataSourceName, information, featureColumns, targetColumn) {
  const params = Object.assign({}, defaultOptions, options);
  const margin = {
    l: params.margin.l,
    r: params.margin.r,
    b: params.margin.b,
    t: params.margin.t,
    pad: params.margin.pad,
  }
  const modebar = {
    orientation: params.modebar.orientation,
  }

  if (_.isEmpty(data)) {
    var cLayout = {
      width: params.extent.width,
      height: params.extent.height,
      title: {
        text: params.title,
      },
      modebar: modebar,
      margin: margin,
    }
  } else {
    if (information === 'Proposed experimental conditions') {
      var cLayout = {
        autosize: true,
        title: "The top 10% percentile of Expected Improvement",
        width: params.extent.width,
        height: params.extent.height,
        modebar: modebar,
        margin: margin,

      }
    } else {
      if (featureColumns.length === 1) {
        var cLayout = {
          autosize: true,
          width: params.extent.width,
          height: params.extent.height,
          title: {
            text: params.title + " <br> " + information,
          },
          xaxis: {
            title: featureColumns[0].column,
            nticks: 10
          },
          yaxis: {
            title: targetColumn,
            nticks: 10,
          },
          modebar: modebar,
        }
      } else if (featureColumns.length === 2) {
        var cLayout = {
          autosize: true,
          width: params.extent.width,
          height: params.extent.height,
          title: {
            text: params.title + " <br> " + information,
          },
          scene: {
            xaxis: {
              title: 'x:' + featureColumns[0].column,
              nticks: 10,
            },
            yaxis: {
              title: 'y:' + featureColumns[1].column,
              nticks: 10,
            },
            zaxis: {
              title: 'z:' + targetColumn,
              nticks: 10,
            },
            camera: {
              eye: params.camera.eye,
              up: params.camera.up,
              center: params.camera.center,
            },
          },
          modebar: modebar,
          margin: margin,
        };
      } else {
        var cLayout = {
          autosize: true,
          width: params.extent.width,
          height: params.extent.height,
          title: {
            text: params.title + " <br> " + targetColumn,
          },
          modebar: modebar,
        };
      }

    }
  }

  return cLayout;
}

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
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default function GaussianProcess({
  data,
  options,
  information,
  featureColumns,
  targetColumn,
  colorTags,
  selectedIndices,
  isPropSheetOpen,
  actions,
}) {


  // Initiation of the VizComp
  const rootNode = useRef(null);
  let internalData = data
  let internalOptions = options;
  let internalInformation = information;
  let internalFeatureColumns = featureColumns;
  let internalTargetColumn = targetColumn;



  let currentDataSourceName = "";
  try {
    const availableDataSources = useSelector((state) => state.dataSources);
    
    currentDataSourceName = (availableDataSources.items.find(item => availableDataSources.selectedDataSource == item.id)).name;
  } catch (error) { /*Just ignore and move on*/ }

  // Create the VizComp based on the incoming parameters
  const createChart = async () => {
    if(actions){ actions.setLoadingState(true); }
    let sData = getChartData(internalData, internalOptions, internalInformation, internalFeatureColumns, internalTargetColumn);
    let layout = getChartLayout(internalData, internalOptions, currentDataSourceName, internalInformation, internalFeatureColumns, internalTargetColumn);
    let config = getChartConfig(internalOptions)

    loadingActions.setLoadingState(true);
    $(function(){
      Plotly.react(rootNode.current, sData, layout, config).then(function() {
      })
      .finally(function() {
        if (featureColumns == 2) {internalOptions["camera"] = (rootNode.current).layout.scene.camera;}
        if(actions){ actions.setLoadingState(false); }
      });
    });
    };

  // Clear away the VizComp
  const clearChart = () => { /* Called when component is deleted */ };

  // Only called at init and set our final exit function
  useEffect(() => {
    return () => { clearChart(); };
  }, []);

  // Recreate the chart if the data and settings change
  useEffect(() => {
    if(isPropSheetOpen){ return; }

    // Clear away all data if requested
    if(data.resetRequest){
      internalOptions.title = "";
      if (featureColumns == 1) {
        internalFeatureColumns[0].column = "x";
        internalTargetColumn = "y";
      } else if (featureColumns == 2) {
        internalFeatureColumns[0].column = "x";
        internalFeatureColumns[1].column = "y";
        internalTargetColumn = "z"
      } else {
        internalFeatureColumns = []
        internalTargetColumn = ''
      }
      delete data.resetRequest;
    }

    createChart();
  }, [data, options]);

  useEffect(() => {
    if(isPropSheetOpen){ return; }
    createChart();
  }, [selectedIndices, colorTags]);

  // Add the VizComp to the DOM
  return (
    <div ref={rootNode} />
  );
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
GaussianProcess.propTypes = {
  data: PropTypes.shape({ }),
  information: PropTypes.string,
  featureColumns: PropTypes.array,
  targetColumn: PropTypes.string,
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
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
GaussianProcess.defaultProps = {
  data: {},
  information: '',
  featureColumns: [],
  targetColumn: '',
  options: defaultOptions,
};
//-------------------------------------------------------------------------------------------------
