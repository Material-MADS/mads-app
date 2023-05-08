import React, { Component, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { DataFrame } from 'pandas-js';
import * as deepEqual from 'deep-equal';
import _ from 'lodash';

import $ from "jquery";

import * as Bokeh from '@bokeh/bokehjs';

import { Greys9 } from '@bokeh/bokehjs/build/js/lib/api/palettes';


var currentDataSource = {};


const defaultOptions = {
  title: 'Statistics:',
  selectionColor: 'orange',
  nonselectionColor: `#${Greys9[3].toString(16)}`,
  extent: { width: 800, height: 230 },
  columns: [],
};

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

class StatisticsVis extends Component {
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

  async createChart() {
    const {
      data,
      options,
      colorTags,
      selectedIndices,
      onSelectedIndicesChange,
    } = this.props;

    $(this.rootNode.current).empty();

    const columns = data && data.columns?data.columns:[];
    const dataContents = data && data.data?data.data:[];

    let fig = createEmptyChart(options, !(dataContents.length > 0));
    if (dataContents.length > 0) {
      const df = new DataFrame(data.data);
      const tmpData = {};
      df.columns.toArray().map((v) => {
        tmpData[v] = df.get(v).to_json({ orient: 'records' });
        return true;
      });

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
  render() {
    return (
      <div id="container">
        <div ref={this.rootNode} />
      </div>
    );
  }
}
export default StatisticsVis;



// /*=================================================================================================
// // Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
// //          Hokkaido University (2018)
// // ________________________________________________________________________________________________
// // Authors: Jun Fujima (Former Lead Developer) [2018-2021]
// //          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// // ________________________________________________________________________________________________
// // Description: This is the React Component for the Visualization View of the 'Statistics' module
// // ------------------------------------------------------------------------------------------------
// // Notes: 'Statistics' is a visualization component that displays a classic Table, rendered with the
// //        Bokeh library.
// // ------------------------------------------------------------------------------------------------
// // References: React & prop-types Libs, 3rd party pandas, deepEqual, lodash & Bokeh libs
// =================================================================================================*/

// //*** TODO: Convert this to the newer react component type using hooks or perhaps...

// //-------------------------------------------------------------------------------------------------
// // Load required libraries
// //-------------------------------------------------------------------------------------------------
// import React, { Component } from 'react';
// import PropTypes from 'prop-types';

// import { DataFrame } from 'pandas-js';
// import * as deepEqual from 'deep-equal';
// import _ from 'lodash';
// import * as Bokeh from '@bokeh/bokehjs';

// //To Surpress unwanted warnings
// Bokeh.logger.set_level("error");

// //-------------------------------------------------------------------------------------------------


// //-------------------------------------------------------------------------------------------------
// // Initiation Consts and Vars
// //-------------------------------------------------------------------------------------------------
// const INITIAL_WIDTH = 800;
// //-------------------------------------------------------------------------------------------------


// //-------------------------------------------------------------------------------------------------
// // This Visualization Component Class
// //-------------------------------------------------------------------------------------------------
// class StatisticsVis extends Component {
//   // Initiation of the VizComp
//   constructor(props) {
//     super(props);
//     this.cds = null;
//     this.rootNode = React.createRef();
//     this.clearChart = this.clearChart.bind(this);
//     this.createChart = this.createChart.bind(this);
//     this.handleSelectedIndicesChange = this.handleSelectedIndicesChange.bind( this );
//   }

//   componentDidMount() {
//     this.createChart();
//   }

//   shouldComponentUpdate(nextProps) {
//     const diff = _.omitBy(nextProps, (v, k) => {
//       const { [k]: p } = this.props;
//       return p === v;
//     });

//     if (diff.colorTags) {
//       return true;
//     }

//     if (diff.filteredIndices) {
//       if (diff.selectedIndices) {
//         this.cds.selected.indices = [...diff.selectedIndices];
//       }
//       return true;
//     }

//     if (diff.selectedIndices) {
//       this.cds.selected.indices = [...diff.selectedIndices];
//       return false;
//     }

//     return true;
//   }

//   componentDidUpdate(prevProps, prevState) {
//     const {
//       data,
//       columns,
//       colorTags,
//       selectedIndices,
//       filteredIndices,
//     } = this.props;

//     if (!deepEqual(prevProps.filteredIndices, filteredIndices)) {
//       this.clearChart();
//       this.createChart();
//       return;
//     }

//     if (!deepEqual(prevProps.colorTags, colorTags)) {
//       this.clearChart();
//       this.createChart();
//       return;
//     }

//     if (!deepEqual(prevProps.columns, columns)) {
//       this.clearChart();
//       this.createChart();
//       return;
//     }

//     if (!deepEqual(prevProps.data, data)) {
//       this.clearChart();
//       this.createChart();
//       return;
//     }
//   }

//   componentWillUnmount() {
//     this.clearChart();
//   }

//   handleSelectedIndicesChange() {
//     const { onSelectedIndicesChange } = this.props;
//     const { indices } = this.cds.selected;

//     if (onSelectedIndicesChange && !deepEqual(this.lastIndices, indices)) {
//       onSelectedIndicesChange(indices);
//       this.lastIndices = [...indices];
//     }
//   }

//   // Clear away the VizComp
//   clearChart() {
//     if (Array.isArray(this.views)) {
//     } else {
//       const v = this.views;
//       if (v) {
//         v.remove();
//       }
//     }

//     this.mainFigure = null;
//     this.views = null;
//   }

//   // Create the VizComp based on the incomming parameters
//   async createChart() {
//     const {
//       data,
//       columns,
//       colorTags,
//       selectedIndices,
//       filteredIndices,
//       options,
//     } = this.props;

//     const df = new DataFrame(data);

//     const tmpData = {};
//     df.columns.toArray().map((v) => {
//       tmpData[v] = df.get(v).to_json({ orient: 'records' });
//       return true;
//     });
//     this.cds = new Bokeh.ColumnDataSource({ data: tmpData });

//     const tString = JSON.stringify(colorTags);
//     const template = `
//       <div style="color:<%=
//         (function() {
//           var colorTags = ${tString}
//           var color = 'black'
//           colorTags.forEach(t => {
//             if (t.itemIndices.includes(__bkdt_internal_index__)) {
//               color = t.color;
//               return;
//             }
//           });
//           return color;
//         }())
//       %>"><%= value %></div>
//     `;
//     const formatter = new Bokeh.Tables.HTMLTemplateFormatter({ template });

//     let displayColumns;

//     // columns
//     if (columns.length > 0) {
//       displayColumns = columns.map((v) => {
//         const c = new Bokeh.Tables.TableColumn({
//           field: v,
//           title: v,
//           formatter,
//         });
//         return c;
//       });
//     } else {
//       displayColumns = df.columns.toArray().map((v) => {
//         const c = new Bokeh.Tables.TableColumn({
//           field: v,
//           title: v,
//           formatter,
//         });
//         return c;
//       });
//     }

//     // selection
//     if (selectedIndices.length > 0) {
//       this.cds.selected.indices = [...selectedIndices];
//     }

//     // setup callback
//     this.cds.connect(this.cds.selected.change, () => {
//       this.handleSelectedIndicesChange();
//     });

//     const dataTable = new Bokeh.Tables.DataTable({
//       source: this.cds,
//       columns: displayColumns,
//       width: options.extent.width || INITIAL_WIDTH,
//       selection_color: 'red',
//     });

//     this.mainFigure = dataTable;

//     // filter
//     if (filteredIndices.length > 0) {
//       const iFilter = new Bokeh.IndexFilter({ indices: filteredIndices });
//       const view = new Bokeh.CDSView({ source: this.cds, filters: [iFilter] });
//       this.mainFigure.view = view;
//     }

//     const views = await Bokeh.Plotting.show(
//       this.mainFigure,
//       this.rootNode.current
//     );
//     window.fig = this.mainFigure;

//     if (this.views) {
//       this.clearChart();
//     }

//     this.views = views;
//   }

//   // Add the VizComp to the DOM
//   render() {
//     return (
//       <div>
//         <div ref={this.rootNode} />
//       </div>
//     );
//   }
// }
// //-------------------------------------------------------------------------------------------------


// //-------------------------------------------------------------------------------------------------
// // This Visualization Component's Allowed and expected Property Types
// //-------------------------------------------------------------------------------------------------
// StatisticsVis.propTypes = {
//   data: PropTypes.arrayOf(PropTypes.object),
//   columns: PropTypes.arrayOf(PropTypes.string),
//   colorTags: PropTypes.arrayOf(PropTypes.object),
//   selectedIndices: PropTypes.arrayOf(PropTypes.number),
//   filteredIndices: PropTypes.arrayOf(PropTypes.number),
//   options: PropTypes.shape({
//     extent: PropTypes.shape({
//       width: PropTypes.number.isRequired,
//       height: PropTypes.number.isRequired,
//     }),
//   }),
//   onSelectedIndicesChange: PropTypes.func,
// };
// //-------------------------------------------------------------------------------------------------


// //-------------------------------------------------------------------------------------------------
// // This Visualization Component's default initial start Property Values
// //-------------------------------------------------------------------------------------------------
// StatisticsVis.defaultProps = {
//   data: [],
//   columns: [],
//   colorTags: [],
//   selectedIndices: [],
//   filteredIndices: [],
//   options: { extent: { width: 800, height: 400 } },
//   onSelectedIndicesChange: undefined,
// };
// //-------------------------------------------------------------------------------------------------

// export default StatisticsVis;

