import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as deepEqual from 'deep-equal';

import * as Bokeh from '@bokeh/bokehjs';
import { Category10 } from '@bokeh/bokehjs/build/js/lib/api/palettes';
import { Greys9 } from '@bokeh/bokehjs/build/js/lib/api/palettes';

const Category10_10 = Category10.Category10_10;

const defaultOptions = {
  title: 'Quad bar chart',
  selectionColor: 'orange',
  nonselectionColor: `#${Greys9[3].toString(16)}`,
  extent: { width: 400, height: 400 },
};

function createEmptyChart(options) {
  const params = Object.assign({}, defaultOptions, options);
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

function QuadBarChart({
  data,
  mappings,
  options,
  colorTags,
  selectedIndices,
  onSelectedIndicesChange,
}) {
  const rootNode = useRef(null);
  const [mainFigure, setMainFigure] = useState(null);
  // const [cds, setCds] = useState(null);
  // const [views, setViews] = useState(null);
  let cds = null;
  let views = null;
  let selectedIndicesInternal = [];

  const color = `#${Category10_10[0].toString(16)}`;

  const createChart = async () => {
    const fig = createEmptyChart(options);
    setMainFigure(fig);

    const { n, bins } = mappings;

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
        console.log('set event handler');
        cds.connect(cds.selected.change, () => {
          // this.handleSelectedIndicesChange();
          const indices = ds.selected.indices;
          if (!deepEqual(selectedIndicesInternal, indices)) {
            console.log('selected', indices);
            // console.log('selected', selectedIndicesInternal);
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
      // console.log(hedges)
      // console.log(hedges.reverse())
      // console.log(hedges.slice(1))
    }

    views = await Bokeh.Plotting.show(fig, rootNode.current);
    return cds;
  };

  const clearChart = () => {
    // if (views) {
    //   // console.log(views);
    //   Object.keys(views).forEach((key) => {
    //     const v = views[key];
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
    if (selectedIndices.length === 0) {
      if (prevCds) {
        prevCds.selected.indices = [];
      }
    }
  }, [selectedIndices]);

  return (
    <div id="container">
      <div ref={rootNode} />
    </div>
  );
}

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

QuadBarChart.defaultProps = {
  data: {},
  mappings: {},
  options: {},
  colorTags: [],
  selectedIndices: [],
  onSelectedIndicesChange: undefined,
};

export default QuadBarChart;
