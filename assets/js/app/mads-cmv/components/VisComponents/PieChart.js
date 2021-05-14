import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import * as Bokeh from "@bokeh/bokehjs";
import { Category10 } from "@bokeh/bokehjs/build/js/lib/api/palettes";
import { Greys9 } from "@bokeh/bokehjs/build/js/lib/api/palettes";

import { Category20c_20 } from "@bokeh/bokehjs/build/js/lib/api/palettes";
import { Plasma256 } from "@bokeh/bokehjs/build/js/lib/api/palettes";

const Category10_10 = Category10.Category10_10;

// Dev and Debug declarations
window.Bokeh = Bokeh;

const defaultOptions = {
  title: "Pie Chart",
  selectionColor: "orange",
  nonselectionColor: `#${Greys9[3].toString(16)}`,
  extent: { width: undefined, height: 400 },
  x_range: [-1.0, 1.0],
  pieColors: [],
};

function createEmptyChart(options) {
  const params = Object.assign({}, defaultOptions, options);
  const tools =
    "pan,crosshair,tap,wheel_zoom,reset,save";

  const fig = Bokeh.Plotting.figure({
    title: params.title || defaultOptions.title,
    tools,
    toolbar_location: "right",
    selectionColor: params.selectionColor || defaultOptions.nonselectionColor,
    nonselectionColor:
      params.nonselectionColor || defaultOptions.nonselectionColor,
    plot_width: params.extent.width || defaultOptions.extent.width,
    plot_height: params.extent.height || defaultOptions.extent.height,
    x_range: params.x_range || defaultOptions.x_range,
    pieColors: [] || defaultOptions.pieColors,
  });

  return fig;
}

export default function PieChart({ data, options }) {
  const rootNode = useRef(null);
  let views = null;
  const [mainFigure, setMainFigure] = useState(null);
  let cds = null;

  const createChart = async () => {
    //const { dimension, values } = mappings;

    const fig = createEmptyChart(options);

    if(data.dimensions){
      const sum = Bokeh.LinAlg.sum(data.values);
      const angles = data.values.map((v) => {
        return (v / sum) * 2 * Math.PI;
      });
      
      let colors = [];
      if(angles.length <= 20){
        colors = Category20c_20.slice(0, angles.length);
      }
      else if(angles.length > 20 && angles.length < 256){
        const step = Math.floor(256/angles.length);
        for(let i = 0; i < angles.length; i++) {
          colors.push(Plasma256[i*step]);
        };                
      }
      else{ colors = Plasma256; }

      const sData = new Bokeh.ColumnDataSource({
        data: {
          ...data,
          angles,
          colors,
        },
      });

      fig.add_tools(new Bokeh.HoverTool({ tooltips: '@dimensions: @values' }));
  
      fig.wedge({
        x: 0,
        y: 1,
        radius: 0.4,
        start_angle: {
          expr: new Bokeh.CumSum({ field: "angles", include_zero: true }),
        },
        end_angle: { expr: new Bokeh.CumSum({ field: "angles" }) },
        line_color: "white",
        fill_color: { field: "colors" },
        legend: "dimensions",
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
  });

  return (
    <div id="container">
      <div ref={rootNode} />
    </div>
  );
}

PieChart.propTypes = {
  data: PropTypes.shape({}),
  // mappings: PropTypes.shape({
  //   dimension: PropTypes.string,
  //   measures: PropTypes.arrayOf(PropTypes.string),
  // }),
  options: PropTypes.shape({
    title: PropTypes.string,
    selectionColor: PropTypes.string,
    nonselectionColor: PropTypes.string,
    pieColors: PropTypes.arrayOf(PropTypes.string),
    x_range: PropTypes.arrayOf(PropTypes.number),
    extent: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number.isRequired,
    }),
  }),
  //colorTags: PropTypes.arrayOf(PropTypes.object),
  //selectedIndices: PropTypes.arrayOf(PropTypes.number),
  // colorTags: PropTypes.arrayOf(PropTypes.object),
  //onSelectedIndicesChange: PropTypes.func,
};

PieChart.defaultProps = {
  data: {},
  // mappings: {},
  options: defaultOptions,
};
