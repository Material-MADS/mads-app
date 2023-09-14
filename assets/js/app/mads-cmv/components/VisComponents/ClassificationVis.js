/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'Classification'
//              module
// ------------------------------------------------------------------------------------------------
// Notes: 'Classification' is a visualization component using ML-classification on the data before
//        displaying its result in a classic Scatter plot. (rendered by the Bokeh-Charts library.)
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party pandas, deepEqual, lodash and Bokeh libs, with
//             various color palettes
=================================================================================================*/

//*** TODO: Convert this to the newer react component type using hooks or perhaps...
//*** TODO: Could this (and perhaps Regression) be deleted, and just leave the Scatter Plot with some new settings to replace them

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { DataFrame } from 'pandas-js';
import * as deepEqual from 'deep-equal';
import _ from 'lodash';
import * as Bokeh from '@bokeh/bokehjs';

import * as gPalette from 'google-palette';
import { Category10 } from '@bokeh/bokehjs/build/js/lib/api/palettes';
import { Greys9 } from '@bokeh/bokehjs/build/js/lib/api/palettes';

const Category10_10 = Category10.Category10_10;

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: 'Classification',
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

  const tools = 'pan,crosshair,wheel_zoom,box_zoom,box_select,reset,save';
  const fig = Bokeh.Plotting.figure({
    tools,
    x_range: params.x_range || (dataIsEmpty ? [-1, 1] : undefined),
    y_range: params.y_range || (dataIsEmpty ? [-1, 1] : undefined),
    width: params.extent.width || 400,
    height: params.extent.height || 400,
  });

  fig.title.text = params.title || 'Plot'; //title object must be set separately or it will become a string (bokeh bug)
  // fig.title.text_color = "#303030";
  //fig.title.text_font_size = "40px";
  //fig.title.text_font = "Times New Roman";

  return fig;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component Class
//-------------------------------------------------------------------------------------------------
export default class ClassificationVis extends Component {
  // Initiation of the VizComp
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

    this.mainFigure = null;
    this.views = null;
  }

  // Create the VizComp based on the incomming parameters
  async createChart() {
    const {
      data,
      mappings,
      options,
      colorTags,
      selectedIndices,
      filteredIndices,
    } = this.props;

    const { x: xName, y: yName, color } = mappings;
    const df = new DataFrame(data);

    let x = [];
    let y = [];

    const cols = df.columns;
    window.c = cols;

    // this.mainFigure = createEmptyChart(options);
    this.mainFigure = createEmptyChart(options, !(xName && yName && cols.includes(xName) && cols.includes(yName)));

    if (xName && yName && cols.includes(xName) && cols.includes(yName)) {
      x = df.get(xName).to_json({ orient: 'records' });
      y = df.get(yName).to_json({ orient: 'records' });
      this.cds = new Bokeh.ColumnDataSource({ data: { x, y } });

      this.mainFigure.title.text = this.mainFigure.title.text + " (" + this.props.method + ")";
      this.mainFigure.xaxis[0].axis_label = xName;
      this.mainFigure.yaxis[0].axis_label = yName;

      // selection
      if (selectedIndices.length > 0) {
        this.cds.selected.indices = selectedIndices;
        this.lastSelections = selectedIndices;
      }

      // color
      const colors = new Array(x.length).fill(
        `#${Category10_10[0].toString(16)}`
      );
      colorTags.forEach((colorTag) => {
        colorTag.itemIndices.forEach((i) => {
          colors[i] = colorTag.color;
        });
      });

      let mapper = null;
      if (color) {
        const pal = gPalette('tol-rainbow', 256).map((c) => `#${c}`);
        const low = df.get(color).values.min();
        const high = df.get(color).values.max();
        mapper = new Bokeh.LinearColorMapper({
          palette: pal,
          low, // - (high - low) * 0.01,
          high, // + (high - low) * 0.01,
        });

        const colorBar = new Bokeh.ColorBar({
          color_mapper: mapper,
          label_standoff: 8,
          location: [0, 0],
        });
        this.mainFigure.add_layout(colorBar, 'right');

        const z = df.get(color).to_json({ orient: 'records' });
        this.cds = new Bokeh.ColumnDataSource({ data: { x, y, z } });
      }

      // setup callback
      this.cds.connect(this.cds.selected.change, () => {
        this.handleSelectedIndicesChange();
      });

      // call the circle glyph method to add some circle glyphs
      const selectionColor = options.selectionColor || 'orange';
      const nonselectionColor =
        options.nonselectionColor || `#${Greys9[3].toString(16)}`;

      let circles = null;
      if (mapper) {
        // call the circle glyph method to add some circle glyphs
        circles = this.mainFigure.circle(
          { field: 'x' },
          { field: 'y' },
          {
            source: this.cds,
            fill_alpha: 0.6,
            fill_color: { field: 'z', transform: mapper },
            selection_color: selectionColor,
            nonselection_color: nonselectionColor,
            line_color: null,
          }
        );
      } else {
        circles = this.mainFigure.circle(
          { field: 'x' },
          { field: 'y' },
          {
            source: this.cds,
            fill_alpha: 0.6,
            fill_color: colors,
            selection_color: selectionColor,
            nonselection_color: nonselectionColor,
            line_color: null,
          }
        );
      }

      // filter
      if (filteredIndices.length > 0) {
        const iFilter = new Bokeh.IndexFilter({
          indices: filteredIndices,
        });
        const view = new Bokeh.CDSView({
          source: this.cds,
          filters: [iFilter],
        });
        circles.view = view;
      }

      const yMax = Math.max.apply(null, y);

      const source = new Bokeh.ColumnDataSource({
        data: { x: [0, yMax], y: [0, yMax] },
      });
      let line = new Bokeh.Line({
        x: { field: 'x' },
        y: { field: 'y' },
        line_color: 'red',
        line_width: 1,
      });
      this.mainFigure.add_glyph(line, source);
    }

    const views = await Bokeh.Plotting.show( this.mainFigure, this.rootNode.current );

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
ClassificationVis.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  mappings: PropTypes.shape({
    x: PropTypes.string,
    y: PropTypes.string,
    color: PropTypes.string,
  }),
  options: PropTypes.shape({
    title: PropTypes.string,
    selectionColor: PropTypes.string,
    nonselectionColor: PropTypes.string,
    extent: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }),
  }),
  colorTags: PropTypes.arrayOf(PropTypes.object),
  selectedIndices: PropTypes.arrayOf(PropTypes.number),
  filteredIndices: PropTypes.arrayOf(PropTypes.number),
  onSelectedIndicesChange: PropTypes.func,
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
ClassificationVis.defaultProps = {
  data: [],
  mappings: {},
  options: defaultOptions,
  colorTags: [],
  selectedIndices: [],
  filteredIndices: [],
  onSelectedIndicesChange: undefined,
};
//-------------------------------------------------------------------------------------------------


