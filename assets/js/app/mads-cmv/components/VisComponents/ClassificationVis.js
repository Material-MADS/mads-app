import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { DataFrame } from 'pandas-js';
import * as deepEqual from 'deep-equal';
import _ from 'lodash';
import * as gPalette from 'google-palette';

import * as Bokeh from '@bokeh/bokehjs';
import { Category10 } from '@bokeh/bokehjs/build/js/lib/api/palettes';
import { Greys9 } from '@bokeh/bokehjs/build/js/lib/api/palettes';

const Category10_10 = Category10.Category10_10;

const defaultOptions = {
  title: 'Scatter',
  selectionColor: 'orange',
  nonselectionColor: `#${Greys9[3].toString(16)}`,
  extent: { width: 400, height: 400 },
};

function createEmptyChart(options) {
  const params = Object.assign({}, defaultOptions, options);

  const tools = 'pan,crosshair,wheel_zoom,box_zoom,box_select,reset,save';
  const fig = Bokeh.Plotting.figure({
    title: params.title || 'Plot',
    tools,
    // x_range: [0, 100],
    // y_range: [0, 100],
    width: params.extent.width || 400,
    height: params.extent.height || 400,
    // toolbar_location: 'right',
    // toolbar_sticky: false,
  });

  return fig;
}

class ClassificationVis extends Component {
  constructor(props) {
    super(props);
    // this.state = {};
    this.cds = null;

    this.rootNode = React.createRef();

    this.clearChart = this.clearChart.bind(this);
    this.createChart = this.createChart.bind(this);
    this.handleSelectedIndicesChange =
      this.handleSelectedIndicesChange.bind(this);
    this.lastSelections = [];
    this.selecting = false;
    // this.updatePlot = this.updatePlot.bind(this);
  }

  componentDidMount() {
    this.createChart();
  }

  shouldComponentUpdate(nextProps) {
    // console.warn('0000', nextProps)
    const diff = _.omitBy(nextProps, (v, k) => {
      const { [k]: p } = this.props;
      return p === v;
    });

    // if (diff.filteredIndices) {
    //   return true;
    // }

    if (diff.colorTags) {
      return true;
    }

    // if (diff.selectedIndices && Object.keys(diff).length === 1) {
    if (diff.selectedIndices) {
      // console.log(diff);
      if (this.cds) {
        this.cds.selected.indices = diff.selectedIndices;
      }
      return false;
    }

    return true;
  }

  componentDidUpdate() {
    // this.updatePlot();
    this.clearChart();
    this.createChart();
  }

  componentWillUnmount() {
    console.info('unmount');
    this.clearChart();
  }

  handleSelectedIndicesChange() {
    const { onSelectedIndicesChange } = this.props;
    const { indices } = this.cds.selected;

    // console.log('selecting', this.selecting);
    if (this.selecting) {
      return;
    }

    // console.log(indices, this.lastIndices);
    // if (onSelectedIndicesChange && !deepEqual(this.lastIndices, indices)) {
    //   onSelectedIndicesChange(indices);
    //   this.lastIndices = indices;
    // }
    if (onSelectedIndicesChange && !deepEqual(this.lastSelections, indices)) {
      this.selecting = true;

      // console.log(indices, this.lastSelections);
      this.lastSelections = [...indices];
      onSelectedIndicesChange(indices);
      this.selecting = false;
    }
  }

  clearChart() {
    // console.info('clear chart');
    // if (this.views) {
    //   Object.keys(this.views).forEach((key) => {
    //     const v = this.views[key];
    //     // v.model.disconnect_signals();
    //     v.remove();
    //     // console.log('remove', key);
    //   });
    // }
    console.log(this.views);
    if (Array.isArray(this.views)) {
      console.warn('array!!!', this.views);
    } else {
      const v = this.views;
      if (v) {
        v.remove();
      }
    }

    this.mainFigure = null;
    this.views = null;
  }

  async createChart() {
    // console.log('create', this.props);
    const {
      data,
      mappings,
      options,
      colorTags,
      selectedIndices,
      filteredIndices,
    } = this.props;

    // console.log('sc', selectedIndices, this.selecting);

    const { x: xName, y: yName, color } = mappings;

    this.mainFigure = createEmptyChart(options);
    const df = new DataFrame(data);

    let x = [];
    let y = [];

    const cols = df.columns;
    // console.log(cols)
    window.c = cols;

    if (xName && yName && cols.includes(xName) && cols.includes(yName)) {
      x = df.get(xName).to_json({ orient: 'records' });
      y = df.get(yName).to_json({ orient: 'records' });
      this.cds = new Bokeh.ColumnDataSource({ data: { x, y } });

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
        // const palette = Bokeh.require('api/palettes').Viridis256;
        // const palette = Bokeh.require('api/palettes').RdBu11;
        // const palette = Bokeh.require('api/palettes').Spectral11;
        // const pal = palette.map(c => `#${c.toString(16)}`);
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
        // console.log(arguments);
        this.handleSelectedIndicesChange();
      });

      // TODO: recover tool selection

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
        console.log(view);
      }

      // const xMax = this.mainFigure.x_range.max;
      // const yMax = this.mainFigure.y_range.max;
      const yMax = Math.max.apply(null, y);
      console.warn(yMax);

      const source = new Bokeh.ColumnDataSource({
        data: { x: [0, yMax], y: [0, yMax] },
      });
      let line = new Bokeh.Line({
        x: { field: 'x' },
        y: { field: 'y' },
        // line_color: '#666699',
        line_color: 'red',
        line_width: 1,
      });
      this.mainFigure.add_glyph(line, source);
    }

    // console.trace();
    // this.views = Bokeh.Plotting.show(this.mainFigure, this.rootNode.current);
    const views = await Bokeh.Plotting.show(
      this.mainFigure,
      this.rootNode.current
    );

    if (this.views) {
      this.clearChart();
    }

    this.views = views;
  }

  // updatePlot() {

  // }

  render() {
    return (
      <div id="container">
        <div ref={this.rootNode} />
      </div>
    );
  }
}

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

ClassificationVis.defaultProps = {
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

export default ClassificationVis;
