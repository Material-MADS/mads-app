/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Philippe Gantzer (Component Developer) [2024-]
//          Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the
//              'DescriptorsVis' module
// ------------------------------------------------------------------------------------------------
// Notes: 'DescriptorsVis' is a visualization component using ML-Descriptors on the data before
//        displaying its result in a classic Scatter plot. (rendered by the Bokeh-Charts library.)
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party deepEqual, pandas, lodash and Bokeh libs with
//             various color palettes
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { Component } from 'react';
import { Card } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import ColorTag from '../../models/ColorTag';

import { DataFrame } from 'pandas-js';
import * as Bokeh from '@bokeh/bokehjs';
import * as deepEqual from 'deep-equal';
import _, { find } from 'lodash';

import * as gPalette from 'google-palette';
import { Category10 } from '@bokeh/bokehjs/build/js/lib/api/palettes';
import { Greys9 } from '@bokeh/bokehjs/build/js/lib/api/palettes';
const Category10_10 = Category10.Category10_10;

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: 'Descriptors',
  color: `#${Category10_10[0].toString(16)}`, //blue
  selectionColor: 'orange',
  nonselectionColor: `#${Greys9[3].toString(16)}`,
  extent: { width: 400, height: 400 },
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Creates an empty basic default Visualization Component of the specific type
//-------------------------------------------------------------------------------------------------
function createEmptyChart(options, dataIsEmpty, isThisOld) {
  const params = Object.assign({}, defaultOptions, options);
  if(isThisOld){ params.title = "Out of date. Old Settings! Replace with New!" }

  const tools = 'pan,crosshair,wheel_zoom,box_zoom,box_select,reset,save';
  const fig = Bokeh.Plotting.figure({
    tools,
    x_range: params.x_range || (dataIsEmpty ? [-1, 1] : undefined),
    y_range: params.y_range || (dataIsEmpty ? [-1, 1] : undefined),
    width: params.extent.width || 400,
    height: params.extent.height || 400,
  });

  fig.title.text = params.title; //title object must be set separately or it will become a string (bokeh bug)
  if(isThisOld){
    fig.title.text_color = "red";
    fig.title.text_font_size = "15px";
  }
  else{
    fig.title.text_color = "#303030";
    fig.title.text_font_size = "13px";
  }
  //fig.title.text_font_size = "40px";
  //fig.title.text_font = "Times New Roman";

  return fig;
}
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// Save predictions to the local computer
//-------------------------------------------------------------------------------------------------
function downloadCSV(csvStr, fileName) {
  const link = document.createElement("a");
  link.setAttribute("href", 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvStr));
  link.setAttribute("target", "_blank");
  link.setAttribute("download", fileName);
  link.click();
  try {
    document.body.removeChild(link)
  } catch (error) {}
}
//-------------------------------------------------------------------------------------------------


export default class DescriptorsVis extends Component {
  // Initiation of the VizComp
  constructor(props) {
    super(props);
    this.cds = null;
    this.rootNode = React.createRef();
    this.clearChart = this.clearChart.bind(this);
    this.createDescTable = this.createDescTable.bind(this);
    this.handleSelectedIndicesChange = this.handleSelectedIndicesChange.bind( this );
  }

  componentDidMount() {
    this.createDescTable();
  }

  shouldComponentUpdate(nextProps) {
    const diff = _.omitBy(nextProps, (v, k) => {
      const { [k]: p } = this.props;
      return p === v;
    });

    if (diff.colorTags) {
      return true;
    }

    if (diff.filteredIndices) {
      if (diff.selectedIndices) {
        this.cds.selected.indices = [...diff.selectedIndices];
      }
      return true;
    }

    if (diff.selectedIndices) {
      this.cds.selected.indices = [...diff.selectedIndices];
      return false;
    }

    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      data,
      columns,
      colorTags,
      options,
      selectedIndices,
      filteredIndices,
    } = this.props;

    if (!deepEqual(prevProps.filteredIndices, filteredIndices)) {
      this.clearChart();
      this.createDescTable();
      return;
    }

    if (!deepEqual(prevProps.colorTags, colorTags)) {
      this.clearChart();
      this.createDescTable();
      return;
    }

    if (!deepEqual(prevProps.columns, columns)) {
      this.clearChart();
      this.createDescTable();
      return;
    }

    if (!deepEqual(prevProps.data, data)) {
      this.clearChart();
      this.createDescTable();
      return;
    }

    if (!deepEqual(prevProps.options, options)) {
      this.clearChart();
      this.createDescTable();
      return;
    }
  }

  componentWillUnmount() {
    this.clearChart();
  }

  handleSelectedIndicesChange() {
    const { onSelectedIndicesChange } = this.props;
    const { indices } = this.cds.selected;

    if (onSelectedIndicesChange && !deepEqual(this.lastIndices, indices)) {
      onSelectedIndicesChange(indices);
      this.lastIndices = [...indices];
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

    this.mainFigure = null;
    this.views = null;
  }

  // Create the VizComp based on the incoming parameters
  async createDescTable() {
    const {
      data,
      id,
      columns,
      colorTags,
      selectedIndices,
      filteredIndices,
      options,
    } = this.props;

    let colNamesInProperOrder = [];
    if(columns.length > 0){ colNamesInProperOrder = [...columns]; }
    else{ if(data.data_desc.length > 0){ colNamesInProperOrder = Object.keys(data.data_desc[0]); } }

    const df = new DataFrame(data.data_desc);
    const tmpData = {};
    df.columns.toArray().map((v) => {
      tmpData[v] = df.get(v).to_json({ orient: 'records' });
      return true;
    });
    this.cds = new Bokeh.ColumnDataSource({ data: tmpData });

    const tString = JSON.stringify(colorTags);
    const template = `
      <div style="color:<%=
        (function() {
          var colorTags = ${tString}
          var color = 'black'
          colorTags.forEach(t => {
            if (t.itemIndices.includes(__bkdt_internal_index__)) {
              color = t.color;
              return;
            }
          });
          return color;
        }())
      %>"><%= value %></div>
    `;
    const formatter = new Bokeh.Tables.HTMLTemplateFormatter({ template });

    let displayColumns = colNamesInProperOrder.map((v) => {
      const c = new Bokeh.Tables.TableColumn({
        field: v,
        title: v,
        formatter,
      });
      return c;
    });

    // Custom Download CSV button
    var tableDataString = "empty";
    const viewWrapperCustomButton_DLCSV = $(this.rootNode.current).parent().parent().find('#saveCSVData' + id);
    viewWrapperCustomButton_DLCSV.off('click');
    viewWrapperCustomButton_DLCSV.on("click", function () { downloadCSV(tableDataString, 'descriptors.csv'); });
    tableDataString = df.to_csv('tmp.csv');


    // selection
    if (selectedIndices.length > 0) {
      this.cds.selected.indices = [...selectedIndices];
    }

    // setup callback
    this.cds.connect(this.cds.selected.change, () => {
      this.handleSelectedIndicesChange();
    });

    const params = Object.assign({}, defaultOptions, options);
    const dataTable = new Bokeh.Tables.DataTable({
      name: "Descriptors",
      source: this.cds,
      columns: displayColumns,
      width: params.extent.width || defaultOptions.extent.width,//INITIAL_WIDTH,
      height: params.extent.height || defaultOptions.extent.height,
      selection_color: 'red',
    });

    this.mainFigure = dataTable;

    // filter
    if (filteredIndices.length > 0) {
      const iFilter = new Bokeh.IndexFilter({ indices: filteredIndices });
      const view = new Bokeh.CDSView({ source: this.cds, filters: [iFilter] });
      this.mainFigure.view = view;
    }

    const views = await Bokeh.Plotting.show(
      this.mainFigure,
      this.rootNode.current
    );
    window.fig = this.mainFigure;

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
DescriptorsVis.propTypes = {
  data: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.object),
    data_desc: PropTypes.arrayOf(PropTypes.object),
  }),
  columns: PropTypes.arrayOf(PropTypes.string),
  colorTags: PropTypes.arrayOf(PropTypes.object),
  selectedIndices: PropTypes.arrayOf(PropTypes.number),
  filteredIndices: PropTypes.arrayOf(PropTypes.number),
  options: PropTypes.shape({
    extent: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }),
  }),
  onSelectedIndicesChange: PropTypes.func,
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
DescriptorsVis.defaultProps = {
  data: {data: [], data_desc: [], },
  descriptors: [],
  columns: [],
  colorTags: [],
  selectedIndices: [],
  filteredIndices: [],
  options: defaultOptions,
  onSelectedIndicesChange: undefined,
  options: {
    extent: { width: 400, height: 400 },
  },
};
//-------------------------------------------------------------------------------------------------
