/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the
//              'PeriodicTable' module
// ------------------------------------------------------------------------------------------------
// Notes: 'PeriodicTable' is a visualization component that displays a classic Periodic Table
//        with the most common elements abd most of their attributes, rendered with the help of the
//        Bokeh-Charts library.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party lodash, Jquery, Bokeh and pandas libs
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { Component } from 'react';
import PropTypes from "prop-types";

import * as Bokeh from "@bokeh/bokehjs";
import _, { transform } from 'lodash';
import $ from "jquery";
import { Series, DataFrame } from 'pandas-js';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Pre Initiate the Element data
//-------------------------------------------------------------------------------------------------

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
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "Periodic Table (omitting LA and AC Series)",
  extent: { width: 1000, height: 450 },
  x_range: groups,
  y_range: periods.reverse(),
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Creates an empty basic default Visualization Component of the specific type
//-------------------------------------------------------------------------------------------------
function createEmptyChart(options) {
  const params = Object.assign({}, defaultOptions, options);
  const tools = "tap,box_select";

  const fig = Bokeh.Plotting.figure({
    tools,
    toolbar_location: null,
    width: params.extent.width || defaultOptions.extent.width,
    height: params.extent.height || defaultOptions.extent.height,
    x_range: params.x_range || defaultOptions.x_range,
    y_range: params.y_range || defaultOptions.y_range,
  });

  fig.title.text = params.title || defaultOptions.title; //title object must be set separately or it will become a string (bokeh bug)

  return fig;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component Class
//-------------------------------------------------------------------------------------------------

export default class PeriodicTable extends Component {
  // Initiation of the VizComp
  constructor(props) {
    super(props);
    this.cds = null;
    this.rootNode = React.createRef();
    this.clearChart = this.clearChart.bind(this);
    this.createChart = this.createChart.bind(this);
    this.handleSelectedIndicesChange = this.handleSelectedIndicesChange.bind(this);
    this.lastSelections = [];
    this.selecting = false;
  }

  componentDidMount() {
    this.createChart();
  }

  shouldComponentUpdate(nextProps) {
    const diff = _.omitBy(nextProps, (v, k) => {
      const { [k]: p } = this.props;
      return p === v;
    });

    if (diff.colorTags) {
      return true;
    }

    if (diff.selectedIndices) {
      if (this.cds) {
        this.cds.selected.indices = diff.selectedIndices;
      }
      return false;
    }

    return true;
  }

  componentDidUpdate() {
    this.clearChart();
    this.createChart();
  }

  componentWillUnmount() {
    this.clearChart();
  }

  handleSelectedIndicesChange() {
    const { onSelectedIndicesChange } = this.props;
    const { indices } = this.cds.selected;

    if (this.selecting) {
      return;
    }

    if (onSelectedIndicesChange && !deepEqual(this.lastSelections, indices)) {
      this.selecting = true;
      this.lastSelections = [...indices];
      onSelectedIndicesChange(indices);
      this.selecting = false;
    }
  }

  // Clear away the VizComp
  clearChart() {
    if (Array.isArray(this.views)) {
    } else {
      const v = this.views;
      if (v) {
        v.remove();
      }
    }
    if(this.props.data.resetRequest){
      this.props.options.title = defaultOptions.title;
      delete this.props.data.resetRequest;
    }
    this.mainFigure = null;
    this.views = null;
  }

  // Create the VizComp based on the incomming parameters
  async createChart() {
    const {
      options,
    } = this.props;


    // Create the VizComp based on the incomming parameters
    const data = new Bokeh.ColumnDataSource({ data: { ...dataset,}, });
    this.mainFigure = createEmptyChart({});

    const r = this.mainFigure.rect({
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

    this.mainFigure.add_tools(new Bokeh.HoverTool({ tooltips: tooltip, renderers: [r] }));

    const text_props = {source: data, text_align: "left", text_baseline: "middle"};
    const x = { field: 'group', transform: new Bokeh.Dodge({ value: -0.4, range: this.mainFigure.x_range, }) };

    this.mainFigure.text({
      x: x,
      y: { field: 'period' },
      text: { field: 'symbol' },
      text_font_style: 'bold',
      ...text_props,
    });

    this.mainFigure.text({
      x: x,
      y: {
         field: "period",
         transform: new Bokeh.Dodge({ value: 0.3, 'range': this.mainFigure.y_range })
      },
      text: { field: 'atomic number' },
      text_font_size: '11px',
      ...text_props,
    });

    this.mainFigure.text({
      x: x,
      y: {
        field: 'period',
        transform: new Bokeh.Dodge({
          value: -0.35,
          range: this.mainFigure.y_range,
        }),
      },
      text: { field: 'name' },
      text_font_size: "7px",
      ...text_props,
    });

    this.mainFigure.text({
      x: x,
      y: {
        field: 'period',
        transform: new Bokeh.Dodge({
          value: -0.2,
          range: this.mainFigure.y_range,
        }),
      },
      text: { field: 'atomic mass' },
      text_font_size: "7px",
      ...text_props,
    });

    this.mainFigure.text({
      x: ["3", "3"],
      y: ["VI", "VII"],
      text: ["LA", "AC"],
      text_align: "center",
      text_baseline: "middle",
    });

    this.mainFigure.outline_line_color = null;
    this.mainFigure.xgrid[0].grid_line_color = null;
    this.mainFigure.ygrid[0].grid_line_color = null;
    this.mainFigure.xaxis[0].axis_line_color = null;
    this.mainFigure.yaxis[0].axis_line_color = null;
    this.mainFigure.xaxis[0].major_tick_line_color = null;
    this.mainFigure.yaxis[0].major_tick_line_color = null;
    this.mainFigure.xaxis[0].major_label_standoff = 0;
    this.mainFigure.yaxis[0].major_label_standoff = 0;
    this.mainFigure.legend.orientation = "horizontal";
    this.mainFigure.legend.location = "top_center";

    const views = await Bokeh.Plotting.show(this.mainFigure, this.rootNode.current);
    $(this.rootNode.current).parent().parent().find(".ui.mini.icon.button").eq(1).hide();

    if (this.views) {
      this.clearChart();
    }

    this.views = views;
  }

  // Add the VizComp to the DOM
  render() {
    return (
      <div>
        <div ref={this.rootNode} />
      </div>
    );
  }
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
PeriodicTable.propTypes = {
  options: PropTypes.shape({
    title: PropTypes.string,
    x_range: PropTypes.arrayOf(PropTypes.string),
    y_range: PropTypes.arrayOf(PropTypes.string),
    extent: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number.isRequired,
    }),
  }),
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
PeriodicTable.defaultProps = {
  options: defaultOptions,
};
//-------------------------------------------------------------------------------------------------
