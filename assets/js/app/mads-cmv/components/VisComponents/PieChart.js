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
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import * as deepEqual from 'deep-equal';
import * as Bokeh from '@bokeh/bokehjs';

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
// This Visualization Component Class
//-------------------------------------------------------------------------------------------------

export default class PieChart extends Component {
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
    const { dimensions, values } = mappings;

    if(internalData[values] && internalData[values].length > 256){
      this.mainFigure.title.text_color = "red";
      this.mainFigure.title.text = "Your target column includes way too many categories (" + internalData[values].length + "), No Pie Chart drawn!";
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
      this.cds = sData;

      // setup callback
      if (this.cds) {
        this.cds.connect(this.cds.selected.change, () => {
          const indices = sData.selected.indices;
          if (!deepEqual(selectedIndicesInternal, indices)) {
            selectedIndicesInternal = [...indices];
            if (onSelectedIndicesChange) {
              onSelectedIndicesChange(indices);
            }
          }
        });
      }

      this.mainFigure.add_tools(new Bokeh.HoverTool({ tooltips: '@' + dimensions + ': @' + values + ' (@percentage %)' }));

      this.mainFigure.wedge({
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

      this.mainFigure.xaxis[0].axis_label = null;
      this.mainFigure.yaxis[0].axis_label = null;
      this.mainFigure.xaxis[0].visible = false;
      this.mainFigure.yaxis[0].visible = false;
      this.mainFigure.xgrid[0].grid_line_color = null;
      this.mainFigure.ygrid[0].grid_line_color = null;
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
