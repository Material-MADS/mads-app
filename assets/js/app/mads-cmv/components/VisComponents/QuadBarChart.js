// /*=================================================================================================
// // Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
// //          Hokkaido University (2018)
// // ________________________________________________________________________________________________
// // Authors: Jun Fujima (Former Lead Developer) [2018-2021]
// //          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// // ________________________________________________________________________________________________
// // Description: This is the React Component for the Visualization View of the 'QuadBarChart' module
// // ------------------------------------------------------------------------------------------------
// // Notes: 'QuadBarChart' is a visualization component that displays a type of bar chart
// //        based on a range of available properties, and is rendered with the help of the
// //        Bokeh-Charts library.
// // ------------------------------------------------------------------------------------------------
// // References: React & prop-types Libs, 3rd party deepEqual, Bokeh libs with various color palettes
// =================================================================================================*/

// //*** TODO: Could this (and perhaps Hist) be deleted, and just leave the Bar Chart with some new settings to replace them

// //-------------------------------------------------------------------------------------------------
// // Load required libraries
// //-------------------------------------------------------------------------------------------------
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import * as deepEqual from 'deep-equal';
import * as Bokeh from '@bokeh/bokehjs';

import { Category10 } from '@bokeh/bokehjs/build/js/lib/api/palettes';
import { Greys9 } from '@bokeh/bokehjs/build/js/lib/api/palettes';
const Category10_10 = Category10.Category10_10;

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: 'Quad bar chart',
  selectionColor: 'orange',
  nonselectionColor: `#${Greys9[3].toString(16)}`,
  extent: { width: 300, height: 300 },
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Creates an empty basic default Visualization Component of the specific type
//-------------------------------------------------------------------------------------------------
function createEmptyChart(options, dataIsEmpty) {
  const params = Object.assign({}, defaultOptions, options);
  const tools = 'pan,crosshair,tap,reset,save,hover';

  const fig = Bokeh.Plotting.figure({
    title: params.title || 'Quad-Bar Chart for Histograms',
    tools,
    x_range: params.x_range || (dataIsEmpty ? [-1, 1] : undefined),
    y_range: params.y_range || (dataIsEmpty ? [-1, 1] : undefined),
    width: params.extent.width || 400,
    height: params.extent.height || 400,
  });

  if (params.xaxis_orientation) {
    fig.xaxis[0].major_label_orientation = params.xaxis_orientation;
  }

  return fig;
}


//-------------------------------------------------------------------------------------------------
// This Visualization Component Class
//-------------------------------------------------------------------------------------------------
export default class QuadBarChart extends Component {
  constructor(props) {
    super(props);
    this.cds = null;
    this.views = null;
    this.selectedIndicesInternal = [];
    this.rootNode = React.createRef();
    this.clearChart = this.clearChart.bind(this);
    this.createChart = this.createChart.bind(this);
  }

  componentDidMount() {
    this.createChart();
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(this.props.data) != JSON.stringify(prevProps.data)) {
      this.clearChart();
      this.createChart();
    }
  }

  componentWillUnmount() {
    this.clearChart();
  }

  clearChart() {
    if (Array.isArray(this.views)) {
    } else {
      const v = this.views;
      if (v) {
        v.remove();
      }
    }
    if(this.props.data.resetRequest){
      delete this.props.options.x_range;
      delete this.props.options.y_range;
      delete this.props.data.resetRequest;
      delete this.props.data.targetColumns;
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
      onSelectedIndicesChange,
    } = this.props;

    const { n, bins } = mappings;
    const color = `#${Category10_10[0].toString(16)}`;

    const params = { ...defaultOptions, ...options };
    let plt = Bokeh.Plotting;
    const columns = data.columns;
    const dataContents = data.data;
    let views = null;
    var p = null;
    let title ="";

    if (dataContents && Object.keys(dataContents).length > 0) {
      let array = new Array(Object.keys(dataContents).length);

      Object.keys(dataContents).map((index) => {
        if(index==0){
          title="Histogram";
        }else{
          title="";
        }
        if (n && dataContents[index][n] && bins && dataContents[index][bins]) {
          const hhist = dataContents[index][n];
          const hedges = dataContents[index][bins];
          const colors = new Array(hhist.length).fill(color);

          const { indices } = dataContents[index];
          if (indices) {
            for (let i = 0; i < indices.length; i++) {
              colorTags.forEach((colorTag) => {
                if (deepEqual(indices[i], colorTag.itemIndices)) {
                  colors[i] = colorTag.color;
                }
              });
            }
          }

          const ds = new Bokeh.ColumnDataSource({
            data: {
              top: hhist,
              left: hedges.slice(0, -1),
              right: hedges.slice(1),
            },
          });
          this.cds = ds;

          // setup callback
          if (this.cds) {
            this.cds.connect(this.cds.selected.change, () => {
              let indices;
              if (ds.selected.indices.length > 0) {
                indices = dataContents[index].indices[ds.selected.indices];
              }
              else {
                indices = [];
              }

              if (!deepEqual(this.selectedIndicesInternal, indices)) {
                this.selectedIndicesInternal = [...indices];
                if (onSelectedIndicesChange) {
                  onSelectedIndicesChange(indices);
                }
              }
            });
          }

          const tools = 'pan,crosshair,tap,reset,save,hover';
          p = plt.figure({
            title: title,
            tools,
            y_axis_label: "Number of data",
            x_axis_label: this.props.targetColumns[index],
            x_minor_ticks: 2,
            y_minor_ticks: 2,
            width: params.extent.width || 250,
            height: params.extent.height || 250,
          });

          p.quad({
            bottom: 0,
            left: { field: 'left' },
            right: { field: 'right' },
            top: { field: 'top' },
            source: ds,
            color: colors,
            line_color: '#3A5785',
          });

          array[index] = p;
        }
      });

      const newArr = [];
      while (array.length) newArr.push(array.splice(0, Math.ceil(Math.sqrt(columns.length))));
      let null_count = null;
      null_count = (newArr.length * Math.ceil(Math.sqrt(columns.length))) - columns.length;
      for (let i = 0; i < null_count; i++) {
        newArr[newArr.length-1].push(null);
      }

      views = await plt.show(plt.gridplot(newArr, {title: 'Histogram Quad Bar chart'}), this.rootNode.current);
    }
    else {
      const fig = createEmptyChart(options, true);
      views = await plt.show(fig, this.rootNode.current);
    }

    this.views = views;
  }

  render() {
    return (
      <div id="container">
        <div ref={this.rootNode} />
      </div>
    );
  }
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
QuadBarChart.propTypes = {
  data: PropTypes.shape({
    n: PropTypes.arrayOf(PropTypes.number),
    bins: PropTypes.arrayOf(PropTypes.number),
    indices: PropTypes.arrayOf(PropTypes.array),
    data: PropTypes.object,
    columns: PropTypes.array,
  }),
  mappings: PropTypes.shape({}),
  options: PropTypes.shape({
    title: PropTypes.string,
    columns: PropTypes.array,
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
QuadBarChart.defaultProps = {
  data: {
    data: {},
    columns: [],
  },
  mappings: {},
  options: {},
  colorTags: [],
  selectedIndices: [],
  onSelectedIndicesChange: undefined,
};
//-------------------------------------------------------------------------------------------------
