import React, { Component, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// import { DataFrame } from 'pandas-js';
import * as deepEqual from 'deep-equal';
import _ from 'lodash';
import * as gPalette from 'google-palette';

import * as Bokeh from '@bokeh/bokehjs';
import { Category10 } from '@bokeh/bokehjs/build/js/lib/api/palettes';
import { Greys9 } from '@bokeh/bokehjs/build/js/lib/api/palettes';

const Category10_10 = Category10.Category10_10;

const defaultOptions = {
  title: 'Bar chart',
  selectionColor: 'orange',
  nonselectionColor: `#${Greys9[3].toString(16)}`,
  extent: { width: 400, height: 400 },
  barColors: [],
};

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
    width: params.extent.width || 400,
    height: params.extent.height || 400,
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

  const color = `#${Category10_10[0].toString(16)}`;

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
  // colorTags: PropTypes.arrayOf(PropTypes.object),
  onSelectedIndicesChange: PropTypes.func,
};

BokehBarChart.defaultProps = {
  data: {},
  mappings: {},
  options: defaultOptions,
  colorTags: [],
  selectedIndices: [],
  // colorTags: [],
  onSelectedIndicesChange: undefined,
};

export default BokehBarChart;
