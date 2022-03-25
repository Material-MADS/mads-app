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
// import React, { Component, useState, useEffect, useRef } from 'react';
import React, { Component } from 'react';
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
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default class BokehBarChart extends Component {
  constructor(props) {
    super(props);
    this.cds = null;
    this.rootNode = React.createRef();
    this.clearChart = this.clearChart.bind(this);
    this.createChart = this.createChart.bind(this);
    this.handleSelectedIndicesChange = this.handleSelectedIndicesChange.bind(this);
    this.lastSelections = [];
    this.selecting = false;
  }

  componentDidMount() {
    this.createChart();
  }

  shouldComponentUpdate(nextProps) {
    const diff = _.omitBy(nextProps, (v, k) => {
      const { [k]: p } = this.props;
      return p === v;
    });

    if (diff.colorTags) {
      return true;
    }

    if (diff.selectedIndices) {
      if (this.cds) {
        this.cds.selected.indices = diff.selectedIndices;
      }
      return false;
    }

    return true;
  }

  componentDidUpdate() {
    this.clearChart();
    this.createChart();
  }

  componentWillUnmount() {
    this.clearChart();
  }

  handleSelectedIndicesChange() {
    const { onSelectedIndicesChange } = this.props;
    const { indices } = this.cds.selected;

    if (this.selecting) {
      return;
    }

    if (onSelectedIndicesChange && !deepEqual(this.lastSelections, indices)) {
      this.selecting = true;
      this.lastSelections = [...indices];
      onSelectedIndicesChange(indices);
      this.selecting = false;
    }
  }

  // Clear away the VizComp
  clearChart() {
    if (Array.isArray(this.views)) {
    } else {
      const v = this.views;
      if (v) {
        v.remove();
      }
    }
    if(this.props.data.resetRequest){
      this.props.options.title = defaultOptions.title;
      delete this.props.options.x_range;
      delete this.props.options.y_range;
      delete this.props.data.resetRequest;
    }
    this.mainFigure = null;
    this.views = null;
  }

  async createChart() {
    const {
      data,
      mappings,
      options,
      colorTags,
      selectedIndices,
      onSelectedIndicesChange,
    } = this.props;

    let selectedIndicesInternal = [];

    const { dimension, measures } = mappings;

    const testDataMapMeasure = measures ? [...measures][0] : undefined;

    // setup ranges
    if (dimension && measures && data[dimension] && data[testDataMapMeasure]) {
      data[dimension] = data[dimension].map(String);
      options.x_range = data[dimension];
    }

    this.mainFigure = createEmptyChart(options, !(dimension && measures && data[dimension] && data[testDataMapMeasure]));

    if (dimension && measures && data[dimension] && data[testDataMapMeasure]) {
      const ds = new Bokeh.ColumnDataSource({ data });
      this.cds = ds;

      let pal = options.palette;
      if (!pal && measures.length > 0) {
        pal = gPalette('tol-rainbow', measures.length).map((c) => `#${c}`);
      }

      // setup callback
      if (this.cds) {
        this.cds.connect(this.cds.selected.change, (...args) => {
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
          range: this.mainFigure.x_range,
        });

        const l = data[dimension].length;
        const ppal = new Array(l).fill(pal[i]);

        if (options.barColors) {
          options.barColors.forEach((c, i) => {
            ppal[i] = c;
          });
        }

        this.mainFigure.vbar({
          x: { field: dimension, transform: xv },
          top: { field: m },
          width: barWidth,
          source: ds,
          color: ppal,
          legend: {
            value: measures[i],
          },
        });
        this.mainFigure.legend.location = options.legendLocation || 'top_right';
      });
    }

    const views = await Bokeh.Plotting.show(this.mainFigure, this.rootNode.current);

    if (this.views) {
      this.clearChart();
    }

    this.views = views;
  }

  // Add the VizComp to the DOM
  render() {
    return (
      <div>
        <div ref={this.rootNode} />
      </div>
    );
  }
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
