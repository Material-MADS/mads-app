/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2026
// ________________________________________________________________________________________________
// Authors: Miyu Shinotsuka [2026]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the
//              'MLPVis' module
// ------------------------------------------------------------------------------------------------
// Notes: 'MLPVis' is a visualization component that applies MLPRegressor to the data and
//        displays the result as a learning curve(R2, Loss) or a "True vs Predict" plot. 
//        (rendered by the Bokeh-Charts library.)
// ------------------------------------------------------------------------------------------------
// References: React, prop-types and semantic-view-ui Libs, 3rd party pandas, Bokeh, deepEqual, 
//             jquery, lodash, and internal support methods fr. VisCompUtils
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState, useEffect, useRef, memo } from "react";
import PropTypes from "prop-types";
import { DataFrame, Series } from "pandas-js";

import ColorTag from '../../models/ColorTag';

import { Card, Accordion } from "semantic-ui-react";
import * as Bokeh from '@bokeh/bokehjs';
import * as deepEqual from 'deep-equal';

import { Category10 } from '@bokeh/bokehjs/build/js/lib/api/palettes';
import { Greys9 } from '@bokeh/bokehjs/build/js/lib/api/palettes';
const Category10_10 = Category10.Category10_10;


import $ from "jquery";
import { Props } from "@storybook/addon-docs";
import _ from "lodash";
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "MLP",
  color: `#${Category10_10[0].toString(16)}`, //blue
  extent: { width: 600, height: 400 },
  selectionColor: 'orange',
  nonselectionColor: `#${Greys9[3].toString(16)}`,
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Creates an empty basic default Visualization Component of the specific type
//-------------------------------------------------------------------------------------------------
function createEmptyChart(options, dataIsEmpty, isThisOld) {
  const params = Object.assign({}, defaultOptions, options);

  if (isThisOld) { params.title = "Out of date. Old Settings! Replace with New!" }

  const tools = 'pan,crosshair,wheel_zoom,box_zoom,box_select,reset,save';
  const fig = Bokeh.Plotting.figure({
    tools,
    x_range: params.x_range || (dataIsEmpty ? [-1, 1] : undefined),
    y_range: params.y_range || (dataIsEmpty ? [-1, 1] : undefined),
    width: params.extent.width || 600,
    height: params.extent.height || 400,
  });

  fig.title.text = params.title; //title object must be set separately or it will become a string (bokeh bug)

  if (isThisOld) {
    fig.title.text_color = "red";
    fig.title.text_font_size = "15px";
  }
  else {
    fig.title.text_color = "#303030";
    fig.title.text_font_size = "13px";
  }

  return fig;
}
//-------------------------------------------------------------------------------------------------



//-------------------------------------------------------------------------------------------------
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
function MLP_Component(props) {

  const {
    data = {},
    mappings = {},
    options = {
      title: "MLP",
      color: defaultOptions.color,
      selectionColor: defaultOptions.selectionColor,
      nonselectionColor: defaultOptions.nonselectionColor,
      extent: { width: 600, height: 400 },
    },
    colorTags = [],
    selectedIndices = [],
    filteredIndices = [],
    onSelectedIndicesChange = undefined,
  } = props;


  const rootNode = useRef(null);
  const cds = useRef(null);
  const views = useRef(null);
  const lastSelections = useRef([]);
  let selecting = useRef(false);
  const mainFigure = useRef(null);
  const dataShouldBeFine = useRef(false);

  const [score, setScore] = useState({});




  const { x: xName, y: yName } = mappings;
  let internalData = data.d1 !== undefined ? data : { d1: { data: [] }, d2: { data: [] } };

  const firstItem = internalData.d1.data[0] || {};
  const isLoss = firstItem.Loss !== undefined;  // Loss
  const isPlot = firstItem.True !== undefined;  // True vs Predict

  const handleSelectedIndicesChange = (props) => {
    const { indices } = cds.current.selected;
    if (selecting.current) {
      return;
    };

    if (onSelectedIndicesChange && !deepEqual(lastSelections, indices)) {
      selecting.current = true;
      lastSelections.current = [...indices];
      onSelectedIndicesChange = indices;
      selecting.current = false;
    };
  };

  const clearChart = (props) => {
    if (rootNode.current) {
      rootNode.current.innerHTML = '';
    }

    if (Array.isArray(views)) {
    } else {
      const v = views.current;
      if (v) {
        v.remove();
      }
    }

    if (data.resetRequest) {
      options.title = data.resetTitle;
      delete options.x_range;
      delete options.y_range;
      delete data.resetRequest;
      delete data.resetTitle;

      if (score !== {}) {
        setScore({});
      }
    }

    mainFigure.current = null;
    views.current = null;
  };

  const createChart = async (props) => {

    let x = [];
    let y = [];

    const trainData = {
      epoch: internalData.d1.data.map(item => item.epoch ?? item.Predict),
      metricsVal: internalData.d1.data.map(item => item.Loss ?? item.R2 ?? item.True),
    };

    const testData = {
      epoch: internalData.d2.data.map(item => item.epoch ?? item.Predict),
      metricsVal: internalData.d2.data.map(item => item.Loss ?? item.R2 ?? item.True)
    }

    mainFigure.current = createEmptyChart(
      options,
      (xName === undefined && yName === undefined),
      (data.d1 === undefined && !dataShouldBeFine.current)
    );

    if (xName && yName && trainData.epoch.length > 0 && trainData.metricsVal.length > 0) {

      if (internalData.scores) {
        const ss = internalData.scores;
        const scoresKey = Object.keys(ss);

        const searchedText = 'test_';
        const newScores = {};

        scoresKey.forEach((key) => {
          if (key.indexOf(searchedText) !== -1) {
            const newKey = 'mean' + (key.replace(searchedText, '').toUpperCase());
            newScores[newKey] = _.mean(ss[key]);
          }
        });

        setScore(newScores);
      }


      y = trainData.metricsVal;  // Loss, R2 => Loss MSE, R2 | True vs Predict => True

      x = trainData.epoch;  // Loss, R2 => epoch || True vs Predict => Predict

      cds.current = new Bokeh.ColumnDataSource({ data: { x, y } });

      // Loss or R2 => epoch --------------------------------------
      if (!isPlot) {
        mainFigure.current.xaxis[0].axis_label = 'epoch';
      }
      //------------------------------------------------------------


      // set axes label & title-------------------------------------------
      if (isLoss) {
        mainFigure.current.yaxis[0].axis_label = 'MSE';
        mainFigure.current.title.text = defaultOptions.title + ' (Loss)';

      } else if (isPlot) {
        mainFigure.current.xaxis[0].axis_label = xName + '--Predicted';
        mainFigure.current.yaxis[0].axis_label = xName + '--True';
        mainFigure.current.title.text = defaultOptions.title + ' (True vs Predict)';

      } else { // R2
        mainFigure.current.yaxis[0].axis_label = 'R2';
        mainFigure.current.title.text = defaultOptions.title + ' (R2)';
      }
      //--------------------------------------------------------------



      // ----------------------------------------------------------------
      const legendLocation = isLoss ? "top_right" : "bottom_right";

      if (mainFigure.current.legend) {
        if (mainFigure.current.legend[0]) {
          mainFigure.current.legend[0].location = legendLocation;
        } else {
          mainFigure.current.legend.location = legendLocation;
        }
      }
      // -----------------------------------------------------------------

      if (selectedIndices.length > 0) {
        cds.current.selected.indices = selectedIndices;
        lastSelections.current = selectedIndices;
      };

      const colors = new Array(x.length).fill(defaultOptions.color);
      colorTags.forEach((colorTag) => {
        colorTag.itemIndices.forEach((i) => {
          colors[i] = colorTag.color;
        });
      });


      cds.current.connect(cds.current.selected.change, () => {
        handleSelectedIndicesChange();
      });

      const selectionColor = options.selectionColor || defaultOptions.selectionColor;
      const nonselectionColor = options.nonselectionColor || defaultOptions.nonselectionColor;

      if (filteredIndices.length > 0) {
        const iFilter = new Bokeh.IndexFilter({
          indices: filteredIndices,
        });
        const view = new Bokeh.CDSView({
          source: cds.current,
          filters: [iFilter],
        });
        circles.current.view = view;
      }


      // Test or R2
      if (!internalData.d1.data[0].Predict) {

        let line = new Bokeh.Line({
          x: { field: 'x' },
          y: { field: 'y' },
          line_width: { value: 3 },
          line_color: { value: "blue" },
          line_alpha: { value: 0.7 },
        });

        const line_renderer = mainFigure.current.add_glyph(line, cds.current);
        const legend_item = new Bokeh.LegendItem({
          label: { value: "Train" },
          renderers: [line_renderer]
        });

        const legend = new Bokeh.Legend({
          items: [legend_item],
          location: isLoss ? "top_right" : "bottom_right"
        });

        mainFigure.current.add_layout(legend);

        // Loss/R2 Test
        if (testData.metricsVal.length > 0 && testData.epoch.length > 0) {
          let y2 = testData.metricsVal;
          let x2 = testData.epoch;

          let cds_test = new Bokeh.ColumnDataSource({ data: { x2, y2 } });
          let line2 = new Bokeh.Line({
            x: { field: 'x2' },
            y: { field: 'y2' },
            line_width: 3,
            line_color: "red",
            source: cds_test,
            line_alpha: 0.7,
          });

          const line_renderer2 = mainFigure.current.add_glyph(line2, cds_test);
          const legend_item2 = new Bokeh.LegendItem({
            label: { value: "Validation" },
            renderers: [line_renderer2]
          });

          const legend2 = new Bokeh.Legend({
            items: [legend_item, legend_item2],
            location: isLoss ? "top_right" : "bottom_right"
          });
          mainFigure.current.add_layout(legend2);
        }

      } else {     // True vs Predict
        let circles = mainFigure.current.circle(
          { field: 'x' },
          { field: 'y' },
          {
            source: cds.current,
            fill_alpha: 0.6,
            fill_color: colors,
            selection_color: selectionColor,
            nonselection_color: nonselectionColor,
            line_alpha: 0.7,
            line_color: colors,
            legend: 'Train',
          }
        );

        // y = x----------------------------------------------
        let xMax = Math.max.apply(null, x);
        let xMin = Math.min.apply(null, x);

        const source = new Bokeh.ColumnDataSource({
          data: { x: [xMin, xMax], y: [xMin, xMax] },
        });

        let line = new Bokeh.Line({
          x: { field: 'x' },
          y: { field: 'y' },
          line_color: 'red',
          line_width: 1,
        });
        mainFigure.current.add_glyph(line, source)
        // ---------------------------------------------------

        // test data exists
        if (testData.metricsVal.length > 0 && testData.epoch.length > 0) {
          let y2 = testData.metricsVal;
          let x2 = testData.epoch;

          let cds_test = new Bokeh.ColumnDataSource({ data: { x2, y2 } });
          const colors2 = new Array(x2.length).fill("red");
          let circles2 = mainFigure.current.triangle(
            { field: 'x2' },
            { field: 'y2' },
            {
              source: cds_test,
              fill_alpha: 0.6,
              fill_color: colors2,
              line_alpha: 0.7,
              line_color: colors2,
              legend: 'Test',
            }
          );
        }
      }
    };


    if (rootNode.current) {
      rootNode.current.innerHTML = '';
    }

    const views = await Bokeh.Plotting.show(
      mainFigure.current,
      rootNode.current
    );


    views.current = views;

    if (!dataShouldBeFine.current) {
      dataShouldBeFine.current = true;
    }

  };


  // // Recreate the chart if the data and settings change
  useEffect(() => {
    createChart();
    // Only called at init and set our final exit function
    return () => {
      clearChart();
    };
  }, [data, options?.extent?.width, options?.extent?.height]);

  const internalDataKey = Object.keys(internalData);


  // card display condition---------------------------------------------------------------------------
  const cardCondition = () => {
    let display = false;
    const searchBest = 'best';
    const searchCorr = 'coresponding_train_'

    if (!isPlot) {  // Loss or R2
      const hasBest = internalDataKey.some(key => key.indexOf(searchBest) !== -1);
      const hasCorr = internalDataKey.some(key => key.indexOf(searchCorr) !== -1);
      display = hasBest && hasCorr;

    } else {  // True vs Predict plot
      display = internalDataKey.some(key => key.indexOf('score') !== -1);
    }

    return display;
  };
  // -------------------------------------------------------------------------------------------------

  // check if final_test_loss or final_test_r2 exists-------------------------------------------------
  const checkSplit = () => {
    if (internalDataKey.includes('final_test_loss') || internalDataKey.includes('final_test_r2'))
      return true;
    else
      return false;
  };
  // -------------------------------------------------------------------------------------------------


  return (
    <div style={{ display: 'flex' }}>
      <div
        ref={rootNode}
        key={internalData}
      />

      {cardCondition() && <div style={{ marginLeft: '10px', marginRight: '10px' }}>
        <Card>
          <Card.Content>
            {!isPlot && <hr />}
            <ul>
              {/* <li>Best Epoch: {internalData.best_epoch}</li> */}
              {isLoss && <li>Best Validation Loss: {internalData.best_test_loss} at Epoch {internalData.best_epoch}</li>}
              {isLoss && <li>Coresponding Train Loss: {internalData.coresponding_train_loss}</li>}
              {!isLoss && !isPlot && <li>Best Validation R2: {internalData.best_test_r2} (at Epoch {internalData.best_epoch})</li>}
              {!isLoss && !isPlot && <li>Coresponding Train R2: {internalData.coresponding_train_r2}</li>}
            </ul>

            {checkSplit() && <ul>
              {isLoss && <li>Final Test Loss: {internalData.final_test_loss}</li>}
              {!isLoss && <li>Final Test R2: {internalData.final_test_r2}</li>}
            </ul>}

            {score != {} && score != undefined && <hr />}
            {score != {} && score != undefined && <h3>CV Scores:</h3>}
            {score != {} && score != undefined && <ul>
              {Object.entries(score).map(([scoreName, value]) => (
                <li key={scoreName}>
                  <span style={{ marginRight: '4px' }}>{scoreName}:</span>
                  <span>{value}</span>
                </li>
              ))}
            </ul>}
            {score != {} && score != undefined && <hr />}
          </Card.Content>
        </Card>
      </div>}
    </div>
  );
};

const shouldComponentUpdate = (prevProps, nextProps) => {
  if (prevProps.colorTags !== nextProps.colorTags) return false;

  if (prevProps.selectedIndices !== nextProps.selectedIndices) {
    if (nextProps.cds && nextProps.selectedIndices) {
      nextProps.cds.selected.indices = nextProps.selectedIndices;
    }
    return true;
  }

  return Object.keys(nextProps).every(key => prevProps[key] === nextProps[key]);
};



//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
MLP_Component.propTypes = {
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

export default memo(MLP_Component, shouldComponentUpdate);
//-------------------------------------------------------------------------------------------------
