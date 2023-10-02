/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'Statistics' module
// ------------------------------------------------------------------------------------------------
// Notes: 'Statistics' is a visualization component that displays a classic Table, rendered with the
//        Bokeh library.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party pandas, deepEqual, lodash & Bokeh libs
=================================================================================================*/

//*** TODO: Convert this to the newer react component type using hooks or perhaps...

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { Component, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { DataFrame } from 'pandas-js';
import * as deepEqual from 'deep-equal';
import _ from 'lodash';
import * as Bokeh from '@bokeh/bokehjs';

import $ from "jquery";
import { Greys9 } from '@bokeh/bokehjs/build/js/lib/api/palettes';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Initiation Consts and Vars
//-------------------------------------------------------------------------------------------------
var currentDataSource = {};

const defaultOptions = {
  title: 'Statistics:',
  selectionColor: 'orange',
  nonselectionColor: `#${Greys9[3].toString(16)}`,
  extent: { width: 800, height: 230 },
  columns: [],
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Create Empty Bokeh Chart
//-------------------------------------------------------------------------------------------------
function createEmptyChart(options, dataIsEmpty) {
  const params = { ...defaultOptions, ...options };
  const tools = 'pan,crosshair,tap,reset,save';

  const fig = new Bokeh.Tables.DataTable({
    source: new Bokeh.ColumnDataSource({ data: {} }),
    columns: [],
    height: params.extent.height || 230,
    width: params.extent.width || 800,
  });
  return fig;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Save the image file to the local computer
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


//-------------------------------------------------------------------------------------------------
// This Visualization Component Class
//-------------------------------------------------------------------------------------------------
class StatisticsVis extends Component {
  // Initiation of the VizComp
  constructor(props) {
    super(props)
    this.cds = null;
    this.selectedIndicesInternal = [];
    this.rootNode = React.createRef();
    this.clearChart = this.clearChart.bind(this);
    this.createChart = this.createChart.bind(this);
  }

  componentDidMount() {
    this.createChart();
  }

  componentDidUpdate(prevProps) {
    var theDataSrcRightNow = $("#dataSourceSelector")[0].innerText;
    if(currentDataSource[this.props.id] !== undefined && currentDataSource[this.props.id] != theDataSrcRightNow){
      this.props.data.columns = [];
      this.props.data.data = [];
      this.clearChart();
      this.createChart();
    }
    currentDataSource[this.props.id] = theDataSrcRightNow;

    if (JSON.stringify(this.props) != JSON.stringify(prevProps, (key, value) => { if (key === "isDupli") { return undefined; } return value; })) {
      this.clearChart();
      this.createChart();
    }
  }

  componentWillUnmount() {
    this.clearChart();
  }

  // Clear away the VizComp
  clearChart() {
    if (Array.isArray(this.views)) {
      console.warn('array!!!', this.views);
    } else {
      const v = this.views;
      if (v) {
        v.remove();
      }
    }
    this.mainFigure = null;
    this.views = null;
  }

  // Create the VizComp based on the incomming parameters
  async createChart() {
    const {
      data,
      options,
      id,
      colorTags,
      selectedIndices,
      onSelectedIndicesChange,
    } = this.props;

    $(this.rootNode.current).empty();

    var tableDataString = "empty";

    const columns = data && data.columns?data.columns:[];
    const dataContents = data && data.data?data.data:[];

    // Custom Download CSV button
    const viewWrapperCustomButton_DLCSV = $(this.rootNode.current).parent().parent().find('#saveCSVData' + id);
    viewWrapperCustomButton_DLCSV.off('click');
    viewWrapperCustomButton_DLCSV.on( "click", function () { downloadCSV(tableDataString, 'stats_data.csv'); });

    let fig = createEmptyChart(options, !(dataContents.length > 0));
    if (dataContents.length > 0) {
      const df = new DataFrame(data.data);
      const tmpData = {};
      df.columns.toArray().map((v) => {
        tmpData[v] = df.get(v).to_json({ orient: 'records' });
        return true;
      });

      tableDataString = df.to_csv('stats_data.csv');

      const ds = new Bokeh.ColumnDataSource({ data: tmpData });

      const displayColumns = columns.map((v) => {
        const c = new Bokeh.Tables.TableColumn({
          field: v,
          title: v,
        });
        return c;
      });
      const params = Object.assign({}, defaultOptions, options);
        fig = new Bokeh.Tables.DataTable({
          source: ds,
          columns: displayColumns,
          height: params.extent.height || 230,
          width: params.extent.width || 800,
        });
    }
    this.views = await Bokeh.Plotting.show(fig, this.rootNode.current);
  }

  // Add the VizComp to the DOM
  render() {
    return (
      <div id="container">
        <div ref={this.rootNode} />
      </div>
    );
  }
}
//-------------------------------------------------------------------------------------------------

export default StatisticsVis;
