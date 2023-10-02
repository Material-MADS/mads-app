/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'HeatMap' module
// ------------------------------------------------------------------------------------------------
// Notes: 'HeatMap' is a visualization component that displays a classic heat map based on a range
//        of available properties, and is rendered with the help of the Bokeh-Charts library.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party deepEqual, Bokeh libs with various color
//              palettes and also internal support methods from FormUtils
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { Component } from 'react';
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
  title: "Heat Map",
  extent: { width: 500, height: 400 },
  x_range: [-1.0, 1.0],
  y_range: [-1.0, 1.0],
  colorMap: 'Category10',
  x_axis_location: 'above',
  toolTipTitles: ['XY Cross', 'HeatValue'],
  heatValUnit: '',
  fontSize: '7px'
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Creates an empty basic default Visualization Component of the specific type
//-------------------------------------------------------------------------------------------------
function createEmptyChart(options) {
  const params = Object.assign({}, defaultOptions, options);
  const tools = "save,pan,tap,box_select,box_zoom,reset,wheel_zoom";

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
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component Class
//-------------------------------------------------------------------------------------------------

export default class HeatMap extends Component {
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
      this.props.options.x_range = [-1.0, 1.0];
      this.props.options.y_range = [-1.0, 1.0];
      delete this.props.data.resetRequest;
    }
    this.mainFigure = null;
    this.views = null;
  }

  // Create the VizComp based on the incomming parameters
  async createChart() {
    const {
      data,
      mappings,
      options,
      colorTags,
      selectedIndices,
      onSelectedIndicesChange,
    } = this.props;

    let selectedIndicesInternal = [];
    let internalData = data;
    let internalOptions = options;

    // Create the VizComp based on the incomming parameters
    this.mainFigure = createEmptyChart(internalOptions);

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
      if (this.cds) {
        this.cds.connect(this.cds.selected.change, () => {
          const indices = bData.selected.indices;
          if (!deepEqual(selectedIndicesInternal, indices)) {
            selectedIndicesInternal = [...indices];
            if (onSelectedIndicesChange) {
              onSelectedIndicesChange(indices);
            }
          }
        });
      }

      this.mainFigure.xgrid[0].grid_line_color = null;
      this.mainFigure.ygrid[0].grid_line_color = null;
      this.mainFigure.xaxis[0].axis_line_color = null;
      this.mainFigure.yaxis[0].axis_line_color = null;
      this.mainFigure.xaxis[0].major_tick_line_color = null;
      this.mainFigure.yaxis[0].major_tick_line_color = null;
      this.mainFigure.xaxis[0].major_label_text_font_size = internalOptions.fontSize || defaultOptions.fontSize;
      this.mainFigure.yaxis[0].major_label_text_font_size = internalOptions.fontSize || defaultOptions.fontSize;
      this.mainFigure.xaxis[0].major_label_standoff = 0;
      this.mainFigure.yaxis[0].major_label_standoff = 0;
      this.mainFigure.xaxis[0].major_label_orientation = Math.PI / 3;
      this.mainFigure.yaxis[0].major_label_orientation = Math.PI / 3;

      const bData = new Bokeh.ColumnDataSource({ data: { ...internalData,}, });
      this.cds = bData;

      const renderer = this.mainFigure.rect({
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

      this.mainFigure.add_tools(new Bokeh.HoverTool({ tooltips: tooltip, renderers: [renderer] }));

      const color_bar = new Bokeh.ColorBar({
        color_mapper: mapper,
        major_label_text_font_size: internalOptions.fontSize || defaultOptions.fontSize,
        ticker: new Bokeh.BasicTicker({desired_num_ticks: colors.length}),
        formatter: new Bokeh.PrintfTickFormatter({format: "%f"+(internalOptions.heatValUnit || defaultOptions.heatValUnit)}),
        label_standoff: 6,
        border_line_color: null
      });

      this.mainFigure.add_layout(color_bar, 'right');
    }

    const views = await Bokeh.Plotting.show(this.mainFigure, this.rootNode.current);

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
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
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
//-------------------------------------------------------------------------------------------------
