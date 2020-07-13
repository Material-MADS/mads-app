import React, { Component, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// import { DataFrame } from 'pandas-js';
import * as deepEqual from 'deep-equal';
import _ from 'lodash';
import * as gPalette from 'google-palette';

// import Bokeh from 'bokehjs/build/js/bokeh';
// // import 'bokehjs/build/js/bokeh-widgets';
// console.log(Bokeh);

const Category10 = Bokeh.require('api/palettes').Category10.Category10_10;
const { Greys9 } = Bokeh.require('api/palettes');

function vbar(fig, ...args) {
  // eslint-disable-next-line no-underscore-dangle
  return fig._glyph(Bokeh.VBar, 'x,top,width,bottom', args);
}

const defaultOptions = {
  title: 'Bar chart',
  selectionColor: 'orange',
  nonselectionColor: `#${Greys9[3].toString(16)}`,
  extent: { width: 400, height: 400 },
  barColors: [],
};

// const hbar = () => {

// }
function createEmptyChart(options) {
  const params = { ...defaultOptions, ...options };
  const tools = 'pan,crosshair,tap,reset,save,hover';

  // options.x_range = fruits;
  // options.y_range = [0, 10];

  const fig = Bokeh.Plotting.figure({
    title: params.title || 'Bar chart',
    tools,
    x_range: params.x_range || undefined,
    y_range: params.y_range || undefined,
    plot_width: params.extent.width || 400,
    plot_height: params.extent.height || 400,
  });

  if (params.xaxis_orientation) {
    fig.xaxis[0].major_label_orientation = params.xaxis_orientation;
  }

  return fig;
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function BokehBarChart({
  data,
  mappings,
  options,
  colorTags,
  selectedIndices,
  onSelectedIndicesChange,
}) {
  console.warn('initial sels', selectedIndices);
  const rootNode = useRef(null);
  const [mainFigure, setMainFigure] = useState(null);

  let cds = null;
  let views = null;
  let selectedIndicesInternal = [];

  const color = `#${Category10[0].toString(16)}`;

  const createChart = async () => {
    const { dimension, measures } = mappings;

    // setup ranges
    if (dimension && measures) {
      options.x_range = data[dimension];
    }

    const fig = createEmptyChart(options);

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
          console.log(args);
          const indices = ds.selected.indices;
          console.log('selected', indices, selectedIndicesInternal);
          if (!deepEqual(selectedIndicesInternal, indices)) {
            selectedIndicesInternal = [...indices];
            if (onSelectedIndicesChange) {
              console.warn('change to', selectedIndicesInternal);
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
          console.log(options.barColors);
          options.barColors.forEach((c, i) => {
            ppal[i] = c;
          });
        }

        // vbar(fig, {
        fig.vbar({
          x: { field: dimension, transform: xv },
          // x: xv.v_compute(fruits),
          top: { field: m },
          // top: [1, 2, 3, 4, 5, 6],
          width: barWidth,
          source: ds,
          color: ppal,
          legend: {
            value: measures[i],
          },
        });
        fig.legend.location = options.legendLocation || 'top_right';
      });

      // TODO: recover tool selection
    }

    // console.trace();
    // this.views = Bokeh.Plotting.show(this.mainFigure, this.rootNode.current);
    views = await Bokeh.Plotting.show(fig, rootNode.current);
    return cds;
  };

  const clearChart = () => {
    // console.info('clear chart');
    // if (this.views) {
    //   Object.keys(this.views).forEach((key) => {
    //     const v = this.views[key];
    //     // v.model.disconnect_signals();
    //     v.remove();
    //     // console.log('remove', key);
    //   });
    // }
    if (Array.isArray(views)) {
      console.warn('array!!!', views);
    } else {
      const v = views;
      if (v) {
        v.remove();
      }
    }

    setMainFigure(null);
    views = null;
  };

  useEffect(() => {
    // console.info('mount');
    createChart();
    return () => {
      // console.info('unmount');
      clearChart();
    };
  }, [data, mappings, options, colorTags]);

  const prevCds = usePrevious(cds);

  useEffect(() => {
    console.log('selection changed ...', selectedIndices);
    console.log(prevCds);

    console.log(selectedIndices, selectedIndicesInternal);

    // if (selectedIndices.length === 0) {
    //   if (prevCds) {
    //     prevCds.selected.indices = [];
    //   }
    // }
  }, [selectedIndices]);

  return (
    <div id="container">
      <div ref={rootNode} />
    </div>
  );
}

class BokehBarChartEx extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.cds = null;
    this.selectedIndicesInternal = [];
    this.selecting = false;

    this.rootNode = React.createRef();

    this.clearChart = this.clearChart.bind(this);
    this.createChart = this.createChart.bind(this);
    this.handleSelectedIndicesChange = this.handleSelectedIndicesChange.bind(
      this
    );
    // this.updatePlot = this.updatePlot.bind(this);
  }

  componentDidMount() {
    this.createChart();
  }

  shouldComponentUpdate(nextProps) {
    const diff = _.omitBy(nextProps, (v, k) => {
      const { [k]: p } = this.props;
      return p === v;
    });

    if (diff.selectedIndices && Object.keys(diff).length === 1) {
      // console.log(diff);
      this.cds.selected.indices = diff.selectedIndices;
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

    if (this.selecting) {
      return;
    }

    if (!deepEqual(this.selectedIndicesInternal, indices)) {
      console.log(this.selectedIndicesInternal, indices);
      this.selecting = true;

      this.selectedIndicesInternal = [...indices];
      if (onSelectedIndicesChange) {
        onSelectedIndicesChange(indices);

        this.selecting = false;
      }
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
      // colorTags,
      selectedIndices,
    } = this.props;

    const { dimension, measures } = mappings;

    // if (data && data.length > 0) {
    //   options.x_range = ['1', '2', '3'];
    // }

    // setup ranges
    if (dimension && measures) {
      options.x_range = data[dimension];
      // options.y_range =
    }

    this.mainFigure = createEmptyChart(options);
    // const df = new DataFrame(data);

    // let x = [];
    // let y = [];
    // console.log(dimension, measures, df)
    if (dimension && measures && data[dimension]) {
      // x = df.get(xName).to_json({ orient: 'records' });
      // y = df.get(yName).to_json({ orient: 'records' });
      this.cds = new Bokeh.ColumnDataSource({ data });

      // this.mainFigure.xaxis.axis_label = xName;
      // this.mainFigure.yaxis.axis_label = yName;

      // selection
      if (selectedIndices.length > 0) {
        this.cds.selected.indices = selectedIndices;
      }

      // color
      // const colors = (new Array(x.length)).fill(`#${Category10[0].toString(16)}`);
      // colorTags.forEach((colorTag) => {
      //   colorTag.itemIndices.forEach((i) => {
      //     colors[i] = colorTag.color;
      //   });
      // });

      let pal = options.palette;
      if (!pal && measures.length > 0) {
        pal = gPalette('tol-rainbow', measures.length).map((c) => `#${c}`);
      }

      // let mapper = null;
      // if (color) {
      //   // const palette = Bokeh.require('api/palettes').Viridis256;
      //   // const palette = Bokeh.require('api/palettes').RdBu11;
      //   // const palette = Bokeh.require('api/palettes').Spectral11;
      //   // const pal = palette.map(c => `#${c.toString(16)}`);
      //   const pal = gPalette('tol-rainbow', 256).map(c => `#${c}`);
      //   const low = df.get(color).values.min();
      //   const high = df.get(color).values.max();
      //   mapper = new Bokeh.LinearColorMapper({
      //     palette: pal,
      //     low, // - (high - low) * 0.01,
      //     high, // + (high - low) * 0.01,
      //   });

      //   const z = df.get(color).to_json({ orient: 'records' });
      //   this.cds = new Bokeh.ColumnDataSource({ data: { x, y, z } });
      // }

      // setup callback
      this.cds.connect(this.cds.selected.change, () => {
        this.handleSelectedIndicesChange();
      });

      // const barWidth = 1 / (measures.length + 2);
      const barWidth = 4 / (measures.length * 5);
      // const step = 1 / (measures.length + 1);
      // const step = (measures.length * barWidth) / 2;
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
          console.log(options.barColors);
          options.barColors.forEach((c, i) => {
            ppal[i] = c;
          });
        }

        console.log(pal);

        vbar(this.mainFigure, {
          x: { field: dimension, transform: xv },
          // x: xv.v_compute(fruits),
          top: { field: m },
          // top: [1, 2, 3, 4, 5, 6],
          width: barWidth,
          source: this.cds,
          color: ppal,
          legend: {
            value: measures[i],
          },
        });
        this.mainFigure.legend.location = options.legendLocation || 'top_right';
      });

      // TODO: recover tool selection

      // call the circle glyph method to add some circle glyphs
      // if (mapper) {
      //   // call the circle glyph method to add some circle glyphs
      //   // this.mainFigure.circle({ field: 'x' }, { field: 'y' }, {
      //   //   source: this.cds,
      //   //   fill_alpha: 0.6,
      //   //   fill_color: { field: 'z', transform: mapper },
      //   //   selection_color: selectionColor,
      //   //   nonselection_color: nonselectionColor,
      //   //   line_color: null,
      //   // });
      // } else {
      //   console.log('glyph...');
      //   // this.mainFigure.circle({ field: 'x' }, { field: 'y' }, {
      //   //   source: this.cds,
      //   //   fill_alpha: 0.6,
      //   //   fill_color: colors,
      //   //   selection_color: selectionColor,
      //   //   nonselection_color: nonselectionColor,
      //   //   line_color: null,
      //   // });
      //   // this.mainFigure._glyph(
      //   //   Bokeh.VBar,
      //   //   'x,bottom,width', [{
      //   //     x: x.map(v => v.toString()),
      //   //     top: data,
      //   //     width: 0.9,
      //   //     fill_color: colors,
      //   //     source: this.cds,
      //   //   }],
      //   // );

      //   this.cds = new Bokeh.ColumnDataSource({
      //   data: { cids: ['1', '2', '3'], counts: [1, 2, 3] }
      // });
      //   this.mainFigure._glyph(
      //     Bokeh.VBar,
      //     'x,top,bottom,width',
      //     [{
      //       x: ['1', '2', '3'],
      //       top: [1, 2, 3],
      //       width: 0.9,
      //       fill_color: ['red', 'blue', 'yellow'],
      //       source: this.cds,
      //     }],
      //   );
      // }
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
  // colorTags: PropTypes.arrayOf(PropTypes.object),
  selectedIndices: PropTypes.arrayOf(PropTypes.number),
  // colorTags: PropTypes.arrayOf(PropTypes.object),
  onSelectedIndicesChange: PropTypes.func,
};

BokehBarChart.defaultProps = {
  data: {},
  mappings: {},
  options: defaultOptions,
  // colorTags: [],
  selectedIndices: [],
  // colorTags: [],
  onSelectedIndicesChange: undefined,
};

export default BokehBarChart;
