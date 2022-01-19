/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'PieChart' module
// ------------------------------------------------------------------------------------------------
// Notes: 'PieChart' is a visualization component that displays a classic pie chart in numerous
//        ways based on a range of available properties, and is rendered with the help of the
//        Bokeh-Charts library.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party deepEqual, Bokeh libs with various color palettes
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import * as deepEqual from 'deep-equal';
import * as Bokeh from "@bokeh/bokehjs";

import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "Pie Chart",
  extent: { width: undefined, height: 400 },
  x_range: [-1.0, 1.0],
  y_range: [-1.0, 1.0],
  colorMap: 'Category20c',
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
    width: params.extent.width || defaultOptions.extent.width,
    height: params.extent.height || defaultOptions.extent.height,
    x_range: params.x_range || defaultOptions.x_range,
    y_range: params.y_range || defaultOptions.y_range,
  });

  fig.title.text = params.title || defaultOptions.title; //title object must be set separately or it will become a string (bokeh bug)
  //fig.title.text_color = "red";
  //fig.title.text_font_size = "40px";
  //fig.title.text_font = "Times New Roman";

  return fig;
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
export default function PieChart({
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
  let internalOptions = options;

  // Clear away all data if requested
  useEffect(() => {
    if(internalData.resetRequest){
      internalOptions.title = undefined;
      delete internalData.resetRequest;
    }
  }, [internalData])

  // Create the VizComp based on the incomming parameters
  const createChart = async () => {
    const fig = createEmptyChart(internalOptions);
    setMainFigure(fig);

    internalOptions.colorMap = internalOptions.colorMap || defaultOptions.colorMap;
    const { dimensions, values } = mappings;

    if(internalData[values] && internalData[values].length > 256){
      fig.title.text_color = "red";
      fig.title.text = "Your target column includes way too many categories (" + internalData[values].length + "), No Pie Chart drawn!";
      internalData = {};
    }

    if(internalData[dimensions]){
      const sum = Bokeh.LinAlg.sum(internalData[values]);
      const angles = internalData[values].map((v) => {
        return (v / sum) * 2 * Math.PI;
      });

      const percentage = internalData[values].map((v) => { return ((v / sum) * 100).toFixed(1); });

      let colors = [];
      var cm = (allPal[(internalOptions.colorMap + angles.length)] != undefined) ? allPal[(internalOptions.colorMap + angles.length)] : allPal[(internalOptions.colorMap + '_' + angles.length)];
      if(angles.length <= 20){
        if(cm != undefined){
          colors = cm.slice(0, angles.length);
        }
        else{
          colors = allPal[(defaultOptions.colorMap + '_' + angles.length)];
          internalOptions.colorMap = defaultOptions.colorMap;
        }
      }
      else{
        if(allPal[(internalOptions.colorMap + '256')] != undefined){
          cm = allPal[(internalOptions.colorMap + '256')];
        }
        else{
          cm = allPal.Magma256;
          internalOptions.colorMap = 'Magma';
        }
        if(angles.length > 20 && angles.length < 256){
          const step = Math.floor(256/angles.length);
          for(let i = 0; i < angles.length; i++) {
            colors.push(cm[i*step]);
          };
        }
        else{ colors = cm; }
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

      const sData = new Bokeh.ColumnDataSource({
        data: {
          ...{ dimensions, values, ...internalData },
          dimensions: internalData[dimensions],
          values: internalData[values],
          angles,
          colors,
          percentage,
        },
      });
      cds = sData;

      // setup callback
      if (cds) {
        cds.connect(cds.selected.change, () => {
          const indices = sData.selected.indices;
          if (!deepEqual(selectedIndicesInternal, indices)) {
            selectedIndicesInternal = [...indices];
            if (onSelectedIndicesChange) {
              onSelectedIndicesChange(indices);
            }
          }
        });
      }

      fig.add_tools(new Bokeh.HoverTool({ tooltips: '@' + dimensions + ': @' + values + ' (@percentage %)' }));

      fig.wedge({
        x: 0,
        y: 0,
        radius: 0.4,
        start_angle: {
          expr: new Bokeh.CumSum({ field: "angles", include_zero: true }),
        },
        end_angle: { expr: new Bokeh.CumSum({ field: "angles" }) },
        line_color: "white",
        fill_color: { field: "colors" },
        legend: dimensions,
        source: sData,
      });

      fig.xaxis[0].axis_label = null;
      fig.yaxis[0].axis_label = null;
      fig.xaxis[0].visible = false;
      fig.yaxis[0].visible = false;
      fig.xgrid[0].grid_line_color = null;
      fig.ygrid[0].grid_line_color = null;
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
    <div id="container">
      <div ref={rootNode} />
    </div>
  );
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
PieChart.propTypes = {
  data: PropTypes.shape({
    values: PropTypes.arrayOf(PropTypes.number),
    dimensions: PropTypes.arrayOf(PropTypes.string),
    indices: PropTypes.arrayOf(PropTypes.array),
  }),
  mappings: PropTypes.shape({}),
  options: PropTypes.shape({
    title: PropTypes.string,
    colorMap: PropTypes.string,
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
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
PieChart.defaultProps = {
  data: {},
  mappings: {
    dimensions: 'dimensions',
    values: 'values',
  },
  options: defaultOptions,
  colorTags: [],
  selectedIndices: [],
  onSelectedIndicesChange: undefined,
};
//-------------------------------------------------------------------------------------------------
