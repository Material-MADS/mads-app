/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'ParCoords' module
// ------------------------------------------------------------------------------------------------
// Notes: 'ParCoords' is a visualization component that displays a Parallell Coordinate chart in
//        various ways based on a range of available properties, and is rendered with the help of
//        the ParCoords library.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types, semantic-ui-react Libs, 3rd party deepEqual, parcoord-es and
//             pandas libs with various color palettes.
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Header } from 'semantic-ui-react';

import * as deepEqual from 'deep-equal';
import 'parcoord-es/dist/parcoords.css';
import ParCoords from 'parcoord-es';
import { Series, DataFrame } from 'pandas-js';

import { Category10 } from '@bokeh/bokehjs/build/js/lib/api/palettes';
import { Greys9 } from '@bokeh/bokehjs/build/js/lib/api/palettes';

const Category10_10 = Category10.Category10_10;

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: 'Parallel Coordinates',
  selectionColor: 'orange',
  nonselectionColor: `#${Greys9[3].toString(16)}`,
  extent: { width: 400, height: 400 },
};
//----------------------

//----------------------
const defaultStyle = {
  position: 'relative',
  width: '400px',
  height: '400px',
};
//----------------------

//----------------------
const chartRoot = {
  position: 'absolute',
  top: '20px',
  right: 0,
  bottom: 0,
  left: 0,
};
//----------------------

//----------------------
const headerStyle = {
  margin: '10px',
};
//----------------------

//----------------------
const testData = [
  [0, -0, 0, 0, 0, 1],
  [1, -1, 1, 2, 1, 1],
  [2, -2, 4, 4, 0.5, 1],
  [3, -3, 9, 6, 0.33, 1],
  [4, -4, 16, 8, 0.25, 1],
];
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default function ParCoordsPlot({
  data,
  axes,
  options,
  colorTags,
  selectedIndices,
  onSelectedIndicesChange,
}) {

  // Initiation of the VizComp
  const rootNode = useRef(null);
  const pcRef = useRef(null);
  let selectedIndicesInternal = null;

  const color = `#${Category10_10[0].toString(16)}`;

  // Create the VizComp based on the incomming parameters
  const createChart = () => {
    const parcoords = ParCoords()(rootNode.current).alpha(0.4);
    pcRef.current = parcoords;
  };

  // Clear away the VizComp
  const clearChart = () => {
    pcRef.current = null;
  };

  // Update the chart
  const updateChart = () => {
    const pc = pcRef.current;

    if (!data || data.length == 0) {
      console.warn('empty data');
      return;
    }

    const indexedData = data.map((d, i) => {
      d['[index]'] = i;
      return d;
    });

    const df = new DataFrame(indexedData);
    let modData = df.to_json({ orient: 'records' });
    if (axes.length > 0) {
      modData = df.get([...axes, '[index]']).to_json({ orient: 'records' });
    }

    pc.data();

    pc.data(modData)
      .mode('queue')
      .hideAxis(['[index]'])
      .composite('darker')
      .render()
      .shadows()
      .reorderable()
      .brushMode('1D-axes');

    pc.removeAxes();
    pc.createAxes();
    pc.brushMode('1D-axes');
    pc.updateAxes();

    window.pc = pc;

    pc.on('brushend', function (brushed, args) {
      const {
        selection: {
          raw, //raw coordinate
          scaled, //y-scale transformed
        },
        node, // svg node
        axis, // dimension name
      } = args;
      const selected = new DataFrame(brushed);

      let selectedIndices = [];
      if (brushed.length == modData.length) {
        selectedIndices = null;
      } else if (brushed.length == 0) {
        selectedIndices = [];
      } else {
        selectedIndices = selected
          .get('[index]')
          .to_json({ orient: 'records' });
      }

      if (
        onSelectedIndicesChange &&
        !deepEqual(selectedIndices, selectedIndicesInternal)
      ) {
        selectedIndicesInternal = selectedIndices;
        onSelectedIndicesChange(selectedIndices);
      }
    });
  };

  // Create the chart when first mounted
  useEffect(() => {
    createChart();
    return () => {
      clearChart();
    };
  }, []);

  // Recreate the chart if the data and settings change
  useEffect(() => {
    updateChart();
  }, [data, axes, colorTags]);

  // Manage Color Tags
  useEffect(() => {
    // colorTag
    const colors = new Array(data.length).fill(
      `#${Category10_10[0].toString(16)}`
    );
    colorTags.forEach((colorTag) => {
      colorTag.itemIndices.forEach((i) => {
        colors[i] = colorTag.color;
      });
    });

    const lineColor = (d) => {
      const i = d['[index]'];

      return colors[i];
    };

    if (colors.length > 0) {
      pcRef.current.color(lineColor);
      pcRef.current.render();
    }
  }, [colorTags]);

  // style settings
  const style = { ...defaultStyle };
  if (options.extent.width) {
    style.width = options.extent.width;
  }
  if (options.extent.height) {
    style.height = options.extent.height;
  }

  // Add the VizComp to the DOM
  return (
    <div style={style}>
      <Header size="tiny" style={headerStyle}>
        Parallel Coordinates
      </Header>
      <div ref={rootNode} style={chartRoot} className="parcoords" />
    </div>
  );
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
ParCoordsPlot.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  axes: PropTypes.arrayOf(PropTypes.string),
  options: PropTypes.shape({
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
ParCoordsPlot.defaultProps = {
  data: [],
  axes: [],
  options: { extent: { width: 800, height: 400 } },
  colorTags: [],
  selectedIndices: [],
  onSelectedIndicesChange: undefined,
};
//-------------------------------------------------------------------------------------------------
