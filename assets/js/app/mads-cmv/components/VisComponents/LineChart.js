/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'LineChart' module
// ------------------------------------------------------------------------------------------------
// Notes: 'LineChart' is a visualization component that displays a classic line chart in numerous
//        ways based on a range of available properties, and is rendered with the help of the
//        Bokeh-Charts library.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party deepEqual, Bokeh libs with various color
//             palettes and also internal support methods from FormUtils
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import * as deepEqual from 'deep-equal';
import * as Bokeh from "@bokeh/bokehjs";

import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";
import { cmMax } from '../Views/FormUtils';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "Line Chart",
  extent: { width: undefined, height: 400 },
  axisLabels: ['x', 'y'],
  x_range: [-1.0, 1.0],
  y_range: [-1.0, 1.0],
  legendLabel: undefined,
  lineWidth: 2,
  lineDash: undefined,
  colorMap: 'Category10',
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Creates an empty basic default Visualization Component of the specific type
//-------------------------------------------------------------------------------------------------
function createEmptyChart(options) {
  const params = Object.assign({}, defaultOptions, options);
  const tools = "pan,crosshair,tap,wheel_zoom,reset,save";

  const fig = Bokeh.Plotting.figure({
    tools,
    toolbar_location: "right",
    width: params.extent.width,
    height: params.extent.height,
    x_axis_label: params.axisLabels[0],
    y_axis_label: params.axisLabels[1],
    x_range: params.x_range,
    y_range: params.y_range,
  });

  fig.title.text = params.title; //title object must be set separately or it will become a string (bokeh bug)
  //fig.title.text_color = "red";
  //fig.title.text_font_size = "40px";
  //fig.title.text_font = "Times New Roman";

  return fig;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Gets the chart range based on the data
//-------------------------------------------------------------------------------------------------
function getRange(data){
  let rangeArray = data.filter((v, i, a) => a.indexOf(v) === i);
  if(typeof rangeArray[0] == "number"){
    rangeArray.sort(function(a,b){return a-b});
    const step = (rangeArray[rangeArray.length-1] - rangeArray[0]) / rangeArray.length-1
    rangeArray = [rangeArray[0] - step, rangeArray[rangeArray.length-1] + step];
  }
  else{
    rangeArray.sort();
  }

  return rangeArray;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Returns the previous value
//-------------------------------------------------------------------------------------------------
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default function LineChart({
  data,
  mappings,
  options,
  colorTags,
  selectedIndices,
  onSelectedIndicesChange,
}) {

  // Initiation of the VizComp
  const rootNode = useRef(null);
  let views = null;
  const [mainFigure, setMainFigure] = useState(null);
  let cds = null;
  let selectedIndicesInternal = [];
  let internalData = data;
  let internalOptions = Object.assign({}, defaultOptions, options);;

  // Clear away all data if requested
  useEffect(() => {
    if(internalData.resetRequest){
      internalOptions = defaultOptions;
      delete internalData.resetRequest;
    }
  }, [internalData])

  // Create the VizComp based on the incomming parameters
  const createChart = async () => {
    const { xData, yData } = mappings;
    if(internalData[xData]){ internalOptions.x_range = getRange(internalData[xData]); }
    if(internalData[yData]){ internalOptions.y_range = getRange(internalData[yData]); }

    const fig = createEmptyChart(internalOptions);
    setMainFigure(fig);

    if(internalData[xData]){
      let colors = internalOptions.colors;
      if(!colors){
        colors = (cmMax[internalOptions.colorMap] != undefined) ? allPal[internalOptions.colorMap+cmMax[internalOptions.colorMap]] : allPal[defaultOptions.colorMap+cmMax[defaultOptions.colorMap]];
      }

      const { indices } = internalData;
      if (indices) {
        for (let i = 0; i < indices.length; i++) {
          colorTags.forEach((colorTag) => {
            if (deepEqual(indices[i], colorTag.itemIndices)) {
              colors[i] = colorTag.color;
            }
          });
        }
      }

      // setup callback
      if (cds) {
        cds.connect(cds.selected.change, () => {
          const indices = bData.selected.indices;
          if (!deepEqual(selectedIndicesInternal, indices)) {
            selectedIndicesInternal = [...indices];
            if (onSelectedIndicesChange) {
              onSelectedIndicesChange(indices);
            }
          }
        });
      }

      const bData = new Bokeh.ColumnDataSource({ data: { ...internalData,}, });
      cds = bData;

      var dataKeys = Object.keys(internalData);
      dataKeys.splice(dataKeys.indexOf(xData), 1);

      fig.add_tools(new Bokeh.HoverTool({ tooltips: 'Data point @' + xData + ' has the value @' + yData + '' }));

      for(var i = 0; i < dataKeys.length; i++){
        if(dataKeys[i] != xData){
          var legendLabel = internalOptions.legendLabel == undefined ? dataKeys[i] + ' ' : (Array.isArray(internalOptions.legendLabel) ? internalOptions.legendLabel[i] : (internalOptions.legendLabel + (dataKeys.length == 1 ? "" : (" " + (i + 1)))));
          var lineDash = internalOptions.lineDash == undefined ? undefined : (Array.isArray(internalOptions.lineDash) ? internalOptions.lineDash[i] : internalOptions.lineDash);
          fig.line({
            x: { field: xData },
            y: { field: dataKeys[i] },
            line_color: colors[i],
            legend: legendLabel,
            line_dash: lineDash,
            line_width: internalOptions.lineWidth,
            source: bData,
          });
        }
      }
    }

    views = await Bokeh.Plotting.show(fig, rootNode.current);
    return cds;
  };

  // Clear away the VizComp
  const clearChart = () => {
    if (Array.isArray(views)) {
    } else {
      const v = views;
      if (v) {
        v.remove();
      }
    }

    setMainFigure(null);
    views = null;
  };

  // Recreate the chart if the data and settings change
  useEffect(() => {
    createChart();
    return () => {
      clearChart();
    };
  }, [data, mappings, options, colorTags]);

  // Catch current data selections properly in the VizComp
  const prevCds = usePrevious(cds);
  useEffect(() => {
    if (selectedIndices.length === 0) {
      if (prevCds) {
        prevCds.selected.indices = [];
      }
    }
  }, [selectedIndices]);

  // Add the VizComp to the DOM
  return (
    <div>
      <div ref={rootNode} />
    </div>
  );
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
LineChart.propTypes = {
  data: PropTypes.shape({}),
  mappings: PropTypes.shape({}),
  options: PropTypes.shape({
    title: PropTypes.string,
    colorMap: PropTypes.string,
    x_range: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ])),
    y_range: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ])),
    extent: PropTypes.shape({
      width: PropTypes.number,
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
LineChart.defaultProps = {
  data: {},
  mappings: {
    xData: 'xData',
    yData: 'yData',
  },
  options: defaultOptions,
  colorTags: [],
  selectedIndices: [],
  onSelectedIndicesChange: undefined,
};
//-------------------------------------------------------------------------------------------------
