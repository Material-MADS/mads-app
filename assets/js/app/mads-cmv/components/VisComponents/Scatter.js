/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'Scatter' module
// ------------------------------------------------------------------------------------------------
// Notes: 'Scatter' is a visualization component that displays a classic Scatter Plot in numerous
//        ways based on a range of available properties, and is rendered with the help of the
//        Bokeh-Charts library.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party pandas, deepEqual, lodash & Bokeh libs
//             with various color palettes
=================================================================================================*/

//*** TODO: Convert this to the newer react component type using hooks

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
  title: 'Scatter',
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
    title: params.title || 'Plot',
    tools,
    x_range: params.x_range || (dataIsEmpty ? [-1, 1] : undefined),
    y_range: params.y_range || (dataIsEmpty ? [-1, 1] : undefined),
    width: params.extent.width || 400,
    height: params.extent.height || 400,
    toolbar_location: 'right',
  });

  return fig;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component Class
//-------------------------------------------------------------------------------------------------
class BokehScatter extends Component {
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
      showMessage,
    } = this.props;

    const { x: xName, y: yName, color } = mappings;

    const df = new DataFrame(data);

    let x = [];
    let y = [];

    const cols = df.columns;

    // this.mainFigure = createEmptyChart(options);
    this.mainFigure = createEmptyChart(options, !(xName && yName && cols.includes(xName) && cols.includes(yName)));

    if (xName && yName && cols.includes(xName) && cols.includes(yName)) {
      x = df.get(xName).to_json({ orient: 'records' });
      y = df.get(yName).to_json({ orient: 'records' });
      this.cds = new Bokeh.ColumnDataSource({ data: { x, y } });

      // if data is categorical, warn
      if (Number.isNaN(parseFloat(x)) || Number.isNaN(parseFloat(y))) {
        showMessage({
          header: '',
          content: 'Type string is not supported.',
          type: 'error',
        });
        console.warn('Type string is not supported.');
        return;
      }

      this.mainFigure.xaxis[0].axis_label = xName;
      this.mainFigure.yaxis[0].axis_label = yName;

      // selection
      if (selectedIndices && selectedIndices.length > 0) {
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
        let low = df.get(color).values.min();
        let high = df.get(color).values.max();
        if (!low) {
          low = 0;
        }
        if (!high) {
          high = 0;
        }

        window.pal = pal;

        mapper = new Bokeh.LinearColorMapper({
          palette: pal,
          low: parseFloat(low),
          high: parseFloat(high),
        });

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

        const colorBar = new Bokeh.ColorBar({
          color_mapper: mapper,
          label_standoff: 8,
          location: [0, 0],
        });

        this.mainFigure.toolbar_location = null;
        this.mainFigure.add_layout(colorBar, 'right');

        const tb = new Bokeh.ProxyToolbar({
          tools: this.mainFigure.toolbar.tools,
        });
        const tpanel = new Bokeh.ToolbarPanel({ toolbar: tb });

        this.mainFigure.add_layout(tpanel, 'right');
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
        const iFilter = new Bokeh.IndexFilter({ indices: filteredIndices });
        const view = new Bokeh.CDSView({
          source: this.cds,
          filters: [iFilter],
        });
        circles.view = view;
      }
    }

    const views = await Bokeh.Plotting.show(
      this.mainFigure,
      this.rootNode.current
    );

    if (this.views) {
      this.clearChart();
    }

    this.views = views;
  }

  // Add the VizComp to the DOM
  render() {
    return (
      <div id="container">
        <div ref={this.rootNode} />
      </div>
    );
  }
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
BokehScatter.propTypes = {
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
  showMessage: PropTypes.func,
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
BokehScatter.defaultProps = {
  data: [],
  mappings: {},
  options: {
    title: 'Scatter',
    selectionColor: 'orange',
    nonselectionColor: `#${Greys9[3].toString(16)}`,
    extent: { width: 400, height: 400 },
  },
  colorTags: [],
  selectedIndices: [],
  filteredIndices: [],
  onSelectedIndicesChange: undefined,
};
//-------------------------------------------------------------------------------------------------

export default BokehScatter;
