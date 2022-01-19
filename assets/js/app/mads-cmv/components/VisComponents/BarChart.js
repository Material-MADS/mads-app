/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'BarChart' module
// ------------------------------------------------------------------------------------------------
// Notes: 'BarChart' is a visualization component that displays a classic bar chart in numerous
//        ways based on a range of available properties, and is rendered with the help of the
//        Bokeh-Charts library.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party deepEqual, Bokeh libs with various color palettes
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { Component, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import * as deepEqual from 'deep-equal';
import * as Bokeh from '@bokeh/bokehjs';

import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";
import gPalette from 'google-palette';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: 'Bar Chart',
  selectionColor: 'orange',
  nonselectionColor: '#' + allPal['Greys9'][3].toString(16),
  extent: { width: 400, height: 400 },
  colorMap: 'Category10',
  barColors: [],
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Creates an empty basic default Visualization Component of the specific type
//-------------------------------------------------------------------------------------------------
function createEmptyChart(options, dataIsEmpty) {
  const params = { ...defaultOptions, ...options };
  const tools = 'pan,crosshair,tap,reset,save,hover';

  const fig = Bokeh.Plotting.figure({
    title: params.title,
    tools,
    x_range: params.x_range || (dataIsEmpty ? ['A', 'B'] : undefined),
    y_range: params.y_range || (dataIsEmpty ? [-1, 1] : undefined),
    width: params.extent.width || 400,
    height: params.extent.height || 400,
  });

  if (params.xaxis_orientation) {
    fig.xaxis[0].major_label_orientation = params.xaxis_orientation;
  }

  return fig;
}
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
export default function BokehBarChart({
  data,
  mappings,
  options,
  colorTags,
  selectedIndices,
  onSelectedIndicesChange,
}) {

  // Initiation of the VizComp
  const rootNode = useRef(null);
  const [mainFigure, setMainFigure] = useState(null);
  let cds = null;
  let views = null;
  let selectedIndicesInternal = [];
  const internalOptions = Object.assign({}, defaultOptions, options);
  let internalData = data;

  // Clear away all data if requested
  useEffect(() => {
    if(internalData.resetRequest){
      internalOptions.title = undefined;
      delete internalData.resetRequest;
    }
  }, [internalData])

  // Create the VizComp based on the incomming parameters
  const createChart = async () => {
    const { dimension, measures } = mappings;

    // setup ranges
    if (dimension && measures && data[dimension]) {
      data[dimension] = data[dimension].map(String);
      options.x_range = data[dimension];
    }

    const fig = createEmptyChart(options, !(dimension && measures && data[dimension]));

    if (dimension && measures && data[dimension]) {
      const ds = new Bokeh.ColumnDataSource({ data });
      cds = ds;

      let pal = options.palette;
      if (!pal && measures.length > 0) {
        pal = gPalette('tol-rainbow', measures.length).map((c) => `#${c}`);
      }

      // setup callback
      if (cds) {
        cds.connect(cds.selected.change, (...args) => {
          const indices = ds.selected.indices;
          if (!deepEqual(selectedIndicesInternal, indices)) {
            selectedIndicesInternal = [...indices];
            if (onSelectedIndicesChange) {
              onSelectedIndicesChange(indices);
            }
          }
        });
      }

      const barWidth = 4 / (measures.length * 5);
      const step = barWidth + barWidth * 0.1;

      measures.forEach((m, i) => {
        const xv = new Bokeh.Dodge({
          name: dimension,
          value: step * i - (step * (measures.length - 1)) / 2,
          range: fig.x_range,
        });

        const l = data[dimension].length;
        const ppal = new Array(l).fill(pal[i]);

        if (options.barColors) {
          options.barColors.forEach((c, i) => {
            ppal[i] = c;
          });
        }

        fig.vbar({
          x: { field: dimension, transform: xv },
          top: { field: m },
          width: barWidth,
          source: ds,
          color: ppal,
          legend: {
            value: measures[i],
          },
        });
        fig.legend.location = options.legendLocation || 'top_right';
      });
    }

    views = await Bokeh.Plotting.show(fig, rootNode.current);
    return cds;
  };

  // Clear away the VizComp
  const clearChart = () => {
    if (Array.isArray(views)) {
    } else {
      const v = views;
      if (v) {
        v.remove();
      }
    }

    setMainFigure(null);
    views = null;
  };

  // Recreate the chart if the data and settings change
  useEffect(() => {
    createChart();
    return () => {
      clearChart();
    };
  }, [data, mappings, options, colorTags]);

  // Catch current data selections properly in the VizComp
  const prevCds = usePrevious(cds);
  useEffect(() => {
    if (selectedIndices.length === 0) {
      if (prevCds) {
        prevCds.selected.indices = [];
      }
    }
  }, [selectedIndices]);

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
BokehBarChart.propTypes = {
  data: PropTypes.shape({}),
  mappings: PropTypes.shape({
    dimension: PropTypes.string,
    measures: PropTypes.arrayOf(PropTypes.string),
  }),
  options: PropTypes.shape({
    title: PropTypes.string,
    selectionColor: PropTypes.string,
    nonselectionColor: PropTypes.string,
    palette: PropTypes.arrayOf(PropTypes.string),
    barColors: PropTypes.arrayOf(PropTypes.string),
    extent: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }),
  }),
  colorTags: PropTypes.arrayOf(PropTypes.object),
  selectedIndices: PropTypes.arrayOf(PropTypes.number),
  onSelectedIndicesChange: PropTypes.func,
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
BokehBarChart.defaultProps = {
  data: {},
  mappings: {},
  options: defaultOptions,
  colorTags: [],
  selectedIndices: [],
  onSelectedIndicesChange: undefined,
};
//-------------------------------------------------------------------------------------------------
