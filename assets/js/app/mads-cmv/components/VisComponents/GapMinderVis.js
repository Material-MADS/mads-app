/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'Gapminder' module
// ------------------------------------------------------------------------------------------------
// Notes: 'Gapminder' is a visualization component that displays a classic Gapminder Plot in
//        various ways based on a range of available properties, and is rendered with the help of the
//        ??? library.
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


import * as loadingActions from '../../actions/loading';
// import { config } from "process";

// Dev and Debug declarations
window.Plotly = Plotly;

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "GapMinder",
  extent: { width: 900, height: 600 },
  // axisTitles: ['x', 'y'],
  // margin: { l: 10, r: 10, b: 10, t: 30, pad: 2 },
  modebar: { orientation: 'h'},
  displayModeBar: 'hover',
  modeBarButtonsToRemove: [], //[toImage, zoom3d, pan3d, orbitRotation, tableRotation, resetCameraDefault3d, resetCameraLastSave3d, hoverClosest3d]
  displaylogo: true,
  // marker: {
  //   size: 4,
  //   color: 'red',
  //   opacity: 0.8,
  // },
  colorMap: 'Category20c',
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Get Chart Data
// Support Method that extracts and prepare the provided data for the VisComp
//-------------------------------------------------------------------------------------------------
function getChartData(data, options, selectedIndices, colorTags) {
  const params = Object.assign({}, defaultOptions, options,);

  var traces = [];
  var frames = [];
  var sliderSteps = [];

  // data = _.isEmpty(data)?{x: [0.1, 0.2], y: [0.1, 0.2], z: [0.1, 0.2]}:data;
  // let uniques = [... new Set(data.gr)];
  // var cm = (allPal[(params.colorMap + uniques.length)] != undefined) ? allPal[(params.colorMap + uniques.length)] : allPal[(params.colorMap + '_' + uniques.length)];

  // if(_.isEmpty(theData)){
  //   $(rootNode.current).append(`
  //   <div>
  //     <div id="outputContainer` + id + `" style="
  //       position: relative;
  //       border: solid blue 1px;
  //       padding: 10px;
  //       font-weight: bold;
  //       font-size: 20px;
  //       width: ` + internalOptions.extent.width + `;
  //     ">
  //     </div>
  //   </div>`
  //   );

  //   var outputContainer = $(rootNode.current).find("#outputContainer" + id);
  //   outputContainer.html("<img width='200' src='https://www.gapminder.org/wp-content/themes/gapminder2/images/gapminder-logo.svg' /></br> New CADS Component Under Development");
  // }

  if(_.isEmpty(data)){
    traces = [{
      y: [],
      x: [],
      opacity: 0.0,
    },];
  }
  else{
    // Create a lookup table to sort and regroup the columns of theData, first by year, then by continent:
    var lookup = {};
    function getData(year, continent) {
      var byYear, trace;
      if (!(byYear = lookup[year])) {;
        byYear = lookup[year] = {};
      }
      // If a container for this year + continent doesn't exist yet, then create one:
      if (!(trace = byYear[continent])) {
        trace = byYear[continent] = {
          x: [],
          y: [],
          id: [],
          text: [],
          marker: {size: []}
        };
      }
      return trace;
    }

    // Go through each row, get the right trace, and append the theData:
    for (var i = 0; i < data.length; i++) {
      var datum = data[i];
      var trace = getData(datum.year, datum.continent);
      trace.text.push(datum.country);
      trace.id.push(datum.country);
      trace.x.push(datum.lifeExp);
      trace.y.push(datum.gdpPercap);
      trace.marker.size.push(datum.pop);
    }

    // Get the group names:
    var years = Object.keys(lookup);
    // In this case, every year includes every continent, so we can just infer the continents from the *first* year:
    var firstYear = lookup[years[0]];
    var continents = Object.keys(firstYear);

    // Create the main traces, one for each continent:

    for (i = 0; i < continents.length; i++) {
      var grSubData = firstYear[continents[i]];
    // One small note. We're creating a single trace here, to which the frames will pass grSubData for the different years. It's subtle, but to avoid grSubData reference problems, we'll slice
    // the arrays to ensure we never write any new grSubData into our lookup table:
      traces.push({
        name: continents[i],
        x: grSubData.x.slice(),
        y: grSubData.y.slice(),
        id: grSubData.id.slice(),
        text: grSubData.text.slice(),
        mode: 'markers',
        marker: {
          size: grSubData.marker.size.slice(),
          sizemode: 'area',
          sizeref: 200000
        }
      });
    }

    // Create a frame for each year. Frames are effectively just traces, except they don't need to contain the *full* trace definition (for example, appearance). The frames just need the parts the traces that change (here, the theData).
    for (i = 0; i < years.length; i++) {
      frames.push({
        name: years[i],
        data: continents.map(function (continent) {
          return getData(years[i], continent);
        })
      })
    }

    // Now create slider steps, one for each frame. The slider executes a plotly.js API command (here, Plotly.animate). In this example, we'll animate to one of the named frames created in the above loop.

    for (i = 0; i < years.length; i++) {
      sliderSteps.push({
        method: 'animate',
        label: years[i],
        args: [[years[i]], {
          mode: 'immediate',
          transition: {duration: 300},
          frame: {duration: 300, redraw: false},
        }]
      });
    }




  }


  return {traces: traces, frames: frames, sliderSteps: sliderSteps};




  // let colors = [];
  // if(uniques.length <= 20){
  //   if(cm != undefined){
  //     colors = cm.slice(0, uniques.length);
  //   }
  //   else{
  //     colors = allPal[(defaultOptions.colorMap + '_' + uniques.length)];
  //     params.colorMap = defaultOptions.colorMap;
  //   }
  // }
  // else if(uniques.length > 20 && uniques.length <= 256){
  //   if(allPal[(params.colorMap + '256')] != undefined){
  //     cm = allPal[(params.colorMap + '256')];
  //   }
  //   else{
  //     cm = allPal.Magma256;
  //     params.colorMap = 'Magma';
  //   }
  //   if(uniques.length > 20 && uniques.length < 256){
  //     const step = Math.floor(256/uniques.length);
  //     for(let i = 0; i < uniques.length; i++) {
  //       colors.push(cm[i*step]);
  //     };
  //   }
  //   else{ colors = cm; }
  // }
  // else{
  //   colors = undefined;
  // }

  // let styles = undefined;
  // if(colors !== undefined){
  //   styles = uniques.map((grColName, index) => { return {target: grColName, value: {marker: {color: ("#"+colors[index].toString(16).slice(0, -2).padStart(6, '0'))}}} });
  // }

  // var theMarkerColors = params.marker.color;
  // if((selectedIndices && selectedIndices.length > 0) || colorTags.length > 0){
  //   theMarkerColors = data.x.map(v => params.marker.color);
  // }

  // if(selectedIndices && selectedIndices.length > 0){
  //   for(var i = 0; i < selectedIndices.length; i++){
  //     theMarkerColors[selectedIndices[i]] = '#FFA500';
  //   }
  // }

  // if(colorTags.length > 0){
  //   colorTags.forEach((colorTag) => {
  //     colorTag.itemIndices.forEach((i) => {
  //       theMarkerColors[i] = colorTag.color;
  //     });
  //   });
  // }

  // var cData = [{
  //   type: 'scatter3d',
  //   mode: 'markers',
  //   transforms: [{
  //     type: "groupby",
  //     groups: data.gr,
  //     styles: styles,
  //   }],
  //   x: data.x,
  //   y: data.y,
  //   z: data.z,
  //   marker: {
  //     size: (params.marker.manySizes && params.marker.manySizes.length > 0) ? params.marker.manySizes : params.marker.size,
  //     color: theMarkerColors,
  //     opacity: params.marker.opacity,
  //   },
  // },];

  // return cData;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Get Chart Layout
// Support Method that extracts and prepare the provided layout settings for the VisComp
//-------------------------------------------------------------------------------------------------
function getChartLayout(data, options, sliderSteps) {
  const params = Object.assign({}, defaultOptions, options);
  var cLayout = {};

  if(_.isEmpty(data)){
    cLayout = {
      xaxis: {
        title: 'Empty',
      },
      yaxis: {
        title: 'Empty',
      },
      title: {
        text: params.title,
      },
      width: params.extent.width,
      height: params.extent.height,
    };
  }
  else{
    cLayout = {
      xaxis: {
        title: 'Life Expectancy',
        range: [30, 85]
      },
      yaxis: {
        title: 'GDP per Capita',
        type: 'log'
      },
      title: {
        text: params.title,
      },
      hovermode: 'closest',
      width: params.extent.width,
      height: params.extent.height,
      // We'll use updatemenus (whose functionality includes menus as well as buttons) to create a play button and a pause button.
      // The play button works by passing `null`, which indicates that Plotly should animate all frames.
      // The pause button works by passing `[null]`, which indicates we'd like to interrupt any currently running animations with a new list of frames.
      // Here the new list of frames is empty, so it halts the animation.
      updatemenus: [{
        x: 0,
        y: 0,
        yanchor: 'top',
        xanchor: 'left',
        showactive: false,
        direction: 'left',
        type: 'buttons',
        pad: {t: 87, r: 10},
        buttons: [{
          method: 'animate',
          args: [null, {
            mode: 'immediate',
            fromcurrent: true,
            transition: {duration: 300},
            frame: {duration: 500, redraw: false}
          }],
          label: 'Play'
        }, {
          method: 'animate',
          args: [[null], {
            mode: 'immediate',
            transition: {duration: 0},
            frame: {duration: 0, redraw: false}
          }],
          label: 'Pause'
        }]
      }],
      // Finally, add the slider and use `pad` to position it nicely next to the buttons.
      sliders: [{
        pad: {l: 130, t: 55},
        currentvalue: {
          visible: true,
          prefix: 'Year:',
          xanchor: 'right',
          font: {size: 20, color: '#666'}
        },
        steps: sliderSteps
      }]
    };
  }




  // var axisTitleAddon = ["", "", ""];
  // if(currentDataSourceName != "" && data.x){
  //   if(data.evr && params.axisTitles[0].substr(0,4) == "PC 1"){
  //     (data.evr).forEach((item, index) => axisTitleAddon[index]=(" (" + ((item*100).toFixed(2)) + "%)"));
  //     params.title = "3D PCA plot from " + data.noOfFeat + " features <br>of the " + currentDataSourceName + " dataset";
  //   }
  //   else{
  //     params.title = "<span style='color:blue;'>" + params.axisTitles[0] + "<span style='color:red;'> vs. </span>" + params.axisTitles[1] + "<span style='color:red;'> vs. </span>" + params.axisTitles[2] + "<br><span style='color:purple; font-weight: bold;'>(by " + currentDataSourceName + ")</span></span>";
  //   }
  // }

  // var cLayout = {
  //   autosize: true,
  //   width: params.extent.width,
  //   height: params.extent.height,
  //   title: {
  //     text: params.title,
  //   },
  //   scene: {
  //     xaxis: {
  //       title: (params.axisTitles[0] || defaultOptions.axisTitles[0]) + axisTitleAddon[0],
  //       nticks: _.isEmpty(data)?10:undefined,
  //     },
  //     yaxis: {
  //       title: (params.axisTitles[1] || defaultOptions.axisTitles[1]) + axisTitleAddon[1],
  //       nticks: _.isEmpty(data)?10:undefined,
  //     },
  //     zaxis: {
  //       title: (params.axisTitles[2] || defaultOptions.axisTitles[2]) + axisTitleAddon[2],
  //       nticks: _.isEmpty(data)?10:undefined,
  //     },
  //     camera: {
  //       eye: params.camera.eye,
  //       up: params.camera.up,
  //       center: params.camera.center,
  //     },
  //   },
  //   modebar: {
  //     orientation: params.modebar.orientation,
  //   },
  //   margin: {
  //     l: params.margin.l,
  //     r: params.margin.r,
  //     b: params.margin.b,
  //     t: params.margin.t,
  //     pad: params.margin.pad,
  //   },
  // };

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
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default function Gapminder({
  data,
  options,
  colorTags,
  selectedIndices,
  isPropSheetOpen,
  actions,
  id,
}) {

  // Initiation of the VizComp
  const rootNode = useRef(null);
  // const uid = "id"+id;
  let internalOptions = options;

  let currentDataSourceName = "";
  try {
    const availableDataSources = useSelector((state) => state.dataSources);
    currentDataSourceName = (availableDataSources.items.find(item => availableDataSources.selectedDataSource == item.id)).name;
  } catch (error) { /*Just ignore and move on*/ }

  // Create the VizComp based on the incoming parameters
  const createChart = async () => {
    $(rootNode.current).empty();

    var theData = data.data;

    console.log(theData);

    internalOptions.colorMap = internalOptions.colorMap || defaultOptions.colorMap;
    let sData = getChartData(theData, internalOptions, selectedIndices, colorTags);
    let layout = getChartLayout(theData, internalOptions, sData.sliderSteps);
    let config = getChartConfig(internalOptions);


    loadingActions.setLoadingState(true);
    $(function(){
      Plotly.react(rootNode.current, { data: sData.traces, layout: layout, frames: sData.frames, config: config, }).then(function() {
      })
      .finally(function() {
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
      // internalOptions.axisTitles = ['x', 'y'];
      // delete data['gr'];
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
    <div>
      <div ref={rootNode} />
    </div>
  );
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
Gapminder.propTypes = {
  data: PropTypes.shape({ }),
  mappings: PropTypes.shape({
    x: PropTypes.string,
    y: PropTypes.string,
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
Gapminder.defaultProps = {
  data: {},
  mappings: {},
  options: defaultOptions,
  colorTags: [],
};
//-------------------------------------------------------------------------------------------------
