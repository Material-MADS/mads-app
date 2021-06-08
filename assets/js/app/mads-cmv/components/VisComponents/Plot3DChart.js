import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import * as deepEqual from 'deep-equal';

import * as Bokeh from "@bokeh/bokehjs";
import { Category10 } from "@bokeh/bokehjs/build/js/lib/api/palettes";
import { Greys9 } from "@bokeh/bokehjs/build/js/lib/api/palettes";

import * as Plotly from 'plotly.js-dist';

import { Category20c_20 } from "@bokeh/bokehjs/build/js/lib/api/palettes";
import { Plasma256 } from "@bokeh/bokehjs/build/js/lib/api/palettes";

const Category10_10 = Category10.Category10_10;

// Dev and Debug declarations
window.Bokeh = Bokeh;

console.log(Plotly);
window.Plotly = Plotly;

const defaultOptions = {
  title: "Plot 3D Chart",
  selectionColor: "orange",
  nonselectionColor: `#${Greys9[3].toString(16)}`,
  extent: { width: undefined, height: 400 },
  x_range: [-1.0, 1.0],
  y_range: [-1.0, 1.0],
  chartColors: [],
};

function createEmptyChart(options) {
  const params = Object.assign({}, defaultOptions, options);
  const tools = "pan,crosshair,tap,wheel_zoom,reset,save";

  const fig = Bokeh.Plotting.figure({
    title: params.title || defaultOptions.title,
    tools,
    toolbar_location: "right",
    selectionColor: params.selectionColor || defaultOptions.nonselectionColor,
    nonselectionColor: params.nonselectionColor || defaultOptions.nonselectionColor,
    width: params.extent.width || defaultOptions.extent.width,
    height: params.extent.height || defaultOptions.extent.height,
    x_range: params.x_range || defaultOptions.x_range,
    y_range: params.y_range || defaultOptions.y_range,
    chartColors: [] || defaultOptions.chartColors,
  });

  return fig;
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default function Plot3DChart({
  data,
  mappings,
  options,
  colorTags,
  selectedIndices,
  onSelectedIndicesChange,
}) {
  const rootNode = useRef(null);
  let views = null;
  const [mainFigure, setMainFigure] = useState(null);
  let cds = null;
  let selectedIndicesInternal = [];

  const createChart = async () => {
    const fig = createEmptyChart(options);
    setMainFigure(fig);

    Plotly.d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/alpha_shape.csv', function(err, rows){
      function unpack(rows, key) {
          return rows.map(function(row) { return row[key]; });
      }

      var data = [{
          x: unpack(rows, 'x'),
          y: unpack(rows, 'y'),
          z: unpack(rows, 'z'),
          mode: 'markers',
          type: 'scatter3d',
          marker: {
            color: 'rgb(23, 190, 207)',
            size: 2
          }
      },{
          alphahull: 7,
          opacity: 0.1,
          type: 'mesh3d',
          x: unpack(rows, 'x'),
          y: unpack(rows, 'y'),
          z: unpack(rows, 'z')
      }];

      var layout = {
          autosize: true,
          height: 480,
          scene: {
              aspectratio: {
                  x: 1,
                  y: 1,
                  z: 1
              },
              camera: {
                  center: {
                      x: 0,
                      y: 0,
                      z: 0
                  },
                  eye: {
                      x: 1.25,
                      y: 1.25,
                      z: 1.25
                  },
                  up: {
                      x: 0,
                      y: 0,
                      z: 1
                  }
              },
              xaxis: {
                  type: 'linear',
                  zeroline: false
              },
              yaxis: {
                  type: 'linear',
                  zeroline: false
              },
              zaxis: {
                  type: 'linear',
                  zeroline: false
              }
          },
          title: '3d point clustering',
          width: 477
      };

      Plotly.newPlot(rootNode.current, data, layout);
    });


    // Plotly.newPlot( rootNode.current, [{
    //   x: [1, 2, 3, 4, 5],
    //   y: [1, 2, 4, 8, 16] }], {
    //   margin: { t: 0 } } );


  };

  const clearChart = () => {
    if (Array.isArray(views)) {
      console.warn("array!!!", views);
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

Plot3DChart.propTypes = {
  data: PropTypes.shape({
    // TODO: values: PropTypes.arrayOf(PropTypes.number),
    // dimensions: PropTypes.arrayOf(PropTypes.string),
    // indices: PropTypes.arrayOf(PropTypes.array),
  }),
  mappings: PropTypes.shape({}),
  options: PropTypes.shape({
    title: PropTypes.string,
    selectionColor: PropTypes.string,
    nonselectionColor: PropTypes.string,
    chartColors: PropTypes.arrayOf(PropTypes.string),
    x_range: PropTypes.arrayOf(PropTypes.number),
    y_range: PropTypes.arrayOf(PropTypes.number),
    extent: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number.isRequired,
    }),
  }),
  colorTags: PropTypes.arrayOf(PropTypes.object),
  selectedIndices: PropTypes.arrayOf(PropTypes.number),
  onSelectedIndicesChange: PropTypes.func,
};

Plot3DChart.defaultProps = {
  data: {},
  mappings: {},
  options: defaultOptions,
  colorTags: [],
  selectedIndices: [],
  onSelectedIndicesChange: undefined,
};
