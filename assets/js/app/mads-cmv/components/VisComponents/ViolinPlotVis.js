/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the React Component for the Visualization View of the 'Gapminder' module
// ------------------------------------------------------------------------------------------------
// Notes: 'Gapminder' is a visualization component that displays a classic Gapminder Plot in
//        various ways based on a range of available properties, and is rendered with the help of the
//        ??? library.
// ------------------------------------------------------------------------------------------------
// References: React, redux & prop-types Libs, 3rd party lodash, jquery and Plotly libs with
//             Bokeh color palettes
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useEffect, useRef } from "react";
import { useSelector } from 'react-redux'
import PropTypes from "prop-types";

import _, { forEach } from 'lodash';
import $ from "jquery";
import Plotly from 'plotly.js-dist-min';

import * as allPal from "@bokeh/bokehjs/build/js/lib/api/palettes";
import { cmMax } from '../Views/FormUtils';
import { getHexColorsFromNumColors } from './VisCompUtils';

import * as loadingActions from '../../actions/loading';

// Dev and Debug declarations
window.Plotly = Plotly;

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Default Options / Settings
//-------------------------------------------------------------------------------------------------
const defaultOptions = {
  title: "Violin Plot",
  extent: { width: 700, height: 400 },
  modebar: { orientation: 'h'},
  displayModeBar: 'hover',
  modeBarButtonsToRemove: [], //[toImage, zoom3d, pan3d, orbitRotation, tableRotation, resetCameraDefault3d, resetCameraLastSave3d, hoverClosest3d]
  displaylogo: true,
  colorMap: 'Category10',
  plotOrientation: 'Vertical',
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Unpack
// Extracts all rows content for a specific column of the data and retirns it as an array
//-------------------------------------------------------------------------------------------------
function unpack(rows, key) {
  return rows.map(function(row) { return row[key]; });
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Make Title from Column Name
// Get a column name and polish it up to be used as a title
//-------------------------------------------------------------------------------------------------
function makeTitleFromColName(colName) {
  const words = colName.split("_");
  for (let i = 0; i < words.length; i++) { words[i] = words[i][0].toUpperCase() + words[i].substr(1); }

  return words.join(" ");
}
//-------------------------------------------------------------------------------------------------



//-------------------------------------------------------------------------------------------------
// Get Chart Data
// Support Method that extracts and prepare the provided data for the VisComp
//-------------------------------------------------------------------------------------------------
function getChartData(data, options, selectedIndices, colorTags) {
  const params = Object.assign({}, defaultOptions, options);
  var cData = [];

  if(_.isEmpty(data)){
    cData = [{
      type: 'violin',
      y: [],
      points: 'none',
      box: { visible: true },
      boxpoints: false,
      line: { color: 'black' },
      opacity: 0.0,
      meanline: { visible: false },
      x0: ""
    },];
  }
  else{
    var isCategorized = false, isBinned = false, isGrouped = (params.groupCol && params.groupCol != 'noneAtAll'), IsSplit = params.splitEnabled;
    var categories = undefined;
    let colors = [];
    var hexColors;
    let catStyles = [];
    let catColDataUniques = [];

    if(params.category && params.category != 'noneAtAll'){
      isCategorized = true;
      var catColData = unpack(data, params.category);
      var catColDataType = typeof catColData[0];
      catColDataUniques = [... new Set(catColData)];
      let noOfCats = catColDataUniques.length;

      if(catColDataType == 'number' && noOfCats > 10){
        isBinned = true;
        var max = Math.max(...catColData);
        var min = Math.min(...catColData);
        var step = max/params.numOfCats;
        var cats = new Array(parseInt(params.numOfCats)).fill(0);

        cats = cats.map(function(val, index) {
          const from = (step*index).toFixed(2);
          const to = (step*(index+1)).toFixed(2);
          const catStr = "[" + from + " - " + to + "]";
          return (catStr);
        });

        const categorized = new Array(catColData.length);
        for(var i = 0; i < catColData.length; i++){
          var catIndex = Math.ceil(catColData[i]/step) - 1;
          categorized[i] = cats[catIndex];
        }
        catColData = [...categorized];
        catColDataUniques = [... new Set(catColData)];
        noOfCats = catColDataUniques.length;
      }

      if(parseInt(cmMax[options.colorMap]) == 256){
        const step = Math.floor(256/noOfCats);
        const cm = allPal[options.colorMap+cmMax[options.colorMap]];
        for(let i = 0; i < noOfCats; i++) { colors.push(cm[i*step]); };
      }
      else{
        colors = (cmMax[options.colorMap] != undefined) ? allPal[options.colorMap+cmMax[options.colorMap]] : allPal[defaultOptions.colorMap+cmMax[defaultOptions.colorMap]];
      }

      hexColors = getHexColorsFromNumColors(colors);

      categories = [...catColData];
    }
    else{
      const cm = allPal[options.colorMap+cmMax[options.colorMap]];
      // colors.push(cm[Math.floor(Math.random() * cm.length)]); RANDOM COLOR
      colors.push(cm[0]);
      hexColors = getHexColorsFromNumColors(colors);
    }

    if(params.manualColors && params.manualColors != ""){
      let manColStr = params.manualColors;
      let manCol = [manColStr];
      var hasSpace = (manColStr.indexOf(' ') != -1);
      var hasComma = (manColStr.indexOf(',') != -1);
      if(hasSpace && hasComma){  manColStr = manColStr.replace(/\s/g, ','); manColStr = manColStr.replace(/,,/g, ',') }
      if(hasSpace && !hasComma){ manCol = manColStr.split(' '); }
      if(hasComma){ manCol = manColStr.split(','); }
      manCol = manCol.filter(function(a){return a !== ''})
      manCol.forEach((item, index) => hexColors[index] = item );
    }

    if(params.category && params.category != 'noneAtAll'){
      for(let i = 0; i < catColDataUniques.length; i++) {
        catStyles.push({target: catColDataUniques[i], value: {line: {color: hexColors[i]}}});
      };
    }

    if((!isGrouped && !isCategorized) || (isGrouped && !isCategorized) || (!isGrouped && isCategorized)){
      cData = [{
        type: 'violin',
        box: { visible: true },
        opacity: 0.7,
        meanline: { visible: true },
      }];

      if(params.plotOrientation == 'Vertical'){
        cData[0].y = unpack(data, params.numDataAxis);
        if(isCategorized){ cData[0].x = categories; }
        cData[0].orientation = 'v';
      }
      else{
        cData[0].x = unpack(data, params.numDataAxis);
        if(isCategorized){ cData[0].y = categories; }
        cData[0].orientation = 'h';
      }

      if(!isCategorized){
        cData[0].line = { color: hexColors[0] };
        if(params.plotOrientation == 'Vertical'){ cData[0].x0 = makeTitleFromColName(params.numDataAxis); }
        else{ cData[0].y0 = makeTitleFromColName(params.numDataAxis); }
      }
      else{
        cData[0].transforms = [{
          type: 'groupby',
          groups: categories,
          styles: catStyles,
        }];
      }
    }
    else{
      var grColData = unpack(data, params.groupCol);
      var grColDataUniques = [... new Set(grColData)];
      var groups = [];
      var internalData = [...data];
      var splits = ['negative', 'positive']

      for(var i = 0; i < internalData.length; i++){ internalData[i].category = categories[i]; }

      grColDataUniques.sort();
      for(var i = 0; i < grColDataUniques.length; i++){
        const group = {
          type: 'violin',
          box: { visible: true },
          opacity: 0.7,
          meanline: { visible: true },
          line: { color: hexColors[i] },
        };

        if(params.plotOrientation == 'Vertical'){
          group.y = unpack((data.filter((row) => { return row[params.groupCol] == grColDataUniques[i];})), params.numDataAxis);
          if(isCategorized){ group.x = unpack((data.filter((row) => { return row[params.groupCol] == grColDataUniques[i];})), 'category'); }
          group.orientation = 'v';
        }
        else{
          group.x = unpack((data.filter((row) => { return row[params.groupCol] == grColDataUniques[i];})), params.numDataAxis);
          if(isCategorized){ group.y = unpack((data.filter((row) => { return row[params.groupCol] == grColDataUniques[i];})), 'category'); }
          group.orientation = 'h';
        }

        group.legendgroup = grColDataUniques[i];
        group.scalegroup = grColDataUniques[i];
        group.name = grColDataUniques[i];

        if(params.splitEnabled && splits.length > i){
          group.side = splits[i];
        }

        groups.push(group);
      }

      cData = groups;
    }
  }

  return cData;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Get Chart Layout
// Support Method that extracts and prepare the provided layout settings for the VisComp
//-------------------------------------------------------------------------------------------------
function getChartLayout(data, options, currentDataSourceName) {
  const params = Object.assign({}, defaultOptions, options);

  var cLayout = {
    title: { text: params.title, },
    yaxis: { zeroline: false, },
    xaxis: { zeroline: false,  },
    width: params.extent.width,
    height: params.extent.height,
    modebar: { orientation: params.modebar.orientation, },
    legend: { traceorder: 'normal', title: { text: "" } },
  };

  var isPrimCategorized = (params.category && params.category != 'noneAtAll');
  var isSecCategorized = (params.groupCol && params.groupCol != 'noneAtAll');
  cLayout.legend.title.text = isPrimCategorized ? ("<b style='text-decoration: underline;'>" + makeTitleFromColName(isSecCategorized ? params.groupCol : params.category) + "</b>") : "";

  cLayout.yaxis.title = isPrimCategorized ? { text: makeTitleFromColName(params.numDataAxis), } : { text: "" };
  cLayout.xaxis.title = isPrimCategorized ? { text: makeTitleFromColName(params.category), } : { text: "" };

  if(isPrimCategorized){
    // cLayout.xaxis.categoryarray = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']
    // cLayout.xaxis.categoryorder = "array";
    cLayout.xaxis.categoryorder = "category ascending";
  }

  if(isSecCategorized && !params.splitEnabled){ cLayout.violinmode = 'group'; }

  return cLayout;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Get Chart Configuration
// Support Method that extracts and prepare the provided Option Parameters for the VisComp
//-------------------------------------------------------------------------------------------------
function getChartConfig(options) {
  const params = Object.assign({}, defaultOptions, options);

  var cConfig = {
    displayModeBar: params.displayModeBar,
    modeBarButtonsToRemove: params.modeBarButtonsToRemove,
    modeBarButtonsToAdd: [],
    displaylogo: params.displaylogo,
  };

  return cConfig;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component Creation Method
//-------------------------------------------------------------------------------------------------
export default function ViolinPlotVis({
  data,
  options,
  colorTags,
  selectedIndices,
  isPropSheetOpen,
  actions,
}) {

  // Initiation of the VizComp
  const rootNode = useRef(null);
  let internalOptions = options;

  let currentDataSourceName = "";
  try {
    const availableDataSources = useSelector((state) => state.dataSources);
    currentDataSourceName = (availableDataSources.items.find(item => availableDataSources.selectedDataSource == item.id)).name;
  } catch (error) { /*Just ignore and move on*/ }


  // Create the VizComp based on the incoming parameters
  const createChart = async () => {

    var theData = data.data;
    internalOptions.colorMap = internalOptions.colorMap || defaultOptions.colorMap;
    let sData = getChartData(theData, internalOptions, selectedIndices, colorTags);
    let layout = getChartLayout(theData, internalOptions, currentDataSourceName);
    let config = getChartConfig(internalOptions);

    loadingActions.setLoadingState(true);
    $(function(){
        Plotly.react(rootNode.current, sData, layout, config).then(function() {
      })
      .finally(function() {
        if(actions){ actions.setLoadingState(false); }
      });
    });
  };

  // Clear away the VizComp
  const clearChart = () => { /* Called when component is deleted */ };

  // Only called at init and set our final exit function
  useEffect(() => {
    return () => { clearChart(); };
  }, []);

  // Recreate the chart if the data and settings change
  useEffect(() => {
    if(isPropSheetOpen){ return; }

    // Clear away all data if requested
    if(data.resetRequest){
      internalOptions.title = "";
      internalOptions.numDataAxis = '';
      internalOptions.category = '';
      internalOptions.groupCol = '';
      internalOptions.splitEnabled = false;
      delete data.resetRequest;
    }

    createChart();
  }, [data, options]);

  useEffect(() => {
    if(isPropSheetOpen){ return; }
    createChart();
  }, [selectedIndices, colorTags]);

  // Add the VizComp to the DOM
  return (
    <div>
      <div ref={rootNode} />
    </div>
  );
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's Allowed and expected Property Types
//-------------------------------------------------------------------------------------------------
ViolinPlotVis.propTypes = {
  data: PropTypes.shape({ }),
  mappings: PropTypes.shape({
    x: PropTypes.string,
    y: PropTypes.string,
    color: PropTypes.string,
  }),
  options: PropTypes.shape({
    title: PropTypes.string,
    selectionColor: PropTypes.string,
    nonselectionColor: PropTypes.string,
    chartColors: PropTypes.arrayOf(PropTypes.string),
    extent: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number.isRequired,
    }),
  }),
  colorTags: PropTypes.arrayOf(PropTypes.object),
};
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// This Visualization Component's default initial start Property Values
//-------------------------------------------------------------------------------------------------
ViolinPlotVis.defaultProps = {
  data: {},
  mappings: {},
  options: defaultOptions,
  colorTags: [],
};
//-------------------------------------------------------------------------------------------------
