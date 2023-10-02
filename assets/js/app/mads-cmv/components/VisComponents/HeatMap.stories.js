/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Storybook test displays for the React Component for the Visualization
//              View of the 'HeatMap' module
// ------------------------------------------------------------------------------------------------
// Notes: 'HeatMap' is a visualization component that displays a classic heat map based on a range
//        of available properties, and is rendered with the help of the Bokeh-Charts library.
// ------------------------------------------------------------------------------------------------
// References: React & storybook Libs, 3rd party jeezy and Chroma libs, HeatMap VizComp
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import * as jz from 'jeezy';
import * as chroma from 'chroma-js';

import HeatMap from './HeatMap';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Available VizComp setups/configs for this specific VizComp to be displayed inside storybook
// environment.
//-------------------------------------------------------------------------------------------------

// Simple Test Data
//=========================================
const originalTestData = {
  data: [
    { time: '00:00-06:00', season: 'Winter', temp: -20, },
    { time: '06:00-12:00', season: 'Winter', temp: -15, },
    { time: '12:00-18:00', season: 'Winter', temp: -10, },
    { time: '18:00-00:00', season: 'Winter', temp: -16, },
    { time: '00:00-06:00', season: 'Spring', temp: -5, },
    { time: '06:00-12:00', season: 'Spring', temp: 0, },
    { time: '12:00-18:00', season: 'Spring', temp: 10, },
    { time: '18:00-00:00', season: 'Spring', temp: 5, },
    { time: '00:00-06:00', season: 'Summer', temp: 10, },
    { time: '06:00-12:00', season: 'Summer', temp: 25, },
    { time: '12:00-18:00', season: 'Summer', temp: 30, },
    { time: '18:00-00:00', season: 'Summer', temp: 20, },
    { time: '00:00-06:00', season: 'Autumn', temp: 5, },
    { time: '06:00-12:00', season: 'Autumn', temp: 10, },
    { time: '12:00-18:00', season: 'Autumn', temp: 15, },
    { time: '18:00-00:00', season: 'Autumn', temp: 7, },
  ]
};
const season = [];
const time = [];
const temp = [];

originalTestData.data.forEach((row, index) => {
  season.push(row.season);
  time.push(row.time);
  temp.push(row.temp);
});

const osXRange = season.filter((v, i, a) => a.indexOf(v) === i);
const osYRange = time.filter((v, i, a) => a.indexOf(v) === i);
const osData =  { season, time, temp }

const osOptions = {
  x_range: osXRange,
  y_range: osYRange.reverse(),
  toolTipTitles: ['Time', 'Temperature'],
  heatValUnit: '°',
  colorMap: 'Viridis',
  extent: { width: 600, height: 400 },
  title: `Average Temperature during the year`,
  fontSize: '10px',
};
//=========================================

// Small File Sample Data
//=========================================
import sampleFileData from './testdata/unemployment';
export function getHeatMapDataPack(){
  let data = { xData: [], yData: [], heatVal: [] };
  let sfXRange = [], yRange = [];
  sampleFileData.forEach((row, index) => {
    delete row.Annual;
    sfXRange.push(row.Year + '');
    for (let col in row) {
      if(col != 'Year'){
        data.xData.push(row.Year + '');
        data.yData.push(col + '');
        data.heatVal.push(row[col]);
        if(index == 0){ yRange.push(col); }
      }
    }
  });

  const options = {
    x_range: sfXRange,
    y_range: yRange.reverse(),
    toolTipTitles: ['Date', 'Rate'],
    heatValUnit: '%%',
    colors: ["#75968f", "#a5bab7", "#c9d9d3", "#e2e2e2", "#dfccce", "#ddb7b1", "#cc7878", "#933b41", "#550b1d"],
    extent: { width: 900, height: 400 },
    title: `US Unemployment (${sfXRange[0]} - ${sfXRange[sfXRange.length-1]})`
  };

  return { data, options };
}
const SFSDPack = getHeatMapDataPack(sampleFileData);
//=========================================

// Chemical File Sample Data
//=========================================
import chemData from './testdata/chem';
import { check } from 'prettier';
const cData = { xData: [], yData: [], heatVal: [] };
chemData.data.forEach(item => {
  cData.xData.push(item.Temperature + '');
  cData.yData.push(item.Preparation + '');
  cData.heatVal.push(item['C2-yield']);
});
const cXRange = (cData.xData.filter((v, i, a) => a.indexOf(v) === i)).sort().reverse();
const cYRange = (cData.yData.filter((v, i, a) => a.indexOf(v) === i)).sort().reverse();

const cOptions = {
  x_range: cXRange,
  y_range: cYRange,
  toolTipTitles: ['Temperature', 'Preparation', 'C2 Yield'],
  colorMap: 'Magma',
  heatValUnit: '%%',
  extent: { width: 1200, height: 400 },
  title: `C2 Yield for for various reactions with  specific temperature and preparation methods`,
};
//=========================================

// Pairwise Correlation Matrix
//=========================================
var pcData = { xData: [], yData: [], heatVal: [] };
var cols = chemData.schema.fields.map(f => f.name);
cols.shift(); // remove index
var mask = [];
const colsSorted = cols.sort();
const colsSortedR = cols.sort().reverse();
var isVisible = 1;
for(var i = 0; i < colsSorted.length; i++){
  for(var k = 0; k < colsSortedR.length; k++){
    if(isVisible == 1){
      if(colsSorted[i] == colsSortedR[k]){
        isVisible = 0;
      }
    }
    mask.push([colsSorted[i]+"-"+colsSortedR[k], isVisible]);
  }
  isVisible = 1;
}
var corr = jz.arr.correlationMatrix(chemData.data, cols);
var allX = [], allY = [];
corr.forEach(item => {
  var testStr = item.column_x +"-"+item.column_y;
  var corrVal = 0;
  for(var i = 0; i < mask.length; i++){
    if(testStr == mask[i][0]){
      if(mask[i][1] != 0){
        corrVal = item.correlation;
      }
      break;
    }
  }
  if(corrVal != 0){
    pcData.xData.push(item.column_x);
    pcData.yData.push(item.column_y);
    pcData.heatVal.push(corrVal);
  }
  allX.push(item.column_x);
  allY.push(item.column_y);
});
const pcXRange = (allX.filter((v, i, a) => a.indexOf(v) === i)).sort();
const pcYRange = (allY.filter((v, i, a) => a.indexOf(v) === i)).sort().reverse();

var c = chroma.scale(["#3B4CC0", "white", "#B40426"]).domain([-1, 0, 1]).colors(100);

const pcOptions = {
  x_range: pcXRange,
  y_range: pcYRange,
  toolTipTitles: ['X', 'Y', 'Correlation'],
  colors: c,
  colorMapperMinMax: [-1,1],
  heatValUnit: '',
  extent: { width: 800, height: 800 },
  x_axis_location: 'below',
  title: `Pairwise Correlation Values for the ChemData Data`,
};
//=========================================

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Adding the various stories configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('HeatMap', module);
stories
  .add('...empty', () => <HeatMap />)
  .add('...with small data', () => (
    <HeatMap
      data = { osData }
      mappings={{ xData: 'season', yData: 'time', heatVal: 'temp' }}
      options = { osOptions }
    />
  ))
  .add('...with file data', () => (
    <HeatMap
      data = { SFSDPack.data }
      options = { SFSDPack.options }
    />
  ))
  .add('...with chem data', () => (
    <HeatMap
       data = {cData}
       options = { cOptions }
    />
  ))
  .add('...Pairwise Correlation Matrix', () => (
    <HeatMap
       data = {pcData}
       options = { pcOptions }
    />
  ));
  //-------------------------------------------------------------------------------------------------
