/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the
//              'RegressionVis' module
// ------------------------------------------------------------------------------------------------
// Notes: 'RegressionVis' is a visualization component using ML-Regression on the data before
//        displaying its result in a classic Scatter plot. (rendered by the Bokeh-Charts library.)
// ------------------------------------------------------------------------------------------------
// References: React & prop-types Libs, 3rd party deepEqual, pandas, lodash and Bokeh libs with
//             various color palettes
=================================================================================================*/

//*** TODO: Could this (and perhaps Classification) be deleted, and just leave the Scatter Plot Chart with some new settings to replace them

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
  title: 'Regression',
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
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default class RegressionVis extends Component {
  // Initiation of the VizComp
  constructor(props) {
    super(props);
    this.cds = null;

    this.rootNode = React.createRef();

    this.clearChart = this.clearChart.bind(this);
    this.createChart = this.createChart.bind(this);
    this.handleSelectedIndicesChange =
      this.handleSelectedIndicesChange.bind(this);
    this.lastSelections = [];
    this.selecting = false;
  }

  state = {
    scores: {},
    dataShouldBeFine: false,
  };

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
      this.props.options.title = this.props.data.resetTitle;
      delete this.props.options.x_range;
      delete this.props.options.y_range;
      delete this.props.data.resetRequest;
      delete this.props.data.resetTitle;
      if((this.state.scores !== {})){
        this.setState({ scores: {} });
      }
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
      filteredIndices,
    } = this.props;

    let internalData = data.d1 !== undefined ? data : {d1: {data: []}, d2: {data: []}};

    const { x: xName, y: yName } = mappings;
    const df = new DataFrame(internalData.d1.data);
    const df2 = new DataFrame(internalData.d2.data);
    let x = [];
    let y = [];
    const cols = df.columns;

    this.mainFigure = createEmptyChart(options, !(xName && yName && cols.includes(xName) && cols.includes(yName)), (data.d1 === undefined && !this.state.dataShouldBeFine));

    if (xName && yName && cols.includes(xName) && cols.includes(yName)) {
      y = df.get(xName).to_json({ orient: 'records' });
      x = df.get(yName).to_json({ orient: 'records' });

      this.cds = new Bokeh.ColumnDataSource({ data: { x, y } });

      this.mainFigure.title.text = this.mainFigure.title.text + " (" + this.props.cvmethod + ") [" + this.props.method + "]";
      this.mainFigure.xaxis[0].axis_label = yName;
      this.mainFigure.yaxis[0].axis_label = xName + '--True';

      // selection
      if (selectedIndices.length > 0) {
        this.cds.selected.indices = selectedIndices;
        this.lastSelections = selectedIndices;
      }

      // color
      const colors = new Array(x.length).fill(defaultOptions.color);
      colorTags.forEach((colorTag) => {
        colorTag.itemIndices.forEach((i) => {
          colors[i] = colorTag.color;
        });
      });

      // setup callback
      this.cds.connect(this.cds.selected.change, () => {
        this.handleSelectedIndicesChange();
      });

      // call the circle glyph method to add some circle glyphs
      const selectionColor = options.selectionColor || defaultOptions.selectionColor;
      const nonselectionColor = options.nonselectionColor || defaultOptions.nonselectionColor;

      // Plot Main data
      let circles = this.mainFigure.circle(
        { field: 'x' },
        { field: 'y' },
        {
          source: this.cds,
          fill_alpha: 0.6,
          fill_color: colors,
          selection_color: selectionColor,
          nonselection_color: nonselectionColor,
          line_alpha: 0.7,
          line_color: colors,
          legend: (internalData.d2.data.length != 0)?'Train':undefined,
        }
      );

      // Plot Separate Test data if such exists
      if(internalData.d2.data.length != 0){
        let y2 = df2.get(xName).to_json({ orient: 'records' });
        let x2 = df2.get(yName).to_json({ orient: 'records' });
        const colors2 = new Array(x2.length).fill("red");
        let cds2 = new Bokeh.ColumnDataSource({ data: { x2, y2 } });
        let circles2 = this.mainFigure.triangle(
          { field: 'x2' },
          { field: 'y2' },
          {
            source: cds2,
            fill_alpha: 0.6,
            fill_color: colors2,
            line_alpha: 0.7,
            line_color: colors2,
            legend: 'Test',
          }
        );
      }

      // filter
      if (filteredIndices.length > 0) {
        const iFilter = new Bokeh.IndexFilter({
          indices: filteredIndices,
        });
        const view = new Bokeh.CDSView({
          source: this.cds,
          filters: [iFilter],
        });
        circles.view = view;
      }

      const xMax = Math.max.apply(null, x);
      const xMin = Math.min.apply(null, x);

      const source = new Bokeh.ColumnDataSource({
        data: { x: [xMin, xMax], y: [xMin, xMax] },
      });
      let line = new Bokeh.Line({
        x: { field: 'x' },
        y: { field: 'y' },
        line_color: 'red',
        line_width: 1,
      });

      const scores = {};
      if (internalData.scores) {
        const ss = internalData.scores;
        if (ss['test_r2']) {
          scores.meanR2 = _.mean(ss['test_r2']);
        }
        if (ss['test_mae']) {
          scores.meanMAE = _.mean(ss['test_mae']);
        }
      }
      if((scores.meanR2 || scores.meanMAE) && (scores.meanR2 !== this.state.scores.meanR2 || scores.meanMAE !== this.state.scores.meanMAE)){
        this.setState({ scores: scores });
      }

      this.mainFigure.add_glyph(line, source);
    }

    const views = await Bokeh.Plotting.show(
      this.mainFigure,
      this.rootNode.current
    );

    if (this.views) {
      this.clearChart();
    }

    this.views = views;

    if(!this.state.dataShouldBeFine){
      this.setState({ dataShouldBeFine: true });
    }
  }

  // Add the VizComp to the DOM
  render() {
    return (
      <div style={{display: 'flex'}} >
        <div ref={this.rootNode} />
        <div style={{marginLeft: '10px', marginRight: '10px'}}>
          <Card>
           <Card.Content>
              <h3>CV scores:</h3>
              <ul>
                <li>mean r2: {this.state.scores.meanR2}</li>
                <li>mean MAE: {this.state.scores.meanMAE}</li>
              </ul>
            </Card.Content>
          </Card>
        </div>
      </div>
    );
  }
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
RegressionVis.propTypes = {
  data: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.object),
  }),
  mappings: PropTypes.shape({
    x: PropTypes.string,
    y: PropTypes.string,
  }),
  options: PropTypes.shape({
    title: PropTypes.string,
    selectionColor: PropTypes.string,
    nonselectionColor: PropTypes.string,
    extent: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }),
  }),
  colorTags: PropTypes.arrayOf(PropTypes.object),
  selectedIndices: PropTypes.arrayOf(PropTypes.number),
  filteredIndices: PropTypes.arrayOf(PropTypes.number),
  onSelectedIndicesChange: PropTypes.func,
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
RegressionVis.defaultProps = {
  data: {data: []},
  mappings: {},
  options: {
    title: 'Regression',
    color: defaultOptions.color,
    selectionColor: defaultOptions.selectionColor,
    nonselectionColor: defaultOptions.nonselectionColor,
    extent: { width: 400, height: 400 },
  },
  colorTags: [],
  selectedIndices: [],
  filteredIndices: [],
  onSelectedIndicesChange: undefined,
};
//-------------------------------------------------------------------------------------------------
