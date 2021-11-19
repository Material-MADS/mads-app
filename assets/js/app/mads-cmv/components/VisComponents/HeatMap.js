import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import * as deepEqual from 'deep-equal';
import * as Bokeh from "@bokeh/bokehjs";
import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";
import { cmMax } from '../Views/FormUtils';

const defaultOptions = {
  title: "Heat Map",
  extent: { width: undefined, height: 400 },
  x_range: [-1.0, 1.0],
  y_range: [-1.0, 1.0],
  colorMap: 'Category10',
  x_axis_location: 'above',
  toolTipTitles: ['XY Cross', 'HeatValue'],
  heatValUnit: '',
  fontSize: '7px'
};

function createEmptyChart(options) {
  const params = Object.assign({}, defaultOptions, options);
  // const tools = "pan,crosshair,tap,wheel_zoom,reset,save";
  const tools = "save,pan,box_zoom,reset,wheel_zoom";

  const fig = Bokeh.Plotting.figure({
    tools,
    toolbar_location: "right",
    width: params.extent.width || defaultOptions.extent.width,
    height: params.extent.height || defaultOptions.extent.height,
    x_range: params.x_range || defaultOptions.x_range,
    y_range: params.y_range || defaultOptions.y_range,
    x_axis_location: params.x_axis_location || defaultOptions.x_axis_location,
  });

  fig.title.text = params.title || defaultOptions.title; //title object must be set separately or it will become a string (bokeh bug)
  //fig.title.text_color = "red";
  //fig.title.text_font_size = "40px";
  //fig.title.text_font = "Times New Roman";

  return fig;
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default function HeatMap({
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
  let internalOptions = options;


  useEffect(() => {
    if(internalData.resetRequest){
      internalOptions = defaultOptions;
      delete internalData.resetRequest;
    }
  }, [internalData])

  const createChart = async () => {
    const fig = createEmptyChart(internalOptions);
    setMainFigure(fig);

    internalOptions.colorMap = internalOptions.colorMap || defaultOptions.colorMap;
    const { xData, yData, heatVal } = mappings;

    if(internalData[xData]){
      let colors = internalOptions.colors;
      if(!colors){
        colors = (cmMax[internalOptions.colorMap] != undefined) ? allPal[internalOptions.colorMap+cmMax[internalOptions.colorMap]] : allPal[defaultOptions.colorMap+cmMax[defaultOptions.colorMap]];
      }

      const colMapMinMax = internalOptions.colorMapperMinMax ? internalOptions.colorMapperMinMax : [Math.min(...(internalData[heatVal])), Math.max(...(internalData[heatVal]))];
      var mapper = new Bokeh.LinearColorMapper({palette: colors, low: colMapMinMax[0], high: colMapMinMax[1]});

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

      fig.xgrid[0].grid_line_color = null;
      fig.ygrid[0].grid_line_color = null;
      fig.xaxis[0].axis_line_color = null;
      fig.yaxis[0].axis_line_color = null;
      fig.xaxis[0].major_tick_line_color = null;
      fig.yaxis[0].major_tick_line_color = null;
      fig.xaxis[0].major_label_text_font_size = internalOptions.fontSize || defaultOptions.fontSize;
      fig.yaxis[0].major_label_text_font_size = internalOptions.fontSize || defaultOptions.fontSize;
      fig.xaxis[0].major_label_standoff = 0;
      fig.yaxis[0].major_label_standoff = 0;
      fig.xaxis[0].major_label_orientation = Math.PI / 3;
      fig.yaxis[0].major_label_orientation = Math.PI / 3;

      const bData = new Bokeh.ColumnDataSource({ data: { ...internalData,}, });
      cds = bData;

      const renderer = fig.rect({
        x: { field: xData },
        y: { field: yData },
        width: 1,
        height: 1,
        source: bData,
        fill_color: {
          field: heatVal,
          transform: mapper
        },
        line_color: null,
      });

      var activeToolTipTitles = internalOptions.toolTipTitles || defaultOptions.toolTipTitles;
      var activeHeatValUnit = (internalOptions.heatValUnit || defaultOptions.heatValUnit);
      if(activeHeatValUnit == "%%"){ activeHeatValUnit = "%" }
      const tooltip = activeToolTipTitles.length == 2 ?
      [
        [activeToolTipTitles[0], '@'+xData+' @'+yData],
        [activeToolTipTitles[1], '@'+heatVal+' '+activeHeatValUnit],
      ] :
      [
        [activeToolTipTitles[0], '@'+xData],
        [activeToolTipTitles[1], '@'+yData],
        [activeToolTipTitles[2], '@'+heatVal+' '+activeHeatValUnit],
      ];

      fig.add_tools(new Bokeh.HoverTool({ tooltips: tooltip, renderers: [renderer] }));

      const color_bar = new Bokeh.ColorBar({
        color_mapper: mapper,
        major_label_text_font_size: internalOptions.fontSize || defaultOptions.fontSize,
        ticker: new Bokeh.BasicTicker({desired_num_ticks: colors.length}),
        formatter: new Bokeh.PrintfTickFormatter({format: "%f"+(internalOptions.heatValUnit || defaultOptions.heatValUnit)}),
        label_standoff: 6,
        border_line_color: null
      });

      fig.add_layout(color_bar, 'right');
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

HeatMap.propTypes = {
  data: PropTypes.shape({
    xData: PropTypes.arrayOf(PropTypes.string),
    yData: PropTypes.arrayOf(PropTypes.string),
    heatVal: PropTypes.arrayOf(PropTypes.number),
    indices: PropTypes.arrayOf(PropTypes.array),
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

HeatMap.defaultProps = {
  data: {},
  mappings: {
    xData: 'xData',
    yData: 'yData',
    heatVal: 'heatVal',
  },
  options: defaultOptions,
  colorTags: [],
  selectedIndices: [],
  onSelectedIndicesChange: undefined,
};
