/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'Table' module
// ------------------------------------------------------------------------------------------------
// Notes: 'Table' is a visualization component that displays a classic Table, rendered with the
//        Bokeh library.
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party pandas, deepEqual, lodash & Bokeh libs
=================================================================================================*/

//*** TODO: Convert this to the newer react component type using hooks or perhaps...

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { DataFrame } from 'pandas-js';
import * as deepEqual from 'deep-equal';
import _ from 'lodash';
import * as Bokeh from '@bokeh/bokehjs';

//To Surpress unwanted warnings
Bokeh.logger.set_level("error");

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Initiation Consts and Vars
//-------------------------------------------------------------------------------------------------
// const INITIAL_WIDTH = 800;
const defaultOptions = {
  extent: { width: 800, height: 400 },
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component Class
//-------------------------------------------------------------------------------------------------
class BokehTable extends Component {
  // Initiation of the VizComp
  constructor(props) {
    super(props);
    this.cds = null;
    this.rootNode = React.createRef();
    this.clearChart = this.clearChart.bind(this);
    this.createChart = this.createChart.bind(this);
    this.handleSelectedIndicesChange = this.handleSelectedIndicesChange.bind( this );
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
      this.createChart();
      return;
    }

    if (!deepEqual(prevProps.colorTags, colorTags)) {
      this.clearChart();
      this.createChart();
      return;
    }

    if (!deepEqual(prevProps.columns, columns)) {
      this.clearChart();
      this.createChart();
      return;
    }

    if (!deepEqual(prevProps.data, data)) {
      this.clearChart();
      this.createChart();
      return;
    }

    if (!deepEqual(prevProps.options, options)) {
      this.clearChart();
      this.createChart();
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

  // Create the VizComp based on the incomming parameters
  async createChart() {
    const {
      data,
      columns,
      colorTags,
      selectedIndices,
      filteredIndices,
      options,
    } = this.props;

    const df = new DataFrame(data);

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

    let displayColumns;

    // columns
    if (columns.length > 0) {
      displayColumns = columns.map((v) => {
        const c = new Bokeh.Tables.TableColumn({
          field: v,
          title: v,
          formatter,
        });
        return c;
      });
    } else {
      displayColumns = df.columns.toArray().map((v) => {
        const c = new Bokeh.Tables.TableColumn({
          field: v,
          title: v,
          formatter,
        });
        return c;
      });
    }

    // selection
    if (selectedIndices.length > 0) {
      this.cds.selected.indices = [...selectedIndices];
    }

    // setup callback
    this.cds.connect(this.cds.selected.change, () => {
      this.handleSelectedIndicesChange();
    });

    const dataTable = new Bokeh.Tables.DataTable({
      source: this.cds,
      columns: displayColumns,
      width: options.extent.width || defaultOptions.extent.width,//INITIAL_WIDTH,
      height: options.extent.height || defaultOptions.extent.height,
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
BokehTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
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
BokehTable.defaultProps = {
  data: [],
  columns: [],
  colorTags: [],
  selectedIndices: [],
  filteredIndices: [],
  options: defaultOptions,
  onSelectedIndicesChange: undefined,
};
//-------------------------------------------------------------------------------------------------

export default BokehTable;
