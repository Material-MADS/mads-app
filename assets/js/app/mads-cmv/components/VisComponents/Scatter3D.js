import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import * as deepEqual from 'deep-equal';
import _ from 'lodash';
import $ from "jquery";

import * as Bokeh from "@bokeh/bokehjs";
import { Category10 } from "@bokeh/bokehjs/build/js/lib/api/palettes";
import { Greys9 } from "@bokeh/bokehjs/build/js/lib/api/palettes";

import Plotly from 'plotly.js-dist';

import { Category20c_20 } from "@bokeh/bokehjs/build/js/lib/api/palettes";
import { Plasma256 } from "@bokeh/bokehjs/build/js/lib/api/palettes";
import { hover } from "reactcss";

const Category10_10 = Category10.Category10_10;

// Dev and Debug declarations
window.Bokeh = Bokeh;
window.Plotly = Plotly;

const defaultOptions = {
  title: "Scatter 3D",
  selectionColor: "orange",
  nonselectionColor: `#${Greys9[3].toString(16)}`,
  extent: { width: 600, height: 600 },
  x_range: [],
  y_range: [],
  z_range: [],
  axisTitles: ['x', 'y', 'z'],
  margin: { l: 10, r: 10, b: 10, t: 30, pad: 2 },
  modebar: { orientation: 'v'},
  displayModeBar: 'hover',
  modeBarButtonsToRemove: [], //[toImage, zoom3d, pan3d, orbitRotation, tableRotation, resetCameraDefault3d, resetCameraLastSave3d, hoverClosest3d]
  displaylogo: true,
  marker: {
    size: 4,
    color: 'red',
    opacity: 0.8,
  },
};

function getChartData(data, options) {
  const params = Object.assign({}, defaultOptions, options, _.isEmpty(data)?{marker: {size: 1, color: 'transparent', opacity: 0}}:{});
  data = _.isEmpty(data)?{x: [0.1, 0.2], y: [0.1, 0.2], z: [0.1, 0.2]}:data;

  var cData = [
    {
      type: 'scatter3d',
      mode: 'markers',
      transforms: [{ type: "groupby", groups: data.gr }],
      x: data.x,
      y: data.y,
      z: data.z,
      marker: {
        size: params.marker.size,
        color: params.marker.color,
        opacity: params.marker.opacity,
      },
    },
  ];

  return cData;
}

function getChartLayout(data, options) {
  const params = Object.assign({}, defaultOptions, options);

  var cLayout = {
    autosize: true,
    width: params.extent.width,
    height: params.extent.height,
    title: {
      text: params.title,
    },
    scene: {
      xaxis: {
        title: params.axisTitles[0],
        nticks: _.isEmpty(data)?10:undefined,
        range: params.x_range,
      },
      yaxis: {
        title: params.axisTitles[1],
        nticks: _.isEmpty(data)?10:undefined,
        range: params.y_range,
      },
      zaxis: {
        title: params.axisTitles[2],
        nticks: _.isEmpty(data)?10:undefined,
        range: params.z_range,
      },
    },
    modebar: {
      orientation: params.modebar.orientation,
    },
    margin: {
      l: params.margin.l,
      r: params.margin.r,
      b: params.margin.b,
      t: params.margin.t,
      pad: params.margin.pad,
    },
  };

  return cLayout;
}

function getChartConfig(options) {
  const params = Object.assign({}, defaultOptions, options);

  var cConfig = {
    displayModeBar: params.displayModeBar,
    modeBarButtonsToRemove: params.modeBarButtonsToRemove,
    modeBarButtonsToAdd: [],
    displaylogo: params.displaylogo,
  };

  return cConfig;
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
export default function Scatter3D({
  data,
  mappings,
  options,
  colorTags,
  selectedIndices,
  onSelectedIndicesChange,
}) {
  const rootNode = useRef(null);
  // let views = null;
  // const [mainFigure, setMainFigure] = useState(null);
  // let cds = null;
  // let selectedIndicesInternal = [];

  const createChart = async () => {
    var sData = getChartData(data, options);
    var layout = getChartLayout(data, options);
    var config = getChartConfig(options);

    $(rootNode.current).append('<img id="Scatter3DLoadingGif" src="http://thanjavurmedicalcollege1970batch.com/images/loader.gif" width="300" />');
    $(function(){
      Plotly.react(rootNode.current, sData, layout, config).then(function() {
          $( "#Scatter3DLoadingGif" ).remove();
        });
    });
  };

  const clearChart = () => {
    // if (Array.isArray(views)) {
    //   console.warn("array!!!", views);
    // } else {
    //   const v = views;
    //   if (v) {
    //     v.remove();
    //   }
    // }

    // setMainFigure(null);
    // views = null;
  };

  useEffect(() => {
    // console.info('mount');
    createChart();
    return () => {
      // console.info('unmount');
      clearChart();
    };
  }, [data, mappings, options, colorTags]);

  // const prevCds = usePrevious(cds);
  // useEffect(() => {
  //   console.log('selection changed ...', selectedIndices);
  //   console.log(prevCds);
  //   if (selectedIndices.length === 0) {
  //     if (prevCds) {
  //       prevCds.selected.indices = [];
  //     }
  //   }
  // }, [selectedIndices]);

  return (
    <div id="container">
      <div ref={rootNode} />
    </div>
  );
}

Scatter3D.propTypes = {
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

Scatter3D.defaultProps = {
  data: {},
  mappings: {},
  options: defaultOptions,
  colorTags: [],
  selectedIndices: [],
  onSelectedIndicesChange: undefined,
};
