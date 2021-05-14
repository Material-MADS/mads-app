import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import * as Bokeh from "@bokeh/bokehjs";
import _, { transform } from 'lodash';
import { Category10 } from "@bokeh/bokehjs/build/js/lib/api/palettes";
import { Greys9 } from "@bokeh/bokehjs/build/js/lib/api/palettes";

import { Category20c_20 } from "@bokeh/bokehjs/build/js/lib/api/palettes";
import { Plasma256 } from "@bokeh/bokehjs/build/js/lib/api/palettes";

import { Series, DataFrame } from 'pandas-js';

const Category10_10 = Category10.Category10_10;


// Import Periodic Table Data and Prepare Periodic Table
//=======================================================
import elements from './data/elements';

const periods = ["I", "II", "III", "IV", "V", "VI", "VII"];
const groups = _.range(1, 19).map(x => x.toString()); 

let df = new DataFrame(elements);
df = df.set('period', (df.get('period').to_json({ orient: 'records' })).map((i) => periods[i - 1]));

df = df.filter(df.get('group').where(1, (v) => v !== '-'));
df = df.filter(df.get('symbol').where(1, (v) => v !== 'Lr'));
df = df.filter(df.get('symbol').where(1, (v) => v !== 'Lu'));

df = df.set('group', (df.get('group').to_json({ orient: 'records' })).map((i) => groups[i -1]));

const dataset = {};
df.columns.toArray().map((c) => {
  dataset[c] = df.get(c).to_json({ orient: 'records' });
});

const cmap = {
  "alkali metal"         : "#a6cee3",
  "alkaline earth metal" : "#1f78b4",
  "metal"                : "#d93b43",
  "halogen"              : "#999d9a",
  "metalloid"            : "#e08d49",
  "noble gas"            : "#eaeaea",
  "nonmetal"             : "#f1d4Af",
  "transition metal"     : "#599d7A"
};

const tooltip = [
  ['Name', '@name'],
  ['Atomic number', '@{atomic number}'],
  ['Atomic mass', '@{atomic mass}'],
  ['Type', '@metal'],
  ['CPK color', '$color[hex, swatch]:CPK'],
  ['Electronic configuration', '@{electronic configuration}'],
];
//=======================================================

const defaultOptions = {
  title: "Periodic Table (omitting LA and AC Series)",
  selectionColor: "orange",
  nonselectionColor: `#${Greys9[3].toString(16)}`,
  extent: { width: 1000, height: 450 },
  x_range: groups,
  y_range: periods.reverse(),
  ptColors: [],
};

function createEmptyChart(options) {
  const params = Object.assign({}, defaultOptions, options);
  const tools = "wheel_zoom,tap,box_select,reset,save";

  const fig = Bokeh.Plotting.figure({
    title: params.title || defaultOptions.title,
    tools,
    toolbar_location: null,
    selectionColor: params.selectionColor || defaultOptions.nonselectionColor,
    nonselectionColor:
      params.nonselectionColor || defaultOptions.nonselectionColor,
    plot_width: params.extent.width || defaultOptions.extent.width,
    plot_height: params.extent.height || defaultOptions.extent.height,
    x_range: params.x_range || defaultOptions.x_range,
    y_range: params.y_range || defaultOptions.y_range,
    ptColors: [] || defaultOptions.ptColors,
  });
  
  //Perhaps not that useful tool
  fig.toolbar.active_scroll = fig.select_one(Bokeh.WheelZoomTool);

  return fig;
}

export default function PeriodicTable({ data, options }) {
  const rootNode = useRef(null);
  let views = null;
  const [mainFigure, setMainFigure] = useState(null);
  let cds = null;

  const createChart = async () => {
    const data = new Bokeh.ColumnDataSource({ data: { ...dataset,}, });
    const fig = createEmptyChart(options);

    // Debugging ----------------------
    window.f = fig;
    // --------------------------------

    const r = fig.rect({
      x: { field: 'group' },
      y: { field: 'period' },
      width: 0.95,
      height: 0.95,
      source: data,
      fill_alpha: 0.6,
      legend: { field: 'metal' },
      color: {
        field: "metal", 
        transform: new Bokeh.CategoricalColorMapper({
          palette: Object.values(cmap), 
          factors:  Object.keys(cmap)
        }),
      },
    });

    fig.add_tools(new Bokeh.HoverTool({ tooltips: tooltip, renderers: [r] }));
     
    const text_props = {source: data, text_align: "left", text_baseline: "middle"};
    const x = { field: 'group', transform: new Bokeh.Dodge({ value: -0.4, range: fig.x_range, }) };

    fig.text({
      x: x,
      y: { field: 'period' },
      text: { field: 'symbol' },
      text_font_style: 'bold',
      ...text_props,
    });

    fig.text({
      x: x,
      y: {
         field: "period",
         transform: new Bokeh.Dodge({ value: 0.3, 'range': fig.y_range })        
      },
      text: { field: 'atomic number' },      
      text_font_size: '11px',
      ...text_props,
    });

    fig.text({
      x: x, 
      y: {
        field: 'period',
        transform: new Bokeh.Dodge({      
          value: -0.35,
          range: fig.y_range,
        }),
      },
      text: { field: 'name' },
      text_font_size: "7px",
      ...text_props,
    });

    fig.text({
      x: x, 
      y: {
        field: 'period',
        transform: new Bokeh.Dodge({        
          value: -0.2,
          range: fig.y_range,
        }),
      },
      text: { field: 'atomic mass' },
      text_font_size: "7px",
      ...text_props,
    });

    fig.text({
      x: ["3", "3"], 
      y: ["VI", "VII"],
      text: ["LA", "AC"],      
      text_align: "center",       
      text_baseline: "middle",
    });

    fig.outline_line_color = null;    
    fig.xgrid[0].grid_line_color = null;
    fig.ygrid[0].grid_line_color = null;
    fig.xaxis[0].axis_line_color = null;
    fig.yaxis[0].axis_line_color = null;
    fig.xaxis[0].major_tick_line_color = null;
    fig.yaxis[0].major_tick_line_color = null;
    fig.xaxis[0].major_label_standoff = 0;
    fig.yaxis[0].major_label_standoff = 0;
    fig.legend.orientation = "horizontal";
    fig.legend.location = "top_center";

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

PeriodicTable.propTypes = {
  data: PropTypes.shape({}),
  options: PropTypes.shape({
    title: PropTypes.string,
    selectionColor: PropTypes.string,
    nonselectionColor: PropTypes.string,
    ptColors: PropTypes.arrayOf(PropTypes.string),
    x_range: PropTypes.arrayOf(PropTypes.string),
    y_range: PropTypes.arrayOf(PropTypes.string),
    extent: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number.isRequired,
    }),
  }),
};

PeriodicTable.defaultProps = {
  data: {},
  options: defaultOptions,
};
