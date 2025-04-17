/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q2 2025
// ________________________________________________________________________________________________
// Authors: Philippe Gantzer [2024-]
//          Pavel Sidorov [2024-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the
//              'OptimizerClassificationVis' module
// ------------------------------------------------------------------------------------------------
// Notes: 'OptimizerClassificationVis' is a visualization component using
//        ML-OptimizerClassification on the data before displaying its result in a classic
//        ROC curve. (rendered by the Bokeh-Charts library.)
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
const Category10_10 = Category10.Category10_10;

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: 'OptimizerClassification',
  extent: { width: 400, height: 400 },
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Creates an empty basic default Visualization Component of the specific type
//-------------------------------------------------------------------------------------------------
function createEmptyChart(options, dataIsEmpty, isThisOld) {
  const params = Object.assign({}, defaultOptions, options);
  if(isThisOld){ params.title = "Out of date. Old Settings! Replace with New!" }

  const tools = 'pan,wheel_zoom,box_zoom,reset,save';
  const fig = Bokeh.Plotting.figure({
    tools,
    x_range: params.x_range || (dataIsEmpty ? [0, 1] : undefined),
    y_range: params.y_range || (dataIsEmpty ? [0, 1] : undefined),
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

//-------------------------------------------------------------------------------------------------
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default class OptimizerClassificationVis extends Component {
  // Initiation of the VizComp
  constructor(props) {
    super(props);
    this.cds = null;
    this.cds_whiskers = null;
    this.cds2 = null;

    this.rootNode = React.createRef();

    this.clearChart = this.clearChart.bind(this);
    this.createChart = this.createChart.bind(this);
    this.handleSelectedIndicesChange = this.handleSelectedIndicesChange.bind(this);
    this.lastSelections = [];
    this.selecting = false;
  }

  state = {
    scores: {},
    params: {},
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
        this.cds.selected.indices = diff.selectedIndices.filter(v => (v < this.props.data.d2.first_test));
        if (this.cds2) {
          this.cds2.selected.indices = diff.selectedIndices.filter(v =>
                    (v >= this.props.data.d2.first_test)).map(v=> v - this.props.data.d2.first_test);
        }
      }
      return false;
    }

    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      filteredIndices,
      colorTags,
      data,
      options,
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
    const { onSelectedIndicesChange, options } = this.props;
    const { indices } = this.cds.selected;
    let all_indices = indices;
    if (this.cds2) {
      const indices2 = this.cds2.selected.indices.map(v=> v+this.props.data.d2.first_test);
      all_indices = [...new Set([...indices, ...indices2])];
    }

    if (this.selecting) {
      return;
    }

    if (onSelectedIndicesChange && !deepEqual(this.lastSelections, all_indices)) {
      this.selecting = true;
      this.lastSelections = all_indices;
      onSelectedIndicesChange(all_indices);
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

  // Create the VizComp based on the incoming parameters
  async createChart() {
    const {
      data,
      id,
      mappings,
      options,
      colorTags,
      selectedIndices,
      filteredIndices,
    } = this.props;

    let internalData = data.d1 !== undefined ? data : {d1: {data: []}, d2: {data: [], first_test: 0}};

    const { x: xName, y: yName } = mappings;
    const df = new DataFrame(internalData.d1.data);
    const df2 = new DataFrame(internalData.d2.data);

    // Custom Download CSV buttons
    if (df.length > 0) {
      console.log("part0")
      const tableDataStringTrain = df.to_csv('tmp.csv', {index: true, index_label: "Index"})
      const viewWrapperCustomButtonTrain_DLCSV = $(this.rootNode.current).parent().parent().find('#saveCSVData-training' + id);
      viewWrapperCustomButtonTrain_DLCSV.off('click');
      viewWrapperCustomButtonTrain_DLCSV.on( "click", function () { downloadCSV(tableDataStringTrain, 'stats_data_training.csv'); });
    }
    if (df2.length > 0) {
      const tableDataStringTest = df2.to_csv('tmp.csv')
      const viewWrapperCustomButtonTest_DLCSV = $(this.rootNode.current).parent().parent().find('#saveCSVData-test' + id);
      viewWrapperCustomButtonTest_DLCSV.off('click');
      viewWrapperCustomButtonTest_DLCSV.on( "click", function () { downloadCSV(tableDataStringTest, 'stats_data_test.csv'); });
    }

    // Figure starts here
    this.mainFigure = createEmptyChart(options, !(xName && yName), (data.d1 === undefined && !this.state.dataShouldBeFine));

    if (xName && yName) {
      this.cds = new Bokeh.ColumnDataSource();

      this.mainFigure.title.text = this.mainFigure.title.text + " (" + this.props.MLmethod + ") [" + this.props.method + "]";
      this.mainFigure.xaxis[0].axis_label = 'False Positive Rate (FPR)';
      this.mainFigure.yaxis[0].axis_label = 'True Positive Rate (TPR)';

      // data.scores
      if ('roc_repeats' in data.cv) {
        let roc_repeats_data = {};
        let roc_repeats_lines = {};

        Object.keys(data.cv.roc_repeats).forEach(key => {
          roc_repeats_data[key] = new Bokeh.ColumnDataSource({
            data: { x: data.cv.roc_repeats[key]['fpr'],
                    y: data.cv.roc_repeats[key]['tpr'],
                    auc: Array.from({ length: data.cv.roc_repeats[key]['fpr'].length }, () => data.cv.roc_repeats[key]['auc']),
                    legend: Array.from({ length: data.cv.roc_repeats[key]['fpr'].length }, () => "Repeat "+ String(key)),
                   },
          });
          roc_repeats_lines[key] = this.mainFigure.line(
            { field: 'x' },
            { field: 'y' },
            {
              source: roc_repeats_data[key],
              line_width: 1,
              line_color: Category10_10[key-1 % 10],
              legend: "Repeat "+ String(key),
            }
          );

        });
        const tips_auc_r = "<div style='padding:2.5px 0px'><p><strong> @legend </strong><br /> FPR: @x{0.000} <br /> TPR: @y{0.000}<br /> AUC: @auc{0.000}</p></div>";
        this.mainFigure.add_tools(new Bokeh.HoverTool({tooltips: tips_auc_r, renderers: Object.values(roc_repeats_lines), description: "Repeats ROC Tooltips"},))

        const roc_mean_data = new Bokeh.ColumnDataSource({
          data: { x: data.cv.roc_mean['fpr'],
                  y: data.cv.roc_mean['tpr'],
                  y_lower: data.cv.roc_mean['tpr_lower'],
                  y_upper: data.cv.roc_mean['tpr_upper'],
                  std_tpr: data.cv.roc_mean['std_tpr'],
                  auc: Array.from({ length: data.cv.roc_mean['tpr'].length }, () => data.cv.roc_mean['auc']),
                  std_auc: Array.from({ length: data.cv.roc_mean['tpr'].length }, () => data.cv.roc_mean['std_auc']),
                },
        });
        const roc_mean_line = this.mainFigure.line(
          { field: 'x' },
          { field: 'y' },
          {
            source: roc_mean_data,
            line_width: 2,
            line_color: 'black',
            legend: "Mean ROC",
          }
        );
        const roc_mean_fill = new Bokeh.Band({
          base: { field: "x" },
          lower: { field: "y_lower" },
          upper: { field: "y_upper" },
          source: roc_mean_data,
          level: "underlay",
          fill_color: "gray",
          fill_alpha: 0.3,
          line_width: 0.5,
          line_color: "black"
        });
        this.mainFigure.add_layout(roc_mean_fill);

        const tips_auc = "<div style='padding:2.5px 0px'><p><strong>Mean ROC</strong><br /> FPR: @x{0.000}<br /> TPR: @y{0.000}±@std_tpr{0.000}<br /> AUC: @auc{0.000}±@std_auc{0.000}</p></div>";
        this.mainFigure.add_tools(new Bokeh.HoverTool({tooltips: tips_auc, renderers: [roc_mean_line], description: "Mean ROC Tooltips"},))

        this.mainFigure.legend.location = 'bottom_right';
        this.mainFigure.legend.click_policy = 'hide';
      }

      if (internalData.scores) {
        this.setState({ scores: internalData.scores });
      }

      if (internalData.params) {
        this.setState({ params: internalData.params });
      }

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
              { Object.keys(this.state.scores).length === 0 ? (
                <p>Optimization not yet performed.</p>
              ) : (
                <>
                  <h4>CV scores:</h4>
                    <ul>
                      {Object.keys(this.state.scores).map((key, id) => (
                            <li key={id}>{key}: {this.state.scores[key]}</li>
                        ))}
                    </ul>
                  <h4>Optimized parameters:</h4>
                    <ul>
                      {Object.keys(this.state.params).map((key, id) => (
                          <li key={id}>{key}: {this.state.params[key]}</li>
                      ))}
                    </ul>
                </>
              )
              }
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
OptimizerClassificationVis.propTypes = {
  data: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.object),
    parameters: PropTypes.arrayOf(PropTypes.object),
  }),
  mappings: PropTypes.shape({
    x: PropTypes.string,
    y: PropTypes.string,
  }),
  options: PropTypes.shape({
    title: PropTypes.string,
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
OptimizerClassificationVis.defaultProps = {
  data: {
    data: [],
    parameters: [],
  },
  mappings: {},
  options: {
    title: defaultOptions.title,
    extent: { width: defaultOptions.width, height: defaultOptions.height },
  },
  colorTags: [],
  selectedIndices: [],
  filteredIndices: [],
  onSelectedIndicesChange: undefined,
};
//-------------------------------------------------------------------------------------------------
