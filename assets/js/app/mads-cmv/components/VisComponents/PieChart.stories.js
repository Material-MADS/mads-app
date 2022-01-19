/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: This is the Storybook test displays for the React Component for the Visualization
//              View of the 'PieChart' module
// ------------------------------------------------------------------------------------------------
// Notes: 'PieChart' is a visualization component that displays a classic pie chart in numerous
//        ways based on a range of available properties, and is rendered with the help of the
//        Bokeh-Charts library.
// ------------------------------------------------------------------------------------------------
// References: React & storybook Libs, 3rd party lodash, PieChart VizComp
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { storiesOf } from '@storybook/react';

import _ from 'lodash';

import PieChart from './PieChart';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Available VizComp setups/configs for this specific VizComp to be displayed inside storybook
// environment.
//-------------------------------------------------------------------------------------------------

// Simple Test Data
//=========================================
export function getPieDataPack(){
  const originalTestData = {
    'United States': 157,
    'United Kingdom': 93,
    Japan: 89,
    China: 63,
    Germany: 44,
    India: 42,
    Italy: 40,
    Australia: 35,
    Brazil: 32,
    France: 31,
    Taiwan: 31,
    Spain: 29,
  };

  const countries = [];
  const scores = [];
  for (let key in originalTestData) {
    countries.push(key);
    scores.push(originalTestData[key]);
  }
  const data =  { countries, scores }
  const mappings = { dimensions: 'countries', values: 'scores' };
  const options = {title: "Scores per Country"};

  return {data, mappings, options};
}
const STDPack = getPieDataPack();
//=========================================

// Small File Sample Data
//=========================================
import sampledata from './testdata/data-ex';
const sgc = {};
sampledata.forEach(item => {
  let sg = item.Spacegroup;
  if(!sgc[sg]){ sgc[sg] = 1; }
  else { sgc[sg]++; }
});
const sgData =  { dimensions: [], values: [] };
for (let key in sgc) {
  sgData.dimensions.push(key);
  sgData.values.push(sgc[key]);
}
//=========================================

// Bigger File Sample Data
//=========================================
import biggersampledata from './testdata/response-ex';
const sgc2 = {};
biggersampledata.data.forEach(item => {
  let sg = item.Spacegroup;
  if(!sgc2[sg]){ sgc2[sg] = 1; }
  else { sgc2[sg]++; }
});
const bsgData =  { dimensions: [], values: [] };
for (let key in sgc2) {
  bsgData.dimensions.push(key);
  bsgData.values.push(sgc2[key]);
}
//=========================================

// Numeric Chem File Data
//=========================================
import numericchemdata from './testdata/chem';
const cData =  { dimensions: _.range(10).map((num) => { return num * 10 + "% - " + ((num * 10) + 10) + "%"; }), values: Array(10).fill(0) };
numericchemdata.data.forEach(item => {
  let sg = item['CH4-Conversion%'];
  cData.values[Math.floor(sg/10)]++;
});
//=========================================

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Adding the various stories configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('PieChart', module);
stories
  .add('...empty', () => <PieChart />)
  .add('...with small data', () => (
    <PieChart
      data = {STDPack.data}
      mappings={STDPack.mappings}
      options = {STDPack.options}
    />
  ))
  .add('...with file data', () => (
    <PieChart
       data = {sgData}
       options = {{title: "The composition of all categories in the column of SpaceGroup in small sample Material Data"}}
    />
  ))
  .add('...with bigger file data', () => (
    <PieChart
       data = {bsgData}
       options = {{title: "The composition of all categories in the column of SpaceGroup in larger sample Material Data"}}
    />
  ))
  .add('...with numerical chem data', () => (
    <PieChart
       data = {cData}
       options = {{title: "The composition of 10 categories in the column of CH4-Conversion% in sample Material Data"}}
    />
  ));
//-------------------------------------------------------------------------------------------------
