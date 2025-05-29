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
import Plotly from 'plotly.js/lib/core';

Plotly.register([
  require('plotly.js/lib/scatter'),
]);

import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";


import * as loadingActions from '../../actions/loading';

// Dev and Debug declarations
window.Plotly = Plotly;

import gmData from './testdata/gapMinderSubData';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "GapMinder",
  extent: { width: 900, height: 600 },
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
function getChartData(data, options, selectedIndices, colorTags) {
  const params = Object.assign({}, defaultOptions, options,);

  var traces = [];
  var frames = [];
  var sliderSteps = [];

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
}) {

  // Initiation of the VizComp
  const rootNode = useRef(null);
  let internalOptions = options;

  // Create the VizComp based on the incoming parameters
  const createChart = async () => {
    var theData = data.data;

    if(_.isEmpty(theData)){
      theData = gmData.data;
    }

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
  options: PropTypes.shape({
    title: PropTypes.string,
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
  options: defaultOptions,
  colorTags: [],
};
//-------------------------------------------------------------------------------------------------
