/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'QuadBarChart' module
// ------------------------------------------------------------------------------------------------
// Notes: 'QuadBarChart' is a visualization component that displays a type of bar chart
//        based on a range of available properties, and is rendered with the help of the
//        Bokeh-Charts library.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party deepEqual, Bokeh libs with various color palettes
=================================================================================================*/

//*** TODO: Could this (and perhaps Hist) be deleted, and just leave the Bar Chart with some new settings to replace them

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import * as deepEqual from 'deep-equal';
import * as Bokeh from '@bokeh/bokehjs';

import { Category10 } from '@bokeh/bokehjs/build/js/lib/api/palettes';
import { Greys9 } from '@bokeh/bokehjs/build/js/lib/api/palettes';
const Category10_10 = Category10.Category10_10;

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: 'Quad bar chart',
  selectionColor: 'orange',
  nonselectionColor: `#${Greys9[3].toString(16)}`,
  extent: { width: 400, height: 400 },
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Creates an empty basic default Visualization Component of the specific type
//-------------------------------------------------------------------------------------------------
function createEmptyChart(options, dataIsEmpty) {
  const params = Object.assign({}, defaultOptions, options);
  const tools = 'pan,crosshair,tap,reset,save,hover';

  const fig = Bokeh.Plotting.figure({
    title: params.title || 'Bar chart',
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
export default function QuadBarChart({
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
  const color = `#${Category10_10[0].toString(16)}`;

  // Create the VizComp based on the incomming parameters
  const createChart = async () => {
    const { n, bins } = mappings;

    const fig = createEmptyChart(options, !(n && bins && data[n] && data[bins]));
    setMainFigure(fig);

    if (n && data[n] && bins && data[bins]) {
      const hhist = data[n];
      const hedges = data[bins];

      const colors = new Array(hhist.length).fill(color);

      const { indices } = data;
      if (indices) {
        for (let i = 0; i < indices.length; i++) {
          colorTags.forEach((colorTag) => {
            if (deepEqual(indices[i], colorTag.itemIndices)) {
              colors[i] = colorTag.color;
            }
          });
        }
      }

      const ds = new Bokeh.ColumnDataSource({
        data: {
          top: hhist,
          left: hedges.slice(0, -1),
          right: hedges.slice(1),
        },
      });
      cds = ds;

      // setup callback
      if (cds) {
        cds.connect(cds.selected.change, () => {
          const indices = ds.selected.indices;
          if (!deepEqual(selectedIndicesInternal, indices)) {
            selectedIndicesInternal = [...indices];
            if (onSelectedIndicesChange) {
              onSelectedIndicesChange(indices);
            }
          }
        });
      }

      fig.quad({
        bottom: 0,
        left: { field: 'left' },
        right: { field: 'right' },
        top: { field: 'top' },
        source: ds,
        color: colors,
        line_color: '#3A5785',
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
QuadBarChart.propTypes = {
  data: PropTypes.shape({
    n: PropTypes.arrayOf(PropTypes.number),
    bins: PropTypes.arrayOf(PropTypes.number),
    indices: PropTypes.arrayOf(PropTypes.array),
  }),
  mappings: PropTypes.shape({}),
  options: PropTypes.shape({}),
  colorTags: PropTypes.arrayOf(PropTypes.object),
  selectedIndices: PropTypes.arrayOf(PropTypes.number),
  onSelectedIndicesChange: PropTypes.func,
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
QuadBarChart.defaultProps = {
  data: {},
  mappings: {},
  options: {},
  colorTags: [],
  selectedIndices: [],
  onSelectedIndicesChange: undefined,
};
//-------------------------------------------------------------------------------------------------
