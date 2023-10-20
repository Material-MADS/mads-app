/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: This is the Storybook test displays for the React Component for the Visualization
//              View of the 'BarChart' module
// ------------------------------------------------------------------------------------------------
// Notes: 'BarChart' is a visualization component that displays a classic bar chart in numerous
//        ways based on a range of available properties, and is rendered with the help of the
//        Bokeh-Charts library.
// ------------------------------------------------------------------------------------------------
// References: React & storybook Libs, BarChart VizComp
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React from 'react';
import { storiesOf } from '@storybook/react'; // eslint-disable-line import/no-extraneous-dependencies
import { action } from '@storybook/addon-actions'; // eslint-disable-line import/no-extraneous-dependencies

import BarChart from './BarVis';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Available VizComp setups/configs for this specific VizComp to be displayed inside storybook
// environment.
//-------------------------------------------------------------------------------------------------

// 'with simple data specified with x axis'
//=========================================
export function getBarChartDataPack(){
  const data = {
    fruits: ['Apples', 'Pears', 'Nectarines', 'Plums', 'Grapes', 'Strawberries'],
    2015: [2, 1, 4, 3, 2, 4],
    2016: [5, 3, 3, 2, 4, 6],
    2017: [3, 2, 4, 4, 5, 3],
  };

  const mappings = { dimension: 'fruits', measures: ['2015', '2016', '2017'] };
  const options = { legendLocation: 'top_left' };
  const onSelectedIndicesChange = action('selected_change');

  return {data, mappings, options, onSelectedIndicesChange};
}
const barChartDataPack = getBarChartDataPack();
//=========================================

// 'same as above but transposed data'
//=========================================
export function getBarChartDataPackTransposed(){
  const data = {
    years: ['2015', '2016', '2017'],
    Apples: [2, 5, 3],
    Pears: [1, 3, 2],
    Nectarines: [4, 3, 4],
    Plums: [3, 2, 4],
    Grapes: [2, 4, 5],
    Strawberries: [4, 6, 3],
  };

  const mappings = { dimension: 'years', measures: ['Apples', 'Pears', 'Nectarines', 'Plums', 'Grapes', 'Strawberries'] };
  const options = { legendLocation: 'top_left' };
  const onSelectedIndicesChange = action('selected_change');

  return {data, mappings, options, onSelectedIndicesChange};
}
const barChartDataPackTransposed = getBarChartDataPackTransposed();
//=========================================


//=========================================

// 'with simple data specified with x axis (4 measures)'
//=========================================
const data02 = {
  fruits: ['Apples', 'Pears', 'Nectarines', 'Plums', 'Grapes', 'Strawberries'],
  2015: [2, 1, 4, 3, 2, 4],
  2016: [5, 3, 3, 2, 4, 6],
  2017: [3, 2, 4, 4, 5, 3],
  2018: [2, 1, 4, 3, 2, 4],
  2019: [5, 3, 3, 2, 4, 6],
};
//=========================================


// 'with simple data (features)'
//=========================================
const data03 = {
  features: [
    'Preparation',
    'Temperature',
    'ch4-pressure',
    'O2-pressure',
    'Contact-Times',
    'Cation1',
    'Cation1-mol',
    'Cation2',
    'Cation2-mol',
    'Cation3',
    'Cation3-mol',
    'Cation4',
    'Cation4-mol',
    'Anion1',
    'Anion1-mol',
    'Anion2',
    'Anion2-mol',
    'Support1',
    'Support1-mol',
    'Support2',
    'Support2-mol',
  ],
  importance: [
    0.039, 0.071275, 0.112966, 0.093391, 0.111855, 0.117603, 0.088582, 0.09848,
    0.098125, 0.023358, 0.031957, 0.005509, 0.007603, 0.031605, 0.028453,
    0.001644, 0.001437, 0.01384, 0.020769, 0.002134, 0.000415,
  ],
};
//=========================================


// 'with simple data (features2)' & 'with simple data (features2) with barColor'
//=========================================
const data04 = {
  features: [
    'Preparation',
    'Temperature',
    'CH4-pressure',
    'O2-pressure',
    'Contact-times',
    'Cation1',
    'Cation1-mol',
    'Cation2',
    'Cation2-mol',
    'Support1',
    'Support1-mol',
  ],
  importance: [
    0.047685, 0.076804, 0.141382, 0.103445, 0.108693, 0.1314, 0.091595,
    0.123338, 0.125366, 0.021953, 0.02834,
  ],
};
//=========================================


// 'with large file filled with many values'
//=========================================
import chemData from './testdata/chem';

const cfData =  { dimension: [], measures: [] };
chemData.data.forEach(item => {
  cfData.dimension.push(item['index']);
  cfData.measures.push(item['Temperature']);
});

const cfMappings = { dimension: 'dimension', measures: ['measures'] };
//=========================================

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Adding the various stories configured above to the storybook environment.
//-------------------------------------------------------------------------------------------------
const stories = storiesOf('BarChart', module);
stories
  .add('empty bar chart', () => <BarChart />)
  .add('with simple data specified with x axis', () => (
    <BarChart
      data = { barChartDataPack.data }
      mappings = { barChartDataPack.mappings }
      options = { barChartDataPack.options }
      onSelectedIndicesChange = { barChartDataPack.onSelectedIndicesChange }
    />
  ))
  .add('same as above with transposed data', () => (
    <BarChart
      data = { barChartDataPackTransposed.data }
      mappings = { barChartDataPackTransposed.mappings }
      options = { barChartDataPackTransposed.options }
      // onSelectedIndicesChange = { barChartDataPackTransposed.onSelectedIndicesChange }
    />
  ))
  .add('with simple data specified with x axis (2 measures)', () => (
    <BarChart
      data={barChartDataPack.data}
      mappings={{ dimension: 'fruits', measures: ['2015', '2016'] }}
      options={{ legendLocation: 'top_left' }}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with simple data specified with x axis (4 measures)', () => (
    <BarChart
      data={data02}
      mappings={{
        dimension: 'fruits',
        measures: ['2015', '2016', '2017', '2018'],
      }}
      options={{ legendLocation: 'top_left' }}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with simple data (features)', () => (
    <BarChart
      data={data03}
      mappings={{ dimension: 'features', measures: ['importance'] }}
      options={{
        legendLocation: 'top_left',
        title: 'Feature Importance',
        extent: { width: 600, height: 400 },
        xaxis_orientation: 'vertical',
      }}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with simple data (features2)', () => (
    <BarChart
      data={data04}
      mappings={{ dimension: 'features', measures: ['importance'] }}
      options={{
        legendLocation: 'top_left',
        title: 'Feature Importance',
        extent: { width: 600, height: 400 },
        xaxis_orientation: 'vertical',
      }}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with simple data (features2) with barColor', () => (
    <BarChart
      data={data04}
      mappings={{ dimension: 'features', measures: ['importance'] }}
      options={{
        legendLocation: 'top_left',
        title: 'Feature Importance',
        extent: { width: 600, height: 400 },
        xaxis_orientation: 'vertical',
        barColors: ['red', 'green'],
      }}
      onSelectedIndicesChange={action('selected_change')}
    />
  ))
  .add('with large file filled with many values', () => (
    <BarChart
      data={cfData}
      mappings={cfMappings}
      options={{
        legendLocation: 'top_left',
        title: 'Big Chem Data',
        extent: { width: 1600, height: 500 },
        xaxis_orientation: 'horizontal',
      }}
      onSelectedIndicesChange={action('selected_change')}
    />
  ));
//-------------------------------------------------------------------------------------------------
