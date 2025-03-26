/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'BarChart' module
// ------------------------------------------------------------------------------------------------
// Notes: 'BarChart' is a visualization component that displays a classic bar chart in numerous
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
import { getRGBAColorStrFromAnyColor } from './VisCompUtils';

import * as deepEqual from 'deep-equal';
import * as Bokeh from '@bokeh/bokehjs';

import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: 'Bar Chart',
  selectionColor: 'orange',
  nonselectionColor: '#' + allPal['Greys9'][3].toString(16),
  extent: { width: 400, height: 400 },
  colorMap: 'Category10',
  barColors: [],
  barType: "Vertical",
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Creates an empty basic default Visualization Component of the specific type
//-------------------------------------------------------------------------------------------------
function createEmptyChart(options, dataIsEmpty) {
  const params = { ...options };
  const tools = 'pan,crosshair,tap,reset,save';

  const fig = Bokeh.Plotting.figure({
    tools,
    x_range: params.x_range || (dataIsEmpty ? ['A', 'B'] : undefined),
    y_range: params.y_range || (dataIsEmpty ? [-1, 1] : undefined),
    width: params.extent.width || 400,
    height: params.extent.height || 400,
  });

  if (params.xaxis_orientation) {
    fig.xaxis[0].major_label_orientation = params.xaxis_orientation;
  }

  fig.title.text = params.title || defaultOptions.title; //title object must be set separately or it will become a string (bokeh bug)
  //fig.title.text_color = "red";
  //fig.title.text_font_size = "40px";
  //fig.title.text_font = "Times New Roman";

  return fig;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Reset Key Props
//-------------------------------------------------------------------------------------------------
function resetKeyProps(compProps) {
  compProps.options.title = defaultOptions.title;
  delete compProps.options.x_range;
  delete compProps.options.y_range;
  compProps.options.transposeEnabled = false;
  delete compProps.options.transposeGroup;
  delete compProps.options.transposeGroupLabel;
  delete compProps.options.transposeSplitColumn;
  compProps.options.valCalcMethod = false;

  compProps.mappings.dimension = "";
  compProps.mappings.measures = [];
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default class BokehBarChart extends Component {
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
    if(this.props.appMsg && this.props.appMsg.resetRequest){
      resetKeyProps(this.props);
      delete this.props.appMsg.resetRequest;
    }
    this.mainFigure = null;
    this.views = null;
  }

  async createChart() {
    const {
      data,
      mappings,
      options,
      colorTags,
      selectedIndices,
      onSelectedIndicesChange,
    } = this.props;
    console.log(data);

    let selectedIndicesInternal = [];
    let internalOptions = {...defaultOptions, ...options};
    const { dimension, measures } = mappings;

    const testDataMapMeasure = measures ? [...measures][0] : undefined;

    // setup ranges
    if (dimension && measures && data[dimension] && data[testDataMapMeasure]) {
      data[dimension] = data[dimension].map(String);
      if(internalOptions.barType == "Vertical"){ internalOptions.x_range = data[dimension]; }
      else { internalOptions.y_range = data[dimension]; }
    }

    this.mainFigure = createEmptyChart(internalOptions, !(dimension && measures && data[dimension] && data[testDataMapMeasure]));

    if (dimension && measures && data[dimension] && data[testDataMapMeasure]) {
      const ds = new Bokeh.ColumnDataSource({ data });
      this.cds = ds;

      var noOfMeasures = measures.length > 2 ? measures.length : 3;
      var cm = (allPal[(internalOptions.colorMap + noOfMeasures)] != undefined) ? allPal[(internalOptions.colorMap + noOfMeasures)] : allPal[(internalOptions.colorMap + '_' + noOfMeasures)];
      let colors = [];
      if(noOfMeasures <= 20){ colors = cm.slice(0, noOfMeasures); }
      else{
        if(allPal[(internalOptions.colorMap + '256')] != undefined){ cm = allPal[(internalOptions.colorMap + '256')]; }
        else{ cm = allPal.Magma256;  internalOptions.colorMap = 'Magma'; }
        if(noOfMeasures > 20 && noOfMeasures < 256){
          const step = Math.floor(256/noOfMeasures);
          for(let i = 0; i < noOfMeasures; i++) { colors.push(cm[i*step]); };
        }
        else{ colors = cm; }
      }

      // setup callback
      if (this.cds) {
        this.cds.connect(this.cds.selected.change, (...args) => {
          const indices = ds.selected.indices;
          if (!deepEqual(selectedIndicesInternal, indices)) {
            selectedIndicesInternal = [...indices];
            if (onSelectedIndicesChange) {
              onSelectedIndicesChange(indices);
            }
          }
        });
      }

      const barWidth = 4 / (measures.length * 5);
      const step = barWidth + barWidth * 0.1;
      measures.forEach((m, i) => {
        const xv = new Bokeh.Dodge({
          name: dimension,
          value: step * i - (step * (measures.length - 1)) / 2,
          range: ((internalOptions.barType == "Vertical") ? this.mainFigure.x_range : this.mainFigure.y_range),
        });

        const l = data[dimension].length;
        const ppal = new Array(l).fill(colors[i]);

        if (internalOptions.barColors) {
          internalOptions.barColors.forEach((c, i) => {
            ppal[i] = c;
          });
        }

        for(var n = 0, ct; ct = colorTags[n]; n++){
          var target = parseInt(ct.itemIndices[0]);
          const baseColorAsHexStr = "#" + (ppal[target] & 0x00FFFFFF).toString(16).padStart(6, '0');
          const baseColorAsRGB = getRGBAColorStrFromAnyColor(baseColorAsHexStr);
          const tintColorAsRGB = getRGBAColorStrFromAnyColor(ct.color);
          ppal[target] = RGB_Linear_Blend(0.85,baseColorAsRGB,tintColorAsRGB);
        }

        const barChartParamObj = {
          x: ((internalOptions.barType == "Vertical") ? { field: dimension, transform: xv } : undefined),
          y: ((internalOptions.barType != "Vertical") ? { field: dimension, transform: xv } : undefined),
          top: ((internalOptions.barType == "Vertical") ? { field: m } : undefined),
          right: ((internalOptions.barType != "Vertical") ? { field: m } : undefined),
          width: ((internalOptions.barType == "Vertical") ? barWidth : undefined),
          height: ((internalOptions.barType != "Vertical") ? barWidth : undefined),
          source: ds,
          color: ppal,
          legend: {
            value: measures[i],
          },
        };

        let renderer;
        if(internalOptions.barType == "Vertical"){
          renderer = this.mainFigure.vbar(barChartParamObj);
        }
        else {
          renderer = this.mainFigure.hbar(barChartParamObj);
        }

        const tooltip = [
          [dimension, '@'+dimension+'\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0'],
          ["Group", m],
          ["Value", '@'+m],
        ]
        this.mainFigure.add_tools(new Bokeh.HoverTool({ tooltips: tooltip, renderers: [renderer] }));
        this.mainFigure.legend.location = internalOptions.legendLocation || 'top_right';
      });
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
BokehBarChart.propTypes = {
  data: PropTypes.shape({}),
  mappings: PropTypes.shape({
    dimension: PropTypes.string,
    measures: PropTypes.arrayOf(PropTypes.string),
  }),
  options: PropTypes.shape({
    title: PropTypes.string,
    selectionColor: PropTypes.string,
    nonselectionColor: PropTypes.string,
    palette: PropTypes.arrayOf(PropTypes.string),
    barColors: PropTypes.arrayOf(PropTypes.string),
    extent: PropTypes.shape({
      width: PropTypes.number.isRequired,
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
BokehBarChart.defaultProps = {
  data: {},
  mappings: {},
  options: defaultOptions,
  colorTags: [],
  selectedIndices: [],
  onSelectedIndicesChange: undefined,
};
//-------------------------------------------------------------------------------------------------
