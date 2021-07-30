import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import _ from 'lodash';
import $ from "jquery";

import * as Bokeh from "@bokeh/bokehjs";
import Plotly from 'plotly.js-dist-min';

import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";

// Dev and Debug declarations
window.Bokeh = Bokeh;
window.Plotly = Plotly;

const defaultOptions = {
  title: "Scatter 3D",
  extent: { width: 450, height: 450 },
  camera: {
    eye: {x: 1.25, y: 1.25, z: 1.25},
    up: {x: 0, y: 0, z: 1},
    center: {x: 0, y: 0, z: 0},
  },
  axisTitles: ['x', 'y', 'z'],
  margin: { l: 10, r: 10, b: 10, t: 30, pad: 2 },
  modebar: { orientation: 'h'},
  displayModeBar: 'hover',
  modeBarButtonsToRemove: [], //[toImage, zoom3d, pan3d, orbitRotation, tableRotation, resetCameraDefault3d, resetCameraLastSave3d, hoverClosest3d]
  displaylogo: true,
  marker: {
    size: 4,
    color: 'red',
    opacity: 0.8,
  },
  colorMap: 'Category20c',
};


function getChartData(data, options) {
  const params = Object.assign({}, defaultOptions, options, _.isEmpty(data)?{marker: {size: 1, color: 'transparent', opacity: 0}}:{});
  data = _.isEmpty(data)?{x: [0.1, 0.2], y: [0.1, 0.2], z: [0.1, 0.2]}:data;
  let uniques = [... new Set(data.gr)];
  var cm = (allPal[(params.colorMap + uniques.length)] != undefined) ? allPal[(params.colorMap + uniques.length)] : allPal[(params.colorMap + '_' + uniques.length)];

  let colors = [];
  if(uniques.length <= 20){
    if(cm != undefined){
      colors = cm.slice(0, uniques.length);
    }
    else{
      colors = allPal[(defaultOptions.colorMap + '_' + uniques.length)];
      params.colorMap = defaultOptions.colorMap;
    }
  }
  else if(uniques.length > 20 && uniques.length <= 256){
    if(allPal[(params.colorMap + '256')] != undefined){
      cm = allPal[(params.colorMap + '256')];
    }
    else{
      cm = allPal.Magma256;
      internalOptions.colorMap = 'Magma';
    }
    if(uniques.length > 20 && uniques.length < 256){
      const step = Math.floor(256/angles.length);
      for(let i = 0; i < uniques.length; i++) {
        colors.push(cm[i*step]);
      };
    }
    else{ colors = cm; }
  }
  else{
    colors = undefined;
  }

  let styles = undefined;
  if(colors !== undefined){
    styles = uniques.map((grCatName, index) => { return {target: grCatName, value: {marker: {color: ("#"+colors[index].toString(16).slice(0, -2).padStart(6, '0'))}}} });
  }

  var cData = [{
    type: 'scatter3d',
    mode: 'markers',
    transforms: [{
      type: "groupby",
      groups: data.gr,
      styles: styles,
    }],
    x: data.x,
    y: data.y,
    z: data.z,
    marker: {
      size: params.marker.size,
      color: params.marker.color,
      opacity: params.marker.opacity,
    },
  },];

  return cData;
}


function getChartLayout(data, options) {
  const params = Object.assign({}, defaultOptions, options);

  var cadsDataSource = $("#mads-cmv > div > div.ui.borderless.menu > div:nth-child(1) > div > div.divider.text");
  var currentDataSourceName = (cadsDataSource.length > 0) ? cadsDataSource.text() : "";
  if(currentDataSourceName != "" && params.axisTitles[0] && params.axisTitles[1] && params.axisTitles[2]){
    if(data.evr && params.axisTitles[0] == "PC 1"){
      (data.evr).forEach((item, index) => params.axisTitles[index]+=(" (" + ((item*100).toFixed(2)) + "%)"));
      params.title = "3D PCA plot from " + data.noOfFeat + " features <br>of the " + currentDataSourceName + " dataset";
    }
    else{
      params.title = "<span style='color:blue;'>" + params.axisTitles[0] + "<span style='color:red;'> vs. </span>" + params.axisTitles[1] + "<span style='color:red;'> vs. </span>" + params.axisTitles[2] + "<br><span style='color:purple; font-weight: bold;'>(by " + currentDataSourceName + ")</span></span>";
    }
  }

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
      },
      yaxis: {
        title: params.axisTitles[1],
        nticks: _.isEmpty(data)?10:undefined,
      },
      zaxis: {
        title: params.axisTitles[2],
        nticks: _.isEmpty(data)?10:undefined,
      },
      camera: {
        eye: params.camera.eye,
        up: params.camera.up,
        center: params.camera.center,
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
}) {
  const rootNode = useRef(null);
  let internalData = data;
  let internalOptions = options;

  useEffect(() => {
    if(internalData.resetRequest){
      internalOptions.title = undefined;
      delete internalData.resetRequest;
    }
  }, [internalData])

  const createChart = async () => {
    internalOptions.colorMap = internalOptions.colorMap || defaultOptions.colorMap;
    let sData = getChartData(internalData, internalOptions);
    let layout = getChartLayout(internalData, internalOptions);
    let config = getChartConfig(internalOptions);

    $(rootNode.current).append('<img id="Scatter3DLoadingGif" src="https://miro.medium.com/max/700/1*CsJ05WEGfunYMLGfsT2sXA.gif" width="300" />');
    $(function(){
      Plotly.react(rootNode.current, sData, layout, config).then(function() {
        $( "#Scatter3DLoadingGif" ).remove();
      });

      (rootNode.current).on('plotly_relayout', function(internalData){ internalOptions["camera"] = (rootNode.current).layout.scene.camera});
    });
  };

  const clearChart = () => { };

  useEffect(() => {
    createChart();
    return () => {
      clearChart();
    };
  }, [data, mappings, options, colorTags]);

  return (
    <div id="container">
      <div ref={rootNode} />
    </div>
  );
}

Scatter3D.propTypes = {
  data: PropTypes.shape({ }),
  mappings: PropTypes.shape({
    x: PropTypes.string,
    y: PropTypes.string,
    z: PropTypes.string,
    color: PropTypes.string,
  }),
  options: PropTypes.shape({
    title: PropTypes.string,
    selectionColor: PropTypes.string,
    nonselectionColor: PropTypes.string,
    chartColors: PropTypes.arrayOf(PropTypes.string),
    extent: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number.isRequired,
    }),
  }),
  colorTags: PropTypes.arrayOf(PropTypes.object),
};

Scatter3D.defaultProps = {
  data: {},
  mappings: {},
  options: defaultOptions,
  colorTags: [],
};
