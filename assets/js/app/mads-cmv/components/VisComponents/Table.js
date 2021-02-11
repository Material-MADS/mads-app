import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { DataFrame } from 'pandas-js';
import * as deepEqual from 'deep-equal';
import _ from 'lodash';

import * as Bokeh from '@bokeh/bokehjs';

const INITIAL_WIDTH = 800;

class BokehTable extends Component {
  constructor(props) {
    super(props);
    // this.state = {};
    this.cds = null;

    this.rootNode = React.createRef();

    this.clearChart = this.clearChart.bind(this);
    this.createChart = this.createChart.bind(this);
    this.handleSelectedIndicesChange = this.handleSelectedIndicesChange.bind(
      this
    );
    // this.updatePlot = this.updatePlot.bind(this);
  }

  componentDidMount() {
    this.createChart();
  }

  shouldComponentUpdate(nextProps) {
    const diff = _.omitBy(nextProps, (v, k) => {
      const { [k]: p } = this.props;
      return p === v;
    });

    console.log(diff);
    if (diff.colorTags) {
      console.log('colorTag');
      return true;
    }

    if (diff.filteredIndices) {
      if (diff.selectedIndices) {
        this.cds.selected.indices = [...diff.selectedIndices];
      }
      return true;
    }

    // if (diff.selectedIndices && Object.keys(diff).length === 1) {
    if (diff.selectedIndices) {
      console.log(diff);
      this.cds.selected.indices = [...diff.selectedIndices];
      // console.log(this.cds.selected.indices)
      return false;
    }

    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      data,
      columns,
      colorTags,
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
  }

  componentWillUnmount() {
    console.info('unmount');
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
    // console.log('create', this.props);
    const {
      data,
      columns,
      colorTags,
      selectedIndices,
      filteredIndices,
      // selectionColor,
      // nonselectionColor,
      options,
    } = this.props;

    console.log(filteredIndices);

    const df = new DataFrame(data);

    const tmpData = {};
    df.columns.toArray().map((v) => {
      tmpData[v] = df.get(v).to_json({ orient: 'records' });
      return true;
    });
    this.cds = new Bokeh.ColumnDataSource({ data: tmpData });

    // const template = '<p style="color:<%=red%>;"><%= value %></p>';
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
        // const c = new Bokeh.Tables.TableColumn({ field: v, title: v });
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
      width: options.extent.width || INITIAL_WIDTH,
      selection_color: 'red',
    });

    this.mainFigure = dataTable;

    // filter
    if (filteredIndices.length > 0) {
      const iFilter = new Bokeh.IndexFilter({ indices: filteredIndices });
      const view = new Bokeh.CDSView({ source: this.cds, filters: [iFilter] });
      this.mainFigure.view = view;
      // console.log(view);
    }

    // console.trace();
    // this.views = Bokeh.Plotting.show(this.mainFigure, this.rootNode.current);
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

  // updatePlot() {

  // }

  render() {
    return (
      <div id="container">
        <div ref={this.rootNode} />
      </div>
    );
  }
}

BokehTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  columns: PropTypes.arrayOf(PropTypes.string),
  colorTags: PropTypes.arrayOf(PropTypes.object),
  selectedIndices: PropTypes.arrayOf(PropTypes.number),
  filteredIndices: PropTypes.arrayOf(PropTypes.number),
  // selectionColor: PropTypes.string,
  // nonselectionColor: PropTypes.string,
  options: PropTypes.shape({
    extent: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }),
  }),
  onSelectedIndicesChange: PropTypes.func,
};

BokehTable.defaultProps = {
  data: [],
  columns: [],
  colorTags: [],
  selectedIndices: [],
  filteredIndices: [],
  // selectionColor: 'orange',
  // nonselectionColor: `#${Greys9[3].toString(16)}`,
  options: { extent: { width: 800, height: 400 } },
  onSelectedIndicesChange: undefined,
};

export default BokehTable;
