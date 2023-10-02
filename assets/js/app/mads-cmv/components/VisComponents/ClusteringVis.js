/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'ClusteringVis' module
// ------------------------------------------------------------------------------------------------
// Notes: 'ClusteringVis' is a visualization component for the 'K-Means Clustering' component that
//        displays a scikit learn cluster either as a scatter plot or a bar chart and is rendered
//        with the help of the Bokeh-Charts library.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party deepEqual, Bokeh libs with various color palettes
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getRGBAColorStrFromAnyColor, RGB_Linear_Blend } from './VisCompUtils';

import { DataFrame } from 'pandas-js';
import * as deepEqual from 'deep-equal';
import _ from 'lodash';
import * as Bokeh from '@bokeh/bokehjs';

import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";
import * as gPalette from 'google-palette';
import { Category10 } from '@bokeh/bokehjs/build/js/lib/api/palettes';
import { Greys9 } from '@bokeh/bokehjs/build/js/lib/api/palettes';
const Category10_10 = Category10.Category10_10;

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: 'Clustering',
  selectionColor: 'orange',
  nonselectionColor: '#' + allPal['Greys9'][3].toString(16),
  extent: { width: 400, height: 400 },
  colorMap: 'Category10',
  barType: "Vertical",
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Creates an empty basic default Visualization Component of the specific type
//-------------------------------------------------------------------------------------------------
function createEmptyChart(options, dataIsEmpty, whatVisType) {
  const params = { ...options };
  var tools = 'reset';
  var xRange = params.x_range || (dataIsEmpty ? [-1, 1] : undefined);

  if(whatVisType == "Bar Chart"){
    tools = 'pan,crosshair,tap,reset,save';
    xRange = params.x_range || (dataIsEmpty ? ['A', 'B'] : undefined);
  }
  else if(whatVisType == "Scatter Plot"){
    tools = 'pan,crosshair,wheel_zoom,box_zoom,box_select,reset,save';
  }

  const fig = Bokeh.Plotting.figure({
    tools,
    x_range: xRange,
    y_range: params.y_range || (dataIsEmpty ? [-1, 1] : undefined),
    width: params.extent.width || 400,
    height: params.extent.height || 400,
    toolbar_location: 'right',
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
  compProps.mappings.dimension = "";
  compProps.mappings.measures = [];
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default class ClusteringVis extends Component {
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
      resetKeyProps(this.props);
      delete this.props.data.resetRequest;
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
      filteredIndices,
      showMessage,
    } = this.props;

    let selectedIndicesInternal = [];
    let internalOptions = {...defaultOptions, ...options};

    // BAR CHART
    //-------------------
    if(data && data.visType == "Bar Chart"){

      const { dimension, measures } = mappings;
      const testDataMapMeasure = measures ? [...measures][0] : undefined;

      // setup ranges
      if (dimension && measures && data[dimension] && data[testDataMapMeasure]) {
        data[dimension] = data[dimension].map(String);
        if(internalOptions.barType == "Vertical"){ internalOptions.x_range = data[dimension]; }
        else { internalOptions.y_range = data[dimension]; }
      }

      this.mainFigure = createEmptyChart(internalOptions, !(dimension && measures && data[dimension] && data[testDataMapMeasure]), data.visType);

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
    }

    //SCATTER PLOT
    //-------------------
    else if(data && data.visType == "Scatter Plot"){
      const { x: xName, y: yName } = mappings;
      const clusters = data.cluster

      const df = new DataFrame(data.data);
      let x = [];
      let y = [];
      const cols = df.columns;

      this.mainFigure = createEmptyChart(internalOptions, !(xName && yName && cols.includes(xName) && cols.includes(yName)), data.visType);

      if (xName && yName && cols.includes(xName) && cols.includes(yName)) {
        x = df.get(xName).to_json({ orient: 'records' });
        y = df.get(yName).to_json({ orient: 'records' });

        this.cds = new Bokeh.ColumnDataSource({ data: { x, y } });

        this.mainFigure.xaxis[0].axis_label = xName;
        this.mainFigure.yaxis[0].axis_label = yName;

        // selection
        if (selectedIndices && selectedIndices.length > 0) {
          this.cds.selected.indices = selectedIndices;
          this.lastSelections = selectedIndices;
        }

        // color
        const colors = new Array(x.length).fill(
          `#${Category10_10[2].toString(16)}`
        );
        for(let i = 0; i < clusters.length; i++) { colors[i] = `#${Category10_10[clusters[i]].toString(16)}`; };

        const selectionColor = options.selectionColor || 'orange';
        const nonselectionColor = options.nonselectionColor || `#${Greys9[3].toString(16)}`;

        let circles = null;
        circles = this.mainFigure.circle(
          { field: 'x' },
          { field: 'y' },
          {
            source: this.cds,
            fill_alpha: 0.9,
            fill_color: colors,
            selection_color: selectionColor,
            nonselection_color: nonselectionColor,
            line_color: null,
          }
        );
      }
    }

    //No Visualization
    //-------------------
    else{
      this.mainFigure = createEmptyChart(internalOptions, false);
    }
    //-------------------

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
ClusteringVis.propTypes = {
  data: PropTypes.shape({}),
  mappings: PropTypes.shape({
    dimension: PropTypes.string,
    measures: PropTypes.arrayOf(PropTypes.string),
    x: PropTypes.string,
    y: PropTypes.string,
    color: PropTypes.string,
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
  filteredIndices: PropTypes.arrayOf(PropTypes.number),
  showMessage: PropTypes.func,
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
ClusteringVis.defaultProps = {
  data: {},
  mappings: {},
  options: defaultOptions,
  colorTags: [],
  selectedIndices: [],
  onSelectedIndicesChange: undefined,
  filteredIndices: [],
};
//-------------------------------------------------------------------------------------------------
