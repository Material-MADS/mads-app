import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import * as deepEqual from 'deep-equal';
import * as Bokeh from "@bokeh/bokehjs";
import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";
import { cmMax } from '../Views/FormUtils';


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
  // fontSize: '7px'
};

function createEmptyChart(options) {
  const params = Object.assign({}, defaultOptions, options);
  const tools = "pan,crosshair,tap,wheel_zoom,reset,save";
  // const tools = "save,pan,box_zoom,reset,wheel_zoom";

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


function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default function LineChart({
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
  let internalData = data;
  let internalOptions = Object.assign({}, defaultOptions, options);;


  useEffect(() => {
    if(internalData.resetRequest){
      internalOptions = defaultOptions;
      delete internalData.resetRequest;
    }
  }, [internalData])

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

  const clearChart = () => {
    if (Array.isArray(views)) {
      // console.warn("array!!!", views);
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
    createChart();
    return () => {
      clearChart();
    };
  }, [data, mappings, options, colorTags]);

  const prevCds = usePrevious(cds);
  useEffect(() => {
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

LineChart.propTypes = {
  data: PropTypes.shape({
    // xData: PropTypes.arrayOf(PropTypes.string),
    // yData: PropTypes.arrayOf(PropTypes.string),
    // heatVal: PropTypes.arrayOf(PropTypes.number),
    // indices: PropTypes.arrayOf(PropTypes.array),
  }),
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
