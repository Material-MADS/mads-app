import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withKnobs, array } from '@storybook/addon-knobs';
import _ from 'lodash';

import PieChart from './PieChart';

// Simple Test Data - SETUP BEGIN
//=========================================
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

const dimensions = [];
const values = [];
for (let key in originalTestData) {
  dimensions.push(key);
  values.push(originalTestData[key]);
}
const data =  { dimensions, values }
//=========================================
// Simple Test Data - SETUP END

// Small File Sample Data - SETUP BEGIN
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
// Small File Sample Data - SETUP END

// Bigger File Sample Data - SETUP BEGIN
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
// Bigger File Sample Data - SETUP END

// Numeric Chem File Data - SETUP BEGIN
//=========================================
import numericchemdata from './testdata/chem';
const cData =  { dimensions: _.range(10).map((num) => { return num * 10 + "% - " + ((num * 10) + 10) + "%"; }), values: Array(10).fill(0) };
numericchemdata.data.forEach(item => {
  let sg = item['CH4-Conversion%'];
  cData.values[Math.floor(sg/10)]++;
});
//=========================================
// Numeric Chem File Data - SETUP END

const stories = storiesOf('PieChart', module);
stories.addDecorator(withKnobs);

stories
  .add('...empty', () => <PieChart />)
  .add('...with small data', () => (
    <PieChart
      data={data}      
      // mappings={{
      //   x: 'Formation Energy (eV)',
      //   y: 'Band Gap (eV)',
      // }}
      // onSelectedIndicesChange={action('selected_change')}
      // options={{ extent: { width: 100, height: 400 } }}
    />
  ))
  .add('...with file data', () => (
    <PieChart
       data = {sgData}
    />
  ))
  .add('...with bigger file data', () => (
    <PieChart
       data = {bsgData}
    />
  ))
  .add('...with numerical chem data', () => (
    <PieChart
       data = {cData}    
    />
  ));
  /* .add('with knobs', () => {
    // const defaultExtent = { width: 400, height: 400 };
    // const groupId = 'GROUP-ID1';
    // const extent = object('extent', defaultExtent);
    // const width = number('width', 400);
    // const height = number('height', 400);

    // const selections = array('selectedIndices', [0]).map(Number);

    return (
      <PieChart
        data = {bData.data}
    //     mappings={{
    //       x: 'Formation Energy (eV)',
    //       y: 'Band Gap (eV)',
    //     }}
    //     // extent={{ width, height }}
    //     selectedIndices={selections}
    //     // onSelectedIndicesChange={action('selected_change')}
      />
    );
  })
);*/
